import express from "express";
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  assignRequest,
  deleteRequest,
} from "../controllers/requestController.js";
import { authenticate, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createRequest);
router.get("/my", getMyRequests);
router.get("/admin/all", isAdmin, getAllRequests);
router.patch("/:id/status", isAdmin, updateRequestStatus);
router.patch("/:id/assign", isAdmin, assignRequest);
router.get("/:id", getRequestById);
router.delete("/:id", deleteRequest);

export default router;
