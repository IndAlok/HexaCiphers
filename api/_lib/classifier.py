POSITIVE_KEYWORDS = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'happy', 
    'proud', 'best', 'fantastic', 'beautiful', 'awesome', 'perfect', 'brilliant',
    'success', 'successful', 'proud', 'achievement', 'progress', 'growth', 'win',
    'victory', 'celebrate', 'congratulations', 'inspiring', 'inspire', 'hope',
    'support', 'thank', 'thanks', 'grateful', 'blessed', 'incredible'
]

NEGATIVE_KEYWORDS = [
    'bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'sad', 'disappointed',
    'worst', 'horrible', 'disgusting', 'pathetic', 'shameful', 'disgrace', 'fail',
    'failure', 'disaster', 'crisis', 'corrupt', 'corruption', 'scam', 'fraud',
    'lies', 'lying', 'fake', 'propaganda', 'manipulate', 'deceive', 'shame',
    'destroy', 'attack', 'violence', 'threat', 'danger', 'fear', 'outrage'
]

PRO_INDIA_KEYWORDS = [
    'proud india', 'love india', 'support india', 'incredible india', 'digital india',
    'make in india', 'jai hind', 'proud indian', 'india rocks', 'vande mataram',
    'bharat mata', 'mera bharat', 'indian pride', 'india first', 'india wins',
    'india success', 'indian achievement', 'india growth', 'india progress',
    'india development', 'india innovation', 'india rising', 'india shining',
    'proud to be indian', 'love my country', 'my india', 'our india'
]

ANTI_INDIA_KEYWORDS = [
    'boycott india', 'anti india', 'hate india', 'destroy india', 'fake india',
    'antiindia', 'boycottindia', 'shameindia', 'indiafails', 'india fails',
    'indiaout', 'india out', 'against india', 'india exposed', 'india lies',
    'india propaganda', 'india genocide', 'india terrorism', 'india fascist',
    'india nazi', 'india apartheid', 'india atrocities', 'india crimes'
]

BOT_INDICATORS = {
    'default_profile': 0.15,
    'no_bio': 0.10,
    'numeric_username': 0.10,
    'new_account': 0.15,
    'high_tweet_rate': 0.20,
    'low_engagement_rate': 0.15,
    'unusual_following_ratio': 0.10,
    'repetitive_content': 0.05
}

def classify_sentiment(text):
    if not text:
        return {'label': 'neutral', 'score': 0.0, 'confidence': 0.5}
    
    text_lower = text.lower()
    pos_count = sum(1 for w in POSITIVE_KEYWORDS if w in text_lower)
    neg_count = sum(1 for w in NEGATIVE_KEYWORDS if w in text_lower)
    total = pos_count + neg_count
    
    if total == 0:
        return {'label': 'neutral', 'score': 0.0, 'confidence': 0.6}
    
    score = (pos_count - neg_count) / max(total, 1)
    
    if pos_count > neg_count:
        confidence = min(0.95, 0.5 + pos_count * 0.08)
        return {'label': 'positive', 'score': score, 'confidence': confidence}
    elif neg_count > pos_count:
        confidence = min(0.95, 0.5 + neg_count * 0.08)
        return {'label': 'negative', 'score': score, 'confidence': confidence}
    
    return {'label': 'neutral', 'score': 0.0, 'confidence': 0.6}

def classify_stance(text):
    if not text:
        return {'label': 'Neutral', 'score': 0.0, 'confidence': 0.5}
    
    text_lower = text.lower()
    pro_count = sum(1 for p in PRO_INDIA_KEYWORDS if p in text_lower)
    anti_count = sum(1 for p in ANTI_INDIA_KEYWORDS if p in text_lower)
    total = pro_count + anti_count
    
    if total == 0:
        india_mentions = text_lower.count('india') + text_lower.count('bharat') + text_lower.count('indian')
        if india_mentions > 0:
            return {'label': 'Neutral', 'score': 0.0, 'confidence': 0.7}
        return {'label': 'Neutral', 'score': 0.0, 'confidence': 0.9}
    
    score = (pro_count - anti_count) / max(total, 1)
    
    if pro_count > anti_count:
        confidence = min(0.95, 0.5 + pro_count * 0.12)
        return {'label': 'Pro-India', 'score': score, 'confidence': confidence}
    elif anti_count > pro_count:
        confidence = min(0.95, 0.5 + anti_count * 0.12)
        return {'label': 'Anti-India', 'score': score, 'confidence': confidence}
    
    return {'label': 'Neutral', 'score': 0.0, 'confidence': 0.6}

