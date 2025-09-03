import os
import textwrap
from typing import Any, Dict, List, Optional, Tuple

# Removed unsupported feature import
from mcp.server.fastmcp import FastMCP

import requests

mcp = FastMCP("pr-summary-mcp")


def _headers() -> Dict[str, str]:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        # Print debug info about available environment variables
        available_env_keys = ", ".join(sorted(k for k in os.environ.keys() if "TOKEN" in k or "KEY" in k or "GITHUB" in k))
        error_msg = f"GITHUB_TOKEN is not set. Available related env vars: {available_env_keys}"
        print(error_msg)
        # Try to use GH_TOKEN as fallback
        token = os.environ.get("GH_TOKEN")
        if not token:
            raise ValueError("Neither GITHUB_TOKEN nor GH_TOKEN is set")
        print("Using GH_TOKEN as fallback")
        
    print(f"Using GitHub token (first 4 chars): {token[:4]}..." if token else "No token found")
    return {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "pr-summary-mcp",
    }


def _split_repo(repo_full: str) -> Tuple[str, str]:
    if "/" not in repo_full:
        raise ValueError(
            f"Invalid repo format: {repo_full}, expected format is 'owner/repo'"
        )

    owner, repo = repo_full.split("/", 1)
    return owner, repo


def _get(url: str, params: Optional[Dict[str, Any]] = None) -> requests.Response:
    r = requests.get(url, headers=_headers(), params=params, timeout=30)
    r.raise_for_status()
    return r


def _get_json(url: str, params: Optional[Dict[str, Any]] = None):
    return _get(url, params=params).json()


def _get_paginated(url: str, params: Optional[Dict[str, Any]] = None) -> List[Any]:
    items: List[Any] = []
    params = dict(params or {})
    params.setdefault("per_page", 100)
    while True:
        resp = _get(url, params=params)
        items.extend(resp.json())
        nxt = resp.links.get("next", {}).get("url")
        if not nxt:
            break
        url, params = nxt, None
    return items


def _build_prompt(
    *,
    pr_title: str,
    pr_body: str,
    base: str,
    head: str,
    html_url: str,
    commit_msgs: str,
    file_summary_block: str,
    patches_block: str,
    style: str,
) -> str:
    return textwrap.dedent(
        f"""
        You are a senior reviewer. Summarize the pull request below for busy reviewers.
        Return **Github-flavored Markdown** only.
    
        ### Output format
        - **Title**: one-line summary
        - **TL;DR**: 2-5 bullets
        - **What changed**: file-by-file bullets
        - **Risk & breaking changes**: bullets with severity
        - **Test plan & manual checks**
        - **Release notes** (copy-pasteable)

        ### Guidelines
        - Be specific about public APIs, migrations, config flags, data shape changes, and performance impact.
        - Call out security/infra/data-impacting changes.
        - Keep it {"detailed" if style == "verbose" else "concise"} but high-signal.


        ### PR metadata
        - URL: {html_url}
        - Branch: {head} -> {base}
        - Title: {pr_title}
        - Body:
        {pr_body or "_(no description)_"}

        ### Commits
        {commit_msgs or "_(commit messages ommited)_"}

        ### Files (summary)
        {file_summary_block or "_(no files)_"}

        ### Unified diffs (truncated for context)
        {patches_block or "_(no textual patches available)_"}
        """
    ).strip()


@mcp.tool()
def summarize_pr(
    *,
    repo_full: str,
    pr_number: int,
    style: str = "concise",
    gemini_model: Optional[str] = None,
    max_context_chars: int = 250_000,
) -> str:
    """
    Fetch PR context from GitHub, compose a prompt, call Gemini, and return Markdown.
    """
    from google import genai

    # 1) Pull PR, commits, and files
    owner, repo = _split_repo(repo_full)
    api = f"https://api.github.com/repos/{owner}/{repo}"
    pr = _get_json(f"{api}/pulls/{pr_number}")
    commits = _get_paginated(f"{api}/pulls/{pr_number}/commits")
    files = _get_paginated(f"{api}/pulls/{pr_number}/files")

    commit_tags = "\n".join(f" - {c['sha']}: {c['commit']['message']}" for c in commits)
    file_summary_lines = []
    for f in files:
        approx = f.get("changes")
        file_summary_lines.append(
            f" - {f['filename']}: {f['status']}; +{f['additions']}/-{f['deletions']}"
            + (f"; ~{approx} lines" if approx is not None else "")
            + ")"
        )
    file_summary_block = "\n".join(file_summary_lines)

    # 2) Build concise context blocks
    remaining = max_context_chars
    patches = []
    for f in files:
        patch = f.get("patch")
        if not patch:
            continue
        header = f"\n# {f['filename']} \n"
        take = max(0, min(remaining - len(header), len(patch)))
        if take <= 0:
            break
        patches.append(header + "```diff\n" + patch[:take] + "\n```")
        remaining -= len(header) + take
        if remaining <= 0:
            break
    patches_block = "\n".join(patches)

    # 3) Compose prompt
    prompt = _build_prompt(
        pr_title=pr.get("title", ""),
        pr_body=pr.get("body", ""),
        base=pr.get("base", {}).get("label", ""),
        head=pr.get("head", {}).get("label", ""),
        html_url=pr.get("html_url", ""),
        commit_msgs=commit_tags,
        file_summary_block=file_summary_block,
        patches_block=patches_block,
        style=style,
    )

    # 4) Call Gemini (client picks up GEMINI_API_KEY from env per docs)
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return "Error: GEMINI_API_KEY environment variable is not set"

        # Define model_name before using it
        model_name = gemini_model or os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
        print(f"Using Gemini model: {model_name}")
        
        client = genai.Client(api_key=api_key)
        resp = client.models.generate_content(model=model_name, contents=prompt)

        if not resp.text:
            return "Error: Gemini returned empty response"

        print(f"Received response from Gemini with {len(resp.text)} characters")
        return resp.text
    except Exception as e:
        error_msg = f"Error calling Gemini API: {str(e)}"
        print(error_msg)
        return f"## Error generating summary\n\n{error_msg}"


if __name__ == "__main__":
    # FastMCP can run directly; this starts a stdio server process.
    mcp.run()
