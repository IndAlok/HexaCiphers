import os
import re
import json
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime

BEARER_TOKEN = os.environ.get('TWITTER_BEARER_TOKEN')
API_BASE = 'https://api.twitter.com/2'

def _make_request(url, method='GET'):
    if not BEARER_TOKEN:
        raise ValueError('TWITTER_BEARER_TOKEN not configured')
    
    req = urllib.request.Request(url, method=method)
    req.add_header('Authorization', f'Bearer {BEARER_TOKEN}')
    req.add_header('User-Agent', 'HexaCiphers/2.0')
    
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ''
        raise ValueError(f'Twitter API error {e.code}: {error_body}')

def extract_tweet_id(url):
    patterns = [
        r'twitter\.com/[^/]+/status/(\d+)',
        r'x\.com/[^/]+/status/(\d+)',
        r'mobile\.twitter\.com/[^/]+/status/(\d+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, url.lower())
        if match:
            return match.group(1)
    return None

def extract_username(url_or_username):
    if url_or_username.startswith('http'):
        patterns = [
            r'twitter\.com/([^/\?]+)',
            r'x\.com/([^/\?]+)',
        ]
        for pattern in patterns:
            match = re.search(pattern, url_or_username.lower())
            if match:
                username = match.group(1)
                if username not in ['i', 'intent', 'search', 'hashtag', 'home']:
                    return username
        return None
    return url_or_username.lstrip('@')

def get_tweet(tweet_id, include_author=True):
    fields = 'created_at,author_id,public_metrics,entities,conversation_id,in_reply_to_user_id,referenced_tweets'
    url = f'{API_BASE}/tweets/{tweet_id}?tweet.fields={fields}'
    
    if include_author:
        url += '&expansions=author_id,referenced_tweets.id&user.fields=username,name,public_metrics,created_at,description,profile_image_url,verified'
    
    data = _make_request(url)
    tweet = data.get('data', {})
    users = {u['id']: u for u in data.get('includes', {}).get('users', [])}
    author = users.get(tweet.get('author_id'), {})
    
    metrics = tweet.get('public_metrics', {})
    entities = tweet.get('entities', {})
    
    referenced = tweet.get('referenced_tweets', [])
    tweet_type = 'tweet'
    in_reply_to = None
    quoted_tweet_id = None
    
    for ref in referenced:
        if ref.get('type') == 'replied_to':
            tweet_type = 'reply'
            in_reply_to = ref.get('id')
        elif ref.get('type') == 'quoted':
            tweet_type = 'quote'
            quoted_tweet_id = ref.get('id')
        elif ref.get('type') == 'retweeted':
            tweet_type = 'retweet'
    
    return {
        'tweet_id': tweet.get('id'),
        'content': tweet.get('text', ''),
        'user_id': tweet.get('author_id'),
        'username': author.get('username', ''),
        'display_name': author.get('name', ''),
        'user_bio': author.get('description', ''),
        'user_followers': author.get('public_metrics', {}).get('followers_count', 0),
        'user_following': author.get('public_metrics', {}).get('following_count', 0),
        'user_tweet_count': author.get('public_metrics', {}).get('tweet_count', 0),
        'user_verified': author.get('verified', False),
        'user_profile_image': author.get('profile_image_url', ''),
        'user_created_at': author.get('created_at'),
        'likes': metrics.get('like_count', 0),
        'retweets': metrics.get('retweet_count', 0),
        'replies': metrics.get('reply_count', 0),
        'quotes': metrics.get('quote_count', 0),
        'hashtags': [h.get('tag', '') for h in entities.get('hashtags', [])],
        'mentions': [m.get('username', '') for m in entities.get('mentions', [])],
        'urls': [u.get('expanded_url', '') for u in entities.get('urls', [])],
        'conversation_id': tweet.get('conversation_id'),
        'tweet_type': tweet_type,
        'in_reply_to': in_reply_to,
        'quoted_tweet_id': quoted_tweet_id,
        'created_at': tweet.get('created_at')
    }

def get_user(username):
    url = f'{API_BASE}/users/by/username/{username}?user.fields=created_at,description,public_metrics,profile_image_url,verified'
    
    data = _make_request(url)
    user = data.get('data', {})
    metrics = user.get('public_metrics', {})
    
    created_at = user.get('created_at')
    account_age_days = 365
    if created_at:
        try:
            created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            account_age_days = (datetime.now(created.tzinfo) - created).days
        except:
            pass
    
    return {
        'twitter_id': user.get('id'),
        'username': user.get('username'),
        'display_name': user.get('name'),
        'bio': user.get('description'),
        'followers': metrics.get('followers_count', 0),
        'following': metrics.get('following_count', 0),
        'tweet_count': metrics.get('tweet_count', 0),
        'listed_count': metrics.get('listed_count', 0),
        'verified': user.get('verified', False),
        'profile_image_url': user.get('profile_image_url'),
        'account_created_at': created_at,
        'account_age_days': account_age_days,
        'default_profile_image': 'default_profile' in (user.get('profile_image_url') or '')
    }

def get_user_tweets(user_id, max_results=100):
    fields = 'created_at,public_metrics,entities,conversation_id,in_reply_to_user_id,referenced_tweets'
    url = f'{API_BASE}/users/{user_id}/tweets?tweet.fields={fields}&max_results={min(max_results, 100)}&exclude=retweets'
    
    data = _make_request(url)
    tweets = data.get('data', [])
    
    results = []
    for tweet in tweets:
        metrics = tweet.get('public_metrics', {})
        entities = tweet.get('entities', {})
        
        referenced = tweet.get('referenced_tweets', [])
        tweet_type = 'tweet'
        in_reply_to = None
        
        for ref in referenced:
            if ref.get('type') == 'replied_to':
                tweet_type = 'reply'
                in_reply_to = ref.get('id')
        
        results.append({
            'tweet_id': tweet.get('id'),
            'content': tweet.get('text', ''),
            'user_id': user_id,
            'likes': metrics.get('like_count', 0),
            'retweets': metrics.get('retweet_count', 0),
            'replies': metrics.get('reply_count', 0),
            'quotes': metrics.get('quote_count', 0),
            'hashtags': [h.get('tag', '') for h in entities.get('hashtags', [])],
            'mentions': [m.get('username', '') for m in entities.get('mentions', [])],
            'conversation_id': tweet.get('conversation_id'),
            'tweet_type': tweet_type,
            'in_reply_to': in_reply_to,
            'created_at': tweet.get('created_at')
        })
    
    return results

def get_conversation(conversation_id, max_results=100):
    query = urllib.parse.quote(f'conversation_id:{conversation_id}')
    fields = 'created_at,author_id,public_metrics,entities,in_reply_to_user_id,referenced_tweets'
    url = f'{API_BASE}/tweets/search/recent?query={query}&tweet.fields={fields}&expansions=author_id&user.fields=username,public_metrics&max_results={min(max_results, 100)}'
    
    data = _make_request(url)
    tweets = data.get('data', [])
    users = {u['id']: u for u in data.get('includes', {}).get('users', [])}
    
    results = []
    for tweet in tweets:
        author = users.get(tweet.get('author_id'), {})
        metrics = tweet.get('public_metrics', {})
        entities = tweet.get('entities', {})
        
        referenced = tweet.get('referenced_tweets', [])
        in_reply_to = None
        for ref in referenced:
            if ref.get('type') == 'replied_to':
                in_reply_to = ref.get('id')
        
        results.append({
            'tweet_id': tweet.get('id'),
            'content': tweet.get('text', ''),
            'user_id': tweet.get('author_id'),
            'username': author.get('username', ''),
            'user_followers': author.get('public_metrics', {}).get('followers_count', 0),
            'likes': metrics.get('like_count', 0),
            'retweets': metrics.get('retweet_count', 0),
            'replies': metrics.get('reply_count', 0),
            'hashtags': [h.get('tag', '') for h in entities.get('hashtags', [])],
            'in_reply_to': in_reply_to,
            'created_at': tweet.get('created_at')
        })
    
    return results

def search_tweets(query, max_results=50):
    encoded_query = urllib.parse.quote(f'{query} -is:retweet lang:en')
    fields = 'created_at,author_id,public_metrics,entities'
    url = f'{API_BASE}/tweets/search/recent?query={encoded_query}&tweet.fields={fields}&expansions=author_id&user.fields=username,public_metrics&max_results={min(max_results, 100)}'
    
    data = _make_request(url)
    tweets = data.get('data', [])
    users = {u['id']: u for u in data.get('includes', {}).get('users', [])}
    
    results = []
    for tweet in tweets:
        author = users.get(tweet.get('author_id'), {})
        metrics = tweet.get('public_metrics', {})
        entities = tweet.get('entities', {})
        
        results.append({
            'tweet_id': tweet.get('id'),
            'content': tweet.get('text', ''),
            'user_id': tweet.get('author_id'),
            'username': author.get('username', ''),
            'user_followers': author.get('public_metrics', {}).get('followers_count', 0),
            'likes': metrics.get('like_count', 0),
            'retweets': metrics.get('retweet_count', 0),
            'replies': metrics.get('reply_count', 0),
            'hashtags': [h.get('tag', '') for h in entities.get('hashtags', [])],
            'created_at': tweet.get('created_at')
        })
    
    return results
