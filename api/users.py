from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            from api._lib.db import get_users, get_user_by_username, DATABASE_URL
            
            if not DATABASE_URL:
                self._send_error(503, 'DATABASE_URL not configured')
                return
            
            query = parse_qs(urlparse(self.path).query)
            username = query.get('username', [None])[0]
            limit = int(query.get('limit', [50])[0])
            
            if username:
                user = get_user_by_username(username)
                if user:
                    user_data = self._serialize(dict(user))
                    self._send_json(200, {'status': 'success', 'data': user_data})
                else:
                    self._send_error(404, f'User @{username} not found')
            else:
                users = get_users(limit)
                users_data = [self._serialize(dict(u)) for u in users]
                self._send_json(200, {'status': 'success', 'data': users_data, 'count': len(users_data)})
            
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
