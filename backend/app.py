from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import psycopg2
import tweepy
import os
from datetime import datetime
import threading
import time
import json
from textblob import TextBlob
import re
from collections import defaultdict
import hashlib

app = Flask(__name__)
CORS(app)

class TwitterMonitor:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'db'),
            'database': os.getenv('DB_NAME', 'sentiment_db'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'password')
        }
        self.twitter_auth = {
            'consumer_key': os.getenv('TWITTER_API_KEY'),
            'consumer_secret': os.getenv('TWITTER_API_SECRET'),
            'access_token': os.getenv('TWITTER_ACCESS_TOKEN'),
            'access_token_secret': os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
            'bearer_token': os.getenv('TWITTER_BEARER_TOKEN')
        }
        self.keywords = self.load_keywords()
        self.monitoring = False
        
    def get_db_connection(self):
        return psycopg2.connect(**self.db_config)
        
    def load_keywords(self):
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT keyword, category, weight FROM keywords WHERE active = true")
            keywords = {}
            for row in cur.fetchall():
                keywords[row[0].lower()] = {'category': row[1], 'weight': row[2]}
            conn.close()
            return keywords
        except:
            return {
                'anti india': {'category': 'political', 'weight': 10},
                'kashmir terrorism': {'category': 'security', 'weight': 9},
                'india fake news': {'category': 'propaganda', 'weight': 8},
                'bharat terrorist': {'category': 'hate', 'weight': 10},
                'indian army fake': {'category': 'military', 'weight': 9}
            }
    
    def analyze_sentiment(self, text):
        blob = TextBlob(text)
        sentiment_score = blob.sentiment.polarity
        
        keyword_score = 0
        matched_keywords = []
        text_lower = text.lower()
        
        for keyword, data in self.keywords.items():
            if keyword in text_lower:
                keyword_score -= data['weight']
                matched_keywords.append(keyword)
        
        final_score = sentiment_score + (keyword_score / 10)
        threat_level = 'low'
        
        if final_score < -0.7 or keyword_score < -15:
            threat_level = 'high'
        elif final_score < -0.3 or keyword_score < -8:
            threat_level = 'medium'
            
        return {
            'sentiment_score': sentiment_score,
            'keyword_score': keyword_score,
            'final_score': final_score,
            'threat_level': threat_level,
            'matched_keywords': matched_keywords
        }
    
    def calculate_engagement_score(self, tweet_data):
        likes = tweet_data.get('public_metrics', {}).get('like_count', 0)
        retweets = tweet_data.get('public_metrics', {}).get('retweet_count', 0)
        replies = tweet_data.get('public_metrics', {}).get('reply_count', 0)
        quotes = tweet_data.get('public_metrics', {}).get('quote_count', 0)
        
        engagement = likes + (retweets * 3) + (replies * 2) + (quotes * 2)
        
        if engagement > 1000:
            return 'viral'
        elif engagement > 100:
            return 'high'
        elif engagement > 10:
            return 'medium'
        return 'low'
    
    def store_tweet(self, tweet_data, analysis):
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            tweet_id = tweet_data['id']
            text = tweet_data['text']
            author_id = tweet_data['author_id']
            created_at = tweet_data['created_at']
            
            metrics = tweet_data.get('public_metrics', {})
            engagement_level = self.calculate_engagement_score(tweet_data)
            
            cur.execute("""
                INSERT INTO tweets (tweet_id, text, author_id, created_at, 
                                  sentiment_score, threat_level, engagement_level,
                                  like_count, retweet_count, reply_count, quote_count,
                                  matched_keywords)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (tweet_id) DO UPDATE SET
                    like_count = EXCLUDED.like_count,
                    retweet_count = EXCLUDED.retweet_count,
                    reply_count = EXCLUDED.reply_count,
                    quote_count = EXCLUDED.quote_count,
                    engagement_level = EXCLUDED.engagement_level
            """, (
                tweet_id, text, author_id, created_at,
                analysis['final_score'], analysis['threat_level'], engagement_level,
                metrics.get('like_count', 0), metrics.get('retweet_count', 0),
                metrics.get('reply_count', 0), metrics.get('quote_count', 0),
                json.dumps(analysis['matched_keywords'])
            ))
            
            conn.commit()
            conn.close()
            
            if analysis['threat_level'] in ['high', 'medium']:
                self.trigger_alert(tweet_data, analysis)
                
        except Exception as e:
            print(f"Error storing tweet: {e}")
    
    def trigger_alert(self, tweet_data, analysis):
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            alert_id = hashlib.md5(f"{tweet_data['id']}{datetime.now()}".encode()).hexdigest()
            
            cur.execute("""
                INSERT INTO alerts (alert_id, tweet_id, threat_level, sentiment_score,
                                  matched_keywords, created_at, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                alert_id, tweet_data['id'], analysis['threat_level'],
                analysis['final_score'], json.dumps(analysis['matched_keywords']),
                datetime.now(), 'active'
            ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error creating alert: {e}")
    
    def start_monitoring(self):
        if not all(self.twitter_auth.values()):
            return False
            
        try:
            client = tweepy.Client(
                bearer_token=self.twitter_auth['bearer_token'],
                consumer_key=self.twitter_auth['consumer_key'],
                consumer_secret=self.twitter_auth['consumer_secret'],
                access_token=self.twitter_auth['access_token'],
                access_token_secret=self.twitter_auth['access_token_secret']
            )
            
            self.monitoring = True
            search_terms = ' OR '.join([f'"{keyword}"' for keyword in self.keywords.keys()])
            
            def monitor_loop():
                while self.monitoring:
                    try:
                        tweets = client.search_recent_tweets(
                            query=f'({search_terms}) -is:retweet lang:en',
                            max_results=100,
                            tweet_fields=['created_at', 'author_id', 'public_metrics', 'context_annotations']
                        )
                        
                        if tweets.data:
                            for tweet in tweets.data:
                                tweet_dict = {
                                    'id': tweet.id,
                                    'text': tweet.text,
                                    'author_id': tweet.author_id,
                                    'created_at': tweet.created_at,
                                    'public_metrics': tweet.public_metrics
                                }
                                
                                analysis = self.analyze_sentiment(tweet.text)
                                self.store_tweet(tweet_dict, analysis)
                        
                        time.sleep(60)
                    except Exception as e:
                        print(f"Monitoring error: {e}")
                        time.sleep(120)
            
            threading.Thread(target=monitor_loop, daemon=True).start()
            return True
            
        except Exception as e:
            print(f"Failed to start monitoring: {e}")
            return False

monitor = TwitterMonitor()

@app.route('/')
def index():
    return jsonify({"status": "HexaCiphers Sentiment Analysis API"})

@app.route('/api/start-monitoring', methods=['POST'])
def start_monitoring():
    if monitor.start_monitoring():
        return jsonify({"status": "success", "message": "Monitoring started"})
    return jsonify({"status": "error", "message": "Failed to start monitoring"}), 400

@app.route('/api/stop-monitoring', methods=['POST'])
def stop_monitoring():
    monitor.monitoring = False
    return jsonify({"status": "success", "message": "Monitoring stopped"})

@app.route('/api/dashboard-data')
def dashboard_data():
    try:
        conn = monitor.get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT threat_level, COUNT(*) 
            FROM tweets 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY threat_level
        """)
        threat_stats = dict(cur.fetchall())
        
        cur.execute("""
            SELECT DATE_TRUNC('hour', created_at) as hour, COUNT(*) 
            FROM tweets 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY hour 
            ORDER BY hour
        """)
        hourly_stats = [(row[0].isoformat(), row[1]) for row in cur.fetchall()]
        
        cur.execute("""
            SELECT tweet_id, text, sentiment_score, threat_level, 
                   like_count, retweet_count, created_at
            FROM tweets 
            WHERE threat_level IN ('high', 'medium')
            ORDER BY created_at DESC 
            LIMIT 20
        """)
        recent_threats = []
        for row in cur.fetchall():
            recent_threats.append({
                'tweet_id': row[0],
                'text': row[1],
                'sentiment_score': float(row[2]),
                'threat_level': row[3],
                'like_count': row[4],
                'retweet_count': row[5],
                'created_at': row[6].isoformat()
            })
        
        cur.execute("""
            SELECT author_id, COUNT(*) as tweet_count, AVG(sentiment_score) as avg_sentiment
            FROM tweets 
            WHERE threat_level IN ('high', 'medium')
            AND created_at >= NOW() - INTERVAL '7 days'
            GROUP BY author_id 
            ORDER BY tweet_count DESC 
            LIMIT 10
        """)
        top_users = []
        for row in cur.fetchall():
            top_users.append({
                'author_id': row[0],
                'tweet_count': row[1],
                'avg_sentiment': float(row[2])
            })
        
        conn.close()
        
        return jsonify({
            'threat_stats': threat_stats,
            'hourly_stats': hourly_stats,
            'recent_threats': recent_threats,
            'top_users': top_users,
            'monitoring_status': monitor.monitoring
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/alerts')
def get_alerts():
    try:
        conn = monitor.get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT a.alert_id, a.tweet_id, a.threat_level, a.sentiment_score,
                   a.matched_keywords, a.created_at, t.text, t.like_count, t.retweet_count
            FROM alerts a
            JOIN tweets t ON a.tweet_id = t.tweet_id
            WHERE a.status = 'active'
            ORDER BY a.created_at DESC
            LIMIT 50
        """)
        
        alerts = []
        for row in cur.fetchall():
            alerts.append({
                'alert_id': row[0],
                'tweet_id': row[1],
                'threat_level': row[2],
                'sentiment_score': float(row[3]),
                'matched_keywords': json.loads(row[4]),
                'created_at': row[5].isoformat(),
                'text': row[6],
                'like_count': row[7],
                'retweet_count': row[8]
            })
        
        conn.close()
        return jsonify(alerts)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/keywords', methods=['GET', 'POST'])
def manage_keywords():
    if request.method == 'GET':
        try:
            conn = monitor.get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT keyword, category, weight, active FROM keywords ORDER BY weight DESC")
            keywords = []
            for row in cur.fetchall():
                keywords.append({
                    'keyword': row[0],
                    'category': row[1],
                    'weight': row[2],
                    'active': row[3]
                })
            conn.close()
            return jsonify(keywords)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        data = request.json
        try:
            conn = monitor.get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO keywords (keyword, category, weight, active)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (keyword) DO UPDATE SET
                    category = EXCLUDED.category,
                    weight = EXCLUDED.weight,
                    active = EXCLUDED.active
            """, (data['keyword'], data['category'], data['weight'], data.get('active', True)))
            conn.commit()
            conn.close()
            
            monitor.keywords = monitor.load_keywords()
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)