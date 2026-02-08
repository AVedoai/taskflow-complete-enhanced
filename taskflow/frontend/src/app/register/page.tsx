"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/use-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { register, isAuthenticated, checkAuth } = useAuthStore();
  const { toast } = useToast();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak password",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      toast({
        title: "Account created 🎉",
        description: "Please sign in to continue",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.response?.data?.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#0B0614]">
      {/* Purple ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-purple-600/30 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-violet-500/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(128,90,213,0.35)]">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
            >
              <CardTitle className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-purple-500 to-violet-600 bg-clip-text text-transparent">
                TaskFlow
              </CardTitle>
            </motion.div>

            <CardDescription className="text-purple-200/70">
              Create your account to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label className="text-purple-200">Name</Label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-purple-300/40 focus-visible:ring-purple-500"
                  autoComplete="name"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2"
              >
                <Label className="text-purple-200">Email</Label>
                <Input
                  type="email"
                  placeholder="you@taskflow.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-purple-300/40 focus-visible:ring-purple-500"
                  autoComplete="email"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label className="text-purple-200">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-purple-300/40 focus-visible:ring-purple-500"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <p className="text-xs text-purple-300/60">
                  Minimum 6 characters
                </p>
              </motion.div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 shadow-lg shadow-purple-500/30"
              >
                {isLoading ? "Creating account…" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-purple-300/70">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-purple-400 hover:text-purple-300 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
