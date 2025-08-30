-- Enhanced database schema for sentiment analysis

CREATE DATABASE IF NOT EXISTS sentiment_db;

\c sentiment_db;

-- Keywords table for monitoring
CREATE TABLE IF NOT EXISTS keywords (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    weight INTEGER DEFAULT 5,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tweets table for storing analyzed content
CREATE TABLE IF NOT EXISTS tweets (
    id SERIAL PRIMARY KEY,
    tweet_id VARCHAR(50) UNIQUE NOT NULL,
    text TEXT NOT NULL,
    author_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    sentiment_score FLOAT NOT NULL,
    threat_level VARCHAR(20) NOT NULL,
    engagement_level VARCHAR(20) NOT NULL,
    like_count INTEGER DEFAULT 0,
    retweet_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    quote_count INTEGER DEFAULT 0,
    matched_keywords JSONB,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table for high-threat content
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(100) UNIQUE NOT NULL,
    tweet_id VARCHAR(50) NOT NULL,
    threat_level VARCHAR(20) NOT NULL,
    sentiment_score FLOAT NOT NULL,
    matched_keywords JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (tweet_id) REFERENCES tweets(tweet_id)
);

-- Users table for tracking influential accounts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100),
    display_name VARCHAR(200),
    followers_count INTEGER DEFAULT 0,
    threat_score FLOAT DEFAULT 0,
    last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Network analysis table for tracking connections
CREATE TABLE IF NOT EXISTS user_networks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    connected_user_id VARCHAR(50) NOT NULL,
    connection_type VARCHAR(50) NOT NULL, -- follower, following, mention, retweet
    strength INTEGER DEFAULT 1,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial keyword database
INSERT INTO keywords (keyword, category, weight, active) VALUES
('anti india', 'political', 10, true),
('kashmir terrorism', 'security', 9, true),
('india fake news', 'propaganda', 8, true),
('bharat terrorist', 'hate', 10, true),
('indian army fake', 'military', 9, true),
('hinduphobia', 'religious', 8, true),
('india fascist', 'political', 9, true),
('modi dictator', 'political', 7, true),
('india oppression', 'political', 8, true),
('bollywood propaganda', 'cultural', 6, true),
('indian media lies', 'propaganda', 7, true),
('kashmir occupation', 'political', 9, true),
('india human rights', 'political', 7, true),
('rss terrorist', 'political', 8, true),
('india genocide', 'hate', 10, true),
('bhakt troll', 'social', 5, true),
('india fake encounter', 'security', 8, true),
('indian scammer', 'stereotype', 6, true),
('curry smell', 'racist', 7, true),
('designated streets', 'racist', 8, true)
ON CONFLICT (keyword) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at);
CREATE INDEX IF NOT EXISTS idx_tweets_threat_level ON tweets(threat_level);
CREATE INDEX IF NOT EXISTS idx_tweets_author_id ON tweets(author_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_keywords_active ON keywords(active);