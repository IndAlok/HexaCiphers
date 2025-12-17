# HexaCiphers: AI-Powered Social Media Sentiment Analysis Platform

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Production-success)
![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-purple)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Python%20%7C%20PostgreSQL-blue)

A sophisticated sentiment and stance analysis platform for Twitter/X, designed to detect and analyze geopolitical narratives, identify potential disinformation, and assess account authenticity. Built with a dual-engine architecture combining AI-powered semantic analysis with rule-based classification for reliability and multi-lingual support.

---

## Overview

HexaCiphers addresses the critical need for automated monitoring of social media narratives a context of national security and public discourse. The platform analyzes Twitter content to identify sentiment patterns, political stances, and potential coordinated campaigns while supporting English, Hindi, and Hinglish languages.

### Key Innovation: Hybrid Analysis Pipeline

**Dual-Engine Architecture ensures both intelligence and reliability:**

1. **AI Engine (Primary)**: Google Gemini 1.5 Flash provides semantic understanding of context, sarcasm, and nuanced political discourse across multiple languages
2. **Heuristic Engine (Fallback)**: Weighted keyword system with 500+ political terms ensures continuous operation even if AI quotas are exceeded or unavailable

This architecture guarantees **zero downtime** while maintaining high accuracy across diverse language inputs.

---

## Core Features

### 1. User Profile Analysis
Comprehensive Twitter account evaluation:
- **Stance Classification**: Categorizes account as Pro-India, Anti-India, or Neutral based on tweet history
- **Credibility Scoring**: Letter grades (A+ to F) based on behavioral patterns
- **Bot Detection**: Multi-factor authenticity assessment analyzing account age, posting velocity, follower ratios, and engagement patterns
- **Influence Metrics**: Weighted scoring considering followers, engagement quality, and verification status
- **Tweet Analysis**: Processes up to 100 recent tweets for pattern identification
- **Sentiment Distribution**: Aggregated positive/negative/neutral breakdown

### 2. Thread & Conversation Analysis
Deep-dive into Twitter discussions:
- **Controversy Measurement**: Quantifies polarization levels within reply chains
- **Sentiment Flow Tracking**: Maps how tone evolves from original post through nested replies
- **Participant Profiling**: Identifies key voices and their positions
- **Engagement Analysis**: Tracks interaction patterns across thread hierarchy
- **Coordination Detection**: Flags synchronized responses suggesting orchestrated activity

### 3. Campaign & Hashtag Monitoring
Identify coordinated information operations:
- **Temporal Pattern Analysis**: Detects suspicious clustering of posting times
- **Bot Network Estimation**: Calculates percentage of likely automated accounts
- **Risk Scoring**: Assesses potential for incitement or disinformation spread
- **Top Contributor Ranking**: Identifies most influential participants
- **Stance Distribution**: Maps Pro/Anti/Neutral breakdown across campaign

### 4. Single Tweet Classification
Instant post-level analysis:
- **Sentiment Detection**: Positive, Negative, or Neutral classification
- **Stance Assessment**: Political alignment determination
- **Risk Quantification**: 0-100 threat level scoring
- **Metadata Extraction**: Hashtags, mentions, and linked content identification
- **Quick Bot Check**: Rapid authenticity assessment of author

---

## Technology Stack

### Frontend
- **React 18** with modern hooks architecture
- **Material UI v5** for responsive, accessible design
- **Dark/Light Theme** support with localStorage persistence
- **Chart.js** for data visualization
- **React Router** for SPA navigation

### Backend
- **Python 3.12** Serverless Functions via Vercel
- **Google Generative AI SDK** for Gemini integration
- **Custom Classification Engine** with weighted keyword scoring
- **PostgreSQL** (Neon) for data persistence with SSL enforcement
- **Twitter API v2** for data fetching

### Architecture Pattern
**Serverless Microservices** deployed on Vercel's edge network for global low-latency access and automatic scaling.

---

## Project Structure

