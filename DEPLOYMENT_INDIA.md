# SnapCofriend - India Deployment Guide (FREE Tier)

## 🇮🇳 India-Specific Configuration

### Currency
- **Currency**: INR (₹) - Indian Rupees
- **Hourly Rates**: ₹500 - ₹5000 per hour
- **Platform Fee**: 25% (Companions keep 75%)

### Payment Gateway
- **Primary**: Razorpay (India's most popular payment gateway)
- **Alternative**: Stripe India

---

## 🆓 FREE Backend Deployment Options

### Option 1: Render (Recommended - FREE Forever)
**Website**: https://render.com

**Pricing**: FREE tier includes:
- 512 MB RAM
- 0.1 CPU
- 750 hours/month (always on)
- Custom domains
- Automatic HTTPS

**Steps**:
1. Sign up at render.com using GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repo: `vedprakas3/Snapcofriend-`
4. Configure:
   - **Name**: `snapcofriend-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables (see below)
6. Click "Create Web Service"

**Your API will be**: `https://snapcofriend-api.onrender.com`

---

### Option 2: Railway (FREE Tier)
**Website**: https://railway.app

**Pricing**: FREE tier includes:
- $5 credit per month
- 512 MB RAM
- 1 GB disk
- Custom domains

**Steps**:
1. Sign up at railway.app using GitHub
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `vedprakas3/Snapcofriend-`
5. Set Root Directory: `server`
6. Add Environment Variables
7. Deploy

---

### Option 3: Fly.io (FREE Tier)
**Website**: https://fly.io

**Pricing**: FREE tier includes:
- 3 shared-cpu-1x VMs
- 256MB RAM per VM
- 3GB persistent volumes

**Steps**:
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
cd server
fly launch

# Set secrets
fly secrets set MONGODB_URI=your_uri JWT_SECRET=your_secret
```

---

## 🗄️ FREE Database - MongoDB Atlas

**Website**: https://www.mongodb.com/atlas

**Pricing**: FREE tier (M0) includes:
- 512 MB storage
- Shared RAM
- 3-node replica set
- Forever FREE

**Steps**:
1. Sign up at mongodb.com/atlas
2. Create a new project
3. Build a new cluster (Select M0 - FREE)
4. Choose region: `Mumbai (ap-south-1)` for best performance in India
5. Create a database user
6. Add IP: `0.0.0.0/0` (Allow from anywhere)
7. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/snapcofriend?retryWrites=true&w=majority
   ```

---

## 💳 FREE Payment Gateway - Razorpay

**Website**: https://razorpay.com

**Pricing**: 
- No setup fee
- 2% transaction fee (standard)
- FREE test mode

**Steps**:
1. Sign up at razorpay.com
2. Complete KYC (for live mode)
3. Get API Keys from Dashboard → Settings → API Keys
   - Key ID: `rzp_test_...` (test) or `rzp_live_...` (live)
   - Key Secret
4. Set up webhook: `https://your-api.com/api/payments/webhook`

---

## 🖼️ FREE Image Storage - Cloudinary

**Website**: https://cloudinary.com

**Pricing**: FREE tier includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations

**Steps**:
1. Sign up at cloudinary.com
2. Get credentials from Dashboard
3. Add to environment variables

---

## 📱 FREE SMS - Twilio (or MSG91 for India)

**Option 1: Twilio**
- FREE trial: $15.50 credit
- Website: https://twilio.com

**Option 2: MSG91 (India - Better rates)**
- Website: https://msg91.com
- FREE trial available

---

## 📧 FREE Email - Gmail SMTP

Use Gmail for sending emails (FREE):
- Enable 2FA
- Generate App Password
- Use in SMTP settings

---

## 🔧 Environment Variables for Backend

Create these in your deployment platform:

```env
# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app

# Database (MongoDB Atlas - FREE)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/snapcofriend?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d

# Razorpay (India Payments)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary (Image Storage - FREE)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MSG91 or Twilio (SMS - FREE trial)
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=SNAPCF

# Email (G SMTP - FREE)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 🚀 Frontend Deployment - Vercel (FREE)

**Website**: https://vercel.com

**Pricing**: FREE tier includes:
- Unlimited deployments
- 100 GB bandwidth
- Serverless functions
- Custom domains
- Forever FREE

**Steps**:
1. Sign up at vercel.com using GitHub
2. Click "Add New Project"
3. Import `vedprakas3/Snapcofriend-`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-render-api.onrender.com/api
   ```
6. Click "Deploy"

**Your frontend will be**: `https://snapcofriend.vercel.app`

---

## 📋 Complete FREE Stack Summary

| Service | Provider | Cost | Purpose |
|---------|----------|------|---------|
| Frontend | Vercel | FREE | React app hosting |
| Backend API | Render | FREE | Node.js server |
| Database | MongoDB Atlas | FREE | Data storage |
| Payments | Razorpay | 2% fee | Payment processing |
| Images | Cloudinary | FREE | Image storage |
| SMS | MSG91/Twilio | FREE trial | OTP & alerts |
| Email | Gmail SMTP | FREE | Email notifications |

**Total Monthly Cost: ₹0 (FREE)**

---

## 🔗 Important URLs After Deployment

1. **Frontend**: `https://snapcofriend.vercel.app`
2. **Backend API**: `https://snapcofriend-api.onrender.com`
3. **API Docs**: `https://snapcofriend-api.onrender.com/api`

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created (Mumbai region)
- [ ] Backend deployed on Render/Railway
- [ ] Frontend deployed on Vercel
- [ ] Razorpay account created
- [ ] Cloudinary account created
- [ ] Environment variables configured
- [ ] CORS configured (backend CLIENT_URL = frontend URL)
- [ ] Test user registration
- [ ] Test booking flow
- [ ] Test payment flow (Razorpay test mode)

---

## 🆘 Troubleshooting

### CORS Error
Add your frontend URL to `CLIENT_URL` in backend environment variables.

### MongoDB Connection Error
- Check IP whitelist (add `0.0.0.0/0`)
- Verify connection string format
- Check network access

### Payment Not Working
- Use Razorpay test keys for testing
- Check webhook URL is correct
- Verify amount is in paise (₹100 = 10000 paise)

---

## 📞 Support

For issues:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Razorpay Docs: https://razorpay.com/docs/

---

**SnapCofriend India** - Desi companionship, desi rates! 🇮🇳
