import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Package, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  LogOut,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  Eye,
  Check,
  X,
  FileDown,
  Bell,
  Settings,
  LayoutDashboard,
  PackageOpen,
  IndianRupee,
  UserCheck,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAllRequests, updateRequestStatus, updateRequestAssignment, Request } from "@/lib/requestService";
import { getDistance } from "@/lib/pricingService";
import InvoiceModal from "@/components/InvoiceModal";
import AssignmentDialog from "@/components/AssignmentDialog";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  role: "admin" | "customer";
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<Request | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'drivers'>('requests');
  const [activeSection, setActiveSection] = useState<'dashboard' | 'requests' | 'trips' | 'documents' | 'customers' | 'settings'>('dashboard');
  const [lastViewedTime, setLastViewedTime] = useState<number>(() => {
    const saved = localStorage.getItem('admin_last_viewed');
    return saved ? parseInt(saved) : Date.now();
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'delivered'>('all');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);

  // Load all requests from localStorage
  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (activeSection === 'customers') {
      loadUsers();
    }
  }, [activeSection]);

  // Count pending requests for notification badge
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  // Handle notification bell click
  const handleNotificationClick = () => {
    setActiveSection('dashboard');
    setActiveTab('requests');
    setLastViewedTime(Date.now());
    localStorage.setItem('admin_last_viewed', Date.now().toString());
  };

  const loadRequests = async () => {
    const allRequests = await getAllRequests();
    setRequests(allRequests);
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("siegma_token");
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load users");
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserRoleChange = async (userId: string, role: "admin" | "customer") => {
    try {
      setUpdatingRoleUserId(userId);
      const token = localStorage.getItem("siegma_token");
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
      toast.success(`Role updated to ${role}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  // Get unique customers
  const customers = Array.from(new Set(requests.map(r => r.customerEmail)));

  // Filter requests based on search query and status filter
  const filteredRequests = requests.filter(request => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      request.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (request: Request) => {
    setRequestToApprove(request);
    setShowAssignment(true);
  };

  const handleAssignVehicleAndDriver = async (
    vehicleNumber: string,
    driverName: string,
    driverContact: string,
    driverProof: string,
    driverProofType: 'aadhar' | 'pan' | 'license',
    driverProofNumber: string
  ): Promise<boolean> => {
    if (!requestToApprove) return false;

    const success = await updateRequestAssignment(requestToApprove.id, {
      assignedVehicleNumber: vehicleNumber,
      assignedDriverName: driverName,
      assignedDriverContact: driverContact,
      assignedDriverProofType: driverProofType,
      assignedDriverProofNumber: driverProofNumber,
      assignedDriverProof: driverProof,
      status: "Approved",
    });

    if (!success) {
      toast.error("Failed to assign driver. Please retry.");
      return false;
    }

    loadRequests();
    setShowAssignment(false);
    setRequestToApprove(null);
    alert(`Request ${requestToApprove.id} has been approved and assigned to driver ${driverName}!`);
    return true;
  };

  const handleReject = async (requestId: string) => {
    if (await updateRequestStatus(requestId, "Rejected")) {
      loadRequests();
      alert(`Request ${requestId} has been rejected.`);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: Request['status']) => {
    if (await updateRequestStatus(requestId, newStatus)) {
      loadRequests();
    }
  };

  const handleViewInvoice = (request: Request) => {
    setSelectedRequest(request);
    setShowInvoice(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-logistics-yellow/10 text-logistics-yellow border border-logistics-yellow/20"><Clock className="w-3 h-3" />{status}</span>;
      case "Approved":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-logistics-green/10 text-logistics-green border border-logistics-green/20"><CheckCircle className="w-3 h-3" />{status}</span>;
      case "Completed":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"><Check className="w-3 h-3" />{status}</span>;
      case "Rejected":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20"><XCircle className="w-3 h-3" />{status}</span>;
      default:
        return <span className="status-pending">{status}</span>;
    }
  };

  const stats = [
    { label: "Total Shipments", value: requests.length.toString(), icon: Package, color: "bg-primary text-white", iconBg: "bg-white/20" },
    { label: "Pickup Packages", value: requests.filter(r => r.status === "Pending" || r.status === "Pending Pickup").length.toString(), icon: Package, color: "bg-logistics-yellow text-white", iconBg: "bg-white/20" },
    { label: "Pending Packages", value: requests.filter(r => r.status === "In Transit" || r.status === "Approved").length.toString(), icon: Clock, color: "bg-orange-500 text-white", iconBg: "bg-white/20" },
    { label: "Packages Delivered", value: requests.filter(r => r.status === "Delivered" || r.status === "Completed").length.toString(), icon: CheckCircle, color: "bg-logistics-green text-white", iconBg: "bg-white/20" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-primary text-primary-foreground hidden lg:block">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Siegma Logistics" className="w-10 h-10 object-contain" />
            <div>
              <span className="text-lg font-bold">Siegma Logistics</span>
              <span className="text-xs text-primary-foreground/70 block -mt-1">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", section: 'dashboard' as const },
            { icon: Package, label: "Requests", section: 'requests' as const },
            { icon: Truck, label: "Trips", section: 'trips' as const },
            { icon: FileText, label: "Documents", section: 'documents' as const },
            { icon: Users, label: "Customers", section: 'customers' as const },
            { icon: Settings, label: "Settings", section: 'settings' as const },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveSection(item.section)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === item.section
                  ? "bg-accent text-accent-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="lg:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-primary">Siegma Admin</span>
              </Link>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-accent/10 rounded-lg"
                title={pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}` : 'No pending requests'}
              >
                <Bell className={`w-5 h-5 ${pendingCount > 0 ? 'text-accent animate-pulse' : ''}`} />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className={`rounded-xl p-5 ${stat.color} shadow-sm`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <Package className="w-8 h-8 opacity-20" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm opacity-90">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tab Navigation */}
              <div className="mb-6 border-b border-border">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'requests'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>All Requests</span>
                      <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                        {requests.length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('drivers')}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'drivers'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Drivers Info</span>
                      <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                        {requests.filter(r => r.assignedDriverName).length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

          {activeTab === 'requests' && (
            <>
              {/* Ongoing Delivery Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">Ongoing Delivery</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {requests.filter(r => r.status === "In Transit" || r.status === "Approved").slice(0, 3).map((request) => (
                <div key={request.id} className="card-logistics hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Shipment ID:</p>
                      <p className="font-bold text-foreground text-lg">{request.id}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                          {request.material}
                        </span>
                        <span className="px-2 py-1 bg-logistics-yellow/10 text-logistics-yellow rounded text-xs font-medium">
                          {request.type === "General Parcel" ? "DHL Express" : "Full Truck"}
                        </span>
                      </div>
                    </div>
                    <Truck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 text-sm">
                        <p className="text-muted-foreground">From:</p>
                        <p className="font-medium text-foreground">{request.from}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 text-sm">
                        <p className="text-muted-foreground">To:</p>
                        <p className="font-medium text-foreground">{request.to}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Distance to destination: ~{getDistance(request.from, request.to)} km
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {requests.filter(r => r.status === "In Transit" || r.status === "Approved").length === 0 && (
                <div className="col-span-full card-logistics py-12 text-center">
                  <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No ongoing deliveries at the moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Track Order Table */}
          <div className="card-logistics">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Track Order</h2>
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  placeholder="Search by ID, location, material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
                />
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="appearance-none px-4 py-2 pr-10 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <PackageOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {searchQuery || statusFilter !== 'all' ? 'No Matching Orders' : 'No Orders Yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'There are no delivery requests to track at the moment.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Tracking No</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Courier Service</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Shipper Date</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Destination</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Weight</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Payment</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-foreground">{request.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {request.type === "General Parcel" ? (
                              <>
                                <div className="w-8 h-8 rounded-full bg-logistics-yellow/10 flex items-center justify-center">
                                  <Package className="w-4 h-4 text-logistics-yellow" />
                                </div>
                                <span className="text-sm text-foreground">DHL Express</span>
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Truck className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-sm text-foreground">Full Truck</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-muted text-xs rounded font-medium text-foreground">
                            {request.material}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {new Date(request.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{request.to}</td>
                        <td className="py-4 px-4 text-sm font-medium text-foreground">{request.weight}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                            <IndianRupee className="w-3 h-3" />
                            {request.amount?.toLocaleString('en-IN') || 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewInvoice(request)}
                              title="View Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            {request.status.toLowerCase() === "pending" && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-logistics-green hover:text-logistics-green"
                                  onClick={() => handleApprove(request)}
                                  title="Approve Request"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleReject(request.id)}
                                  title="Reject Request"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {request.status.toLowerCase() !== "pending" && request.status.toLowerCase() !== "rejected" && (
                              <select
                                value={request.status}
                                onChange={(e) => handleStatusChange(request.id, e.target.value as Request['status'])}
                                className="text-xs px-2 py-1 border border-border rounded bg-background hover:bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                                title="Update Status"
                              >
                                <option value="Approved">Approved</option>
                                <option value="Pending Pickup">Pending Pickup</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Completed">Completed</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
            </>
          )}

          {activeTab === 'drivers' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-primary" />
                  Drivers Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  Total Assigned Drivers: {requests.filter(r => r.assignedDriverName).length}
                </p>
              </div>

              {requests.filter(r => r.assignedDriverName).length === 0 ? (
                <div className="card-logistics text-center py-12">
                  <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">No drivers assigned yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Approve requests to assign drivers</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {requests.filter(r => r.assignedDriverName).map((request) => (
                    <div key={request.id} className="card-logistics hover:shadow-lg transition-all border-2 border-primary/20">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Request ID:</p>
                          <p className="font-bold text-foreground">{request.id}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      {/* Driver Details */}
                      <div className="space-y-4">
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <h3 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            Driver Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Driver Name:</span>
                              <span className="font-semibold text-foreground">{request.assignedDriverName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Contact Number:</span>
                              <span className="font-semibold text-foreground">{request.assignedDriverContact}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vehicle Number:</span>
                              <span className="font-semibold text-foreground">{request.assignedVehicleNumber}</span>
                            </div>
                          </div>
                        </div>

                        {/* Driver Proof Details */}
                        {request.assignedDriverProofType && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-3">
                              Verification Document
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Proof Type:</span>
                                <span className="font-semibold text-foreground">
                                  {request.assignedDriverProofType === 'aadhar' && 'Aadhar Card'}
                                  {request.assignedDriverProofType === 'pan' && 'PAN Card'}
                                  {request.assignedDriverProofType === 'license' && 'Driving License'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  {request.assignedDriverProofType === 'aadhar' && 'Aadhar Number:'}
                                  {request.assignedDriverProofType === 'pan' && 'PAN Number:'}
                                  {request.assignedDriverProofType === 'license' && 'License Number:'}
                                </span>
                                <span className="font-mono font-semibold text-foreground">
                                  {request.assignedDriverProofNumber}
                                </span>
                              </div>
                            </div>

                            {/* View Proof Document */}
                            {(request.assignedDriverProof || request.assignedDriverProofUrl) && (
                              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                                <button
                                  onClick={() => {
                                    const proof = request.assignedDriverProof || '';

                                    // New flow: backend returns a public URL for proof stored in Supabase Storage.
                                    if (request.assignedDriverProofUrl) {
                                      window.open(request.assignedDriverProofUrl, '_blank');
                                      return;
                                    }

                                    // Some historical rows store the full URL directly in assignedDriverProof.
                                    if (proof.startsWith('http://') || proof.startsWith('https://')) {
                                      window.open(proof, '_blank');
                                      return;
                                    }

                                    // Backward compatibility: old payloads may still contain base64 data URLs.
                                    if (proof.startsWith('data:')) {
                                      try {
                                        const [header, data] = proof.split(',');
                                        if (!data) {
                                          throw new Error('Missing base64 payload');
                                        }
                                        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
                                        const binaryString = atob(data);
                                        const bytes = new Uint8Array(binaryString.length);
                                        for (let i = 0; i < binaryString.length; i++) {
                                          bytes[i] = binaryString.charCodeAt(i);
                                        }
                                        const blob = new Blob([bytes], { type: mimeType });
                                        const blobUrl = URL.createObjectURL(blob);
                                        const newWindow = window.open(blobUrl, '_blank');
                                        if (newWindow) {
                                          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                                        }
                                      } catch {
                                        alert('This proof record is malformed. Please re-upload proof from assignment dialog.');
                                      }
                                      return;
                                    }

                                    // If proof is a plain storage path and URL was not included, show a hint.
                                    alert('Proof file is stored in Supabase Storage. Please open via backend-provided URL.');
                                  }}
                                  className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                  <Download className="w-4 h-4" />
                                  View Uploaded Proof
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Shipment Details */}
                        <div className="pt-4 border-t border-border">
                          <h3 className="font-semibold text-sm text-foreground mb-2">Shipment Details</h3>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-start gap-2">
                              <Package className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{request.material}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{new Date(request.pickupDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* View Invoice Button */}
                        <Button
                          onClick={() => handleViewInvoice(request)}
                          className="w-full"
                          size="sm"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Full Invoice
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </>
          )}

          {/* Requests Section - Same as Dashboard */}
          {activeSection === 'requests' && (
            <>
              {/* Tab Navigation */}
              <div className="mb-6 border-b border-border">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'requests'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>All Requests</span>
                      <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                        {requests.length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('drivers')}
                    className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'drivers'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Drivers Info</span>
                      <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                        {requests.filter(r => r.assignedDriverName).length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

          {activeTab === 'requests' && (
            <>
              {/* All Requests Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">All Requests</h2>
                
                {requests.length === 0 ? (
                  <div className="card-logistics text-center py-16">
                    <Package className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Requests Yet</h3>
                    <p className="text-muted-foreground">Requests from customers will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {requests.map((request) => (
                      <div key={request.id} className="card-logistics hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Request ID:</p>
                            <p className="font-bold text-foreground text-sm">{request.id}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Customer</p>
                            <p className="font-semibold text-foreground">{request.customer}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">From</p>
                              <p className="font-medium text-foreground">{request.from}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">To</p>
                              <p className="font-medium text-foreground">{request.to}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">Service Type</p>
                            <p className="font-medium text-foreground">{request.type}</p>
                          </div>

                          <div className="flex gap-2 pt-2">
                            {request.status.toLowerCase() === "pending" && (
                              <>
                                <Button
                                  onClick={() => handleApprove(request)}
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleReject(request.id)}
                                  size="sm"
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {request.status.toLowerCase() !== "pending" && request.status.toLowerCase() !== "rejected" && (
                              <select
                                value={request.status}
                                onChange={(e) => handleStatusChange(request.id, e.target.value as Request['status'])}
                                className="text-sm px-3 py-2 border border-border rounded-lg bg-background hover:bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary w-full"
                              >
                                <option value="Approved">Approved</option>
                                <option value="Pending Pickup">Pending Pickup</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Completed">Completed</option>
                              </select>
                            )}
                            <Button
                              onClick={() => handleViewInvoice(request)}
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'drivers' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-primary" />
                  Drivers Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  Total Assigned Drivers: {requests.filter(r => r.assignedDriverName).length}
                </p>
              </div>

              {requests.filter(r => r.assignedDriverName).length === 0 ? (
                <div className="card-logistics text-center py-12">
                  <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">No drivers assigned yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Approve requests to assign drivers</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {requests.filter(r => r.assignedDriverName).map((request) => (
                    <div key={request.id} className="card-logistics hover:shadow-lg transition-all border-2 border-primary/20">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Request ID:</p>
                          <p className="font-bold text-foreground">{request.id}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      {/* Driver Details */}
                      <div className="space-y-4">
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <h3 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            Driver Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Driver Name:</span>
                              <span className="font-semibold text-foreground">{request.assignedDriverName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Contact Number:</span>
                              <span className="font-semibold text-foreground">{request.assignedDriverContact}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vehicle Number:</span>
                              <span className="font-semibold text-foreground">{request.assignedVehicleNumber}</span>
                            </div>
                          </div>
                        </div>

                        {/* Driver Proof Details */}
                        {request.assignedDriverProofType && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-3">
                              Verification Document
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Proof Type:</span>
                                <span className="font-semibold text-foreground">
                                  {request.assignedDriverProofType === 'aadhar' && 'Aadhar Card'}
                                  {request.assignedDriverProofType === 'pan' && 'PAN Card'}
                                  {request.assignedDriverProofType === 'license' && 'Driving License'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  {request.assignedDriverProofType === 'aadhar' && 'Aadhar Number:'}
                                  {request.assignedDriverProofType === 'pan' && 'PAN Number:'}
                                  {request.assignedDriverProofType === 'license' && 'License Number:'}
                                </span>
                                <span className="font-mono font-semibold text-foreground">
                                  {request.assignedDriverProofNumber}
                                </span>
                              </div>
                            </div>

                            {/* View Proof Document */}
                            {(request.assignedDriverProof || request.assignedDriverProofUrl) && (
                              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                                <button
                                  onClick={() => {
                                    const proof = request.assignedDriverProof || '';

                                    // Prefer backend-resolved public URL (Supabase Storage)
                                    if (request.assignedDriverProofUrl) {
                                      window.open(request.assignedDriverProofUrl, '_blank');
                                      return;
                                    }

                                    // Direct HTTP URL stored in proof field
                                    if (proof.startsWith('http://') || proof.startsWith('https://')) {
                                      window.open(proof, '_blank');
                                      return;
                                    }

                                    // Backward compatibility: base64 data URL
                                    if (proof.startsWith('data:')) {
                                      try {
                                        const [header, data] = proof.split(',');
                                        if (!data) throw new Error('Missing base64 payload');
                                        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
                                        const binaryString = atob(data);
                                        const bytes = new Uint8Array(binaryString.length);
                                        for (let i = 0; i < binaryString.length; i++) {
                                          bytes[i] = binaryString.charCodeAt(i);
                                        }
                                        const blob = new Blob([bytes], { type: mimeType });
                                        const blobUrl = URL.createObjectURL(blob);
                                        const newWindow = window.open(blobUrl, '_blank');
                                        if (newWindow) {
                                          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                                        }
                                      } catch {
                                        alert('This proof record is malformed. Please re-upload proof from assignment dialog.');
                                      }
                                      return;
                                    }

                                    alert('Proof file is stored in Supabase Storage. Please open via backend-provided URL.');
                                  }}
                                  className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                  <Download className="w-4 h-4" />
                                  View Uploaded Proof
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* View Invoice Button */}
                        <Button
                          onClick={() => handleViewInvoice(request)}
                          className="w-full"
                          size="sm"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Full Invoice
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
            </>
          )}

          {/* Trips Section */}
          {activeSection === 'trips' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Truck className="w-7 h-7 text-primary" />
                  Trips Management
                </h2>
              </div>
              <div className="card-logistics text-center py-16">
                <Truck className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">Trips management features will be available here</p>
              </div>
            </div>
          )}

          {/* Documents Section */}
          {activeSection === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-7 h-7 text-primary" />
                  Documents Management
                </h2>
              </div>
              <div className="card-logistics text-center py-16">
                <FileText className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">Document management features will be available here</p>
              </div>
            </div>
          )}

          {/* Customers Section */}
          {activeSection === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-7 h-7 text-primary" />
                  Customer Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  Total Users: {users.length}
                </p>
              </div>

              <div className="card-logistics overflow-x-auto">
                <h3 className="text-lg font-semibold text-foreground mb-4">User Role Management</h3>
                {loadingUsers ? (
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                ) : users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users found.</p>
                ) : (
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 text-sm font-semibold text-foreground">Name</th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-foreground">Email</th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-foreground">Phone</th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-foreground">Current Role</th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-foreground">Set Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-3 text-sm text-foreground">{u.full_name || "-"}</td>
                          <td className="py-3 px-3 text-sm text-muted-foreground">{u.email}</td>
                          <td className="py-3 px-3 text-sm text-muted-foreground">{u.phone || "-"}</td>
                          <td className="py-3 px-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-sm">
                            <select
                              value={u.role}
                              disabled={updatingRoleUserId === u.id}
                              onChange={(e) => handleUserRoleChange(u.id, e.target.value as "admin" | "customer")}
                              className="text-sm px-2 py-1 border border-border rounded bg-background"
                            >
                              <option value="customer">customer</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {customers.length === 0 ? (
                <div className="card-logistics text-center py-16">
                  <Users className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Customers Yet</h3>
                  <p className="text-muted-foreground">Customer data will appear here once requests are made</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((customerEmail) => {
                    const customerRequests = requests.filter(r => r.customerEmail === customerEmail);
                    const customer = customerRequests[0];
                    return (
                      <div key={customerEmail} className="card-logistics hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {customerRequests.length} Requests
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{customer.customer}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{customerEmail}</p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Pending:</span>
                            <span className="font-semibold text-yellow-600">
                              {customerRequests.filter(r => r.status === 'Pending').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Approved:</span>
                            <span className="font-semibold text-green-600">
                              {customerRequests.filter(r => r.status === 'Approved').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Completed:</span>
                            <span className="font-semibold text-blue-600">
                              {customerRequests.filter(r => r.status === 'Completed').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-7 h-7 text-primary" />
                  Settings
                </h2>
              </div>
              <div className="card-logistics text-center py-16">
                <Settings className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">Settings and configuration options will be available here</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal 
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        request={selectedRequest}
      />

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={showAssignment}
        onClose={() => {
          setShowAssignment(false);
          setRequestToApprove(null);
        }}
        request={requestToApprove}
        onAssign={handleAssignVehicleAndDriver}
      />
    </div>
  );
};

export default AdminDashboard;
