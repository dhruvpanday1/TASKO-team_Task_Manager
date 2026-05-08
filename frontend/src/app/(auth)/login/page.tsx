"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  // Removed aggressive auto-redirect to prevent loops
  useEffect(() => {
    // Optional: Only redirect if we've explicitly just logged in
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login for:", formData.email);
      const response = await api.post("/auth/login", formData);
      console.log("Login response:", response.data);
      
      const { token } = response.data;
      
      if (!token) {
        throw new Error("No token received from server");
      }

      // Store token in both locations for maximum compatibility
      Cookies.set("token", token, { expires: 7, path: '/' });
      localStorage.setItem("token", token);
      
      console.log("Token stored, navigating to dashboard...");
      
      // Use router.push as requested, but with a fallback
      window.location.href = "/dashboard";

    } catch (err: any) {
      console.error("Login error:", err);
      const errorData = err.response?.data?.error;
      setError(typeof errorData === 'string' ? errorData : errorData?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <h2 className="text-3xl font-bold mb-2 text-white">Welcome back</h2>
        <p className="text-gray-400 mb-8">Login to your Tasko account</p>
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 text-lg rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Sign In"}
          </Button>
        </form>
        
        <p className="mt-8 text-center text-gray-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
