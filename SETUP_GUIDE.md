# Cashflow & Inventory Tracker - Setup Guide

## Quick Start

### Backend Setup
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run dev
\`\`\`

### Frontend Setup
\`\`\`bash
cd frontend
npm install
npm start
# Scan QR code with Expo Go app
\`\`\`

### Production Deployment
\`\`\`bash
cd deployment
docker-compose up -d
\`\`\`

## Features
- 📱 Mobile-first React Native app
- 💰 Sales and inventory tracking
- 📊 Financial reports
- 🌐 Offline support
- 🔐 OTP authentication
