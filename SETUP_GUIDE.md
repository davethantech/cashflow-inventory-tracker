# Cashflow & Inventory Tracker - Setup Guide

## Prerequisites

### For Local Development
- Node.js 18+ 
- PostgreSQL 15+
- React Native/Expo CLI
- Android Studio (for Android development)

### For Production
- Docker & Docker Compose
- AWS/GCP/Render account
- Domain name (optional)

## Local Development Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run migrate
npm run seed

# Start development server
npm run dev
