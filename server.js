const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Keys (to be set in Vercel environment variables)
const API_KEYS = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    HUNTER_API_KEY: process.env.HUNTER_API_KEY,
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY, // For company data via RapidAPI
    SERP_API_KEY: process.env.SERP_API_KEY  // Alternative for company search
};

// Main research endpoint
app.post('/api/research', async (req, res) => {
    try {
        const { clientName } = req.body;
        
        if (!clientName) {
            return res.status(400).json({ error: 'Client name is required' });
        }
        
        console.log(`Starting research for: ${clientName}`);
        
        // Perform research
        const result = await performClientResearch(clientName);
        
        res.json(result);
    } catch (error) {
        console.error('Research error:', error);
        res.status(500).json({ 
            error: 'Research failed', 
            details: error.message,
            name: req.body.clientName || 'Unknown'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        apis_configured: {
            openai: !!API_KEYS.OPENAI_API_KEY,
            hunter: !!API_KEYS.HUNTER_API_KEY,
            news: !!API_KEYS.NEWS_API_KEY,
            rapidapi: !!API_KEYS.RAPIDAPI_KEY,
            serpapi: !!API_KEYS.SERP_API_KEY
        }
    });
});

// Main research function
async function performClientResearch(clientName) {
    const result = {
        name: clientName,
        timestamp: new Date().toISOString(),
        industry: null,
        website: null,
        location: null,
        employees: null,
        description: null,
        contacts: null,
        news: null,
        analysis: null
    };
    
    try {
        // 1. Get company information from RapidAPI or SerpAPI
        const companyInfo = await getCompanyData(clientName);
        if (companyInfo) {
            result.industry = companyInfo.industry;
            result.website = companyInfo.website;
            result.location = companyInfo.location;
            result.employees = companyInfo.employees;
            result.description = companyInfo.description;
        }
        
        // 2. Get contact information from Hunter.io
        if (result.website) {
            const contacts = await getHunterData(result.website);
            result.contacts = contacts;
        }
        
        // 3. Get recent news
        const news = await getNewsData(clientName);
        result.news = news;
        
        // 4. Get AI analysis
        const analysis = await getAIAnalysis(result);
        result.analysis = analysis;
        
    } catch (error) {
        console.error(`Research error for ${clientName}:`, error);
        // Continue with partial results
    }
    
    return result;
}

// Company data integration using multiple sources
async function getCompanyData(companyName) {
    // Try RapidAPI first (Company Data API)
    if (API_KEYS.RAPIDAPI_KEY) {
        try {
            const response = await axios.get(`https://company-data-api.p.rapidapi.com/company`, {
                params: { name: companyName },
                headers: {
                    'X-RapidAPI-Key': API_KEYS.RAPIDAPI_KEY,
                    'X-RapidAPI-Host': 'company-data-api.p.rapidapi.com'
                },
                timeout: 10000
            });
            
            const data = response.data;
            return {
                industry: data.industry,
                website: data.website,
                location: data.location,
                employees: data.employee_count,
                description: data.description
            };
        } catch (error) {
            console.error('RapidAPI error:', error.message);
        }
    }
    
    // Try SerpAPI as fallback
    if (API_KEYS.SERP_API_KEY) {
        try {
            const response = await axios.get(`https://serpapi.com/search`, {
                params: {
                    engine: 'google',
                    q: `${companyName} company information`,
                    api_key: API_KEYS.SERP_API_KEY
                },
                timeout: 10000
            });
            
            // Parse Google search results for company info
            const organicResults = response.data.organic_results || [];
            const firstResult = organicResults[0];
            
            if (firstResult) {
                return {
                    industry: 'Unknown',
                    website: firstResult.link,
                    location: 'Unknown',
                    employees: 'Unknown',
                    description: firstResult.snippet
                };
            }
        } catch (error) {
            console.error('SerpAPI error:', error.message);
        }
    }
    
    // Fallback to mock data
    console.log('No API keys configured, using mock data');
    return getMockCompanyData(companyName);
}

// Hunter.io API integration
async function getHunterData(domain) {
    if (!API_KEYS.HUNTER_API_KEY) {
        console.log('Hunter API key not configured, using mock data');
        return getMockContactData(domain);
    }
    
    try {
        const response = await axios.get(`https://api.hunter.io/v2/domain-search`, {
            params: {
                domain: domain,
                api_key: API_KEYS.HUNTER_API_KEY,
                limit: 5
            },
            timeout: 10000
        });
        
        const emails = response.data.data.emails.slice(0, 3).map(email => 
            `${email.value} (${email.first_name} ${email.last_name} - ${email.position})`
        );
        
        return emails.join(', ');
    } catch (error) {
        console.error('Hunter API error:', error.message);
        return getMockContactData(domain);
    }
}

// News API integration
async function getNewsData(companyName) {
    if (!API_KEYS.NEWS_API_KEY) {
        console.log('News API key not configured, using mock data');
        return getMockNewsData(companyName);
    }
    
    try {
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: companyName,
                apiKey: API_KEYS.NEWS_API_KEY,
                sortBy: 'publishedAt',
                pageSize: 3,
                language: 'en'
            },
            timeout: 10000
        });
        
        const articles = response.data.articles.slice(0, 2).map(article => 
            `${article.title} (${new Date(article.publishedAt).toLocaleDateString()})`
        );
        
        return articles.join('; ');
    } catch (error) {
        console.error('News API error:', error.message);
        return getMockNewsData(companyName);
    }
}

