"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, LibraryBig, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailOrPhone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email or phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOrPhone }),
      });

      const data = await res.json();
      
      if (!data.success) {
        toast({
          title: "Error",
          description: data.message || "Failed to process request",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitted(true);
      
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
  };  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark bg-black">
      <div className="w-full max-w-md">
        <Card className="border border-border bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <LibraryBig className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Library Management</h1>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {isSubmitted ? "Check Your Email" : "Forgot Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSubmitted 
                ? "We have sent a password reset link to your email"
                : "Enter your email address or phone number to reset your password"}
            </CardDescription>
          </CardHeader>
          
          {isSubmitted ? (
            <CardContent className="space-y-6 pt-4 text-center">
              <div className="flex justify-center">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              
              <div className="space-y-2">
                <p>
                  We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you don&apos;t see the email, check your spam folder.
                </p>
              </div>
              
              <div className="pt-4">
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:underline flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to login
                </Link>
              </div>
            </CardContent>
          ) : (
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
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email or phone"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    *If you enter a phone number, the reset link will still be sent to your registered email address
                  </p>
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
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <span>Send Reset Link</span>
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
          )}
        </Card>
      </div>
    </div>
  );
}
