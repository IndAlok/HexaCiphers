from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            from api._lib.db import get_stats, DATABASE_URL
            
            if not DATABASE_URL:
                self._send_error(503, 'DATABASE_URL not configured')
                return
            
            stats = get_stats()
            
            result = {
                'overview': {
                    'total_posts': stats['total_posts'],
                    'total_users': stats['total_users'],
                    'total_threads': stats['total_threads'],
                    'total_campaigns': stats['total_campaigns'],
                    'high_risk_posts': stats['high_risk_posts'],
                    'likely_bots': stats['likely_bots']
                },
                'sentiment_distribution': stats['sentiment_distribution'],
                'classification_distribution': stats['classification_distribution'],
                'user_stance_distribution': stats['user_stance_distribution'],
                'last_updated': datetime.utcnow().isoformat()
            }
            
            self._send_json(200, {'status': 'success', 'data': result})
            
        except Exception as e:
            self._send_error(500, str(e))
    
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
