import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyOTP, resendOTP } = useAuth();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  // Get the redirect path from location state, default to home
  const from = (location.state as any)?.from?.pathname || "/";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    const success = await resendOTP();
    setIsResending(false);
    if (success) {
      toast.info("OTP resent! Check your email or console for the code.");
    } else {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mfaStep) {
      const success = await verifyOTP(otpCode);
      if (success) {
        toast.success("Login successful!");
        navigate("/admin/dashboard");
      } else {
        toast.error("Invalid or expired OTP. Please try again.");
      }
      setIsLoading(false);
      return;
    }

    const result = await login(formData.emailOrPhone, formData.password);

    if (result === "mfa_required") {
      setAdminEmail(formData.emailOrPhone);
      setMfaStep(true);
      toast.info("OTP sent to admin email. Check your inbox (or console in dev mode).");
    } else if (result === "success") {
      toast.success("Login successful!");
      navigate(from === "/" || from === "/login" ? "/customer/dashboard" : from);
    } else {
      toast.error("Invalid credentials. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-logistics-navy-dark flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.jpg" alt="Siegma Logistics" className="w-12 h-12 object-contain" />
          <div className="text-primary-foreground">
            <span className="text-2xl font-bold">Siegma Logistics</span>
            <p className="text-xs text-primary-foreground/70">Pvt Ltd</p>
          </div>
        </Link>

        {/* Login Card */}
        <div className="bg-card rounded-2xl p-8 shadow-xl animate-scale-in">
          <div className="text-center mb-8">
            {mfaStep ? (
              <>
                <div className="flex justify-center mb-3">
                  <ShieldCheck className="w-12 h-12 text-accent" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Two-Factor Verification</h1>
                <p className="text-muted-foreground text-sm">
                  An OTP has been sent to <span className="font-medium text-foreground">{adminEmail}</span>.
                  Please enter it below.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
                <p className="text-muted-foreground">Login to access your dashboard</p>
              </>
            )}
          </div>

          {/* Login Method Toggle - hidden during MFA step */}
          <div className={`flex bg-muted rounded-lg p-1 mb-6 ${mfaStep ? "hidden" : ""}`}>
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "email"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                loginMethod === "phone"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP Input - shown only during MFA step */}
            {mfaStep && (
              <div>
                <label htmlFor="otpCode" className="block text-sm font-medium text-foreground mb-2">
                  One-Time Password (OTP)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="otpCode"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    maxLength={6}
                    className="input-logistics pl-11 text-center tracking-widest text-lg font-bold"
                    placeholder="000000"
                    autoFocus
                    autoComplete="one-time-code"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">OTP is valid for 5 minutes</p>
              </div>
            )}

            {/* Regular login fields - hidden during MFA step */}
            <div className={mfaStep ? "hidden" : ""}>
              <label htmlFor="emailOrPhone" className="block text-sm font-medium text-foreground mb-2">
                {loginMethod === "email" ? "Email Address" : "Phone Number"}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {loginMethod === "email" ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                </div>
                <input
                  type={loginMethod === "email" ? "email" : "tel"}
                  id="emailOrPhone"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  required
                  className="input-logistics pl-11"
                  placeholder={loginMethod === "email" ? "Enter your email" : "Enter your phone number"}
                />
              </div>
            </div>

            <div className={mfaStep ? "hidden" : ""}>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!mfaStep}
                  className="input-logistics pl-11 pr-11"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className={`flex items-center justify-between ${mfaStep ? "hidden" : ""}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  {mfaStep ? "Verifying..." : "Logging in..."}
                </>
              ) : (
                <>
                  {mfaStep ? "Verify OTP" : "Login"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {mfaStep && (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="w-full py-2 text-sm text-accent hover:text-accent/80 disabled:text-muted-foreground text-center font-medium"
              >
                {isResending ? "Resending..." : "Didn't receive the code? Resend OTP"}
              </button>
            )}

            {mfaStep && (
              <button
                type="button"
                onClick={() => { setMfaStep(false); setOtpCode(""); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
              >
                ← Back to login
              </button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-accent font-semibold hover:underline">
                Register Now
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials:</p>
            <div className="text-xs text-center space-y-1">
              <p><span className="font-medium">Admin:</span> Configured in backend environment</p>
              <p><span className="font-medium">Customer:</span> any email / any password</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
