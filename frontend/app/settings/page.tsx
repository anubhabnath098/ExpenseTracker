'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {toast} from 'sonner'

interface UserProfile {
  name: string;
  email: string;
  phone_number: string;
}

type Msg = { type: 'success' | 'error'; text: string };

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone_number: '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const [msg, setMsg] = useState<Msg | null>(null);
  const showMsg = (type: Msg['type'], text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  // load token
  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  // fetch profile once token is ready
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/me`, {
          method: 'GET',
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfile(data);
        setNewEmail(data.email);
      } catch {
        toast.error('Failed to load profile');
      }
    })();
  }, [token]);

  // inline password validation
  const onPasswordChange = (val: string) => {
    setPassword(val);
    if (val && val.length < 6) setPasswordError('Password must be at least 6 characters');
    else setPasswordError('');
  };

  const handleSendOtp = async () => {
    if (!newEmail) return showMsg('error', 'Please enter a new email');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/send-email-update-otp`,
        { newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(true);
      toast.success('OTP sent to new email');
    } catch {
      toast.success('Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return showMsg('error', 'Please enter the OTP');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/verify-email-update-otp`,
        { newEmail: newEmail.trim(), otp: otp.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmailVerified(true);
      toast.success('Email verified');
    } catch {
      toast.error('Invalid OTP');
    }
  };

  const handleUpdate = async () => {
    if (newEmail !== profile.email && !emailVerified) {
      return showMsg('error', 'Verify new email before saving');
    }
    if (passwordError) {
      return showMsg('error', passwordError);
    }
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update`,
        {
          name: profile.name.trim(),
          phone_number: profile.phone_number.trim(),
          password: password || undefined,
          email: newEmail.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Profile updated successfully');
      setPassword('');
      setProfile((prev) => ({
        ...prev,
        email: newEmail.trim(),
       }));
      setOtpSent(false);
      setEmailVerified(false);
    } catch {
      toast.error('Could not update profile');
    }
  };

  // detect if anything changed
  const isDirty =
    profile.name.trim() !== '' ||
    profile.phone_number.trim() !== '' ||
    newEmail.trim() !== profile.email ||
    password.length > 0;

  return (
    <div className="relative py-8 px-4 sm:px-6 lg:px-8">
      {/* Floating message */}
      {msg && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-md text-sm font-medium ${
            msg.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          } animate-fade-in-down`}
        >
          {msg.text}
        </div>
      )}

      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        {/* Name */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="mt-1"
          />
        </div>
        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={profile.phone_number}
            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
            className="mt-1"
          />
        </div>
        {/* Email & OTP */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setEmailVerified(false);
              setOtpSent(false);
            }}
            className="mt-1"
          />
          {!emailVerified && newEmail !== profile.email && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={handleSendOtp}>
                Send OTP
              </Button>
              {otpSent && (
                <>
                  <Input
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-28 mt-0"
                  />
                  <Button size="sm" variant="secondary" onClick={handleVerifyOtp}>
                    Verify OTP
                  </Button>
                </>
              )}
            </div>
          )}
          {emailVerified && (
            <p className="mt-2 text-green-600 text-sm">Email verified ✅ Please click Save Changes to save the new Email</p>
          )}
        </div>
        {/* Password */}
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Leave blank to keep unchanged"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="mt-1"
          />
          {passwordError && (
            <p className="text-red-600 text-sm mt-1">{passwordError}</p>
          )}
        </div>
        {/* Save */}
        <Button
          onClick={handleUpdate}
          className="w-full"
          disabled={!isDirty || !!passwordError}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}