import { supabase } from "../db.js";

export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, phone, company_name, role, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role must be customer or admin" });
    }

    if (req.user.id === userId && role !== "admin") {
      return res.status(400).json({ error: "You cannot remove your own admin role" });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId)
      .select("id, email, full_name, role")
      .single();

    if (error) throw error;
    res.json({ message: "User role updated", user: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, email, name, phone, address, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer details
export const getCustomerDetails = async (req, res) => {
  try {
    const { customerId } = req.params;

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError) throw customerError;

    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    res.json({ customer, invoices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all invoices (admin view)
export const getAllInvoices = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `*,
        customers:customer_id(id, email, name, phone)`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload driver proof
export const uploadDriverProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { invoiceId, driverName, licensePlate } = req.body;
    const fileName = `driver-proofs/${invoiceId}-${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("driver-proofs")
      .upload(fileName, req.file.buffer, {
        contentType: "image/jpeg",
      });

    if (error) throw error;

    // Save proof record
    const { data: proof, error: proofError } = await supabase
      .from("driver_proofs")
      .insert([
        {
          invoice_id: invoiceId,
          driver_name: driverName,
          license_plate: licensePlate,
          proof_url: fileName,
          uploaded_at: new Date(),
        },
      ])
      .select()
      .single();

    if (proofError) throw proofError;

    res.status(201).json({
      message: "Driver proof uploaded successfully",
      proof,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver proofs
export const getDriverProofs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("driver_proofs")
      .select(
        `*,
        invoices:invoice_id(id, order_id, service_type)`
      )
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const { data: totalCustomers } = await supabase
      .from("customers")
      .select("id", { count: "exact" });

    const { data: totalInvoices } = await supabase
      .from("invoices")
      .select("id", { count: "exact" });

    const { data: pendingInvoices } = await supabase
      .from("invoices")
      .select("id", { count: "exact" })
      .eq("status", "pending");

    const { data: completedInvoices } = await supabase
      .from("invoices")
      .select("amount", { count: "exact" });

    res.json({
      totalCustomers: totalCustomers?.length || 0,
      totalInvoices: totalInvoices?.length || 0,
      pendingInvoices: pendingInvoices?.length || 0,
      completedInvoices: completedInvoices?.length || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
