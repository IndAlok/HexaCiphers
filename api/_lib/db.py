import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from datetime import datetime, timedelta
import json

DATABASE_URL = os.environ.get('DATABASE_URL')

@contextmanager
def get_connection():
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        yield conn
    finally:
        if conn:
            conn.close()

def init_tables():
    if not DATABASE_URL:
        return False
    
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    twitter_id VARCHAR(64) UNIQUE,
                    username VARCHAR(128),
                    display_name VARCHAR(256),
                    bio TEXT,
                    followers INTEGER DEFAULT 0,
                    following INTEGER DEFAULT 0,
                    tweet_count INTEGER DEFAULT 0,
                    account_created_at TIMESTAMP,
                    profile_image_url TEXT,
                    verified BOOLEAN DEFAULT FALSE,
                    stance_score FLOAT DEFAULT 0,
                    stance_label VARCHAR(32) DEFAULT 'Neutral',
                    bot_probability FLOAT DEFAULT 0,
                    influence_score FLOAT DEFAULT 0,
                    risk_score FLOAT DEFAULT 0,
                    grade VARCHAR(8) DEFAULT 'N/A',
                    tweets_analyzed INTEGER DEFAULT 0,
                    last_analyzed TIMESTAMP,
                    analysis_data JSONB DEFAULT '{}'
                );

                CREATE TABLE IF NOT EXISTS posts (
                    id SERIAL PRIMARY KEY,
                    tweet_id VARCHAR(64) UNIQUE,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    twitter_user_id VARCHAR(64),
                    content TEXT,
                    platform VARCHAR(32) DEFAULT 'Twitter',
                    tweet_type VARCHAR(32) DEFAULT 'tweet',
                    in_reply_to VARCHAR(64),
                    quoted_tweet_id VARCHAR(64),
                    conversation_id VARCHAR(64),
                    likes INTEGER DEFAULT 0,
                    retweets INTEGER DEFAULT 0,
                    replies INTEGER DEFAULT 0,
                    quotes INTEGER DEFAULT 0,
                    sentiment VARCHAR(32),
                    sentiment_score FLOAT DEFAULT 0,
                    classification VARCHAR(32),
                    classification_score FLOAT DEFAULT 0,
                    risk_score FLOAT DEFAULT 0,
                    hashtags JSONB DEFAULT '[]',
                    mentions JSONB DEFAULT '[]',
                    urls JSONB DEFAULT '[]',
                    created_at TIMESTAMP,
                    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS threads (
                    id SERIAL PRIMARY KEY,
                    root_tweet_id VARCHAR(64) UNIQUE,
                    conversation_id VARCHAR(64),
                    tweet_count INTEGER DEFAULT 0,
                    reply_count INTEGER DEFAULT 0,
                    unique_users INTEGER DEFAULT 0,
                    total_engagement INTEGER DEFAULT 0,
                    avg_sentiment_score FLOAT DEFAULT 0,
                    dominant_sentiment VARCHAR(32),
                    dominant_stance VARCHAR(32),
                    controversy_score FLOAT DEFAULT 0,
                    pro_india_count INTEGER DEFAULT 0,
                    anti_india_count INTEGER DEFAULT 0,
                    neutral_count INTEGER DEFAULT 0,
                    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    thread_data JSONB DEFAULT '{}'
                );

                CREATE TABLE IF NOT EXISTS campaigns (
                    id SERIAL PRIMARY KEY,
                    hashtag VARCHAR(256) UNIQUE,
                    name VARCHAR(256),
                    volume INTEGER DEFAULT 0,
                    unique_users INTEGER DEFAULT 0,
                    avg_sentiment FLOAT DEFAULT 0,
                    dominant_stance VARCHAR(32),
                    risk_score FLOAT DEFAULT 0,
                    coordination_score FLOAT DEFAULT 0,
                    bot_percentage FLOAT DEFAULT 0,
                    first_detected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    metadata JSONB DEFAULT '{}'
                );

                CREATE TABLE IF NOT EXISTS trend_snapshots (
                    id SERIAL PRIMARY KEY,
                    hashtag VARCHAR(256),
                    snapshot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    volume INTEGER DEFAULT 0,
                    sentiment_positive INTEGER DEFAULT 0,
                    sentiment_negative INTEGER DEFAULT 0,
                    sentiment_neutral INTEGER DEFAULT 0,
                    velocity FLOAT DEFAULT 0,
                    top_users JSONB DEFAULT '[]'
                );

                CREATE TABLE IF NOT EXISTS api_cache (
                    id SERIAL PRIMARY KEY,
                    cache_key VARCHAR(256) UNIQUE,
                    data JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(twitter_user_id);
                CREATE INDEX IF NOT EXISTS idx_posts_conversation ON posts(conversation_id);
                CREATE INDEX IF NOT EXISTS idx_posts_sentiment ON posts(sentiment);
                CREATE INDEX IF NOT EXISTS idx_posts_classification ON posts(classification);
                CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
                CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
                CREATE INDEX IF NOT EXISTS idx_users_stance ON users(stance_label);
                CREATE INDEX IF NOT EXISTS idx_campaigns_hashtag ON campaigns(hashtag);
                CREATE INDEX IF NOT EXISTS idx_cache_key ON api_cache(cache_key);
                CREATE INDEX IF NOT EXISTS idx_cache_expires ON api_cache(expires_at);
            """)
            conn.commit()
    return True

def get_cached(cache_key, max_age_hours=24):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT data FROM api_cache 
                WHERE cache_key = %s AND expires_at > NOW()
            """, (cache_key,))
            row = cur.fetchone()
            return row['data'] if row else None

def set_cached(cache_key, data, ttl_hours=24):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO api_cache (cache_key, data, expires_at)
                VALUES (%s, %s, NOW() + INTERVAL '%s hours')
                ON CONFLICT (cache_key) DO UPDATE SET
                    data = EXCLUDED.data,
                    expires_at = EXCLUDED.expires_at,
                    created_at = NOW()
            """, (cache_key, json.dumps(data), ttl_hours))
            conn.commit()

def upsert_user(data):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO users (twitter_id, username, display_name, bio, followers, following, 
                    tweet_count, account_created_at, profile_image_url, verified,
                    stance_score, stance_label, bot_probability, influence_score, risk_score, 
                    grade, tweets_analyzed, last_analyzed, analysis_data)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), %s)
                ON CONFLICT (twitter_id) DO UPDATE SET
                    username = EXCLUDED.username,
                    display_name = EXCLUDED.display_name,
                    bio = EXCLUDED.bio,
                    followers = EXCLUDED.followers,
                    following = EXCLUDED.following,
                    tweet_count = EXCLUDED.tweet_count,
                    profile_image_url = EXCLUDED.profile_image_url,
                    verified = EXCLUDED.verified,
                    stance_score = EXCLUDED.stance_score,
                    stance_label = EXCLUDED.stance_label,
                    bot_probability = EXCLUDED.bot_probability,
                    influence_score = EXCLUDED.influence_score,
                    risk_score = EXCLUDED.risk_score,
                    grade = EXCLUDED.grade,
                    tweets_analyzed = EXCLUDED.tweets_analyzed,
                    last_analyzed = NOW(),
                    analysis_data = EXCLUDED.analysis_data
                RETURNING id
            """, (
                data.get('twitter_id'),
                data.get('username'),
                data.get('display_name'),
                data.get('bio'),
                data.get('followers', 0),
                data.get('following', 0),
                data.get('tweet_count', 0),
                data.get('account_created_at'),
                data.get('profile_image_url'),
                data.get('verified', False),
                data.get('stance_score', 0),
                data.get('stance_label', 'Neutral'),
                data.get('bot_probability', 0),
                data.get('influence_score', 0),
                data.get('risk_score', 0),
                data.get('grade', 'N/A'),
                data.get('tweets_analyzed', 0),
                json.dumps(data.get('analysis_data', {}))
            ))
            conn.commit()
            return cur.fetchone()['id']

