# Supabase MCP Setup

This document describes how the Supabase MCP server is configured for this project and how to manage the access token securely.

## Overview

- The MCP server used: `@supabase/mcp-server-supabase@latest`
- Project ref: `hlygryxopxrkvfvsppvm`
- The MCP server is registered in two places:
  - Workspace-level: `./.vscode/mcp.json`
  - User-level (Windsurf): `~/.codeium/windsurf/mcp_config.json`
- Both configs read your token from the OS environment variable and pass it via CLI:
  - `--access-token=${env:SUPABASE_ACCESS_TOKEN}`

## Prerequisites

- Node.js and npx available on PATH
  - `node -v` should print a version
  - `npx -v` or `npx.cmd -v` should print a version

## Access Token (PAT)

Set a user environment variable on Windows so the MCP server can authenticate without storing secrets in files.

PowerShell or CMD:

```
setx SUPABASE_ACCESS_TOKEN "<YOUR_SUPABASE_PAT>"
```

Notes:
- Close and reopen VS Code/Windsurf after setting the variable so the new environment is picked up.
- Never commit your token to version control.

## Configuration Files

- Workspace-level (checked into repo):

  File: `./.vscode/mcp.json`
  ```json
  {
    "servers": {
      "supabase": {
        "command": "cmd",
        "args": [
          "/c",
          "npx",
          "-y",
          "@supabase/mcp-server-supabase@latest",
          "--project-ref=hlygryxopxrkvfvsppvm",
          "--access-token=${env:SUPABASE_ACCESS_TOKEN}"
        ]
      }
    }
  }
  ```

- User-level (local to your machine):

  File: `~/.codeium/windsurf/mcp_config.json`
  ```json
  {
    "mcpServers": {
      "supabase": {
        "command": "cmd",
        "args": [
          "/c",
          "npx",
          "-y",
          "@supabase/mcp-server-supabase@latest",
          "--project-ref=hlygryxopxrkvfvsppvm",
          "--access-token=${env:SUPABASE_ACCESS_TOKEN}"
        ]
      }
    }
  }
  ```

## Reloading After Changes

If you change the token or configuration:

- Preferred: Command Palette → `Developer: Reload Window`
- Or fully close and reopen VS Code/Windsurf

## Verifying the Connection

After reload, you can verify using the MCP tools (already wired in this environment):

- Get project URL
- Get anon key
- List tables, extensions, edge functions

If you want to run checks manually via the Assistant, just ask: "Verify Supabase MCP connection".

## Troubleshooting

- No prompt appears for token
  - This setup uses an environment variable instead of prompts. Ensure `SUPABASE_ACCESS_TOKEN` is set and you reloaded the window.

- Unauthorized error
  - Ensure `SUPABASE_ACCESS_TOKEN` is set for your user and is a valid PAT.
  - Reload the window so the new environment is picked up.
  - Confirm the `--access-token=${env:SUPABASE_ACCESS_TOKEN}` flag is present in both configs.

- PowerShell blocks `npx.ps1`
  - This config uses `cmd /c npx` to avoid PowerShell execution policy issues.

- Multiple configs conflict
  - It’s OK to have both workspace and user-level configs as long as they are aligned. This project keeps both aligned to use the same CLI flags.

## Security

- Tokens are not stored in repo files; they are read from your OS environment.
- Rotate your PAT as needed and update the environment variable accordingly.
