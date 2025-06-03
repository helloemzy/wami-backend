# 🍷 Wami Backend API

Wine Collecting & Idle Vineyard Game Backend

## Features
- AI-powered wine bottle scanning with Deepseek Vision
- User authentication and profiles
- Wine collection management with WSET tasting notes
- Idle vineyard game with coin economy
- RESTful API with MongoDB storage

## Quick Deploy to Railway

1. Upload all files to GitHub repository
2. Connect repository to Railway
3. Add environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Secure random string for JWT tokens
   - `DEEPSEEK_API_KEY` - Your Deepseek AI API key
   - `NODE_ENV=production`

4. Deploy automatically

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Wine Bottles
- `POST /api/bottles/scan` - AI scan wine bottle image
- `POST /api/bottles/save` - Save bottle to collection
- `GET /api/bottles/collection` - Get user's bottle collection
- `GET /api/bottles/:id` - Get specific bottle details

### Idle Game
- `GET /api/game/vineyard` - Get vineyard status and idle earnings
- `POST /api/game/harvest` - Collect idle coins
- `POST /api/game/upgrade` - Upgrade vineyard level

## Health Check
- `GET /` - API status and health check

Built with Node.js, Express, MongoDB, and Deepseek AI 🚀
