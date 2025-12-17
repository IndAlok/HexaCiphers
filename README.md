# HexaCiphers

An advanced AI-powered platform for real-time detection, analysis, and monitoring of anti-India sentiment campaigns on Twitter/X. The system provides comprehensive user profiling, thread analysis, campaign detection, bot identification, and risk assessment.

## Key Features

### Complete User Profile Analysis
Analyze any Twitter user's complete public profile including their timeline, engagement patterns, and content stance. The system processes up to 100 recent tweets to calculate:
- Overall stance grade (A+ to F scale)
- Pro-India/Anti-India/Neutral classification
- Bot probability score using 7-factor detection
- Influence score based on engagement metrics
- Sentiment breakdown across all tweets

### Thread and Conversation Analysis
Analyze entire Twitter conversations including all replies to understand:
- Dominant sentiment across the thread
- Controversy score measuring disagreement
- Participation analysis with unique user count
- Stance distribution among all participants
- Engagement patterns at each level

### Campaign Detection
Monitor hashtags for coordinated campaign activity:
- Coordination score detecting synchronized posting
- Bot percentage estimation
- Top contributor identification
- Risk scoring for potential harmful campaigns
- Sentiment and stance breakdown

### Single Tweet Analysis
Quick analysis of individual tweets with:
- Real-time Twitter API data fetching
- Sentiment classification
- Stance determination
- Risk assessment
- User bot probability

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TailwindCSS, Recharts, Lucide Icons |
| Backend | Vercel Serverless Functions (Python 3.9) |
| Database | Neon PostgreSQL (Serverless) |
| API | Twitter API v2 |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health check |
| `/api/stats` | GET | Comprehensive database statistics |
| `/api/analyze-user` | POST | Complete user profile analysis |
| `/api/analyze-thread` | POST | Full thread/conversation analysis |
| `/api/analyze-campaign` | POST | Hashtag campaign analysis |
| `/api/analyze-url` | POST | Single tweet analysis |
| `/api/users` | GET | List analyzed users |
| `/api/posts` | GET | List analyzed posts |
| `/api/threads` | GET | List analyzed threads |
| `/api/campaigns` | GET | List detected campaigns |
| `/api/classify` | POST | Text classification |
| `/api/init-db` | POST | Initialize database tables |

## Deployment

### Prerequisites
- Twitter Developer Account with API v2 access
- Neon PostgreSQL database (free tier available)
- Vercel account

### Environment Variables
Configure these in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `TWITTER_BEARER_TOKEN` | Twitter API v2 Bearer Token |
| `DATABASE_URL` | Neon PostgreSQL connection string |

### Step 1: Twitter API Setup
1. Go to [developer.twitter.com](https://developer.twitter.com/en/portal/dashboard)
2. Create a Project and App
3. Navigate to "Keys and tokens"
4. Generate Bearer Token and copy it

### Step 2: Database Setup
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a project named "HexaCiphers"
4. Copy the connection string from dashboard

### Step 3: Deploy to Vercel
1. Push code to GitHub
2. Import repository to Vercel
3. Add environment variables
4. Deploy

### Step 4: Initialize Database
After successful deployment:
```bash
curl -X POST https://your-app.vercel.app/api/init-db
```

## API Usage Examples

### Analyze a User Profile
```bash
curl -X POST https://your-app.vercel.app/api/analyze-user \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk"}'
```

### Analyze a Thread
```bash
curl -X POST https://your-app.vercel.app/api/analyze-thread \
  -H "Content-Type: application/json" \
  -d '{"url": "https://twitter.com/user/status/123456789"}'
```

### Analyze a Hashtag Campaign
```bash
curl -X POST https://your-app.vercel.app/api/analyze-campaign \
  -H "Content-Type: application/json" \
  -d '{"hashtag": "DigitalIndia"}'
```

### Classify Text
```bash
curl -X POST https://your-app.vercel.app/api/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "Proud to be Indian"}'
```

## Architecture

```
HexaCiphers/
├── api/                        # Vercel Serverless Functions
│   ├── _lib/                   # Shared Python modules
│   │   ├── db.py              # PostgreSQL operations
│   │   ├── classifier.py      # ML classification
│   │   └── twitter.py         # Twitter API client
│   ├── analyze-user.py        # User profile analysis
│   ├── analyze-thread.py      # Thread analysis
│   ├── analyze-campaign.py    # Campaign detection
│   ├── analyze-url.py         # Single tweet analysis
│   ├── stats.py               # Statistics endpoint
│   └── ...
├── frontend/                   # React Application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── UserAnalysis.js
│   │   │   ├── ThreadAnalysis.js
│   │   │   ├── CampaignAnalysis.js
│   │   │   └── ...
│   │   └── components/
│   └── public/
├── vercel.json                # Vercel configuration
└── README.md
```

## License

MIT
