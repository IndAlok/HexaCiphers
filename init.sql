-- Fixed database schema for sentiment analysis

-- Create database (remove IF NOT EXISTS as it's not needed in init script)
-- CREATE DATABASE sentiment_db; -- Remove this line, database is created by container

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
    matched_keywords TEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table for high-threat content
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_id VARCHAR(100) UNIQUE NOT NULL,
    tweet_id VARCHAR(50) NOT NULL,
    threat_level VARCHAR(20) NOT NULL,
    sentiment_score FLOAT NOT NULL,
    matched_keywords TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
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
('bollywood propaganda', 'cultural', 6, true)
ON CONFLICT (keyword) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at);
CREATE INDEX IF NOT EXISTS idx_tweets_threat_level ON tweets(threat_level);
CREATE INDEX IF NOT EXISTS idx_tweets_author_id ON tweets(author_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);