def calculate_risk_score(sentiment, stance, engagement=None, bot_prob=0):
    score = 0
    
    if sentiment.get('label') == 'negative':
        score += 25 * sentiment.get('confidence', 0.5)
    
    if stance.get('label') == 'Anti-India':
        score += 40 * stance.get('confidence', 0.5)
    
    score += bot_prob * 20
    
    if engagement:
        total = engagement.get('likes', 0) + engagement.get('retweets', 0) * 2
        if total > 10000:
            score += 15
        elif total > 1000:
            score += 10
        elif total > 100:
            score += 5
    
    return min(100, max(0, score))

def calculate_bot_probability(user_data):
    score = 0
    
    if not user_data.get('bio'):
        score += BOT_INDICATORS['no_bio']
    
    if user_data.get('default_profile_image'):
        score += BOT_INDICATORS['default_profile']
    
    username = user_data.get('username', '')
    if username and sum(c.isdigit() for c in username) > len(username) * 0.4:
        score += BOT_INDICATORS['numeric_username']
    
    account_age_days = user_data.get('account_age_days', 365)
    if account_age_days < 30:
        score += BOT_INDICATORS['new_account']
    elif account_age_days < 90:
        score += BOT_INDICATORS['new_account'] * 0.5
    
    tweet_count = user_data.get('tweet_count', 0)
    if account_age_days > 0:
        tweets_per_day = tweet_count / account_age_days
        if tweets_per_day > 50:
            score += BOT_INDICATORS['high_tweet_rate']
        elif tweets_per_day > 20:
            score += BOT_INDICATORS['high_tweet_rate'] * 0.5
    
    followers = user_data.get('followers', 0)
    following = user_data.get('following', 1)
    if following > 0:
        ratio = followers / following
        if ratio < 0.01 or ratio > 100:
            score += BOT_INDICATORS['unusual_following_ratio']
    
    return min(1.0, max(0, score))

def calculate_influence_score(user_data):
    followers = user_data.get('followers', 0)
    following = max(user_data.get('following', 1), 1)
    tweet_count = user_data.get('tweet_count', 0)
    verified = user_data.get('verified', False)
    
    follower_score = min(40, (followers / 10000) * 40)
    ratio_score = min(20, (followers / following) * 2)
    activity_score = min(20, (tweet_count / 1000) * 20)
    verified_bonus = 20 if verified else 0
    
    return min(100, follower_score + ratio_score + activity_score + verified_bonus)

def calculate_user_grade(stance_score, bot_probability, influence_score, risk_score):
    if bot_probability > 0.7:
        return 'F'
    
    composite = 0
    
    if stance_score > 0.5:
        composite += 30
    elif stance_score > 0:
        composite += 20
    elif stance_score > -0.3:
        composite += 10
    
    composite += (1 - bot_probability) * 25
    composite += influence_score * 0.25
    composite += (100 - risk_score) * 0.2
    
    if composite >= 85:
        return 'A+'
    elif composite >= 75:
        return 'A'
    elif composite >= 65:
        return 'B+'
    elif composite >= 55:
        return 'B'
    elif composite >= 45:
        return 'C+'
    elif composite >= 35:
        return 'C'
    elif composite >= 25:
        return 'D'
    else:
        return 'F'

def calculate_controversy_score(sentiments, stances):
    if len(sentiments) < 2:
        return 0.0
    
    pos_count = sum(1 for s in sentiments if s == 'positive')
    neg_count = sum(1 for s in sentiments if s == 'negative')
    total = len(sentiments)
    
    sentiment_variance = abs(pos_count - neg_count) / total
    
    pro_count = sum(1 for s in stances if s == 'Pro-India')
    anti_count = sum(1 for s in stances if s == 'Anti-India')
    
    stance_variance = abs(pro_count - anti_count) / max(len(stances), 1)
    
    controversy = 1 - (sentiment_variance * 0.5 + stance_variance * 0.5)
    
    return min(1.0, max(0, controversy))

def classify_text(text, engagement=None):
    sentiment = classify_sentiment(text)
    stance = classify_stance(text)
    risk = calculate_risk_score(sentiment, stance, engagement)
    
    return {
        'sentiment': sentiment['label'],
        'sentiment_score': sentiment['score'],
        'sentiment_confidence': sentiment['confidence'],
        'classification': stance['label'],
        'classification_score': stance['score'],
        'classification_confidence': stance['confidence'],
        'risk_score': risk
    }

