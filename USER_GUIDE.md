# Quick Start Guide - Siegma Logistics Dashboard

## Accessing the Application

**Development Server**: http://localhost:8084

## Login Credentials

### Admin Account
- **Email**: admin@siegma.com
- **Password**: admin123
- **Access**: Full system access with admin dashboard

### Customer Account
- **Register**: Create new account on registration page
- **Login**: Use registered email and any password
- **Access**: Customer dashboard with personal requests

---

## Admin Dashboard Features

### 1. Stats Overview (Top Section)
Four colored cards displaying real-time statistics:
- **Total Shipments** (Blue): Total number of all requests
- **Pickup Packages** (Yellow): Requests pending pickup
- **Pending Packages** (Orange): Requests in transit or approved
- **Packages Delivered** (Green): Completed/delivered requests

### 2. Ongoing Delivery Section
- Shows up to 3 active shipments (In Transit/Approved status)
- Displays: Shipment ID, Material type, Courier service, Route, Distance
- Empty state shown when no active deliveries

### 3. Track Order Table
Comprehensive table showing all requests with columns:
- **Tracking No**: Request/Shipment ID
- **Courier Service**: DHL Express (parcel) or Full Truck
- **Category**: Material type
- **Shipper Date**: Pickup date
- **Destination**: Delivery location
- **Weight**: Shipment weight
- **Payment**: Amount in ₹
- **Status**: Color-coded status badge
- **Actions**: 
  - 📄 View Invoice (all requests)
  - ✅ Approve (pending requests only)
  - ❌ Reject (pending requests only)

### 4. Sidebar Navigation
- Dashboard (active)
- Requests
- Trips
- Documents
- Customers
- Settings
- Logout (bottom)

---

## Customer Dashboard Features

### 1. Stats Overview
Four cards showing personal statistics:
- Total Requests
- In Transit
- Delivered
- Pending

### 2. My Requests Tab
View all your submitted requests with:
- Request ID and date
- Route information (From → To)
- Material and weight
- Status badge
- Amount in ₹
- Quick view details button

### 3. My Documents Tab
View and manage invoices:
- Invoice number
- Date
- Amount
- Status
- **View** button: Opens invoice preview
- **Download** button: Downloads invoice as PDF

---

## Invoice Features

### Invoice Modal (Admin & Customer)

#### What's Included:
1. **Company Header**
   - Siegma Logistics logo
   - Full company address
   - GST number
   - Contact information

2. **Invoice Details**
   - Invoice number
   - Issue date
   - Status

3. **Customer Information**
   - Customer name
   - Email address
   - Phone number

4. **Shipment Details**
   - Request type
   - From/To locations
   - Material description
   - Weight

5. **Cost Breakdown**
   - Subtotal
   - GST (18%)
   - **Total Amount**

6. **Payment Terms**
   - Payment deadline (30 days)
   - Bank account details
   - Late payment notice
   - Contact for queries

#### Actions:
- **🖨️ Print**: Print invoice directly
- **⬇️ Download PDF**: Save invoice as PDF using browser print dialog
- **❌ Close**: Exit modal

---

## User Workflows

### For Customers:

#### 1. Create New Request
1. Visit website and click "Get Quote" or "Request Delivery"
2. Login (or register if new user)
3. Fill out request form:
   - Select type (General Parcel / Full Truck Load)
   - Enter pickup and delivery locations
   - Specify material details
   - Provide weight and packages
   - Add contact information
4. Submit request
5. Receive request ID confirmation
6. Redirected to dashboard

#### 2. View Request Status
1. Login to customer account
2. Go to "My Requests" tab
3. See all requests with current status
4. Click "View" for more details

#### 3. Download Invoice
1. Login to customer account
2. Go to "My Documents" tab
3. Find your request
4. Click "View" to preview invoice
5. Click "Download PDF" to save
6. Or click "Print" for hard copy

### For Admin:

#### 1. Review New Requests
1. Login to admin account
2. View all pending requests in Track Order table
3. Check request details by clicking invoice icon
4. Review customer information and shipment details

#### 2. Approve/Reject Requests
1. Locate pending request in table
2. Click ✅ (Check) to approve
3. Or click ❌ (X) to reject
4. Request status updates immediately
5. Customer notified of status change

#### 3. View All Shipments
1. View stats cards for quick overview
2. Check "Ongoing Delivery" section for active shipments
3. Use Track Order table to see all requests
4. Filter by searching in search box

#### 4. Generate Invoices
1. Click invoice icon (📄) for any request
2. Review invoice details
3. Print or download as needed
4. Share with customer if needed

---

## Tips & Best Practices

### For Customers:
- ✅ Keep your contact information up to date
- ✅ Download invoices for your records
- ✅ Check dashboard regularly for status updates
- ✅ Contact admin for any discrepancies

### For Admin:
- ✅ Review pending requests daily
- ✅ Verify all details before approving
- ✅ Use invoice feature to maintain records
- ✅ Monitor ongoing deliveries section
- ✅ Keep track of delivery statistics

---

## Troubleshooting

### Cannot Login
- Verify email is correct
- For admin, use: admin@siegma.com / admin123
- For customers, use registered credentials

### Request Not Showing
- Ensure you're logged in with correct account
- Customer dashboard only shows YOUR requests
- Admin dashboard shows ALL requests
- Try refreshing the page

### Invoice Not Loading
- Ensure request has been created properly
- Check that all required fields were filled
- Try closing and reopening the modal
- Refresh the browser if issue persists

### Print/Download Not Working
- Ensure browser allows print dialogs
- Check popup blocker settings
- Try using Chrome or Edge for best results
- Ensure printer is configured (for print)
- Select "Save as PDF" in print dialog (for download)

---

## Browser Compatibility

**Recommended Browsers:**
- Google Chrome (Latest)
- Microsoft Edge (Latest)
- Mozilla Firefox (Latest)
- Safari (Latest)

**Required:**
- JavaScript enabled
- Cookies enabled
- Local Storage enabled
- Pop-ups allowed for print dialog

---

## Support

For technical support or questions:
- **Email**: support@siegmalogistics.com
- **Phone**: +91 22 1234 5678
- **Address**: 3.54, Salem Attur NH - 636015, Tamil Nadu, India

---

## Security Note

- Never share your login credentials
- Always logout after using a shared computer
- Report suspicious activity immediately
- Keep your password secure
- Admin credentials should never be shared with customers

---

**Version**: 1.0  
**Last Updated**: [Current Date]  
**Siegma Logistics Pvt Ltd** - Your Trusted Logistics Partner