// OpenAI API integration
async function getAIAnalysis(companyData) {
    if (!API_KEYS.OPENAI_API_KEY) {
        console.log('OpenAI API key not configured, using mock analysis');
        return getMockAnalysis(companyData);
    }
    
    try {
        const prompt = `Analyze this company for B2B sales opportunities:\n\nCompany: ${companyData.name}\nIndustry: ${companyData.industry}\nLocation: ${companyData.location}\nEmployees: ${companyData.employees}\nDescription: ${companyData.description}\nRecent News: ${companyData.news}\n\nProvide a brief analysis (2-3 sentences) focusing on:\n1. Sales opportunity potential\n2. Key decision makers to target\n3. Best approach strategy`;
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: prompt
            }],
            max_tokens: 200,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEYS.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
        
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI API error:', error.message);
        return getMockAnalysis(companyData);
    }
}

// Mock data functions (for when APIs are not configured)
function getMockCompanyData(companyName) {
    const mockData = {
        'Apple Inc': {
            category: { industry: 'Technology' },
            domain: 'apple.com',
            geo: { city: 'Cupertino', country: 'United States' },
            metrics: { employees: 164000 },
            description: 'Technology company that designs and manufactures consumer electronics, software, and online services.'
        },
        'Microsoft Corporation': {
            category: { industry: 'Technology' },
            domain: 'microsoft.com',
            geo: { city: 'Redmond', country: 'United States' },
            metrics: { employees: 221000 },
            description: 'Multinational technology company that develops computer software, consumer electronics, and cloud services.'
        }
    };
    
    return mockData[companyName] || {
        category: { industry: 'Unknown' },
        domain: 'unknown.com',
        geo: { city: 'Unknown', country: 'Unknown' },
        metrics: { employees: 'Unknown' },
        description: 'Company information not available in mock data.'
    };
}

function getMockContactData(domain) {
    return `info@${domain}, sales@${domain}, contact@${domain}`;
}

function getMockNewsData(companyName) {
    return `Recent ${companyName} announcement about new product launch; ${companyName} reports quarterly earnings`;
}

function getMockAnalysis(companyData) {
    return `${companyData.name} shows strong potential for B2B partnerships given their ${companyData.industry} focus and ${companyData.employees} employee base. Target C-level executives and department heads for decision-making. Approach with industry-specific solutions and emphasize ROI and efficiency gains.`;
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Client Research Agent running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔑 API Keys configured:`, {
        openai: !!API_KEYS.OPENAI_API_KEY,
        hunter: !!API_KEYS.HUNTER_API_KEY,
        news: !!API_KEYS.NEWS_API_KEY,
        rapidapi: !!API_KEYS.RAPIDAPI_KEY,
        serpapi: !!API_KEYS.SERP_API_KEY
    });
});

module.exports = app;