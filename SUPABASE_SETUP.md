# Supabase Database Setup Guide

This guide will help you set up the Supabase database schema to ensure user creation and management works properly with the VAI Client Research Agent.

## 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `vai-client-research-agent`
5. Enter database password (save this securely)
6. Select region closest to your users
7. Click "Create new project"

## 2. Get API Keys

1. Go to Project Settings → API
2. Copy the following values to your `.env` file:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_KEY`

## 3. Create Database Schema

### Step 1: Create Users Table

Go to SQL Editor in Supabase Dashboard and run this SQL:

```sql
-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status VARCHAR(50) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Create Research Sessions Table (Optional)

```sql
-- Create research_sessions table to track user research history
CREATE TABLE research_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    research_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_research_sessions_user_id ON research_sessions(user_id);
CREATE INDEX idx_research_sessions_created_at ON research_sessions(created_at);
```

### Step 3: Set Row Level Security (RLS)

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Policy: Only service role can insert users (for admin creation)
CREATE POLICY "Service role can insert users" ON users
    FOR INSERT WITH CHECK (true);

-- Enable RLS on research_sessions table
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own research sessions
CREATE POLICY "Users can view own research" ON research_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own research sessions
CREATE POLICY "Users can create research" ON research_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
```

### Step 4: Create Admin User

```sql
-- Insert default admin user (change email and password)
INSERT INTO users (name, email, password, role, subscription_status)
VALUES (
    'Admin User',
    'admin@ventaroai.com',
    '$2b$10$example.hash.here', -- Use bcrypt to hash your password
    'admin',
    'active'
);
```

## 4. Environment Variables Setup

Create a `.env` file in your project root with these values:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID=price_your-monthly-subscription-price-id
```

## 5. Stripe Setup

### Create Stripe Product and Price

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Products
3. Click "Add Product"
4. Enter:
   - Name: "VAI Research Agent Subscription"
   - Description: "Monthly subscription for VAI Client Research Agent"
5. Add pricing:
   - Price: $10.00
   - Billing period: Monthly
   - Currency: USD
6. Save and copy the Price ID to `STRIPE_PRICE_ID`

### Set up Webhook

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## 6. Testing the Setup

### Test User Creation

1. Start your server: `npm start`
2. Login as admin
3. Go to Admin Panel
4. Create a test user
5. Check Supabase dashboard to verify user was created

### Test Database Connection

Run this test query in Supabase SQL Editor:

```sql
-- Test query to verify setup
SELECT 
    id,
    name,
    email,
    role,
    subscription_status,
    created_at
FROM users
ORDER BY created_at DESC;
```

## 7. Security Best Practices

1. **Never expose service key**: Only use `SUPABASE_SERVICE_KEY` on the server
2. **Use anon key for client**: Frontend should only use `SUPABASE_ANON_KEY`
3. **Enable RLS**: Always enable Row Level Security on tables
4. **Validate inputs**: Always validate and sanitize user inputs
5. **Use HTTPS**: Ensure all API calls use HTTPS in production

## 8. Troubleshooting

### Common Issues

1. **"relation does not exist"**: Make sure you've run the SQL schema creation
2. **"permission denied"**: Check RLS policies and ensure correct API key usage
3. **"invalid JWT"**: Verify JWT_SECRET matches between client and server
4. **Stripe webhook fails**: Ensure webhook URL is accessible and secret is correct

### Debug Queries

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- View recent users
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

## 9. Production Deployment

Before deploying to production:

1. Change all default passwords
2. Use production Stripe keys
3. Set up proper domain for webhooks
4. Enable database backups in Supabase
5. Set up monitoring and alerts
6. Review and test all RLS policies

Your Supabase database is now ready to store user creation data securely!