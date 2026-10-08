#!/usr/bin/env python3
"""
AI Joke Generator — Python Launcher
Usage:
    python3 run.py
"""

import sys
import os
import time
import socket
import argparse
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
VENV_PYTHON = ROOT_DIR / ".venv" / "bin" / "python"
if not VENV_PYTHON.exists():
    VENV_PYTHON = ROOT_DIR / ".venv" / "Scripts" / "python.exe"


def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Check if port is already occupied."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def ensure_venv():
    """If project .venv exists and we are not using it, re-exec with .venv python."""
    if VENV_PYTHON.exists() and sys.executable != str(VENV_PYTHON):
        in_venv = getattr(sys, "base_prefix", sys.prefix) != sys.prefix
        if not in_venv:
            print(f"🔄 Switching to project virtualenv ({VENV_PYTHON})...")
            os.execv(str(VENV_PYTHON), [str(VENV_PYTHON)] + sys.argv)


def banner(url: str):
    print("\n" + "═" * 58)
    print("           🎭  AI JOKE GENERATOR  🎭")
    print("═" * 58)
    print(f"  🚀 App URL:      {url}")
    print(f"  ⚡ API Docs:     {url}/docs")
    print("  🧠 AI Model:     Fine-Tuned GPT-2 Medium")
    print("  🔞 Content Mode: Uncensored (Filters Disabled)")
    print("═" * 58)
    print("  Press Ctrl+C to stop\n")


def main():
    parser = argparse.ArgumentParser(
        description="Start the AI Joke Generator server (FastAPI + Modern Web UI)."
    )
    parser.add_argument("--host", default="0.0.0.0", help="Host address (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port number (default: 8000)")
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically")
    parser.add_argument("--reload", action="store_true", help="Enable code auto-reload for development")

    args = parser.parse_args()

    ensure_venv()

    url = f"http://localhost:{args.port}"
    banner(url)

    if not args.no_browser:
        def _open():
            time.sleep(1.2)
            try:
                webbrowser.open(url)
            except Exception:
                pass
        import threading
        threading.Thread(target=_open, daemon=True).start()

    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level="info",
        )
    except KeyboardInterrupt:
        print("\n👋 AI Joke Generator stopped.")
    except ImportError:
        print("❌ uvicorn is missing. Install requirements with:")
        print("   pip install -r requirements.txt")
        sys.exit(1)


if __name__ == "__main__":
    main()
