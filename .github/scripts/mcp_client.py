import os
import asyncio
from mcp import ClientSession, StdioServerParameters, types
from mcp.client.stdio import stdio_client


def env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing required env var: {name}")
    return v


async def main() -> None:
    repo = env("GITHUB_REPOSITORY")
    pr_number = int(env("PR_NUMBER"))

    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    server_script = os.path.join(script_dir, "mcp_server.py")

    # Make sure GITHUB_TOKEN is available
    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        print("Warning: GITHUB_TOKEN not found in environment")
    
    # Pass current environment to the subprocess
    env_vars = os.environ.copy()
    
    # Create StdioServerParameters with environment variables
    server_params = StdioServerParameters(
        command="python", 
        args=[server_script],
        env=env_vars  # Explicitly pass environment variables
    )
    
    # IMPORTANT: unpack BOTH streams
    async with stdio_client(server_params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()

            result = await session.call_tool(
                "summarize_pr",
                {
                    "repo_full": repo,
                    "pr_number": pr_number,
                    "style": os.getenv("SUMMARY_STYLE", "concise"),
                    "gemini_model": os.getenv("GEMINI_MODEL"),
                },
            )

            # Add debug info
            print("Result received:", result)

            # Extract text from the tool result (supports both styles)
            text_parts = [
                c.text
                for c in getattr(result, "content", [])
                if isinstance(c, types.TextContent)
            ]
            print(f"Text parts extracted: {text_parts}")

            text = "\n".join(text_parts) or (
                str(getattr(result, "structuredContent", "") or "")
            )
            print(
                f"Final text to write: {text[:100]}..." if text else "No text generated"
            )

            # Write to the correct path with debug info
            debug_info = """
## Debug Information
- Result type: {type}
- Has content: {has_content}
- Content length: {content_len}
- Text parts count: {text_parts_count}
""".format(
                type=type(result).__name__,
                has_content=hasattr(result, "content"),
                content_len=len(getattr(result, "content", [])),
                text_parts_count=len(text_parts),
            )

            with open(".github/pr-summary.md", "w", encoding="utf-8") as f:
                if text:
                    f.write(text)
                else:
                    f.write(
                        "# No summary was generated\n\n"
                        + debug_info
                        + "\n\nPlease check the logs for more information."
                    )


if __name__ == "__main__":
    asyncio.run(main())
