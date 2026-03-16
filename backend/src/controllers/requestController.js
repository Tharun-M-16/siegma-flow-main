import { supabase } from "../db.js";

const PROOF_BUCKET = "driver-proofs";

const buildPublicUrl = (path) => {
  if (!path) return null;
  if (typeof path === "string" && (path.startsWith("http://") || path.startsWith("https://"))) {
    return path;
  }
  if (typeof path === "string" && path.startsWith("data:")) {
    return null;
  }
  const { data } = supabase.storage.from(PROOF_BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
};

const uploadDriverProofIfNeeded = async ({ requestId, driverProof, driverProofType }) => {
  if (!driverProof) return null;

  // If it is already a public URL or stored path, keep it as-is.
  if (driverProof.startsWith("http://") || driverProof.startsWith("https://")) {
    return driverProof;
  }

  // Browser blob URLs are session-local and cannot be uploaded server-side directly.
  if (driverProof.startsWith("blob:")) {
    console.warn("Driver proof upload skipped: blob URL is not uploadable from backend.");
    return null;
  }

  const normalized = String(driverProof).trim();

  // If it looks like an existing storage path (contains '/'), keep it as-is.
  if (!normalized.startsWith("data:") && normalized.includes("/")) {
    return normalized;
  }

  let mimeType = "application/octet-stream";
  let base64Data = "";

  if (normalized.startsWith("data:")) {
    const match = normalized.match(/^data:([^;,]+)(;base64)?,(.+)$/);
    if (!match) {
      console.warn("Driver proof upload skipped: invalid data URL format.");
      return null;
    }
    mimeType = match[1] || mimeType;
    base64Data = match[3] || "";
  } else {
    // Best effort: accept raw base64 content without data URL prefix.
    base64Data = normalized;
  }

  let fileBuffer;
  try {
    fileBuffer = Buffer.from(base64Data, "base64");
  } catch {
    console.warn("Driver proof upload skipped: base64 decode failed.");
    return null;
  }

  if (!fileBuffer || !fileBuffer.length) {
    console.warn("Driver proof upload skipped: decoded file is empty.");
    return null;
  }

  let extension = "bin";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) extension = "jpg";
  if (mimeType.includes("png")) extension = "png";
  if (mimeType.includes("webp")) extension = "webp";
  if (mimeType.includes("heic")) extension = "heic";
  if (mimeType.includes("pdf")) extension = "pdf";

  const typePart = driverProofType || "proof";
  const filePath = `${requestId}/${typePart}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(PROOF_BUCKET).upload(filePath, fileBuffer, {
    contentType: mimeType,
    upsert: true,
  });

  if (error) {
    // Keep assignment flow working even before storage bucket provisioning.
    console.warn("Driver proof upload skipped:", error.message);
    return driverProof;
  }

  return filePath;
};

const parsePayload = (description) => {
  if (!description) return {};
  if (typeof description === "object") return description;
  try {
    return JSON.parse(description);
  } catch {
    return {};
  }
};

const mapRequestRow = (row) => {
  const payload = parsePayload(row.description);
  const assignments = Array.isArray(row.assignments) ? row.assignments : [];
  const assignment = assignments
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a?.updated_at || a?.created_at || 0).getTime();
      const bTime = new Date(b?.updated_at || b?.created_at || 0).getTime();
      return bTime - aTime;
    })[0] || {};
  const proofPath = assignment.driver_proof_url || payload.assignedDriverProof || null;

  return {
    id: row.id,
    createdAt: row.created_at,
    customer: payload.customer || row.users?.full_name || "Customer",
    customerEmail: payload.customerEmail || row.users?.email || "",
    type: payload.type || row.service_type || "General Parcel",
    from: payload.from || "",
    to: payload.to || "",
    status: row.status || payload.status || "Pending",
    date:
      payload.date ||
      new Date(row.created_at).toISOString().split("T")[0],
    material: payload.material || "",
    weight: payload.weight || "",
    amount:
      Number(row.total_amount || payload.amount || 0) || 0,
    invoiceNumber: payload.invoiceNumber,
    pickupDate: payload.pickupDate,
    deliveryDate: payload.deliveryDate,
    dimensions: payload.dimensions,
    quantity: payload.quantity,
    description: payload.description,
    contactName: payload.contactName,
    contactPhone: payload.contactPhone,
    specialInstructions: payload.specialInstructions,
    assignedVehicleNumber:
      assignment.assigned_vehicle_number || payload.assignedVehicleNumber,
    assignedDriverName: assignment.driver_name || payload.assignedDriverName,
    assignedDriverPhone: payload.assignedDriverPhone,
    assignedDriverContact: assignment.driver_contact || payload.assignedDriverContact,
    assignedDriverProofType: assignment.driver_proof_type || payload.assignedDriverProofType,
    assignedDriverProofNumber: assignment.driver_proof_number || payload.assignedDriverProofNumber,
    assignedDriverProof: proofPath,
    assignedDriverProofUrl: buildPublicUrl(proofPath),
  };
};

export const createRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestPayload = req.body || {};

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now()}`;
    const payload = {
      ...requestPayload,
      invoiceNumber,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      status: "Pending",
    };

    const { data: createdRequest, error: requestError } = await supabase
      .from("requests")
      .insert([
        {
          user_id: userId,
          service_type: requestPayload.type || "General Parcel",
          status: "Pending",
          description: JSON.stringify(payload),
        },
      ])
      .select("*")
      .single();

    if (requestError) throw requestError;

    const amount = Number(requestPayload.amount || 0) || 0;
    const quantity = Number(requestPayload.quantity || 1) || 1;

    const { error: invoiceError } = await supabase.from("invoices").insert([
      {
        user_id: userId,
        invoice_number: invoiceNumber,
        description:
          requestPayload.description || requestPayload.material || "Logistics request",
        quantity,
        unit_price: amount,
        total_amount: amount,
        status: "pending",
      },
    ]);

    if (invoiceError) {
      console.error("Invoice insert warning:", invoiceError.message);
    }

    const { data: requestWithUser, error: fetchError } = await supabase
      .from("requests")
      .select("*, users:user_id(email, full_name), assignments(*)")
      .eq("id", createdRequest.id)
      .single();

    if (fetchError) throw fetchError;

    res.status(201).json(mapRequestRow(requestWithUser));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from("requests")
      .select("*, users:user_id(email, full_name), assignments(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapRequestRow));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("requests")
      .select("*, users:user_id(email, full_name), assignments(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json((data || []).map(mapRequestRow));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("requests")
      .select("*, users:user_id(email, full_name), assignments(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (req.user.role !== "admin" && req.user.role !== "superadmin" && data.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(mapRequestRow(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: existing, error: fetchError } = await supabase
      .from("requests")
      .select("id, description")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    const payload = parsePayload(existing.description);
    const updatedPayload = { ...payload, status };

    const { data, error } = await supabase
      .from("requests")
      .update({ status, description: JSON.stringify(updatedPayload) })
      .eq("id", id)
      .select("*, users:user_id(email, full_name), assignments(*)")
      .single();

    if (error) throw error;

    if (updatedPayload.invoiceNumber) {
      await supabase
        .from("invoices")
        .update({ status: status.toLowerCase() })
        .eq("invoice_number", updatedPayload.invoiceNumber);
      
      // NOTE: PDF generation is handled by frontend (html2canvas + jsPDF)
      // This ensures consistent formatting between preview and stored PDF
      // When user downloads from frontend, it updates pdf_url automatically
    }

    res.json(mapRequestRow(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const assignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const assignmentData = req.body || {};

    const { data: existing, error: fetchError } = await supabase
      .from("requests")
      .select("id, description")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    const payload = parsePayload(existing.description);
    const storedProofPath = await uploadDriverProofIfNeeded({
      requestId: id,
      driverProof: assignmentData.assignedDriverProof,
      driverProofType: assignmentData.assignedDriverProofType,
    });

    const assignmentForDb = {
      status: assignmentData.status || "Approved",
      assigned_vehicle_number: assignmentData.assignedVehicleNumber || null,
      driver_name: assignmentData.assignedDriverName || null,
      driver_contact: assignmentData.assignedDriverContact || null,
      driver_proof_type: assignmentData.assignedDriverProofType || null,
      driver_proof_number: assignmentData.assignedDriverProofNumber || null,
      driver_proof_url: storedProofPath || null,
    };

    const updatedPayload = {
      ...payload,
      ...assignmentData,
      assignedDriverProof: storedProofPath || assignmentData.assignedDriverProof,
      status: assignmentData.status || "Approved",
    };

    const nextStatus = assignmentData.status || "Approved";

    const { error: requestError } = await supabase
      .from("requests")
      .update({
        status: nextStatus,
        description: JSON.stringify(updatedPayload),
      })
      .eq("id", id)
      .select("id")
      .single();

    if (requestError) throw requestError;

    const { data: updatedAssignments, error: assignmentUpdateError } = await supabase
      .from("assignments")
      .update(assignmentForDb)
      .eq("request_id", id)
      .select("id");

    if (assignmentUpdateError) {
      console.warn("Assignments detailed update fallback:", assignmentUpdateError.message);
      const { error: fallbackUpdateError } = await supabase
        .from("assignments")
        .update({ status: nextStatus })
        .eq("request_id", id);

      if (fallbackUpdateError) throw fallbackUpdateError;
    }

    if (!updatedAssignments || updatedAssignments.length === 0) {
      const { error: assignmentInsertError } = await supabase.from("assignments").insert([
        {
          request_id: id,
          ...assignmentForDb,
        },
      ]);

      if (assignmentInsertError) {
        console.warn("Assignments detailed insert fallback:", assignmentInsertError.message);
        const { error: fallbackInsertError } = await supabase.from("assignments").insert([
          {
            request_id: id,
            status: nextStatus,
          },
        ]);

        if (fallbackInsertError) throw fallbackInsertError;
      }
    }

    if (updatedPayload.invoiceNumber) {
      await supabase
        .from("invoices")
        .update({ status: nextStatus.toLowerCase() })
        .eq("invoice_number", updatedPayload.invoiceNumber);
      
      // NOTE: PDF generation is handled by frontend (html2canvas + jsPDF)
      // This ensures consistent formatting between preview and stored PDF
      // When user downloads from frontend, it updates pdf_url automatically
    }

    const { data: refreshedRequest, error: refreshError } = await supabase
      .from("requests")
      .select("*, users:user_id(email, full_name), assignments(*)")
      .eq("id", id)
      .single();

    if (refreshError) throw refreshError;

    res.json(mapRequestRow(refreshedRequest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabase
      .from("requests")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (req.user.role !== "admin" && req.user.role !== "superadmin" && existing.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { error } = await supabase.from("requests").delete().eq("id", id);
    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