```
HexaCiphers/
├── api/                          # Serverless Python Backend
│   ├── _lib/
│   │   ├── ai.py                 # Gemini AI integration with token optimization
│   │   ├── classifier.py         # Weighted heuristic engine + scoring algorithms
│   │   ├── db.py                 # PostgreSQL connection with SSL
│   │   └── twitter.py            # Twitter API wrapper
│   ├── analyze-user.py           # User profile analysis endpoint
│   ├── analyze-thread.py         # Thread analysis endpoint
│   ├── analyze-campaign.py       # Campaign detection endpoint
│   ├── analyze-url.py            # Single tweet analysis endpoint
│   ├── classify.py               # Text classification endpoint
│   ├── health.py                 # Health check endpoint
│   ├── stats.py                  # Statistics endpoint
│   ├── init-db.py                # Database initialization
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js         # Top navigation with theme toggle
│   │   │   └── Sidebar.js        # Main navigation drawer
│   │   ├── pages/
│   │   │   ├── Dashboard.js      # Overview & quick analysis
│   │   │   ├── UserAnalysis.js   # User profiling interface
│   │   │   ├── ThreadAnalysis.js # Thread analysis interface
│   │   │   ├── CampaignAnalysis.js
│   │   │   ├── URLAnalysis.js    # Tweet analysis interface
│   │   │   ├── Analytics.js      # System statistics
│   │   │   └── Settings.js       # Configuration panel
│   │   ├── theme.js              # Material UI theme configuration
│   │   ├── ThemeContext.js       # Theme state management
│   │   └── App.js                # Root component
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json
│   └── package.json
├── vercel.json                   # Deployment configuration
├── .env.example                  # Environment variable template
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js 18 or higher
- Python 3.12 or higher
- Git

### Local Development

1. **Clone Repository**
   ```bash
   git clone https://github.com/ShirshenduR/HexaCiphers.git
   cd HexaCiphers
   ```

2. **Environment Configuration**
   
   Create a `.env` file in the project root:
   ```env
   # PostgreSQL Database (Neon recommended)
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   
   # Twitter API v2 Bearer Token
   TWITTER_BEARER_TOKEN="your_bearer_token"
   
   # Google Gemini AI API Key
   GEMINI_API_KEY="AIzaSy..."
   ```

3. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend (for local testing)
   cd ..
   pip install -r api/requirements.txt
   ```

4. **Start Development Server**
   ```bash
   cd frontend
   npm start
   ```

---

## Deployment to Production

### Step 1: Obtain Required Credentials

