# Quick Start Checklist

Follow this checklist to get your Siegma Logistics project live:

## Phase 1: Supabase (30 minutes)

- [ ] Create account at https://supabase.com
- [ ] Create new project
- [ ] Open SQL Editor
- [ ] Copy SQL from `backend/DATABASE_SETUP.md`
- [ ] Run SQL query
- [ ] Go to Settings → API
- [ ] Copy Project URL and anon key
- [ ] Create storage buckets: `invoices` and `driver-proofs`

**Credentials saved?** ✅ Next step →

---

## Phase 2: Backend Setup (15 minutes)

- [ ] Navigate to `backend` folder
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in `SUPABASE_URL` and `SUPABASE_KEY`
- [ ] Set `JWT_SECRET=your-secret-here`
- [ ] Run: `npm install`
- [ ] Run: `npm run dev`
- [ ] Check: `http://localhost:5000/api/health`

**Backend running?** ✅ Next step →

---

## Phase 3: Frontend Connection (15 minutes)

- [ ] Create file `src/lib/api.ts`
- [ ] Copy code from DEPLOYMENT_GUIDE.md
- [ ] Update `src/.env` with backend URL
- [ ] Test login/signup in frontend
- [ ] Test invoice creation

**Frontend connected?** ✅ Next step →

---

## Phase 4: Deploy Backend (30 minutes)

Choose one: Railway or Render

### Railway
- [ ] Go to railway.app
- [ ] Connect GitHub
- [ ] Select project and backend folder
- [ ] Add environment variables (SUPABASE_URL, SUPABASE_KEY, JWT_SECRET)
- [ ] Deploy
- [ ] Copy backend URL from Railway

### Render
- [ ] Go to render.com
- [ ] Create Web Service
- [ ] Connect GitHub
- [ ] Select backend folder
- [ ] Add environment variables
- [ ] Deploy
- [ ] Copy backend URL

**Backend deployed?** ✅ Next step →

---

## Phase 5: Deploy Frontend (30 minutes)

Choose one: Vercel or Netlify

### Vercel
- [ ] Go to vercel.com
- [ ] Import project
- [ ] Add env var: `VITE_API_URL=your-backend-url/api`
- [ ] Deploy
- [ ] Copy frontend URL

### Netlify
- [ ] Go to netlify.com
- [ ] Import project
- [ ] Add env var: `VITE_API_URL=your-backend-url/api`
- [ ] Deploy
- [ ] Copy frontend URL

**Frontend deployed?** ✅ Next step →

---

## Phase 6: Final Configuration (10 minutes)

- [ ] Update backend .env: `FRONTEND_URL=your-frontend-url`
- [ ] Redeploy backend with new URL
- [ ] Test signup on production frontend
- [ ] Test login
- [ ] Test invoice creation
- [ ] Test PDF upload

---

## ✅ You're Live!

- Frontend: `https://your-domain.vercel.app`
- Backend: `https://your-backend.railway.app`
- Database: Supabase PostgreSQL
- Storage: Supabase Storage

**Testing Checklist:**
- [ ] Signup works
- [ ] Login works
- [ ] Can view profile
- [ ] Can create invoice
- [ ] Can upload PDF
- [ ] Admin can view all customers
- [ ] Admin can view all invoices
- [ ] Admin can update invoice status

---

## Support Files

| File | Contents |
|------|----------|
| `BACKEND_SETUP_SUMMARY.md` | Overview of backend |
| `DEPLOYMENT_GUIDE.md` | Detailed deployment steps |
| `backend/README.md` | Backend documentation |
| `backend/DATABASE_SETUP.md` | SQL schema |
| `backend/.env.example` | Environment template |

---

## Estimated Time: 2 hours total

- Setup Supabase: 30 min
- Setup Backend: 15 min
- Connect Frontend: 15 min
- Deploy Backend: 30 min
- Deploy Frontend: 30 min

**Total: ~2 hours**

---

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Support

If something's not working:

1. **Backend won't start?**
   - Check Node.js version: `node --version` (need 16+)
   - Check port 5000 is free
   - Check `.env` file has all variables

2. **Can't connect to Supabase?**
   - Verify URL and KEY are correct
   - Check network/VPN
   - Test in Supabase dashboard

3. **CORS errors?**
   - Check FRONTEND_URL is set
   - Check frontend URL matches deployed URL

4. **PDF upload fails?**
   - Check storage buckets exist
   - Check file size < 50MB
   - Check RLS policies

---

Start from Phase 1 and follow each step! 🚀
