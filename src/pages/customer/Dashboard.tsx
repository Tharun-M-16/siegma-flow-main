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
  Plus,
  Download,
  Eye,
  User,
  Bell,
  IndianRupee,
  PackageOpen
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getUserRequests, Request } from "@/lib/requestService";
import InvoiceModal from "@/components/InvoiceModal";

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"requests" | "documents">("requests");
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Load user requests from Supabase-backed API
  useEffect(() => {
    if (user?.email) {
      const loadUserRequests = async () => {
        const userRequests = await getUserRequests(user.email);
        setRequests(userRequests);
      };

      loadUserRequests();
    }
  }, [user]);

  const handleViewInvoice = (request: Request) => {
    setSelectedRequest(request);
    setShowInvoice(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Pickup":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-logistics-yellow/10 text-logistics-yellow border border-logistics-yellow/20"><Clock className="w-3 h-3" />{status}</span>;
      case "In Transit":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"><Truck className="w-3 h-3" />{status}</span>;
      case "Delivered":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-logistics-green/10 text-logistics-green border border-logistics-green/20"><CheckCircle className="w-3 h-3" />{status}</span>;
      case "Cancelled":
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20"><XCircle className="w-3 h-3" />{status}</span>;
      default:
        return <span className="status-pending">{status}</span>;
    }
  };

  const stats = [
    { label: "Total Requests", value: requests.length.toString(), icon: Package, color: "bg-primary/10 text-primary" },
    { label: "In Transit", value: requests.filter(r => r.status === "In Transit").length.toString(), icon: Truck, color: "bg-logistics-yellow/10 text-logistics-yellow" },
    { label: "Delivered", value: requests.filter(r => r.status === "Delivered").length.toString(), icon: CheckCircle, color: "bg-logistics-green/10 text-logistics-green" },
    { label: "Pending", value: requests.filter(r => r.status === "Pending Pickup").length.toString(), icon: Clock, color: "bg-accent/10 text-accent" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container-logistics">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Siegma Logistics" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-lg font-bold text-primary">Siegma Logistics</span>
                <span className="text-xs text-muted-foreground block -mt-1">Customer Portal</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name || "Customer"}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-logistics py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            View your shipment status, download invoices, and manage your logistics requests.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card-logistics">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link to="/request/general-parcel">
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Request General Parcel
            </Button>
          </Link>
          <Link to="/request/full-truck-load">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Request Full Truck Load
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "requests"
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Requests
            {activeTab === "requests" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "documents"
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Documents
            {activeTab === "documents" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === "requests" ? (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="card-logistics py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <PackageOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Requests Yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      You haven't made any delivery requests yet. Start by creating your first request.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button asChild>
                        <Link to="/request/general-parcel" className="gap-2">
                          <Package className="w-4 h-4" />
                          General Parcel
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/request/full-truck-load" className="gap-2">
                          <Truck className="w-4 h-4" />
                          Full Truck Load
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block card-logistics overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Request ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Route</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Material</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Weight</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => (
                          <tr key={request.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium text-foreground">{request.id}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                {request.type === "General Parcel" ? (
                                  <Package className="w-4 h-4 text-accent" />
                                ) : (
                                  <Truck className="w-4 h-4 text-accent" />
                                )}
                                {request.type}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              <div className="max-w-[200px]">
                                <div className="truncate">{request.from}</div>
                                <div className="text-xs text-muted-foreground/70">↓</div>
                                <div className="truncate">{request.to}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{request.material}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground font-medium">{request.weight}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-primary">
                              <div className="flex items-center gap-1">
                                <IndianRupee className="w-3 h-3" />
                                {request.amount.toLocaleString('en-IN')}
                              </div>
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="gap-1"
                                  onClick={() => handleViewInvoice(request)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="gap-1"
                                  onClick={() => handleViewInvoice(request)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="card-logistics p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-foreground">{request.id}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            {request.type === "General Parcel" ? (
                              <Package className="w-3 h-3" />
                            ) : (
                              <Truck className="w-3 h-3" />
                            )}
                            {request.type}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">From:</span>
                          <span className="font-medium text-foreground text-right">{request.from}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">To:</span>
                          <span className="font-medium text-foreground text-right">{request.to}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Material:</span>
                          <span className="font-medium text-foreground">{request.material}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium text-foreground">{request.weight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold text-primary flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {request.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium text-foreground">{request.date}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => handleViewInvoice(request)}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => handleViewInvoice(request)}
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="card-logistics">
            {requests.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Documents Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Invoices and documents will appear here once you make delivery requests.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Invoices & Documents</h3>
                  <p className="text-sm text-muted-foreground">Download or view your shipment invoices and documents</p>
                </div>
                <div className="grid gap-4">
                  {requests.map((request) => (
                    <div key={request.invoiceNumber} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{request.invoiceNumber}.pdf</p>
                          <p className="text-sm text-muted-foreground">
                            {request.type} • {request.id} • {request.date}
                          </p>
                          <p className="text-sm font-medium text-primary flex items-center gap-1 mt-1">
                            <IndianRupee className="w-3 h-3" />
                            {request.amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleViewInvoice(request)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleViewInvoice(request)}
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      <InvoiceModal 
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        request={selectedRequest}
      />
    </div>
  );
};

export default CustomerDashboard;
