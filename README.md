# SnapCofriend

**SnapCofriend** is a contextual companionship marketplace that connects people who need specific social presence for particular situations with verified companions who specialize in those contexts.

## 🌟 Features

### Core Functionality
- **AI-Powered Matching**: Describe your situation in natural language and get matched with the top 3 companions
- **Contextual Companionship**: Find companions for weddings, fitness, travel, cultural events, and more
- **Presence Packages**: Book situation-specific packages instead of generic hourly rates
- **Real-time Communication**: In-app messaging with read receipts
- **Live Location Sharing**: Share your location during meetups for safety

### Safety Features
- ✅ ID Verification for all companions
- ✅ Background Checks
- ✅ Video Introductions
- ✅ Safety Code System
- ✅ Automatic Check-ins every 30 minutes
- ✅ One-tap SOS alerts
- ✅ $5M Insurance Coverage
- ✅ 24/7 Safety Team

### For Companions (Friends)
- Create a professional profile with presence packages
- Set your own hourly rates ($20-$200/hr)
- Manage availability calendar
- Track earnings and stats
- Build reputation through reviews

## 🏗️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS + shadcn/ui
- React Router DOM
- Axios (API Client)
- Socket.io Client (Real-time)
- date-fns (Date formatting)

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Socket.io (Real-time communication)
- JWT Authentication
- bcrypt (Password hashing)
- Stripe (Payments)
- Helmet (Security)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vedprakas3/Snapcofriend-.git
cd Snapcofriend-
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**

Create `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/snapcofriend
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_key
```

Create `.env` file in the `app` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Start development servers**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📁 Project Structure

```
snapcofriend/
├── app/                    # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   └── package.json
├── server/                 # Backend Node.js API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Entry point
│   └── package.json
└── package.json           # Root package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/emergency-contact` - Update emergency contact

### Friends (Companions)
- `GET /api/friends` - List companions with filters
- `GET /api/friends/:id` - Get companion details
- `POST /api/friends/profile` - Create friend profile
- `PUT /api/friends/profile` - Update friend profile
- `POST /api/friends/packages` - Add presence package

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/messages` - Send message

### Matching
- `POST /api/matches/find` - Find matches for situation
- `GET /api/matches/recommendations` - Get recommended companions

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `GET /api/payments/earnings` - Get earnings (for friends)

### Safety
- `POST /api/safety/sos` - Trigger SOS alert
- `GET /api/safety/status/:bookingId` - Get safety status

## 🛡️ Safety & Ethics

1. **Strictly Platonic**: Explicit prohibition of romantic/sexual services
2. **Public Meetings**: First meetings must be in public venues
3. **Equal Protection**: Safety features protect both users and companions
4. **Fair Wages**: Companions keep 75% of earnings
5. **Transparency**: Clear pricing with no hidden fees
6. **Privacy**: GDPR/CCPA compliant with data encryption

## 💰 Monetization

- **Platform Fee**: 25% of every booking
- **Subscription**: "Friend Pass" $29/month (reduced fees, priority matching)
- **B2B Licensing**: White-label access for hotels, airlines, corporates

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repo to Vercel
2. Set build command: `cd app && npm run build`
3. Set output directory: `app/dist`
4. Add environment variables

### Backend (Railway/Render/Heroku)
1. Connect your GitHub repo
2. Set root directory: `server`
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ for meaningful connections
- Inspired by the need for structured, safe companionship

---

**SnapCofriend** - The right presence for every moment.
