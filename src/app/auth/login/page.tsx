"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LibraryBig, Lock, Mail, User } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({
    emailOrPhone: "",
    password: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const data = await res.json();
      
      if (!data.success) {
        toast({
          title: "Error",
          description: data.message || "Login failed",
          variant: "destructive",
        });
        return;
      }

      // Use NextAuth signIn for client-side authentication
      const result = await signIn("credentials", {
        redirect: false,
        emailOrPhone: formValues.emailOrPhone,
        password: formValues.password,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error || "Login failed",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark bg-black">
      <div className="w-full max-w-md">
        <Card className="border border-border bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <LibraryBig className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Library Management</h1>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Staff Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone">Email or Phone</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Mail size={16} />
                  </div>
                  <Input
                    id="emailOrPhone"
                    name="emailOrPhone"
                    className="pl-10"
                    placeholder="Enter your email or phone"
                    required
                    value={formValues.emailOrPhone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10"
                    placeholder="Enter your password"
                    required
                    value={formValues.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Sign in</span>
                )}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Library Management System
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}