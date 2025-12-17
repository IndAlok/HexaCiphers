import random
from datetime import datetime, timedelta

def get_mock_tweet(tweet_id=None):
    """realistic mock tweet for simulation mode."""
    return {
        'tweet_id': tweet_id or '1234567890',
        'content': "This is a simulated tweet generated because the Twitter API rate limit was exceeded. In a real scenario, this would be the actual tweet content. #Simulation #AI",
        'user_id': '12345',
        'username': 'simulation_user',
        'display_name': 'Simulation User',
        'user_bio': 'Account for testing resilience when API quotas are hit.',
        'user_followers': random.randint(1000, 50000),
        'user_following': random.randint(100, 2000),
        'user_tweet_count': random.randint(500, 10000),
        'user_verified': random.choice([True, False]),
        'user_profile_image': 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
        'user_created_at': (datetime.now() - timedelta(days=365*2)).isoformat(),
        'likes': random.randint(0, 500),
        'retweets': random.randint(0, 100),
        'replies': random.randint(0, 50),
        'quotes': random.randint(0, 20),
        'hashtags': ['Simulation', 'AI'],
        'mentions': [],
        'urls': [],
        'conversation_id': tweet_id or '1234567890',
        'tweet_type': 'tweet',
        'in_reply_to': None,
        'quoted_tweet_id': None,
        'created_at': datetime.now().isoformat()
    }

def get_mock_user(username=None):
    """a realistic mock user profile."""
    username = username or 'simulation_user'
    return {
        'twitter_id': '12345',
        'username': username,
        'display_name': f'{username.capitalize()} (Simulated)',
        'bio': 'This simulated profile ensures the dashboard remains functional during API outages.',
        'followers': random.randint(5000, 100000),
        'following': random.randint(100, 1000),
        'tweet_count': random.randint(1000, 20000),
        'listed_count': random.randint(0, 50),
        'verified': True,
        'profile_image_url': 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
        'account_created_at': (datetime.now() - timedelta(days=1000)).isoformat(),
        'account_age_days': 1000,
        'default_profile_image': False
    }

def get_mock_user_tweets(user_id=None, count=10):
    """a list of mock tweets for a user."""
    tweets = []
    base_time = datetime.now()
    for i in range(count):
        tweets.append({
            'tweet_id': f'sim_{i}',
            'content': f"Simulated tweet #{i+1}. The system is currently in resilient mode due to high traffic. #Tech #Innovation",
            'user_id': user_id or '12345',
            'likes': random.randint(10, 200),
            'retweets': random.randint(0, 50),
            'replies': random.randint(0, 20),
            'quotes': random.randint(0, 5),
            'hashtags': ['Tech', 'Innovation'],
            'mentions': [],
            'conversation_id': f'conv_{i}',
            'tweet_type': 'tweet',
            'in_reply_to': None,
            'created_at': (base_time - timedelta(hours=i*2)).isoformat()
        })
    return tweets

def get_mock_conversation(conversation_id=None, count=5):
    """a mock conversation thread."""
    return get_mock_user_tweets(count=count)