def analyze_user_profile(user_data, tweets):
    if not tweets:
        return {
            'stance_score': 0,
            'stance_label': 'Neutral',
            'bot_probability': calculate_bot_probability(user_data),
            'influence_score': calculate_influence_score(user_data),
            'risk_score': 0,
            'grade': 'N/A',
            'sentiment_breakdown': {'positive': 0, 'negative': 0, 'neutral': 0},
            'stance_breakdown': {'Pro-India': 0, 'Anti-India': 0, 'Neutral': 0}
        }
    
    sentiments = []
    stances = []
    stance_scores = []
    
    for tweet in tweets:
        result = classify_text(tweet.get('content', ''))
        sentiments.append(result['sentiment'])
        stances.append(result['classification'])
        stance_scores.append(result['classification_score'])
    
    sentiment_breakdown = {
        'positive': sentiments.count('positive'),
        'negative': sentiments.count('negative'),
        'neutral': sentiments.count('neutral')
    }
    
    stance_breakdown = {
        'Pro-India': stances.count('Pro-India'),
        'Anti-India': stances.count('Anti-India'),
        'Neutral': stances.count('Neutral')
    }
    
    avg_stance_score = sum(stance_scores) / len(stance_scores) if stance_scores else 0
    
    if stance_breakdown['Pro-India'] > stance_breakdown['Anti-India']:
        dominant_stance = 'Pro-India'
    elif stance_breakdown['Anti-India'] > stance_breakdown['Pro-India']:
        dominant_stance = 'Anti-India'
    else:
        dominant_stance = 'Neutral'
    
    bot_prob = calculate_bot_probability(user_data)
    influence = calculate_influence_score(user_data)
    
    negative_ratio = sentiment_breakdown['negative'] / max(len(tweets), 1)
    anti_ratio = stance_breakdown['Anti-India'] / max(len(tweets), 1)
    risk = (negative_ratio * 30 + anti_ratio * 50 + bot_prob * 20)
    
    grade = calculate_user_grade(avg_stance_score, bot_prob, influence, risk)
    
    return {
        'stance_score': avg_stance_score,
        'stance_label': dominant_stance,
        'bot_probability': bot_prob,
        'influence_score': influence,
        'risk_score': min(100, risk),
        'grade': grade,
        'sentiment_breakdown': sentiment_breakdown,
        'stance_breakdown': stance_breakdown,
        'tweets_analyzed': len(tweets)
    }

def analyze_thread(tweets):
    if not tweets:
        return {
            'tweet_count': 0,
            'unique_users': 0,
            'dominant_sentiment': 'neutral',
            'dominant_stance': 'Neutral',
            'controversy_score': 0,
            'avg_sentiment_score': 0
        }
    
    users = set()
    sentiments = []
    stances = []
    sentiment_scores = []
    total_engagement = 0
    
    for tweet in tweets:
        users.add(tweet.get('user_id') or tweet.get('author_id'))
        result = classify_text(tweet.get('content', ''))
        sentiments.append(result['sentiment'])
        stances.append(result['classification'])
        sentiment_scores.append(result['sentiment_score'])
        total_engagement += tweet.get('likes', 0) + tweet.get('retweets', 0)
    
    pos = sentiments.count('positive')
    neg = sentiments.count('negative')
    if pos > neg:
        dominant_sentiment = 'positive'
    elif neg > pos:
        dominant_sentiment = 'negative'
    else:
        dominant_sentiment = 'neutral'
    
    pro = stances.count('Pro-India')
    anti = stances.count('Anti-India')
    if pro > anti:
        dominant_stance = 'Pro-India'
    elif anti > pro:
        dominant_stance = 'Anti-India'
    else:
        dominant_stance = 'Neutral'
    
    controversy = calculate_controversy_score(sentiments, stances)
    avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
    
    return {
        'tweet_count': len(tweets),
        'reply_count': sum(1 for t in tweets if t.get('in_reply_to')),
        'unique_users': len(users),
        'total_engagement': total_engagement,
        'dominant_sentiment': dominant_sentiment,
        'dominant_stance': dominant_stance,
        'controversy_score': controversy,
        'avg_sentiment_score': avg_sentiment,
        'pro_india_count': pro,
        'anti_india_count': anti,
        'neutral_count': stances.count('Neutral'),
        'sentiment_breakdown': {
            'positive': pos,
            'negative': neg,
            'neutral': sentiments.count('neutral')
        }
    }
