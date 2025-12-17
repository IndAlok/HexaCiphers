from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body) if body else {}
            url = data.get('url', '').strip()
            
            if not url:
                self._send_error(400, 'URL is required')
                return
            
            from api._lib.twitter import extract_tweet_id, get_tweet
            from api._lib.classifier import classify_text, calculate_bot_probability
            from api._lib.db import insert_post, update_campaign, DATABASE_URL
            
            tweet_id = extract_tweet_id(url)
            if not tweet_id:
                self._send_error(400, 'Invalid Twitter/X URL')
                return
            
            tweet = get_tweet(tweet_id)
            
            engagement = {
                'likes': tweet.get('likes', 0),
                'retweets': tweet.get('retweets', 0)
            }
            
            classification = classify_text(tweet.get('content', ''), engagement)
            
            user_data = {
                'bio': tweet.get('user_bio'),
                'username': tweet.get('username'),
                'followers': tweet.get('user_followers', 0),
                'following': tweet.get('user_following', 0),
                'tweet_count': tweet.get('user_tweet_count', 0),
                'account_age_days': 365
            }
            bot_prob = calculate_bot_probability(user_data)
            
            result = {
                'tweet': {
                    'tweet_id': tweet.get('tweet_id'),
                    'content': tweet.get('content'),
                    'tweet_type': tweet.get('tweet_type', 'tweet'),
                    'created_at': tweet.get('created_at')
                },
                'user': {
                    'username': tweet.get('username'),
                    'display_name': tweet.get('display_name'),
                    'followers': tweet.get('user_followers'),
                    'following': tweet.get('user_following'),
                    'verified': tweet.get('user_verified'),
                    'profile_image': tweet.get('user_profile_image')
                },
                'engagement': {
                    'likes': tweet.get('likes', 0),
                    'retweets': tweet.get('retweets', 0),
                    'replies': tweet.get('replies', 0),
                    'quotes': tweet.get('quotes', 0)
                },
                'analysis': {
                    'sentiment': classification['sentiment'],
                    'sentiment_confidence': round(classification['sentiment_confidence'], 3),
                    'classification': classification['classification'],
                    'classification_confidence': round(classification['classification_confidence'], 3),
                    'risk_score': round(classification['risk_score'], 1),
                    'bot_probability': round(bot_prob, 3)
                },
                'metadata': {
                    'hashtags': tweet.get('hashtags', []),
                    'mentions': tweet.get('mentions', []),
                    'conversation_id': tweet.get('conversation_id'),
                    'url': url
                }
            }
            
            if DATABASE_URL:
                insert_post({
                    'tweet_id': tweet.get('tweet_id'),
                    'twitter_user_id': tweet.get('user_id'),
                    'content': tweet.get('content'),
                    'tweet_type': tweet.get('tweet_type', 'tweet'),
                    'in_reply_to': tweet.get('in_reply_to'),
                    'quoted_tweet_id': tweet.get('quoted_tweet_id'),
                    'conversation_id': tweet.get('conversation_id'),
                    'likes': tweet.get('likes', 0),
                    'retweets': tweet.get('retweets', 0),
                    'replies': tweet.get('replies', 0),
                    'quotes': tweet.get('quotes', 0),
                    'sentiment': classification['sentiment'],
                    'sentiment_score': classification['sentiment_score'],
                    'classification': classification['classification'],
                    'classification_score': classification['classification_score'],
                    'risk_score': classification['risk_score'],
                    'hashtags': tweet.get('hashtags', []),
                    'mentions': tweet.get('mentions', []),
                    'urls': tweet.get('urls', []),
                    'created_at': tweet.get('created_at')
                })
                
                for hashtag in tweet.get('hashtags', []):
                    update_campaign(hashtag, classification['sentiment_score'], 
                                   classification['classification'], classification['risk_score'])
            
            self._send_json(200, {'status': 'success', 'data': result})
            
        except ValueError as e:
            self._send_error(503, str(e))
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
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
