import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, Mail, Phone, Lock, Eye, EyeOff, User, Building, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"signup" | "verification">("signup");
  const [verificationToken, setVerificationToken] = useState("");
  const [verificationData, setVerificationData] = useState({
    emailCode: "",
    phoneCode: "",
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVerificationData({
      ...verificationData,
      [name]: value,
    });
  };

  const handleVerifyEmail = async () => {
    if (!verificationData.emailCode || verificationData.emailCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationToken,
          emailCode: verificationData.emailCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Email verification failed");
        return;
      }

      setEmailVerified(true);
      toast.success("Email verified successfully!");
    } catch (error) {
      toast.error("Email verification failed. Please try again.");
    }
  };

  const handleVerifyPhone = async () => {
    if (!verificationData.phoneCode || verificationData.phoneCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationToken,
          phoneCode: verificationData.phoneCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Phone verification failed");
        return;
      }

      // Both verified - auto-login or redirect
      toast.success("Account verified successfully! Logging you in...");
      localStorage.setItem("token", result.token);
      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("Phone verification failed. Please try again.");
    }
  };

  const handleResendCode = async (type: "email" | "phone") => {
    setResendLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationToken,
          type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to resend code");
        setResendLoading(false);
        return;
      }

      toast.success(`New ${type} code sent! Check your ${type} or console (dev mode).`);
    } catch (error) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    if (accountType === "business" && !formData.companyName) {
      toast.error("Please enter your company name");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          companyName: accountType === "business" ? formData.companyName : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Check if verification is required
      if (result.requiresVerification) {
        setVerificationToken(result.verificationToken);
        setStep("verification");
        toast.success("Verification codes sent! Check your email and console (dev mode).");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! Please login to continue.");
      navigate("/login");
      setIsLoading(false);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-logistics-navy-dark flex items-center justify-center p-4 py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.jpg" alt="Siegma Logistics" className="w-12 h-12 object-contain" />
          <div className="text-primary-foreground">
            <span className="text-2xl font-bold">Siegma Logistics</span>
            <p className="text-xs text-primary-foreground/70">Pvt Ltd</p>
          </div>
        </Link>

        {/* Register Card */}
        <div className="bg-card rounded-2xl p-8 shadow-xl animate-scale-in">
          <div className="text-center mb-8">
            {step === "signup" ? (
              <>
                <h1 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h1>
                <p className="text-muted-foreground">
                  Join Siegma Logistics for reliable shipping services
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Details</h1>
                <p className="text-muted-foreground">
                  We've sent verification codes to your email and phone
                </p>
              </>
            )}
          </div>

          {step === "signup" ? (
            <>
              {/* Account Type Toggle */}
              <div className="flex bg-muted rounded-lg p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setAccountType("individual")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    accountType === "individual"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("business")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    accountType === "business"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Business
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="input-logistics pl-11"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-logistics pl-11"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input-logistics pl-11"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Company Name (for business accounts) */}
            {accountType === "business" && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Building className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required={accountType === "business"}
                    className="input-logistics pl-11"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password *
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
                    required
                    minLength={6}
                    className="input-logistics pl-11 pr-11"
                    placeholder="Create password"
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="input-logistics pl-11 pr-11"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-1 rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link to="/terms" className="text-accent hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-accent hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-accent font-semibold hover:underline">
                    Login Here
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Verification Step */}
              <div className="space-y-6">
                {/* Email Verification */}
                <div className={`p-5 rounded-lg border-2 transition-all ${
                  emailVerified
                    ? "bg-green-50 border-green-200"
                    : "bg-muted border-border"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Mail className={`w-5 h-5 ${emailVerified ? "text-green-600" : "text-muted-foreground"}`} />
                      <div>
                        <h3 className="font-semibold text-foreground">Email Verification</h3>
                        <p className="text-xs text-muted-foreground">Check your email inbox for the code</p>
                      </div>
                    </div>
                    {emailVerified && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </div>

                  {!emailVerified && (
                    <>
                      <input
                        type="text"
                        name="emailCode"
                        value={verificationData.emailCode}
                        onChange={handleVerificationChange}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={emailVerified}
                        className="input-logistics mb-3 text-center text-2xl tracking-widest"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={handleVerifyEmail}
                          className="flex-1"
                        >
                          Verify Email
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendCode("email")}
                          disabled={resendLoading}
                          className="flex-1"
                        >
                          {resendLoading ? "Sending..." : "Resend"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Phone Verification */}
                <div className={`p-5 rounded-lg border-2 transition-all ${
                  phoneVerified
                    ? "bg-green-50 border-green-200"
                    : "bg-muted border-border"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Phone className={`w-5 h-5 ${phoneVerified ? "text-green-600" : "text-muted-foreground"}`} />
                      <div>
                        <h3 className="font-semibold text-foreground">Phone Verification</h3>
                        <p className="text-xs text-muted-foreground">Check your phone or console (dev mode)</p>
                      </div>
                    </div>
                    {phoneVerified && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </div>

                  {!phoneVerified && (
                    <>
                      <input
                        type="text"
                        name="phoneCode"
                        value={verificationData.phoneCode}
                        onChange={handleVerificationChange}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={phoneVerified || !emailVerified}
                        className="input-logistics mb-3 text-center text-2xl tracking-widest"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={handleVerifyPhone}
                          disabled={!emailVerified}
                          className="flex-1"
                        >
                          Verify Phone
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendCode("phone")}
                          disabled={resendLoading || !emailVerified}
                          className="flex-1"
                        >
                          {resendLoading ? "Sending..." : "Resend"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Info Box */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900">
                      <strong>Dev Mode Tip:</strong> Check your browser console for the verification codes (📋 logs)
                    </p>
                  </div>
                </div>

                {emailVerified && phoneVerified && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-900 text-center">
                      ✅ All verified! You'll be redirected to your dashboard shortly...
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("signup");
                    setVerificationToken("");
                    setVerificationData({ emailCode: "", phoneCode: "" });
                    setEmailVerified(false);
                    setPhoneVerified(false);
                  }}
                >
                  ← Back to Sign Up
                </Button>
              </div>
            </>
          )}
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

export default Register;
