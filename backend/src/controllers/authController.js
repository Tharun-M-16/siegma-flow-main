import { supabase } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/mailer.js";

// In-memory OTP store: email -> { otp, expiresAt }
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req, res) => {
  try {
    const { email, password, fullName, companyName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password and full name are required" });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash: hashedPassword,
          full_name: fullName,
          company_name: companyName || null,
          phone,
          role: "customer",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Generate JWT token
    const token = jwt.sign(
      { id: data.id, email: data.email, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: { id: data.id, email: data.email, name: data.full_name, role: data.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, password_hash")
      .eq("email", email)
      .single();

    if (error || !user) {
      if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
        // MFA: generate & send OTP
        const otp = generateOTP();
        otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
        const tempToken = jwt.sign(
          { id: "demo-admin", email, role: "admin", mfaPending: true },
          process.env.JWT_SECRET,
          { expiresIn: "5m" }
        );
        try {
          await sendOTPEmail(email, otp);
        } catch (sendError) {
          console.error("Admin fallback OTP email failed:", sendError.message);
        }
        return res.json({ requiresMFA: true, tempToken });
      }

      return res.status(401).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Admin users require MFA
    if (user.role === "admin") {
      const otp = generateOTP();
      otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
      const tempToken = jwt.sign(
        { id: user.id, email, role: "admin", mfaPending: true },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
      try {
        await sendOTPEmail(email, otp);
      } catch (_) { /* OTP logged to console in dev */ }
      return res.json({ requiresMFA: true, tempToken });
    }

    // Regular customer login
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role || "customer",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyAdminOTP = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({ error: "Token and OTP are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }

    if (!decoded.mfaPending || decoded.role !== "admin") {
      return res.status(401).json({ error: "Invalid token" });
    }

    const email = decoded.email;
    const stored = otpStore.get(email);

    if (!stored || Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(401).json({ error: "OTP has expired. Please login again." });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(401).json({ error: "Invalid OTP. Please try again." });
    }

    otpStore.delete(email);

    // Issue real JWT
    const token = jwt.sign(
      { id: decoded.id, email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { id: decoded.id, email, name: "Admin", role: "admin" },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resendAdminOTP = async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({ error: "Token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }

    if (!decoded.mfaPending || decoded.role !== "admin") {
      return res.status(401).json({ error: "Invalid token" });
    }

    const email = decoded.email;
    // Generate new OTP
    const otp = generateOTP();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    try {
      await sendOTPEmail(email, otp);
    } catch (sendError) {
      console.error("Resend OTP email failed:", sendError.message);
    }

    return res.json({
      message: "OTP resent successfully. Check your email or console.",
      requiresMFA: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
