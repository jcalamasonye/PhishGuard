# PhishGuard — Full Deployment Guide
Backend → Railway | Frontend → Vercel

---

## Pre-flight checklist

- [ ] Railway account created (railway.app)
- [ ] Vercel account created (vercel.com)  
- [ ] GitHub repo with this backend code pushed
- [ ] GitHub repo with frontend code pushed (or same repo)
- [ ] Gmail account (for SMTP) with 2FA enabled

---

## STEP 1 — Generate secrets locally

Run these three commands and save the output. You'll need them in Step 3.

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(48).toString('hex'))"
```

---

## STEP 2 — Deploy backend to Railway

### 2a. Create project
1. Go to railway.app → **New Project**
2. Choose **Deploy from GitHub repo** → select your backend repo
3. Railway will detect Node.js and start building

### 2b. Add PostgreSQL database
1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**
2. Railway automatically sets `DATABASE_URL` in your backend service — no action needed

### 2c. Set environment variables
Go to your backend service → **Variables** tab → add each one:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | *(from Step 1)* |
| `JWT_REFRESH_SECRET` | *(from Step 1)* |
| `FRONTEND_URL` | `https://YOUR-APP.vercel.app` *(fill after Step 3)* |
| `BACKEND_URL` | `https://YOUR-BACKEND.railway.app` *(copy from Railway Networking tab)* |
| `CORS_ORIGIN` | `https://YOUR-APP.vercel.app` *(fill after Step 3)* |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASSWORD` | your Gmail App Password *(see below)* |
| `FROM_EMAIL` | `noreply@phishguard.com` |
| `FROM_NAME` | `PhishGuard Security` |

### 2d. Get Gmail App Password
1. Go to myaccount.google.com → Security → 2-Step Verification → App passwords
2. Create a new app password for "Mail"
3. Copy the 16-character password → paste as `SMTP_PASSWORD`

### 2e. Set your Railway public URL
1. Go to your backend service → **Networking** → **Generate Domain**
2. Copy the URL (e.g. `https://phishguardbackend.railway.app`)
3. Set `BACKEND_URL` to this value in Variables

### 2f. Trigger deployment
Railway auto-deploys on push. To manually trigger:
- Go to your service → **Deployments** → **Deploy Now**

### 2g. Verify backend is live
Open your browser and visit:
```
https://YOUR-BACKEND.railway.app/health
```
Expected response:
```json
{ "status": "ok", "timestamp": "...", "uptime": 12.3, "environment": "production" }
```

---

## STEP 3 — Run database migrations + seed

In Railway, go to your backend service → **Settings** → scroll to **Deploy** → find the shell, or use the Railway CLI:

```bash
# Option A — Railway CLI (install: npm i -g @railway/cli)
railway login
railway run npm run db:migrate
railway run npm run db:seed

# Option B — Add a one-off start command temporarily
# Change Start Command to: npm run db:migrate && npm run db:seed && npm start
# Deploy once, then change Start Command back to: npm start
```

After seeding, your demo credentials are:
- **Admin:** `admin@democorp.com` / `Admin@123`
- **Users:** `sarah@democorp.com`, `michael@democorp.com`, etc. / `User@123`

---

## STEP 4 — Deploy frontend to Vercel

### 4a. Import project
1. Go to vercel.com → **Add New Project** → import your frontend GitHub repo
2. Framework preset: **Next.js** (auto-detected)
3. Build command: `npm run build` (default)

### 4b. Set environment variables
In Vercel project → **Settings** → **Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.railway.app/api/v1` |

### 4c. Deploy
Click **Deploy**. Once complete, copy your Vercel URL.

### 4d. Update Railway with Vercel URL
Go back to Railway → Variables and update:
- `FRONTEND_URL` → `https://YOUR-APP.vercel.app`
- `CORS_ORIGIN` → `https://YOUR-APP.vercel.app`

Then redeploy the Railway service (it auto-triggers on variable change).

---

## STEP 5 — End-to-end smoke test

Run through this flow to confirm everything works:

### Admin flow
- [ ] Visit `https://YOUR-APP.vercel.app`
- [ ] Click **Admin Login** → log in as `admin@democorp.com` / `Admin@123`
- [ ] Dashboard loads with stats
- [ ] Navigate to **Templates** → at least one template visible
- [ ] Navigate to **Users** → 10 seeded users visible
- [ ] Navigate to **Campaigns** → click **Create Campaign**
- [ ] Select a template, add users, click **Launch**
- [ ] Campaign status changes to ACTIVE

### Email tracking flow
- [ ] Open the phishing email received by a test user
- [ ] Click the link in the email
- [ ] Browser redirects to training page at `https://YOUR-APP.vercel.app/training/...`
- [ ] Return to admin dashboard → campaign open/click rates updated

### User flow  
- [ ] Log in as `sarah@democorp.com` / `User@123`
- [ ] Dashboard shows campaigns + quiz history
- [ ] Navigate to **Quiz** → take a quiz → score recorded
- [ ] Navigate to **Analyzer** → paste an email → AI analyzes it

### Analytics
- [ ] Log in as admin → **Reports**
- [ ] Overview stats populate
- [ ] Department breakdown chart visible
- [ ] Risk assessment table shows user risk levels

---

## Troubleshooting

### Railway crashes on deploy
Check the deploy logs. Common causes:
- **"Missing required environment variable: DATABASE_URL"** → PostgreSQL plugin not added, or vars not saved
- **"Cannot find module './config'"** → build didn't run; check build logs for tsc errors
- **"ENOENT logs/app.log"** → old dist/ without logger fix; push latest code and redeploy

### CORS errors in browser
- Confirm `CORS_ORIGIN` on Railway exactly matches your Vercel URL (no trailing slash)
- Confirm `NEXT_PUBLIC_API_URL` on Vercel ends with `/api/v1`

### Login fails (401)
- Confirm `JWT_SECRET` and `JWT_REFRESH_SECRET` are set and at least 32 chars
- Confirm the DB was seeded (try `railway run npm run db:seed`)

### Emails not sending
- Confirm Gmail App Password is correct (16 chars, no spaces)
- Check Railway logs for `nodemailer` errors
- For demo: campaigns still work — emails just won't arrive in inboxes

### AI analyzer not working
- This requires a separate Python ML service running at `AI_API_URL`
- If not deployed, the `/ai/analyze` endpoint returns an error but everything else works

---

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env
# Edit .env with your local Postgres URL and secrets

# 3. Run migrations + seed
npm run db:migrate
npm run db:seed

# 4. Start dev server (hot reload)
npm run dev
```

Server starts at `http://localhost:3001`
Health check: `http://localhost:3001/health`
API base: `http://localhost:3001/api/v1`
