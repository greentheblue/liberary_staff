"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound, LibraryBig, LockKeyhole } from "lucide-react";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formValues, setFormValues] = useState({
    password: "",
    confirmPassword: "",
  });
  
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const tokenParam = searchParams?.get("token");
    
    if (!tokenParam) {
      setValidating(false);
      return;
    }

    setToken(tokenParam);
    
    // Validate the token with an API call
    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/validate-token?token=${tokenParam}`);
        const data = await res.json();
        
        if (data.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formValues.password !== formValues.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formValues.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formValues.password,
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password",
          variant: "destructive",
        });
        return;
      }

      // Show success message
      setIsCompleted(true);
      
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const redirectToLogin = () => {
    router.push("/auth/login");
  };
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dark bg-black">
        <Card className="w-full max-w-md border border-border bg-card text-card-foreground">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <LibraryBig className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Library Management</h1>
            </div>
            <CardTitle className="text-xl">Verifying your request...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid && !isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dark bg-black">
        <div className="w-full max-w-md">
          <Card className="border border-border bg-card text-card-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <LibraryBig className="h-6 w-6" />
                <h1 className="text-xl font-semibold">Library Management</h1>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Invalid Request</CardTitle>
              <CardDescription className="text-center">
                The password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4 text-center">
              <p className="text-muted-foreground mb-6">
                Please request a new password reset link from the forgot password page.
              </p>
              
              <Button 
                onClick={() => router.push("/auth/forgot-password")}
                className="mb-4"
              >
                Request New Link
              </Button>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Link 
                href="/auth/login" 
                className="text-primary hover:underline flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Back to login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dark bg-black">
        <div className="w-full max-w-md">
          <Card className="border border-border bg-card text-card-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <LibraryBig className="h-6 w-6" />
                <h1 className="text-xl font-semibold">Library Management</h1>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Password Reset Successfully</CardTitle>
              <CardDescription className="text-center">
                Your password has been reset successfully
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-4 text-center">
              <div className="flex justify-center">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              
              <p>
                You can now login to your account with your new password.
              </p>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={redirectToLogin}
                className="w-full"
              >
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark bg-black">
      <div className="w-full max-w-md">
        <Card className="border border-border bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <LibraryBig className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Library Management</h1>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <LockKeyhole size={16} />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10"
                    placeholder="Enter your new password"
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
                <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <KeyRound size={16} />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-10"
                    placeholder="Confirm your new password"
                    required
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={toggleShowConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  <span>Reset Password</span>
                )}
              </Button>
              
              <div className="text-center">
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:underline flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
