from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            from api._lib.db import get_threads, DATABASE_URL
            
            if not DATABASE_URL:
                self._send_error(503, 'DATABASE_URL not configured')
                return
            
            query = parse_qs(urlparse(self.path).query)
            limit = int(query.get('limit', [20])[0])
            
            threads = get_threads(limit)
            threads_data = [self._serialize(dict(t)) for t in threads]
            
            self._send_json(200, {'status': 'success', 'data': threads_data, 'count': len(threads_data)})
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _serialize(self, item):
        for key, val in item.items():
            if hasattr(val, 'isoformat'):
                item[key] = val.isoformat()
        return item
    
    def _send_json(self, status, data):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def _send_error(self, status, message):
        self._send_json(status, {'status': 'error', 'message': message})
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
