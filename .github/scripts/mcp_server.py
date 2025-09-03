import os
import textwrap
from typing import Any, Dict, List, Optional, Tuple

from __feature__ import annotations
from mcp.server.fastmpc import FastMPC

import requests

mcp = FastMPC("pr-summary-mcp")


def _headers() -> Dict[str, str]:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN is not set")
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
        You are a seniro reviewer. Summarize the pull request below for busy reviewers.
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
    client = genai.Client()
    model_name = gemini_model or os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
    resp = client.models.generate_content(model=model_name, contents=prompt)
    return resp.text or ""


if __name__ == "__main__":
    # FastMCP can run directly; this starts a stdio server process.
    mcp.run()
