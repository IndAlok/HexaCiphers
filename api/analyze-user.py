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
            username = data.get('username', '').strip().lstrip('@')
            
            if not username:
                self._send_error(400, 'Username is required')
                return
            
            from api._lib.twitter import get_user, get_user_tweets, extract_username
            from api._lib.classifier import analyze_user_profile, classify_text
            from api._lib.db import upsert_user, insert_post, get_cached, set_cached, DATABASE_URL
            
            username = extract_username(username) or username
            
            cache_key = f'user_analysis:{username.lower()}'
            cached = get_cached(cache_key, max_age_hours=6) if DATABASE_URL else None
            if cached:
                self._send_json(200, {'status': 'success', 'data': cached, 'cached': True})
                return
            
            user = get_user(username)
            tweets = get_user_tweets(user['twitter_id'], max_results=10)
            
            analysis = analyze_user_profile(user, tweets)
            
            tweet_analyses = []
            for tweet in tweets[:20]:
                result = classify_text(tweet.get('content', ''))
                tweet_analyses.append({
                    'tweet_id': tweet.get('tweet_id'),
                    'content': tweet.get('content', '')[:200],
                    'sentiment': result['sentiment'],
                    'classification': result['classification'],
                    'likes': tweet.get('likes', 0),
                    'retweets': tweet.get('retweets', 0),
                    'created_at': tweet.get('created_at')
                })
            
            result = {
                'user': {
                    'twitter_id': user['twitter_id'],
                    'username': user['username'],
                    'display_name': user['display_name'],
                    'bio': user['bio'],
                    'followers': user['followers'],
                    'following': user['following'],
                    'tweet_count': user['tweet_count'],
                    'verified': user['verified'],
                    'profile_image_url': user['profile_image_url'],
                    'account_age_days': user['account_age_days']
                },
                'analysis': {
                    'grade': analysis['grade'],
                    'stance_label': analysis['stance_label'],
                    'stance_score': round(analysis['stance_score'], 3),
                    'bot_probability': round(analysis['bot_probability'], 3),
                    'influence_score': round(analysis['influence_score'], 1),
                    'risk_score': round(analysis['risk_score'], 1),
                    'tweets_analyzed': analysis['tweets_analyzed'],
                    'sentiment_breakdown': analysis['sentiment_breakdown'],
                    'stance_breakdown': analysis['stance_breakdown']
                },
                'recent_tweets': tweet_analyses
            }
            
            if DATABASE_URL:
                upsert_user({
                    'twitter_id': user['twitter_id'],
                    'username': user['username'],
                    'display_name': user['display_name'],
                    'bio': user['bio'],
                    'followers': user['followers'],
                    'following': user['following'],
                    'tweet_count': user['tweet_count'],
                    'account_created_at': user.get('account_created_at'),
                    'profile_image_url': user['profile_image_url'],
                    'verified': user['verified'],
                    'stance_score': analysis['stance_score'],
                    'stance_label': analysis['stance_label'],
                    'bot_probability': analysis['bot_probability'],
                    'influence_score': analysis['influence_score'],
                    'risk_score': analysis['risk_score'],
                    'grade': analysis['grade'],
                    'tweets_analyzed': analysis['tweets_analyzed'],
                    'analysis_data': {
                        'sentiment_breakdown': analysis['sentiment_breakdown'],
                        'stance_breakdown': analysis['stance_breakdown']
                    }
                })
                
                for tweet in tweets:
                    tweet_result = classify_text(tweet.get('content', ''))
                    insert_post({
                        'tweet_id': tweet.get('tweet_id'),
                        'twitter_user_id': user['twitter_id'],
                        'content': tweet.get('content'),
                        'tweet_type': tweet.get('tweet_type', 'tweet'),
                        'in_reply_to': tweet.get('in_reply_to'),
                        'conversation_id': tweet.get('conversation_id'),
                        'likes': tweet.get('likes', 0),
                        'retweets': tweet.get('retweets', 0),
                        'replies': tweet.get('replies', 0),
                        'quotes': tweet.get('quotes', 0),
                        'sentiment': tweet_result['sentiment'],
                        'sentiment_score': tweet_result['sentiment_score'],
                        'classification': tweet_result['classification'],
                        'classification_score': tweet_result['classification_score'],
                        'risk_score': tweet_result['risk_score'],
                        'hashtags': tweet.get('hashtags', []),
                        'mentions': tweet.get('mentions', []),
                        'created_at': tweet.get('created_at')
                    })
                
                set_cached(cache_key, result, ttl_hours=6)
            
            self._send_json(200, {'status': 'success', 'data': result})
            
        except ValueError as e:
            error_msg = str(e)
            if '429' in error_msg:
                #Rate Limit Hit :sad: - fallback to demo
                from api._lib.simulator import get_mock_user, get_mock_user_tweets
                user = get_mock_user(username)
                tweets = get_mock_user_tweets(user['twitter_id'], count=10)               
                #Perform actual analysis on mock data
                analysis = analyze_user_profile(user, tweets)
                
                tweet_analyses = []
                for tweet in tweets:
                    result = classify_text(tweet.get('content', ''))
                    tweet_analyses.append({
                        'tweet_id': tweet.get('tweet_id'),
                        'content': tweet.get('content', '')[:200],
                        'sentiment': result['sentiment'],
                        'classification': result['classification'],
                        'likes': tweet.get('likes', 0),
                        'retweets': tweet.get('retweets', 0),
                        'created_at': tweet.get('created_at')
                    })
                
                result = {
                    'user': {
                        'twitter_id': user['twitter_id'],
                        'username': user['username'],
                        'display_name': user['display_name'],
                        'bio': user['bio'],
                        'followers': user['followers'],
                        'following': user['following'],
                        'tweet_count': user['tweet_count'],
                        'verified': user['verified'],
                        'profile_image_url': user['profile_image_url'],
                        'account_age_days': user['account_age_days']
                    },
                    'analysis': {
                        'grade': analysis['grade'],
                        'stance_label': analysis['stance_label'],
                        'stance_score': round(analysis['stance_score'], 3),
                        'bot_probability': round(analysis['bot_probability'], 3),
                        'influence_score': round(analysis['influence_score'], 1),
                        'risk_score': round(analysis['risk_score'], 1),
                        'tweets_analyzed': analysis['tweets_analyzed'],
                        'sentiment_breakdown': analysis['sentiment_breakdown'],
                        'stance_breakdown': analysis['stance_breakdown']
                    },
                    'recent_tweets': tweet_analyses,
                    'simulation_mode': True
                }
                self._send_json(200, {'status': 'success', 'data': result, 'source': 'simulation'})
            else:
                self._send_error(503, error_msg)
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
