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
                self._send_error(400, 'Tweet URL is required')
                return
            
            from api._lib.twitter import extract_tweet_id, get_tweet, get_conversation
            from api._lib.classifier import analyze_thread, classify_text
            from api._lib.db import upsert_thread, insert_post, get_cached, set_cached, DATABASE_URL
            
            tweet_id = extract_tweet_id(url)
            if not tweet_id:
                self._send_error(400, 'Invalid Twitter/X URL')
                return
            
            cache_key = f'thread_analysis:{tweet_id}'
            cached = get_cached(cache_key, max_age_hours=2) if DATABASE_URL else None
            if cached:
                self._send_json(200, {'status': 'success', 'data': cached, 'cached': True})
                return
            
            root_tweet = get_tweet(tweet_id)
            conversation_id = root_tweet.get('conversation_id', tweet_id)
            
            replies = get_conversation(conversation_id, max_results=10)
            
            all_tweets = [root_tweet] + replies
            
            thread_analysis = analyze_thread(all_tweets)
            
            root_classification = classify_text(root_tweet.get('content', ''))
            
            analyzed_replies = []
            for reply in replies[:30]:
                result = classify_text(reply.get('content', ''))
                analyzed_replies.append({
                    'tweet_id': reply.get('tweet_id'),
                    'username': reply.get('username'),
                    'content': reply.get('content', '')[:200],
                    'sentiment': result['sentiment'],
                    'classification': result['classification'],
                    'likes': reply.get('likes', 0),
                    'in_reply_to': reply.get('in_reply_to'),
                    'created_at': reply.get('created_at')
                })
            
            result = {
                'root_tweet': {
                    'tweet_id': root_tweet.get('tweet_id'),
                    'content': root_tweet.get('content'),
                    'username': root_tweet.get('username'),
                    'display_name': root_tweet.get('display_name'),
                    'user_followers': root_tweet.get('user_followers'),
                    'likes': root_tweet.get('likes'),
                    'retweets': root_tweet.get('retweets'),
                    'replies': root_tweet.get('replies'),
                    'quotes': root_tweet.get('quotes'),
                    'sentiment': root_classification['sentiment'],
                    'classification': root_classification['classification'],
                    'risk_score': root_classification['risk_score'],
                    'created_at': root_tweet.get('created_at')
                },
                'thread_analysis': {
                    'tweet_count': thread_analysis['tweet_count'],
                    'reply_count': thread_analysis['reply_count'],
                    'unique_users': thread_analysis['unique_users'],
                    'total_engagement': thread_analysis['total_engagement'],
                    'dominant_sentiment': thread_analysis['dominant_sentiment'],
                    'dominant_stance': thread_analysis['dominant_stance'],
                    'controversy_score': round(thread_analysis['controversy_score'], 3),
                    'avg_sentiment_score': round(thread_analysis['avg_sentiment_score'], 3),
                    'pro_india_count': thread_analysis['pro_india_count'],
                    'anti_india_count': thread_analysis['anti_india_count'],
                    'neutral_count': thread_analysis['neutral_count'],
                    'sentiment_breakdown': thread_analysis['sentiment_breakdown']
                },
                'replies': analyzed_replies,
                'conversation_id': conversation_id
            }
            
            if DATABASE_URL:
                upsert_thread({
                    'root_tweet_id': tweet_id,
                    'conversation_id': conversation_id,
                    'tweet_count': thread_analysis['tweet_count'],
                    'reply_count': thread_analysis['reply_count'],
                    'unique_users': thread_analysis['unique_users'],
                    'total_engagement': thread_analysis['total_engagement'],
                    'avg_sentiment_score': thread_analysis['avg_sentiment_score'],
                    'dominant_sentiment': thread_analysis['dominant_sentiment'],
                    'dominant_stance': thread_analysis['dominant_stance'],
                    'controversy_score': thread_analysis['controversy_score'],
                    'pro_india_count': thread_analysis['pro_india_count'],
                    'anti_india_count': thread_analysis['anti_india_count'],
                    'neutral_count': thread_analysis['neutral_count'],
                    'thread_data': {
                        'sentiment_breakdown': thread_analysis['sentiment_breakdown'],
                        'root_tweet_content': root_tweet.get('content', '')[:500]
                    }
                })
                
                for tweet in all_tweets:
                    tweet_result = classify_text(tweet.get('content', ''))
                    insert_post({
                        'tweet_id': tweet.get('tweet_id'),
                        'twitter_user_id': tweet.get('user_id'),
                        'content': tweet.get('content'),
                        'tweet_type': 'reply' if tweet.get('in_reply_to') else 'tweet',
                        'in_reply_to': tweet.get('in_reply_to'),
                        'conversation_id': conversation_id,
                        'likes': tweet.get('likes', 0),
                        'retweets': tweet.get('retweets', 0),
                        'replies': tweet.get('replies', 0),
                        'sentiment': tweet_result['sentiment'],
                        'sentiment_score': tweet_result['sentiment_score'],
                        'classification': tweet_result['classification'],
                        'classification_score': tweet_result['classification_score'],
                        'risk_score': tweet_result['risk_score'],
                        'hashtags': tweet.get('hashtags', []),
                        'created_at': tweet.get('created_at')
                    })
                
                set_cached(cache_key, result, ttl_hours=2)
            
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
