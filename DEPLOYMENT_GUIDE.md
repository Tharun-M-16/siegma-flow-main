# Complete Deployment Guide - Siegma Logistics

## Overview
```
Frontend (React)     →    Backend (Node.js)     →    Database (PostgreSQL)
Vercel/Netlify          Railway/Render              Supabase.com
```

---

## Phase 1: Supabase Setup (5 minutes)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start Your Project"
3. Sign up with GitHub or Email
4. Create new project:
   - Project name: `siegma-logistics`
   - Region: Choose closest to you (India region if available)
   - Password: Create strong password
5. Wait for deployment (2-3 minutes)

### Step 2: Create Database Tables
1. Once project is created, click on "SQL Editor"
2. Click "+ New Query"
3. Copy content from `backend/DATABASE_SETUP.md`
4. Paste into the SQL editor
5. Click "Run"
6. Status should show "✅ Success"

### Step 3: Get Supabase Credentials
1. Click "Settings" → "API"
2. Copy these:
   - **Project URL** → `SUPABASE_URL`
   - **anon key** → `SUPABASE_KEY`
3. Keep these safe - you'll need them

### Step 4: Create Storage Buckets
1. Click "Storage" in left sidebar
2. Click "New bucket"
3. Create bucket name: `invoices` (Public: OFF)
4. Create bucket name: `driver-proofs` (Public: OFF)

---

## Phase 2: Backend Setup (10 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create .env File
1. Duplicate `.env.example` → `.env`
2. Fill in values:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-from-settings
JWT_SECRET=your-secret-key-12345-change-this
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 3: Test Backend Locally
```bash
npm run dev
```
You should see:
```
🚀 Server running on http://localhost:5000
```

Test the API:
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"Backend is running ✅"}`

---

## Phase 3: Frontend Connection (10 minutes)

### Step 1: Create API Service File
Create `src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth APIs
export const auth = {
  signup: (email: string, password: string, name: string, phone: string, address: string) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone, address }),
    }),

  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => apiCall('/auth/profile'),
};

// Invoice APIs
export const invoices = {
  create: (data: any) =>
    apiCall('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: () => apiCall('/invoices'),

  getOne: (id: string) => apiCall(`/invoices/${id}`),

  uploadPDF: (invoiceId: string, file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('invoiceId', invoiceId);
    return fetch(`${API_BASE_URL}/invoices/upload-pdf`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(r => r.json());
  },

  download: (invoiceId: string) =>
    apiCall(`/invoices/${invoiceId}/download`),
};

// Admin APIs
export const admin = {
  getStats: () => apiCall('/admin/stats'),
  getCustomers: () => apiCall('/admin/customers'),
  getCustomerDetails: (customerId: string) =>
    apiCall(`/admin/customers/${customerId}`),
  getAllInvoices: () => apiCall('/admin/invoices'),
  updateInvoiceStatus: (invoiceId: string, status: string) =>
    apiCall(`/admin/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getDriverProofs: () => apiCall('/admin/driver-proofs'),
};
```

### Step 2: Update Frontend .env
Create `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

## Phase 4: Deploy Backend (15 minutes)

### Option A: Deploy to Railway (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub
   - Connect your GitHub account

2. **Deploy Backend**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Select your `siegma-flow-main` repo
   - Select root directory: `backend`
   - Add environment variables:
     - `SUPABASE_URL`
     - `SUPABASE_KEY`
     - `JWT_SECRET`
     - `NODE_ENV=production`

3. **Get Backend URL**
   - Railway generates: `https://your-app.up.railway.app`
   - Save this URL

### Option B: Deploy to Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub
4. Select `siegma-flow-main` repo
5. Settings:
   - Build Command: `cd backend && npm install`
   - Start Command: `npm start`
   - Add environment variables
6. Deploy

---

## Phase 5: Deploy Frontend (10 minutes)

### Deploy to Vercel (Easiest)

1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repo: `siegma-flow-main`
4. Build settings:
   - Framework: Vite
   - Build Command: `npm run build`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
6. Click "Deploy"
7. Get your frontend URL: `https://your-app.vercel.app`

### Deploy to Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub
4. Select repo
5. Build settings: Same as above
6. Deploy

---

## Phase 6: Final Setup

### Update Backend Environment
In Railway/Render dashboard:
```
FRONTEND_URL=https://your-app.vercel.app
```

### Update Frontend
Change `.env` to production:
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

---

## Testing Checklist

### Local Testing (Before Deployment)
- [ ] Backend runs on `http://localhost:5000`
- [ ] Health check: `http://localhost:5000/api/health` ✅
- [ ] Frontend runs on `http://localhost:5173`
- [ ] Signup works
- [ ] Login works
- [ ] Can create invoice
- [ ] Can upload PDF

### Production Testing
- [ ] Frontend loads from Vercel
- [ ] Can signup on production
- [ ] Can login
- [ ] Invoice creation works
- [ ] PDF upload works
- [ ] Admin dashboard loads

---

## Troubleshooting

### Backend won't start
```bash
# Check Node version
node --version  # Should be 16+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run with debug
npm run dev --debug
```

### Can't connect to Supabase
- Check `SUPABASE_URL` format (must have .supabase.co)
- Check `SUPABASE_KEY` is correct
- Check RLS policies aren't blocking queries

### CORS errors
- Update `FRONTEND_URL` in backend
- Ensure ` origins` in `src/index.js` includes your frontend

### PDF upload fails
- Check storage buckets exist
- Check bucket policies allow uploads
- Verify file size < 50MB

---

## API Endpoints Reference

### Auth
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/profile (requires token)
```

### Invoices (Customer)
```
POST   /api/invoices (create)
GET    /api/invoices (list)
GET    /api/invoices/:id (get one)
POST   /api/invoices/upload-pdf (upload)
GET    /api/invoices/:invoiceId/download
```

### Admin
```
GET    /api/admin/stats
GET    /api/admin/customers
GET    /api/admin/customers/:customerId
GET    /api/admin/invoices
PATCH  /api/admin/invoices/:invoiceId/status
GET    /api/admin/driver-proofs
POST   /api/admin/driver-proofs (upload)
```

---

## Success! 🎉

Your Siegma Logistics platform is now live:
- 🎯 Frontend: `https://your-app.vercel.app`
- 🔧 Backend: `https://your-backend.railway.app`
- 🗄️ Database: Supabase PostgreSQL
- 💾 Storage: Supabase Storage for PDFs
