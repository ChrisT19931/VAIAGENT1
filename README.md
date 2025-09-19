# Client Research Agent

AI-powered client research automation tool with secure admin access.

## Features

- 🔐 **Secure Login** - Admin-only access with hardcoded credentials
- 🔍 **Bulk Research** - Research multiple clients at once
- 🤖 **AI Analysis** - GPT-powered insights and recommendations
- 📊 **Comprehensive Data** - Company info, contacts, news, and analysis
- 🚀 **One-Click Deploy** - Ready for Vercel deployment

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm start
```

Visit `http://localhost:3000` and login with:
- **Email:** chris.t@ventarosales.com
- **Password:** Rabbit5511$$11

### 3. Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add the API keys listed below

## Required API Keys

Add these to your Vercel environment variables:

### Essential APIs:
- `OPENAI_API_KEY` - Get from [OpenAI](https://platform.openai.com/api-keys)
- `RAPIDAPI_KEY` - Get from [RapidAPI](https://rapidapi.com/) (search for "Company Data API")
- `HUNTER_API_KEY` - Get from [Hunter.io](https://hunter.io/api)
- `NEWS_API_KEY` - Get from [NewsAPI](https://newsapi.org/)

### Optional APIs:
- `SERP_API_KEY` - Get from [SerpAPI](https://serpapi.com/) (alternative company search)

## API Key Setup Guide

### 1. OpenAI API Key (Required for AI analysis)
- Go to https://platform.openai.com/api-keys
- Create new secret key
- Copy and add to Vercel as `OPENAI_API_KEY`

### 2. RapidAPI Key (Company data)
- Sign up at https://rapidapi.com/
- Search for "Company Data API" and subscribe
- Get API key from dashboard
- Add to Vercel as `RAPIDAPI_KEY`

### 3. SerpAPI Key (Alternative company search)
- Sign up at https://serpapi.com/
- Get free API key (100 searches/month)
- Add to Vercel as `SERP_API_KEY`

### 4. Hunter.io API Key (Email finding)
- Sign up at https://hunter.io/
- Go to API section
- Copy API key
- Add to Vercel as `HUNTER_API_KEY`

### 5. News API Key (Recent news)
- Sign up at https://newsapi.org/
- Get free API key
- Add to Vercel as `NEWS_API_KEY`

## How It Works

1. **Login** - Secure admin authentication
2. **Input** - Enter client names (one per line)
3. **Research** - Automated data gathering from multiple sources
4. **Analysis** - AI-powered insights and recommendations
5. **Results** - Comprehensive client profiles

## Data Sources

- **Company Info:** RapidAPI + SerpAPI (Google search)
- **Contact Data:** Hunter.io API
- **Recent News:** NewsAPI
- **AI Analysis:** OpenAI GPT-3.5

## Mock Data

The app includes mock data for testing without API keys. Real APIs provide:
- More accurate company information
- Live contact data
- Recent news and updates
- Personalized AI analysis

## Security

- Admin-only access with hardcoded credentials
- Session-based authentication
- No data storage (research happens in real-time)
- Environment variables for API keys

## Deployment Steps for Vercel

1. **Push to GitHub** (optional but recommended)
2. **Connect to Vercel:**
   - Go to vercel.com
   - Import your project
   - Deploy

3. **Add Environment Variables:**
   - Project Settings → Environment Variables
   - Add all API keys from the list above

4. **Redeploy** after adding environment variables

## Usage

1. Login with admin credentials
2. Enter client names (e.g., "Apple Inc", "Microsoft Corporation")
3. Click "Start Research"
4. Wait for results (1-2 minutes per client)
5. Review comprehensive client profiles

## Pricing Estimates

**API Costs per 100 clients researched:**
- OpenAI: ~$2-5
- RapidAPI: ~$5-15 (depending on plan)
- SerpAPI: ~$5-10 (100 free searches/month)
- Hunter.io: ~$10-20
- NewsAPI: Free tier available

**Total: ~$22-50 per 100 clients**

## Support

For issues or questions, contact: chris.t@ventarosales.com