# 🚀 STRIPE LIVE MODE SETUP GUIDE

## ✅ COMPLETED CHANGES:

### 1. **Environment Variables Setup**
- Created `.env` file for secure configuration
- Server now uses environment variables for all sensitive data
- Added validation to ensure live keys are used

### 2. **Code Updates**
- ✅ Updated server.js to use live Stripe keys
- ✅ Updated index.html to use live publishable key
- ✅ Removed all "test" mode references
- ✅ Added production-ready logging
- ✅ Enhanced security validation

## 🔑 REQUIRED ACTIONS:

### **Step 1: Get Your Live Stripe Keys**

1. **Go to Stripe Dashboard:** https://dashboard.stripe.com/apikeys
2. **Switch to LIVE mode** (toggle in top-left corner should say "LIVE")
3. **Copy your keys:**
   - **Secret Key:** `sk_live_...` (starts with `sk_live_`)
   - **Publishable Key:** `pk_live_...` (starts with `pk_live_`)

### **Step 2: Update .env File**

Replace the placeholder values in `.env`:

```env
# Replace these with your actual LIVE Stripe keys
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_LIVE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_LIVE_PUBLISHABLE_KEY_HERE

# Server Configuration
PORT=4242

# Email Configuration (already configured)
GMAIL_USER=moosapc401@gmail.com
GMAIL_APP_PASSWORD=beia cpuh fnur tywr
ADMIN_EMAIL=au.moosaimran@gmail.com

# Application Environment
NODE_ENV=production
```

### **Step 3: Update Frontend Publishable Key**

In `public/index.html`, line ~515, replace:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE';
```

With your actual live publishable key:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51QDrhGCix17DoyQv...'; // Your actual key
```

### **Step 4: Stripe Account Requirements for Live Mode**

Before going live, ensure your Stripe account has:

1. **Business Information:** Complete business details in Stripe dashboard
2. **Bank Account:** Added for receiving payments
3. **Identity Verification:** Completed (if required)
4. **Payment Methods:** Enabled (cards, etc.)

### **Step 5: Test with Live Payment Methods**

⚠️ **IMPORTANT:** In live mode, you'll use REAL payment methods:
- Real credit/debit cards
- Real bank accounts
- Real money transactions

### **Step 6: Security Considerations**

1. **Never commit .env file to Git:**
   ```bash
   # Add .env to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use HTTPS in production**
3. **Set up proper webhook endpoints** (for production)

## 🔒 SECURITY FEATURES ADDED:

- ✅ Environment variable validation
- ✅ Live key verification on startup
- ✅ Secure configuration management
- ✅ Production-ready error handling

## 🚀 STARTING THE SERVER:

```bash
# Make sure .env file has your live keys
node server.js
```

You should see:
```
🚀 Global Leaders Visa Application Server running on http://localhost:4242
🔒 Running in production mode
💳 Stripe Live Mode: ENABLED
```

## ⚠️ IMPORTANT NOTES:

1. **Live Mode = Real Money:** All transactions will be real
2. **Test Carefully:** Test thoroughly before public launch
3. **Monitor Transactions:** Watch Stripe dashboard for all payments
4. **Customer Support:** Be ready to handle real customer inquiries

## 📞 SUPPORT:

If you encounter issues:
1. Check Stripe dashboard for transaction details
2. Monitor server logs for errors
3. Verify all live keys are correctly set
4. Ensure business verification is complete in Stripe

Your application is now ready for live payment processing! 🎉