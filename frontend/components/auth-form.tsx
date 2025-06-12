'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {toast} from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function AuthForm() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  // registration form fields
  const [regValues, setRegValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [enteredOtp, setEnteredOtp] = useState('');

  // login form (react-hook-form + zod)
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Switch between login & register
  const resetAll = () => {
    setIsLoading(false);
    setRegValues({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    setRegErrors({});
    setEnteredOtp('');
    loginForm.reset();
    setShowOtpDialog(false);
  };
  const handleFormSwitch = () => {
    resetAll();
    setIsLogin(!isLogin);
  };

  // LOGIN
  async function onLoginSubmit(data: { email: string; password: string }) {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/sign-in`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      const payload = await res.json();
      if (!res.ok) toast.error('Login failed. Please try again later');

      localStorage.setItem('user_id', payload.user.user_id);
      localStorage.setItem('token', payload.token);
      toast.success('Login successful. Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(`login failed. Please check your credentials`)
    } finally {
      setIsLoading(false);
    }
  }

  // REGISTER → SEND OTP
  async function onRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setRegErrors({});

    const result = registerSchema.safeParse(regValues);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const formatted: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([k, v]) => {
        formatted[k] = v?.[0] || '';
      });
      setRegErrors(formatted);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/send-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: regValues.email }),
        }
      );
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message);
      toast.success(`OTP sent To ${regValues.email}`);
      setShowOtpDialog(true);
    } catch (err: any) {
      toast.error('OTP error')
    } finally {
      setIsLoading(false);
    }
  }

  // VERIFY OTP → SIGN UP
  async function handleOtpSubmit() {
    if (!enteredOtp) {
      toast.info('Please enter OTP')
      return;
    }
    setIsLoading(true);
    try {
      const verify = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: regValues.email, otp: enteredOtp }),
        }
      );
      const vPayload = await verify.json();
      if (!verify.ok) toast.error(vPayload.message);

      const signup = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/sign-up`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: regValues.name,
            email: regValues.email,
            password: regValues.password,
            phone_number: regValues.phone,
          }),
        }
      );
      const sPayload = await signup.json();
      if (!signup.ok) toast.error(sPayload.message);

      toast.success('Registration complete !Please log in.');
      resetAll();
      setIsLogin(true);
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
          <CardDescription>
            {isLogin
              ? 'Enter your credentials'
              : 'Fill in and verify your email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                {['email', 'password'].map((field) => (
                  <FormField
                    key={field}
                    name={field}
                    control={loginForm.control}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="capitalize">
                          {field}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...f}
                            type={field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in…' : 'Login'}
                </Button>
              </form>
            </Form>
          ) : (
            <form onSubmit={onRegisterSubmit} className="space-y-3">
              <Input
                placeholder="Name"
                value={regValues.name}
                onChange={(e) =>
                  setRegValues({ ...regValues, name: e.target.value })
                }
                disabled={isLoading}
              />
              {regErrors.name && (
                <p className="text-xs text-red-600">{regErrors.name}</p>
              )}

              <Input
                placeholder="Email"
                value={regValues.email}
                onChange={(e) =>
                  setRegValues({ ...regValues, email: e.target.value })
                }
                disabled={isLoading}
              />
              {regErrors.email && (
                <p className="text-xs text-red-600">{regErrors.email}</p>
              )}

              <Input
                placeholder="Phone (optional)"
                value={regValues.phone}
                onChange={(e) =>
                  setRegValues({ ...regValues, phone: e.target.value })
                }
                disabled={isLoading}
              />

              <Input
                placeholder="Password"
                type="password"
                value={regValues.password}
                onChange={(e) =>
                  setRegValues({ ...regValues, password: e.target.value })
                }
                disabled={isLoading}
              />
              {regErrors.password && (
                <p className="text-xs text-red-600">{regErrors.password}</p>
              )}

              <Input
                placeholder="Confirm Password"
                type="password"
                value={regValues.confirmPassword}
                onChange={(e) =>
                  setRegValues({
                    ...regValues,
                    confirmPassword: e.target.value,
                  })
                }
                disabled={isLoading}
              />
              {regErrors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {regErrors.confirmPassword}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP…' : 'Register & Send OTP'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <Button variant="link" onClick={handleFormSwitch} disabled={isLoading}>
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Email</DialogTitle>
            <DialogDescription>
              Enter the 6‑digit OTP we sent to {regValues.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="OTP"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              disabled={isLoading}
            />
            <Button
              className="w-full"
              onClick={handleOtpSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying…' : 'Verify & Complete Registration'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
