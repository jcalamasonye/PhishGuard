# PhishGuard 

A web-based phishing simulation and security awareness training platform built for COMP3000 Computing Project 2025/2026 at the University of Plymouth.

## Overview

PhishGuard trains employees to identify phishing emails through hands-on simulation rather than passive learning. Admins create and send fake phishing campaigns, and when employees click the links, they are redirected to a training program instead of being compromised — turning security failures into learning opportunities.

## Features

### Admin
- Secure login & session authentication
- Dashboard to monitor and manage campaigns
- User management with progress tracking
- Template library with difficulty levels
- Reports & analytics on user interactions
- Secure logout

### Employee
- Secure login & session authentication
- Personal dashboard with click-rate metrics
- Training resources on phishing awareness
- Quiz system with immediate scoring
- AI-powered email analyzer to classify phishing threats
- Phishing library to distinguish threats

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (via Prisma)
- **AI/ML:** Scikit-learn
- **Deployment:** Railway, Vercel
- **Domain:** phishguardapp.space

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL

### Installation

```bash
git clone https://github.com/jcalamasonye/PhishGuard.git
cd PhishGuard
npm install
```

### Environment Variables
Copy the `.env.example` file and fill in your values:
```bash
cp .env.example .env
```

### Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Live Demo
https://phish-guard-frontend-sigma.vercel.app 
