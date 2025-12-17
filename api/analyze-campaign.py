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
            hashtag = data.get('hashtag', '').strip().lstrip('#')
            
            if not hashtag:
                self._send_error(400, 'Hashtag is required')
                return
            
            from api._lib.twitter import search_tweets
            from api._lib.classifier import classify_text, calculate_bot_probability
            from api._lib.db import update_campaign, insert_post, get_cached, set_cached, DATABASE_URL
            
            cache_key = f'campaign_analysis:{hashtag.lower()}'
            cached = get_cached(cache_key, max_age_hours=1) if DATABASE_URL else None
            if cached:
                self._send_json(200, {'status': 'success', 'data': cached, 'cached': True})
                return
            
            tweets = search_tweets(f'#{hashtag}', max_results=10)
            
            if not tweets:
                self._send_error(404, f'No tweets found for #{hashtag}')
                return
            
            users = set()
            user_data = {}
            sentiments = []
            stances = []
            total_engagement = 0
            suspicious_count = 0
            
            analyzed_tweets = []
            for tweet in tweets:
                user_id = tweet.get('user_id')
                users.add(user_id)
                
                if user_id not in user_data:
                    user_data[user_id] = {
                        'username': tweet.get('username'),
                        'followers': tweet.get('user_followers', 0),
                        'tweet_count': 1
                    }
                else:
                    user_data[user_id]['tweet_count'] += 1
                
                result = classify_text(tweet.get('content', ''))
                sentiments.append(result['sentiment'])
                stances.append(result['classification'])
                
                engagement = tweet.get('likes', 0) + tweet.get('retweets', 0)
                total_engagement += engagement
                
                if tweet.get('user_followers', 0) < 10 and engagement > 100:
                    suspicious_count += 1
                
                analyzed_tweets.append({
                    'tweet_id': tweet.get('tweet_id'),
                    'username': tweet.get('username'),
                    'content': tweet.get('content', '')[:200],
                    'sentiment': result['sentiment'],
                    'classification': result['classification'],
                    'risk_score': result['risk_score'],
                    'likes': tweet.get('likes', 0),
                    'retweets': tweet.get('retweets', 0),
                    'created_at': tweet.get('created_at')
                })
            
            pos = sentiments.count('positive')
            neg = sentiments.count('negative')
            dominant_sentiment = 'positive' if pos > neg else 'negative' if neg > pos else 'neutral'
            
            pro = stances.count('Pro-India')
            anti = stances.count('Anti-India')
            dominant_stance = 'Pro-India' if pro > anti else 'Anti-India' if anti > pro else 'Neutral'
            
            high_activity_users = [u for u, d in user_data.items() if d['tweet_count'] > 2]
            coordination_score = len(high_activity_users) / max(len(users), 1)
            
            bot_percentage = suspicious_count / max(len(tweets), 1)
            
            risk_score = 0
            if dominant_stance == 'Anti-India':
                risk_score += 40
            risk_score += coordination_score * 30
            risk_score += bot_percentage * 30
            risk_score = min(100, risk_score)
            
            top_users = sorted(
                [{'username': d['username'], 'tweets': d['tweet_count'], 'followers': d['followers']} 
                 for d in user_data.values()],
                key=lambda x: x['tweets'],
                reverse=True
            )[:10]
            
            result = {
                'hashtag': hashtag,
                'analysis': {
                    'tweet_count': len(tweets),
                    'unique_users': len(users),
                    'total_engagement': total_engagement,
                    'avg_engagement': round(total_engagement / max(len(tweets), 1), 1),
                    'dominant_sentiment': dominant_sentiment,
                    'dominant_stance': dominant_stance,
                    'coordination_score': round(coordination_score, 3),
                    'bot_percentage': round(bot_percentage, 3),
                    'risk_score': round(risk_score, 1),
                    'sentiment_breakdown': {
                        'positive': pos,
                        'negative': neg,
                        'neutral': sentiments.count('neutral')
                    },
                    'stance_breakdown': {
                        'pro_india': pro,
                        'anti_india': anti,
                        'neutral': stances.count('Neutral')
                    }
                },
                'top_users': top_users,
                'sample_tweets': analyzed_tweets[:20]
            }
            
            if DATABASE_URL:
                avg_sentiment = (pos - neg) / max(len(tweets), 1)
                update_campaign(hashtag, avg_sentiment, dominant_stance, risk_score)
                
                for tweet in tweets:
                    tweet_result = classify_text(tweet.get('content', ''))
                    insert_post({
                        'tweet_id': tweet.get('tweet_id'),
                        'twitter_user_id': tweet.get('user_id'),
                        'content': tweet.get('content'),
                        'likes': tweet.get('likes', 0),
                        'retweets': tweet.get('retweets', 0),
                        'sentiment': tweet_result['sentiment'],
                        'sentiment_score': tweet_result['sentiment_score'],
                        'classification': tweet_result['classification'],
                        'risk_score': tweet_result['risk_score'],
                        'hashtags': [hashtag],
                        'created_at': tweet.get('created_at')
                    })
                
                set_cached(cache_key, result, ttl_hours=1)
            
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
