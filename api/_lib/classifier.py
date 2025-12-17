# Weighted sentiment dictionaries
from api._lib.ai import get_ai_analysis

# Weighted sentiment dictionaries
POSITIVE_SCORES = {
    'good': 1, 'great': 2, 'excellent': 3, 'amazing': 3, 'wonderful': 2, 'love': 3, 'like': 1, 
    'happy': 2, 'proud': 2, 'best': 3, 'fantastic': 3, 'beautiful': 2, 'awesome': 3, 
    'perfect': 3, 'brilliant': 3, 'success': 2, 'successful': 2, 'achievement': 2, 
    'progress': 2, 'growth': 2, 'win': 2, 'victory': 2, 'celebrate': 2, 'congratulations': 2, 
    'inspiring': 2, 'inspire': 2, 'hope': 1, 'support': 2, 'thank': 1, 'thanks': 1, 
    'grateful': 2, 'blessed': 2, 'incredible': 3, 'masterpiece': 3, 'visionary': 3,
    'strong': 1, 'powerful': 1, 'effective': 1, 'promising': 2, 'optimistic': 2,
    # Hindi/Hinglish Positive
    'zindabad': 3, 'jai': 2, 'mahaan': 3, 'badhai': 2, 'shandaar': 3, 'zabardast': 3,
    'sundar': 2, 'accha': 1, 'acche': 1, 'safalta': 2, 'vikas': 2, 'vijay': 2,
    'swagat': 1, 'dhanyavad': 1, 'namaste': 1, 'pranam': 1
}

NEGATIVE_SCORES = {
    'bad': 1, 'terrible': 3, 'awful': 3, 'hate': 3, 'dislike': 2, 'angry': 2, 'sad': 1, 
    'disappointed': 2, 'worst': 3, 'horrible': 3, 'disgusting': 3, 'pathetic': 3, 
    'shameful': 3, 'disgrace': 3, 'fail': 2, 'failure': 2, 'disaster': 3, 'crisis': 2, 
    'corrupt': 3, 'corruption': 3, 'scam': 3, 'fraud': 3, 'lies': 2, 'lying': 2, 
    'fake': 2, 'propaganda': 2, 'manipulate': 2, 'deceive': 2, 'shame': 2, 'destroy': 3, 
    'attack': 2, 'violence': 3, 'threat': 2, 'danger': 2, 'fear': 1, 'outrage': 2,
    'useless': 2, 'incompetent': 3, 'weak': 1, 'hopeless': 2, 'trash': 3, 'nonsense': 2,
    # Hindi/Hinglish Negative
    'murdabad': 4, 'haaye': 3, 'bekaar': 2, 'ghatiya': 3, 'sharm': 3, 'barbaad': 3,
    'dhoka': 2, 'jhooth': 2, 'fareb': 2, 'nafrat': 3, 'dushman': 2, 'aatank': 4,
    'gaddar': 3, 'kutta': 3, 'suar': 3, 'saala': 1, 'chor': 2
}

# Weighted Stance Indicators
PRO_INDIA_SCORES = {
    'proud india': 3, 'love india': 3, 'support india': 3, 'incredible india': 2, 
    'digital india': 1, 'make in india': 1, 'jai hind': 4, 'proud indian': 3, 
    'india rocks': 2, 'vande mataram': 4, 'bharat mata': 4, 'mera bharat': 3, 
    'indian pride': 3, 'india first': 3, 'india wins': 2, 'india success': 2, 
    'india growth': 2, 'india progress': 2, 'india development': 2, 'india innovation': 2, 
    'india rising': 2, 'india shining': 2, 'proud to be indian': 4, 'love my country': 3, 
    'my india': 1, 'our india': 1, 'vishwaguru': 2, 'atmanirbhar': 2, 'developed india': 2,
    'modi': 0.5, 'yogi': 0.5, 'bjp': 0.5, 'rss': 0.5,  # Context dependent
    # Hindi/Hinglish Pro
    'bharat mata ki jai': 5, 'hindustan zindabad': 5, 'mera bharat mahan': 4,
    'akhand bharat': 3, 'modi hai to mumkin hai': 2, 'ghar ghar modi': 2,
    'jai shri ram': 1, 'har har mahadev': 1, 'sanatan dharma': 2
}

