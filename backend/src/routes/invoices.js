import express from "express";
import multer from "multer";
import {
  createInvoice,
  getCustomerInvoices,
  getInvoice,
  uploadInvoicePDF,
  generateInvoicePDF,
  downloadInvoice,
  generateMissingInvoicePDFs,
} from "../controllers/invoiceController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Customer routes
router.post("/", authenticate, createInvoice);
router.get("/", authenticate, getCustomerInvoices);
router.get("/:id", authenticate, getInvoice);
router.post("/generate-pdf", authenticate, generateInvoicePDF);
router.post("/upload-pdf", authenticate, upload.single("pdf"), uploadInvoicePDF);
router.get("/:invoiceId/download", authenticate, downloadInvoice);

// Admin bulk generation route
router.post("/admin/generate-missing", authenticate, generateMissingInvoicePDFs);

export default router;
