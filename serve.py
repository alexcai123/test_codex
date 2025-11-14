#!/usr/bin/env python3
"""Run a simple HTTP server to host the Pokémon battle app."""
from __future__ import annotations

import argparse
import os
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from typing import Tuple


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the Pokémon battle web app")
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host interface to bind (default: 127.0.0.1)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PORT", 8000)),
        help="Port to serve on (default: 8000 or PORT environment variable)",
    )
    return parser.parse_args()


def build_server_address(host: str, port: int) -> Tuple[str, int]:
    return host, port


def main() -> None:
    args = parse_args()
    root_dir = os.path.dirname(os.path.abspath(__file__))
    handler = partial(SimpleHTTPRequestHandler, directory=root_dir)
    server_address = build_server_address(args.host, args.port)
    httpd = ThreadingHTTPServer(server_address, handler)

    print(f"Serving Pokémon battle app at http://{args.host}:{args.port}/index.html")
    print("Press Ctrl+C to stop the server.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
