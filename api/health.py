from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        db_url = os.environ.get('DATABASE_URL', '')
        twitter_token = os.environ.get('TWITTER_BEARER_TOKEN', '')
        
        db_check = {
            'configured': bool(db_url),
            'connected': False,
            'error': None
        }
        
        if db_url:
            try:
                from api._lib.db import get_connection
                with get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT 1")
                        db_check['connected'] = True
            except Exception as e:
                db_check['error'] = str(e)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'status': 'healthy',
            'version': '2.1.0',
            'environment': os.environ.get('VERCEL_ENV', 'unknown'),
            'checks': {
                'database': db_check['connected'],
                'twitter_api': bool(twitter_token)
            },
            'details': {
                'database': db_check,
                'twitter_configured': bool(twitter_token),
                'db_url_present': bool(db_url),
                'db_url_length': len(db_url) if db_url else 0
            }
        }
        
        self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
