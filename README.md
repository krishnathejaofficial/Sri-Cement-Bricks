# 🧱 Cement Brick Store — Full Stack Web App

A complete e-commerce platform for ordering cement bricks with admin panel, order tracking, UPI payments, and transport/labour cost calculator.

---

## 🚀 Quick Setup Guide

### Step 1: Install Node.js
Download and install Node.js from: https://nodejs.org (use LTS version)

### Step 2: Open in VS Code
1. Extract the ZIP file
2. Open VS Code
3. File → Open Folder → select the `cement-brick-store` folder

### Step 3: Install Dependencies
Open Terminal in VS Code (Ctrl + ` backtick) and run:
```bash
npm install
```

### Step 4: Set Up MongoDB (Free)
1. Go to https://mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://...`)

### Step 5: Configure Environment Variables
1. Open `.env.local` in VS Code
2. Fill in your values:

```env
# MongoDB (from Step 4)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cement-brick-store?retryWrites=true&w=majority

# Your admin login credentials
ADMIN_EMAIL=admin@youremail.com
ADMIN_PASSWORD=YourSecurePassword123

# For order email notifications (use Gmail)
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your-gmail-app-password

# UPI Payment
NEXT_PUBLIC_UPI_ID=yourname@upi

# Company name
NEXT_PUBLIC_COMPANY_NAME=Sri Cement Bricks

# For local testing
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### How to get Gmail App Password:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search "App Passwords" → Create one for "Mail"
4. Use that 16-character password as EMAIL_PASS

### Step 6: Run Locally
```bash
npm run dev
```
Open http://localhost:3000

---

## 🌐 Deploy to Vercel (Free Hosting)

### Step 1: Push to GitHub
1. Create a GitHub account at https://github.com
2. Create a new repository (name it `cement-brick-store`)
3. In VS Code terminal:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cement-brick-store.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project" → Import your repository
4. Click "Environment Variables" and add ALL variables from your `.env.local`
   - IMPORTANT: For `NEXT_PUBLIC_APP_URL`, use your Vercel URL (e.g. `https://cement-brick-store.vercel.app`)
5. Click "Deploy"

Done! Your site is live! 🎉

---

## 🔐 Admin Panel

URL: `https://yoursite.com/admin`

Login with the email and password you set in `.env.local`

### Admin Features:
- **Dashboard**: See total orders, revenue, pending orders at a glance
- **Orders**: View all orders, update status, confirm transport quotes for custom locations, update payment status
- **Products**: Add/edit/delete products with images, prices, categories, specifications
- **Locations**: Add delivery locations with fixed prices or per-km pricing
- **Settings**: Configure all prices, company info, UPI ID, GST, labour rates

---

## 📱 Customer Features

- Browse products with beautiful animated cards
- Quick price calculator on homepage
- Order form with 3 steps: details, location & labour, payment
- Choose from preset locations (fixed transport price) or enter custom location
- GPS location detection for custom locations
- Payment via COD, UPI Advance, or UPI Full Payment
- QR code generation for UPI payments
- Order tracking with code (format: SCB-YYYYMMDD-XXXX)
- Email confirmation for customer and admin

---

## 🗃️ Project Structure

```
cement-brick-store/
├── pages/
│   ├── index.js          ← Main homepage
│   ├── track.js          ← Order tracker
│   ├── admin/
│   │   ├── index.js      ← Admin dashboard
│   │   └── login.js      ← Admin login
│   └── api/
│       ├── admin/        ← Auth, settings APIs
│       ├── orders/       ← Order CRUD + tracking
│       ├── products/     ← Product CRUD
│       ├── locations/    ← Location CRUD
│       └── payment/      ← UPI QR generation
├── components/
│   ├── Navbar.js
│   ├── ProductCard.js
│   └── OrderModal.js
├── models/               ← MongoDB schemas
├── lib/                  ← DB, auth, email utilities
└── styles/               ← Global CSS
```

---

## 💡 Tips

- Add product images by hosting them on any image service (Imgur, Cloudinary, etc.) and pasting the URL in admin
- The order code format is: `SCB-YYYYMMDD-XXXX` (e.g. SCB-20240615-4821)
- Custom location orders show a ⏳ notice until admin sets the transport quote
- All price settings are live — changing them in admin immediately affects the website

---

## 📞 Support

If you face any issues:
1. Check the VS Code terminal for error messages
2. Make sure `.env.local` has all variables filled correctly
3. Make sure MongoDB URI is correct and your IP is whitelisted in Atlas