ANTI_INDIA_SCORES = {
    'boycott india': 5, 'anti india': 5, 'hate india': 5, 'destroy india': 5, 
    'fake india': 4, 'antiindia': 5, 'boycottindia': 5, 'shameindia': 5, 
    'indiafails': 4, 'india fails': 4, 'indiaout': 5, 'india out': 5, 
    'against india': 3, 'india exposed': 3, 'india lies': 4, 'india propaganda': 4, 
    'india genocide': 5, 'india terrorism': 5, 'india fascist': 5, 'india nazi': 5, 
    'india apartheid': 5, 'india atrocities': 4, 'india crimes': 4,
    'intolerant india': 3, 'unsafe india': 3, 'rape capital': 4, 'lynchistan': 5,
    'minorities unsafe': 2, 'islamophobia': 2, 'hindutva terror': 5, 'saffron terror': 5,
    'fascist modi': 4, 'dictator': 2, 'democracy died': 3, 'pogrom': 4,
    'occupied kashmir': 5, 'free kashmir': 5, 'khalistan': 5, 'terrorist state': 5,
    # Hindi/Hinglish Anti
    'hindustan murdabad': 5, 'bharat tere tukde': 5, 'azadi': 2, 'laal salaam': 1,
    'modi hatao': 2, 'bjp hatao': 1, 'desh drohi': 3, 'sanghi': 1, 'bhakt': 1,
    'godimedia': 2, 'godi media': 2
}

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

def preprocess_text(text):
    """Normalize text for improved matching."""
    return ' ' + text.lower().replace('#', ' ').replace('@', ' ').replace('-', ' ').replace('_', ' ') + ' '

def classify_sentiment(text):
    if not text:
        return {'label': 'neutral', 'score': 0.0, 'confidence': 0.5}
    
    text_processed = preprocess_text(text)
    
    pos_score = 0
    neg_score = 0
    
    # Check weighted keywords
    for word, weight in POSITIVE_SCORES.items():
        if f' {word} ' in text_processed:
            pos_score += weight
    
    for word, weight in NEGATIVE_SCORES.items():
        if f' {word} ' in text_processed:
            neg_score += weight
            
    # Negation handling (simple)
    if ' not ' in text_processed or ' no ' in text_processed or " don't " in text_processed:
        pass 
    
    total_score = pos_score + neg_score
    
    if total_score == 0:
        return {'label': 'neutral', 'score': 0.0, 'confidence': 0.6}
    
    final_score = (pos_score - neg_score) / max(total_score, 1)
    
    if pos_score > neg_score:
        confidence = min(0.99, 0.6 + (pos_score / (total_score + 1)) * 0.4)
        return {'label': 'positive', 'score': final_score, 'confidence': confidence}
    elif neg_score > pos_score:
        confidence = min(0.99, 0.6 + (neg_score / (total_score + 1)) * 0.4)
        return {'label': 'negative', 'score': final_score, 'confidence': confidence}
    
    return {'label': 'neutral', 'score': 0.0, 'confidence': 0.6}

def classify_stance(text):
    if not text:
        return {'label': 'Neutral', 'score': 0.0, 'confidence': 0.5}
    
    text_processed = preprocess_text(text)
    
    pro_score = 0
    anti_score = 0
    
    # Weighted Phrase Matching
    for phrase, weight in PRO_INDIA_SCORES.items():
        if phrase in text_processed:
            pro_score += weight
            
    for phrase, weight in ANTI_INDIA_SCORES.items():
        if phrase in text_processed:
            anti_score += weight
            
    # Contextual Boosts
    if 'support' in text_processed and 'india' in text_processed: pro_score += 1
    if 'against' in text_processed and 'india' in text_processed: anti_score += 1
    
    total = pro_score + anti_score
    
    if total == 0:
        return {'label': 'Neutral', 'score': 0.0, 'confidence': 0.7}
    
    score = (pro_score - anti_score) / max(total, 1)
    
    # Threshold for Anti-India (bias detection) - lower threshold for detection
    if anti_score >= 2 or (anti_score > pro_score):
        confidence = min(0.99, 0.6 + (anti_score / (total + 1)) * 0.4)
        return {'label': 'Anti-India', 'score': score, 'confidence': confidence}
    elif pro_score > anti_score:
        confidence = min(0.99, 0.6 + (pro_score / (total + 1)) * 0.4)
        return {'label': 'Pro-India', 'score': score, 'confidence': confidence}
    
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
    if not user_data:
        return 0
    
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
    if not user_data:
        return 0
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
    # Try AI Mode First
    try:
        ai_result = get_ai_analysis(text)
        if ai_result:
            return ai_result
    except Exception as e:
        print(f"AI classification failed, falling back: {e}")

    # Fallback to local weighted logic
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
        'risk_score': risk,
        'method': 'fallback'
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
