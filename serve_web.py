#!/usr/bin/env python3
"""
Objective: Paperclips - Zero-Dependency Web Server
Launches a local HTTP server serving the Web / Electron game edition.
Usage: python3 serve_web.py [--port PORT]
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
if len(sys.argv) > 2 and sys.argv[1] == '--port':
    try:
        PORT = int(sys.argv[2])
    except ValueError:
        pass

WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web')

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def log_message(self, format, *args):
        # Clean console output
        sys.stdout.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))

def run_server():
    global PORT
    for attempt in range(10):
        try:
            with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
                url = f"http://localhost:{PORT}"
                print("\n" + "=" * 64)
                print("  📎 OBJECTIVE: PAPERCLIPS - WEB & ELECTRON EDITION")
                print("=" * 64)
                print(f"  🚀 Server running at: \033[92m{url}\033[0m")
                print(f"  📂 Serving files from: {WEB_DIR}")
                print("  🛑 Press Ctrl+C to stop the server.")
                print("=" * 64 + "\n")
                
                httpd.serve_forever()
                break
        except OSError as e:
            if e.errno == 98 or "Address already in use" in str(e):
                PORT += 1
            else:
                raise

if __name__ == '__main__':
    try:
        run_server()
    except KeyboardInterrupt:
        print("\n[Server stopped by user]")
