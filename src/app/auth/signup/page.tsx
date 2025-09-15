"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignup = async () => {
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signup successful! Check your email to verify your account.");
      // Optional: redirect to login after signup
      // router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl rounded-2xl dark:bg-gray-800 dark:border dark:border-gray-700">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-2xl font-bold text-center text-indigo-700 dark:text-indigo-400">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-300 mt-1">
            Sign up to start managing your leads
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <Button
              type="button"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </div>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 px-2 text-gray-400 dark:text-gray-300 text-sm bg-white dark:bg-gray-800">
              OR
            </span>
          </div>

          <Button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="w-full bg-white border border-gray-300 text-indigo-600 hover:bg-indigo-50 dark:bg-gray-700 dark:border-gray-600 dark:text-indigo-400 dark:hover:bg-gray-600"
          >
            Login Instead
          </Button>

          {message && (
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
