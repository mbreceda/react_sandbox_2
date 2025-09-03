import os
import asyncio
from mcp import ClientSession, StdioServerParameters, types as mcptypes
from mcp.client.stdio import stdio_client


def _env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise ValueError(f"Environment variable {name} is not set")
    return v


async def main() -> None:
    repo_full = _env("GITHUB_REPOSITORY")
    pr_number = int(_env("PR_NUMBER"))

    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    server_script = os.path.join(script_dir, "mcp_server.py")
    
    server_params = StdioServerParameters(
        command="python",
        args=[server_script],
    )

    async with ClientSession(server_params) as (read, write):
        async with stdio_client(read, write) as session:
            await session.initialize()
            result = await session.call_tool(
                "summarize_pr",
                {
                    "repo_full": repo_full,
                    "pr_number": pr_number,
                    "style": os.getenv("SUMMARY_STYLE", "concise"),
                    "gemini_model": os.getenv("GEMINI_MODEL"),
                },
            )

            # Prefered structured result if present, otherwhise read thext content blocks
            text = None
            if getattr(result, "structuredContent", None):
                sc = result.structuredContent
                if isinstance(sc, dict) and isinstance(sc.get("result"), str):
                    text = sc["result"]

            if not text:
                parts = [
                    c.text
                    for c in result.content
                    if isinstance(c, mcptypes.TextContent)
                ]
                text = "\n".join(parts) if parts else None

            with open("pr-summary.md", "w", encoding="utf-8") as f:
                f.write(text or "No summary generated.")


if __name__ == "__main__":
    asyncio.run(main())
