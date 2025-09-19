# VAI Client Research Agent

A powerful AI-driven client research automation tool with user management, subscription handling, and comprehensive admin panel.

## 🚀 Features

- **AI-Powered Research**: Automated client research using multiple APIs
- **User Management**: Complete user authentication and role-based access control
- **Admin Panel**: Create and manage users with different roles
- **Subscription System**: Stripe integration for payment processing
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Database Storage**: Supabase integration for reliable data storage
- **Modern UI**: Elite dark theme with responsive design

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account
- Stripe account (for payments)
- API keys for research services (OpenAI, Clearbit, Hunter.io, etc.)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vai-client-research-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your actual API keys and configuration values.

4. **Set up Supabase database**
   Follow the detailed guide in `SUPABASE_SETUP.md`

5. **Start the application**
   ```bash
   npm start
   ```

## 🗄️ Database Schema & User Storage

### How User Creation is Stored

The application uses **Supabase** as the primary database to store all user data securely:

#### Users Table Schema
```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Creation Process

1. **Admin Authentication**: Admin logs in via `/api/auth/login`
2. **User Creation Request**: Admin submits user data via admin panel
3. **Server Processing**:
   - Validates input data (name, email, password)
   - Checks for duplicate emails
   - Hashes password using bcrypt (10 salt rounds)
   - Inserts user data into Supabase `users` table
4. **Database Storage**: User data is permanently stored in Supabase
5. **Response**: Server returns created user data (without password)

#### Data Security
- **Password Hashing**: All passwords are hashed with bcrypt before storage
- **Row Level Security**: Supabase RLS policies protect user data
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server validates all user inputs

## 🔐 Authentication System

### Login Flow
1. User submits credentials to `/api/auth/login`
2. Server verifies email exists in database
3. Password is compared using bcrypt
4. JWT token generated with user ID, email, and role
5. Token returned to client for subsequent requests

### Protected Routes
- All admin endpoints require valid JWT token
- Admin role required for user management functions
- Tokens expire after 24 hours for security

## 🎛️ Admin Panel Features

### User Management
- **Create Users**: Add new users with email, name, password, and role
- **View Users**: Display all users with their details and creation dates
- **Role Assignment**: Assign 'user' or 'admin' roles
- **Subscription Tracking**: Monitor subscription status for billing

### Security Features
- Role-based access control
- JWT authentication middleware
- Password strength requirements
- Input sanitization and validation

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with email/password
- `GET /api/user/profile` - Get authenticated user profile

### Admin Endpoints (Requires Admin Role)
- `POST /api/admin/create-user` - Create new user
- `GET /api/admin/users` - Get all users list

### Research
- `POST /api/research` - Perform client research
- `GET /api/health` - Health check and API status

## 🌐 Environment Configuration

### Essential Variables (Required)
```env
# Supabase Database
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Authentication
JWT_SECRET=your-secure-jwt-secret

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID=price_your-subscription-price-id
```

### Research API Keys (Optional)
```env
OPENAI_API_KEY=sk-your-openai-key
CLEARBIT_API_KEY=your-clearbit-key
HUNTER_API_KEY=your-hunter-key
NEWS_API_KEY=your-news-api-key
APOLLO_API_KEY=your-apollo-key
```

## 🚀 Deployment

### Vercel Deployment
1. Connect repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Deploy automatically on push to main branch
4. Configure custom domain if needed

### Production Checklist
- [ ] All environment variables configured
- [ ] Supabase database schema created
- [ ] Admin user created in database
- [ ] Stripe webhooks configured
- [ ] SSL certificate enabled
- [ ] Domain configured for production

## 🔒 Security Best Practices

1. **Password Security**
   - bcrypt hashing with 10 salt rounds
   - No plain text password storage
   - Strong password requirements enforced

2. **Database Security**
   - Row Level Security (RLS) enabled
   - Service key used only on server
   - Input validation and sanitization

3. **Authentication Security**
   - JWT tokens with 24-hour expiration
   - Secure, random JWT secret
   - Role-based access control

## 🐛 Troubleshooting

### Database Issues
- **"User creation failed"**: Check Supabase connection and table schema
- **"Invalid credentials"**: Verify user exists and password is correct
- **"Permission denied"**: Check RLS policies and API key permissions

### Authentication Issues
- **"JWT must be provided"**: Ensure JWT_SECRET is set in environment
- **"Invalid token"**: Check token format and expiration
- **"Admin access required"**: Verify user has admin role

### Setup Issues
- **"Supabase not configured"**: Check SUPABASE_URL and keys
- **"Dependencies missing"**: Run `npm install` to install packages
- **"Port already in use"**: Change PORT in .env or stop other services

## 📊 User Data Flow

```
Admin Login → JWT Token → Admin Panel → Create User → 
Validate Data → Hash Password → Store in Supabase → 
Return Success → Update UI → User Available for Login
```

## 📞 Support

For technical support:
- **Email**: chris.t@ventarosales.com
- **Documentation**: See `SUPABASE_SETUP.md` for database setup
- **Issues**: Check troubleshooting section above

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by VentaroAI** | Secure • Scalable • User-Friendly