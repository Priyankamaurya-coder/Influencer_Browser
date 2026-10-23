"""Tiny local server for the Influencer Browser demo. Run: python start_server.py"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

os.chdir(Path(__file__).resolve().parent)
address = ("127.0.0.1", 8000)
print(f"Open http://{address[0]}:{address[1]} in your browser. Press Ctrl+C to stop.")
ThreadingHTTPServer(address, SimpleHTTPRequestHandler).serve_forever()
