# Siegma Logistics Backend

Node.js + Express API for Siegma Logistics platform with Supabase PostgreSQL.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup .env
Copy `.env.example` to `.env` and fill in:
```
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-anon-key
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Database
Follow instructions in `DATABASE_SETUP.md`

### 4. Run Development Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## Project Structure

```
backend/
├── src/
│   ├── index.js                 # Main server file
│   ├── db.js                    # Supabase connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── controllers/
│   │   ├── authController.js    # Login/Signup
│   │   ├── invoiceController.js # Invoice management
│   │   └── adminController.js   # Admin dashboard
│   └── routes/
│       ├── auth.js              # Auth endpoints
│       ├── invoices.js          # Invoice endpoints
│       └── admin.js             # Admin endpoints
├── uploads/                     # PDF storage (local)
├── .env.example                 # Environment template
├── package.json
└── DATABASE_SETUP.md            # SQL schema
```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Customer signup
- `POST /api/auth/login` - Login (customer or admin)
- `GET /api/auth/profile` - Get user profile

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - List customer invoices
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices/upload-pdf` - Upload invoice PDF
- `GET /api/invoices/:invoiceId/download` - Download PDF

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/customers` - All customers
- `GET /api/admin/customers/:customerId` - Customer details
- `GET /api/admin/invoices` - All invoices
- `PATCH /api/admin/invoices/:invoiceId/status` - Update invoice status
- `GET /api/admin/driver-proofs` - View driver proofs
- `POST /api/admin/driver-proofs` - Upload driver proof

---

## Database

PostgreSQL via Supabase with tables:
- `customers` - Customer accounts
- `admins` - Admin users
- `invoices` - Invoices with status tracking
- `driver_proofs` - Driver delivery proofs

See `DATABASE_SETUP.md` for schema.

---

## Deployment

See `../DEPLOYMENT_GUIDE.md` for complete deployment instructions.

### Deploy to Railway:
```bash
1. Push to GitHub
2. Go to railway.app
3. Connect repo and deploy
4. Add environment variables
```

### Deploy to Render:
```bash
1. Push to GitHub
2. Go to render.com
3. Create Web Service
4. Select backend folder
5. Deploy
```

---

## Authentication

Uses JWT tokens. After login, store token in localStorage:
```javascript
const token = localStorage.getItem('token');
// Use in requests: Authorization: Bearer {token}
```

---

## File Upload

- **Invoices**: PDF files to Supabase Storage
- **Driver Proofs**: Images to Supabase Storage
- Uses multer for file handling

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `SUPABASE_URL` | Database URL | https://xxx.supabase.co |
| `SUPABASE_KEY` | API Key | eyJh... |
| `JWT_SECRET` | Token signing key | your-secret |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development/production |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

---

## Development

### Run with hot reload
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

---

## Testing APIs with cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","name":"John","phone":"9999999999","address":"123 Main St"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
```

---

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5000
# Windows: netstat -ano | findstr :5000
# Then: taskkill /PID <pid> /F

# Or use different port:
PORT=3000 npm run dev
```

### Supabase connection failed
- Check URL and KEY are correct
- Verify network connectivity
- Check RLS policies aren't blocking

### CORS errors
- Update FRONTEND_URL in .env
- Add frontend URL to cors() options

---

## License
Private project - Siegma Logistics
