from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.do_POST()

    def do_POST(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        
        debug_info = []
        try:
            debug_info.append("Starting init-db request")
            
            # Step 1: Check environment
            url = os.environ.get('DATABASE_URL')
            debug_info.append(f"DATABASE_URL present: {bool(url)}")
            
            if not url:
                raise ValueError("DATABASE_URL not configured")
            
            # Step 2: Import
            debug_info.append("Attempting import...")
            try:
                from api._lib.db import init_tables
                debug_info.append("Import successful")
            except Exception as ie:
                debug_info.append(f"Import failed: {str(ie)}")
                raise ie
                
            # Step 3: Execution
            debug_info.append("Calling init_tables()...")
            result = init_tables()
            debug_info.append(f"init_tables finished with result: {result}")
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            self.wfile.write(json.dumps({
                'status': 'success',
                'message': 'Database tables initialized successfully',
                'debug': debug_info
            }).encode())
            
        except Exception as e:
            import traceback
            trace_str = traceback.format_exc()
            print(f"ERROR in init-db: {str(e)}\n{trace_str}") # Log to Vercel console
            
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'error',
                'message': str(e),
                'trace': trace_str,
                'debug': debug_info
            }).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