def insert_post(data):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO posts (tweet_id, twitter_user_id, content, platform, tweet_type,
                    in_reply_to, quoted_tweet_id, conversation_id, likes, retweets, replies, quotes,
                    sentiment, sentiment_score, classification, classification_score, risk_score,
                    hashtags, mentions, urls, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (tweet_id) DO UPDATE SET
                    sentiment = EXCLUDED.sentiment,
                    sentiment_score = EXCLUDED.sentiment_score,
                    classification = EXCLUDED.classification,
                    classification_score = EXCLUDED.classification_score,
                    risk_score = EXCLUDED.risk_score,
                    analyzed_at = NOW()
                RETURNING id
            """, (
                data.get('tweet_id'),
                data.get('twitter_user_id'),
                data.get('content'),
                data.get('platform', 'Twitter'),
                data.get('tweet_type', 'tweet'),
                data.get('in_reply_to'),
                data.get('quoted_tweet_id'),
                data.get('conversation_id'),
                data.get('likes', 0),
                data.get('retweets', 0),
                data.get('replies', 0),
                data.get('quotes', 0),
                data.get('sentiment'),
                data.get('sentiment_score', 0),
                data.get('classification'),
                data.get('classification_score', 0),
                data.get('risk_score', 0),
                json.dumps(data.get('hashtags', [])),
                json.dumps(data.get('mentions', [])),
                json.dumps(data.get('urls', [])),
                data.get('created_at')
            ))
            conn.commit()
            return cur.fetchone()['id']

def upsert_thread(data):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO threads (root_tweet_id, conversation_id, tweet_count, reply_count,
                    unique_users, total_engagement, avg_sentiment_score, dominant_sentiment,
                    dominant_stance, controversy_score, pro_india_count, anti_india_count,
                    neutral_count, thread_data)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (root_tweet_id) DO UPDATE SET
                    tweet_count = EXCLUDED.tweet_count,
                    reply_count = EXCLUDED.reply_count,
                    unique_users = EXCLUDED.unique_users,
                    total_engagement = EXCLUDED.total_engagement,
                    avg_sentiment_score = EXCLUDED.avg_sentiment_score,
                    dominant_sentiment = EXCLUDED.dominant_sentiment,
                    dominant_stance = EXCLUDED.dominant_stance,
                    controversy_score = EXCLUDED.controversy_score,
                    pro_india_count = EXCLUDED.pro_india_count,
                    anti_india_count = EXCLUDED.anti_india_count,
                    neutral_count = EXCLUDED.neutral_count,
                    thread_data = EXCLUDED.thread_data,
                    analyzed_at = NOW()
                RETURNING id
            """, (
                data.get('root_tweet_id'),
                data.get('conversation_id'),
                data.get('tweet_count', 0),
                data.get('reply_count', 0),
                data.get('unique_users', 0),
                data.get('total_engagement', 0),
                data.get('avg_sentiment_score', 0),
                data.get('dominant_sentiment'),
                data.get('dominant_stance'),
                data.get('controversy_score', 0),
                data.get('pro_india_count', 0),
                data.get('anti_india_count', 0),
                data.get('neutral_count', 0),
                json.dumps(data.get('thread_data', {}))
            ))
            conn.commit()
            return cur.fetchone()['id']