#### Twitter Developer Access
1. Apply at [developer.twitter.com](https://developer.twitter.com)
2. Create a Project and App
3. Generate Bearer Token from "Keys and Tokens"

#### Google Gemini API
1. Visit [ai.google.dev](https://ai.google.dev)
2. Create API key
3. Copy the key (format: `AIzaSy...`)

#### Neon PostgreSQL
1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string (ensure `?sslmode=require` is included)

### Step 2: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/HexaCiphers.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js/React configuration

3. **Configure Environment Variables**
   
   In Vercel Project Settings → Environment Variables, add:
   - `DATABASE_URL`
   - `TWITTER_BEARER_TOKEN`
   - `GEMINI_API_KEY`

4. **Deploy & Initialize**
   - Click "Deploy" and wait for build completion
   - Visit `https://your-project.vercel.app/api/init-db` to initialize database schema
   - Expected response: `{"status": "success", "message": "Database tables initialized successfully"}`

---

## API Reference

### Base URL
```
https://your-deployment.vercel.app/api
```

### Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/health` | System health check | - |
| GET | `/stats` | Database statistics | - |
| POST | `/analyze-user` | Analyze Twitter user profile | `{"username": "string"}` |
| POST | `/analyze-thread` | Analyze conversation thread | `{"url": "tweet_url"}` |
| POST | `/analyze-campaign` | Analyze hashtag campaign | `{"hashtag": "string"}` |
| POST | `/analyze-url` | Analyze single tweet | `{"url": "tweet_url"}` |
| POST | `/classify` | Classify text | `{"text": "string"}` |
| POST | `/init-db` | Initialize database schema | - |

### Example Usage

**Analyze a User:**
```bash
curl -X POST https://your-app.vercel.app/api/analyze-user \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk"}'
```

**Analyze a Thread:**
```bash
curl -X POST https://your-app.vercel.app/api/analyze-thread \
  -H "Content-Type: application/json" \
  -d '{"url": "https://twitter.com/user/status/1234567890"}'
```

**Monitor a Hashtag:**
```bash
curl -X POST https://your-app.vercel.app/api/analyze-campaign \
  -H "Content-Type: application/json" \
  -d '{"hashtag": "DigitalIndia"}'
```

---

## Classification Methodology

### Sentiment Analysis
**Three-class classification**: Positive, Negative, Neutral

**AI Method (Primary):**
- Gemini 1.5 Flash with task-optimized prompt
- Configurable max_output_tokens (100) for cost efficiency
- Temperature 0.1 for consistent outputs
- Supports English, Hindi, Hinglish natively

**Heuristic Method (Fallback):**
- Weighted keyword dictionary (500+ terms)
- Context-aware scoring (e.g., "support india" vs. "india")
- Negation handling
- Confidence scoring based on term strength

### Stance Classification
**Three-class classification**: Pro-India, Anti-India, Neutral

**Detection Methodology:**
- Phrase-level matching with weighted scores
- Political context understanding (e.g., "vishwaguru", "lynchistan")
- Multi-lingual support including Hinglish slang
- Risk thresholds for Anti-India classification

### Bot Detection
**Eight-factor analysis:**
1. Profile completeness (bio presence)
2. Profile image default status
3. Username patterns (numeric ratio)
4. Account age
5. Tweet velocity (tweets per day)
6. Engagement rate quality
7. Follower/following ratio
8. Content repetitiveness

**Output**: 0.0 to 1.0 probability score

---

## Security & Privacy

- **No Permanent Content Storage**: Tweet text is analyzed transiently; only metadata and scores are persisted
- **Environment-Based Secrets**: All API keys stored in environment variables, never in code
- **SSL-Enforced Database**: PostgreSQL connections require `sslmode=require`
- **CORS Configured**: Proper cross-origin headers for API security
- **Rate Limiting Ready**: Designed to handle Twitter API rate limits gracefully

---

## Limitations & Considerations

- **Twitter API Free Tier (100 posts/month)**: Optimized for minimal quota consumption
- **AI Quota Dependency**: Gemini API has free tier limits; fallback ensures continuity
- **Language Support**: Optimized for English, Hindi, Hinglish; other languages use AI only
- **Per-Analysis Limits**: 10 tweets per user/thread/campaign (for free tier)
- **Accuracy**: Classification accuracy depends on context quality; best for political discourse

---

## API Rate Limit Optimization

The system is designed to conserve Twitter API quota aggressively:

### Quota Conservation Strategies

**1. Minimal Fetch Size**
- Default `max_results=10` per API call (instead of 100)
- Each analysis consumes only ~10-11 tweets from monthly quota

**2. Smart Query Filtering**
All search queries automatically filter out noise:
```
-is:retweet -is:reply lang:en
```
This ensures quota is only spent on original, relevant content.

**3. Database Caching**
Results are cached to prevent redundant API calls:
- User Analysis: **6-hour** cache TTL
- Thread Analysis: **2-hour** cache TTL  
- Campaign Analysis: **1-hour** cache TTL

Repeated requests within cache window consume **zero** API quota.

**4. Reply Exclusion**
User timeline fetches exclude replies:
```
exclude=retweets,replies
```
This focuses analysis on user's original thoughts only.

### Quota Usage Estimate

| Action | Tweets Consumed | Notes |
|--------|-----------------|-------|
| User Analysis | ~10 | From user timeline |
| Thread Analysis | ~11 | 1 root + 10 replies |
| Campaign Analysis | ~10 | Search results |
| Single Tweet | 1 | Just the tweet itself |

**Monthly Capacity (Free Tier)**: Approximately 10 full analyses per month

---

## Use Cases

### Academic Research
- Study polarization patterns in political discourse
- Analyze sentiment trends around major events
- Investigate misinformation spread patterns
- Linguistic evolution in regional languages

### Content Moderation
- Flag potentially harmful narratives for human review
- Identify coordinated harassment campaigns
- Detect bot networks in real-time

### Intelligence & Security
- Monitor extremist radicalization indicators
- Track foreign influence operations
- Assess election interference attempts

---

## Troubleshooting

### Common Issues

**Database Connection Failed**
```
Error: Database: Disconnected
```
**Solution**: Verify `DATABASE_URL` includes `?sslmode=require`. Check Neon dashboard for connection string.

**Twitter API Rate Limit**
```
Error: 429 Too Many Requests
```
**Solution**: Twitter API has strict limits. Wait 15 minutes or reduce request frequency.

**Gemini AI Failure**
```
AI Analysis failed, falling back
```
**Solution**: System automatically uses heuristic engine. Check API quota at Google Cloud Console.

**500 Error on Vercel**
**Solution**: 
1. Check Vercel logs for stack traces
2. Verify all environment variables are set
3. Ensure `/api/init-db` was called successfully

---

## Contributing

Contributions are welcome. Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit with clear messages (`git commit -m 'Add YourFeature'`)
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a Pull Request with detailed description

---

## Acknowledgments

This project was developed with ❤️ by IndAlok[https://github.com/IndAlok]. Special thanks to:
- Google Generative AI team for Gemini API access
- Vercel for serverless infrastructure platform
- Neon for PostgreSQL database services
- Material UI team for React component library

---

## License

MIT License

---

**Built with purpose. Deployed for impact.**
