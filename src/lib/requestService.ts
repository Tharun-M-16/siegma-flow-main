// API-based request management service backed by Supabase

export interface Request {
  createdAt: string;
  id: string;
  customer: string;
  customerEmail: string;
  type: "General Parcel" | "Full Truck Load";
  from: string;
  to: string;
  status: "Pending" | "Approved" | "Completed" | "Rejected" | "In Transit" | "Delivered" | "Pending Pickup";
  date: string;
  material: string;
  weight: string;
  amount?: number;
  invoiceNumber?: string;
  // Additional fields
  pickupDate?: string;
  deliveryDate?: string;
  dimensions?: string;
  quantity?: number;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  specialInstructions?: string;
  // Vehicle & Driver Assignment
  assignedVehicleNumber?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedDriverContact?: string;
  assignedDriverProofType?: 'aadhar' | 'pan' | 'license';
  assignedDriverProofNumber?: string;
  assignedDriverProof?: string;
  assignedDriverProofUrl?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("siegma_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const toRequestArray = (data: unknown): Request[] => {
  if (!Array.isArray(data)) return [];
  return data as Request[];
};

export const getAllRequests = async (): Promise<Request[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/requests/admin/all`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return toRequestArray(data);
  } catch (error) {
    console.error("Error loading requests:", error);
    return [];
  }
};

export const getUserRequests = async (_userEmail: string): Promise<Request[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/requests/my`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return toRequestArray(data);
  } catch (error) {
    console.error("Error loading user requests:", error);
    return [];
  }
};

export const addRequest = async (
  request: Omit<Request, "id" | "status" | "date" | "invoiceNumber">
): Promise<Request> => {
  const response = await fetch(`${API_BASE_URL}/api/requests`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create request");
  }

  return data as Request;
};

export const updateRequestStatus = async (
  requestId: string,
  status: Request["status"]
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const updateRequestAssignment = async (
  requestId: string,
  assignmentData: {
    assignedVehicleNumber: string;
    assignedDriverName: string;
    assignedDriverContact: string;
    assignedDriverProofType: 'aadhar' | 'pan' | 'license';
    assignedDriverProofNumber: string;
    assignedDriverProof: string;
    status?: Request['status'];
  }
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/assign`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const deleteRequest = async (requestId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const getRequestById = async (requestId: string): Promise<Request | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data as Request;
  } catch {
    return null;
  }
};