def get_posts(limit=50):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM posts ORDER BY analyzed_at DESC LIMIT %s", (limit,))
            return cur.fetchall()

def get_users(limit=50):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users ORDER BY last_analyzed DESC LIMIT %s", (limit,))
            return cur.fetchall()

def get_user_by_username(username):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
            return cur.fetchone()

def get_threads(limit=20):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM threads ORDER BY analyzed_at DESC LIMIT %s", (limit,))
            return cur.fetchall()

def get_stats():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) as total FROM posts")
            total_posts = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as total FROM users")
            total_users = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as total FROM threads")
            total_threads = cur.fetchone()['total']
            
            cur.execute("SELECT sentiment, COUNT(*) as count FROM posts WHERE sentiment IS NOT NULL GROUP BY sentiment")
            sentiment_rows = cur.fetchall()
            sentiment_dist = {row['sentiment']: row['count'] for row in sentiment_rows}
            
            cur.execute("SELECT classification, COUNT(*) as count FROM posts WHERE classification IS NOT NULL GROUP BY classification")
            class_rows = cur.fetchall()
            class_dist = {row['classification']: row['count'] for row in class_rows}
            
            cur.execute("SELECT COUNT(*) as total FROM campaigns WHERE is_active = TRUE")
            total_campaigns = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as count FROM posts WHERE risk_score > 70")
            high_risk = cur.fetchone()['count']
            
            cur.execute("SELECT COUNT(*) as count FROM users WHERE bot_probability > 0.7")
            likely_bots = cur.fetchone()['count']
            
            cur.execute("SELECT stance_label, COUNT(*) as count FROM users WHERE stance_label IS NOT NULL GROUP BY stance_label")
            stance_rows = cur.fetchall()
            stance_dist = {row['stance_label']: row['count'] for row in stance_rows}
            
            return {
                'total_posts': total_posts,
                'total_users': total_users,
                'total_threads': total_threads,
                'total_campaigns': total_campaigns,
                'high_risk_posts': high_risk,
                'likely_bots': likely_bots,
                'sentiment_distribution': {
                    'positive': sentiment_dist.get('positive', 0),
                    'negative': sentiment_dist.get('negative', 0),
                    'neutral': sentiment_dist.get('neutral', 0)
                },
                'classification_distribution': {
                    'pro_india': class_dist.get('Pro-India', 0),
                    'anti_india': class_dist.get('Anti-India', 0),
                    'neutral': class_dist.get('Neutral', 0)
                },
                'user_stance_distribution': stance_dist
            }

def get_campaigns(limit=50):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM campaigns WHERE is_active = TRUE ORDER BY volume DESC LIMIT %s", (limit,))
            return cur.fetchall()

def update_campaign(hashtag, sentiment_score=0, classification='Neutral', risk_score=0):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO campaigns (hashtag, volume, avg_sentiment, dominant_stance, risk_score)
                VALUES (%s, 1, %s, %s, %s)
                ON CONFLICT (hashtag) DO UPDATE SET
                    volume = campaigns.volume + 1,
                    avg_sentiment = (campaigns.avg_sentiment * campaigns.volume + %s) / (campaigns.volume + 1),
                    risk_score = GREATEST(campaigns.risk_score, %s),
                    last_activity = NOW()
                RETURNING id
            """, (hashtag.lower(), sentiment_score, classification, risk_score, sentiment_score, risk_score))
            conn.commit()
            return cur.fetchone()['id']
