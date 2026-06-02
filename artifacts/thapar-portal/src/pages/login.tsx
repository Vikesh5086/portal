import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const user = await loginMutation.mutateAsync({
        data: { college_id: collegeId, password }
      });
      login(user);
      if (user.role === "admin" || user.role === "teacher") {
        setLocation("/admin");
      } else {
        setLocation("/homepage");
      }
    } catch (err) {
      setError("Invalid User ID or Password");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column */}
      <div className="w-1/2 relative flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img src="/campus.jpg" alt="Campus" className="w-full h-full object-cover" />
        </div>
        
        {/* Login Card */}
        <div className="relative z-10 bg-white p-8 w-full max-w-md shadow-lg border border-gray-200">
          <div className="mb-6 flex flex-col items-center">
            <img src="/ti-logo.png" alt="Thapar Institute Logo" className="w-52 mb-1" />
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm text-center border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="collegeId">User ID</Label>
              <Input 
                id="collegeId" 
                type="text" 
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full rounded-none"
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-none"
                required
              />
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-[#333333] hover:bg-[#222222] text-white rounded-none h-10"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </div>
            
            <div className="text-center pt-2">
              <a href="#" className="text-[#0066cc] text-sm hover:underline">
                Forgot Password
              </a>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right Column */}
      <div className="w-1/2 relative hidden md:block">
        <div className="absolute inset-0 z-0">
          <img src="/campus.jpg" alt="Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#8B0000] opacity-60"></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full p-2 bg-white/80 backdrop-blur text-xs text-gray-600 text-center z-20">
        Copyright 2000, 2022, Oracle and its affiliates
      </div>
    </div>
  );
}
