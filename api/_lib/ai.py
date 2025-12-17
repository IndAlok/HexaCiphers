import google.generativeai as genai
import os
import json

def get_ai_analysis(text):
    try:
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            # Silent fail to fallback if no key configured
            return None
            
        genai.configure(api_key=api_key)
        
        #Flash for speed and lower cost, hehe:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""Analyze this text for geopolitical sentiment regarding India (English/Hindi/Hinglish).
Text: "{text}"

Output JSON ONLY:
{{
  "sentiment": "positive"|"negative"|"neutral",
  "classification": "Pro-India"|"Anti-India"|"Neutral", 
  "risk_score": 0-100,
  "confidence": 0.0-1.0
}}"""
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=100,
                temperature=0.1
            )
        )
        
        if not response.text:
            return None
            
        # Clean response
        json_str = response.text.strip()
        if json_str.startswith('```json'):
            json_str = json_str[7:-3]
        elif json_str.startswith('```'):
            json_str = json_str[3:-3]
            
        result = json.loads(json_str)
        
        return {
            'sentiment': result.get('sentiment', 'neutral').lower(),
            'classification': result.get('classification', 'Neutral'),
            'risk_score': min(100, max(0, result.get('risk_score', 0))),
            'sentiment_score': 1.0 if result.get('sentiment') == 'positive' else -1.0 if result.get('sentiment') == 'negative' else 0.0,
            'classification_score': 1.0 if result.get('classification') == 'Pro-India' else -1.0 if result.get('classification') == 'Anti-India' else 0.0,
            'confidence': result.get('confidence', 0.8),
            'method': 'ai_gemini_flash'
        }
        
    except Exception as e:
        print(f"AI Analysis failed: {str(e)}")
        return None

def calculate_sentiment_score(sentiment):
    if sentiment == 'positive': return 1.0
    if sentiment == 'negative': return -1.0
    return 0.0

def calculate_stance_score(stance):
    if stance == 'Pro-India': return 1.0
    if stance == 'Anti-India': return -1.0
    return 0.0
