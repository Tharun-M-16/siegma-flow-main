import express from "express";
import multer from "multer";
import {
  getAllUsers,
  updateUserRole,
  getAllCustomers,
  getCustomerDetails,
  getAllInvoices,
  updateInvoiceStatus,
  uploadDriverProof,
  getDriverProofs,
  getDashboardStats,
} from "../controllers/adminController.js";
import { authenticate, isAdmin } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Admin routes
router.use(authenticate, isAdmin); // All routes below require admin auth

// Dashboard
router.get("/stats", getDashboardStats);

// Users / Roles
router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);

// Customers
router.get("/customers", getAllCustomers);
router.get("/customers/:customerId", getCustomerDetails);

// Invoices
router.get("/invoices", getAllInvoices);
router.patch("/invoices/:invoiceId/status", updateInvoiceStatus);

// Driver Proofs
router.post("/driver-proofs", upload.single("proof"), uploadDriverProof);
router.get("/driver-proofs", getDriverProofs);

export default router;
