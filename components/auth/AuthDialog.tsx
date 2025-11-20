'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import type { E164Number } from 'libphonenumber-js/core';
import type { ConfirmationResult } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { PhoneInput } from '@/components/ui/phone-input';
import { toast } from 'sonner';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type AuthStep = 'identifier' | 'email-password' | 'email-signup' | 'phone-verification';

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const { login, signup, sendPhoneCode, verifyPhoneAndSignIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<AuthStep>('identifier');
  const [identifier, setIdentifier] = useState<E164Number | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [nameError, setNameError] = useState('');

  const isEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isPhone = (value: string) => {
    // Simple phone validation - starts with + and has digits
    return /^\+?[\d\s-()]+$/.test(value.trim()) && value.trim().length >= 10;
  };

  const validateName = (name: string): boolean => {
    const nameParts = name.trim().split(/\s+/);
    if (!name.trim()) {
      setNameError('Full name is required');
      return false;
    }
    if (nameParts.length < 2) {
      setNameError('Please enter both first and last name');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    // Clear error when user starts typing again after an error
    if (nameError && value.trim()) {
      setNameError('');
    }
  };

  const handleNameBlur = () => {
    if (displayName.trim()) {
      validateName(displayName);
    }
  };

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier) {
      toast.error('Please enter a phone number');
      return;
    }

    // Validate name
    if (!validateName(displayName)) {
      return;
    }

    // For phone, send verification code
    setIsLoading(true);
    try {
      const result = await sendPhoneCode(identifier, 'recaptcha-container');
      setConfirmationResult(result);
      toast.success('Verification code sent!');
      setStep('phone-verification');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email: identifier, password });
      toast.success('Logged in successfully');
      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      // If user not found, offer to sign up
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('No account') || errorMessage.includes('user-not-found')) {
        toast.error('No account found. Please sign up.');
        setStep('email-signup');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        email: identifier,
        password,
        displayName: displayName || undefined,
      });
      toast.success('Account created successfully');
      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationResult) {
      toast.error('Please request a verification code first');
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyPhoneAndSignIn(confirmationResult, verificationCode, displayName);
      toast.success('Successfully signed in!');
      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('identifier');
    setIdentifier('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setVerificationCode('');
    setConfirmationResult(null);
    setNameError('');
  };

  const handleBack = () => {
    if (step === 'email-password' || step === 'email-signup' || step === 'phone-verification') {
      setStep('identifier');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setVerificationCode('');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {step === 'identifier' && 'Join'}
              {step === 'email-password' && 'Enter password'}
              {step === 'email-signup' && 'Create account'}
              {step === 'phone-verification' && 'Enter code'}
            </DialogTitle>
            <DialogDescription>
              {step === 'identifier' && 'Enter your details so we can reach out to you'}
              {step === 'email-password' && `Signing in to ${identifier}`}
              {step === 'email-signup' && 'Complete your registration'}
              {step === 'phone-verification' && `We sent a verification code to ${identifier}`}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Identifier Input */}
          {step === 'identifier' && (
            <form onSubmit={handleIdentifierSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="ex. John Doe"
                  value={displayName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  className={nameError ? 'border-destructive' : ''}
                  required
                />
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneInput
                  id="phone"
                  placeholder="Enter phone number"
                  value={identifier}
                  onChange={(value) => setIdentifier(value || '')}
                  defaultCountry="US"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !identifier || !displayName}>
                {isLoading ? 'Processing...' : 'Next'}
              </Button>
            </form>
          )}

          {/* Step 2: Email Password (Login) */}
          {step === 'email-password' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Don&#39;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setStep('email-signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* Step 3: Email Signup */}
          {step === 'email-signup' && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Name (Optional)</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">At least 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setStep('email-password')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Step 4: Phone Verification */}
          {step === 'phone-verification' && (
            <form onSubmit={handlePhoneVerification} className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={verificationCode}
                  onChange={(value) => setVerificationCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          )}

          {/* reCAPTCHA container - constrained size */}
          <div className="flex justify-center overflow-hidden max-h-[78px]">
            <div id="recaptcha-container"></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
