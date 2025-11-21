'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import Link from 'next/link';
import Image from 'next/image';
import { PhoneInput } from '@/components/ui/phone-input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ArrowLeft } from 'lucide-react';
import type { E164Number } from 'libphonenumber-js/core';
import type { ConfirmationResult } from 'firebase/auth';

type AuthStep = 'phone' | 'phone-verification' | 'name-input';

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('phone');
  const [identifier, setIdentifier] = useState<E164Number | ''>('');
  const [displayName, setDisplayName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<any>(null);

  const { sendPhoneCode, verifyPhoneAndSignIn, user, loading } = useAuth();
  const router = useRouter();

  // Check if user is authenticated but missing displayName
  useEffect(() => {
    if (!loading && user) {
      if (!user.displayName) {
        // User is authenticated but needs to complete profile
        setVerifiedUser(user);
        setStep('name-input');
      } else {
        // User is fully authenticated, redirect to groups
        router.push('/biblestudygroups');
      }
    }
  }, [user, loading, router]);

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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!identifier) {
      setLocalError('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendPhoneCode(identifier, 'recaptcha-container');
      setConfirmationResult(result);
      setStep('phone-verification');
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!confirmationResult) {
      setLocalError('Please request a verification code first');
      return;
    }

    if (verificationCode.length !== 6) {
      setLocalError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      // Verify the code to get the user
      const credential = await confirmationResult.confirm(verificationCode);
      const user = credential.user;

      // Check if user has a display name (existing user)
      if (user.displayName) {
        // Existing user - complete sign in
        router.push('/biblestudygroups');
      } else {
        // New user - ask for name
        setVerifiedUser(user);
        setStep('name-input');
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateName(displayName)) {
      return;
    }

    if (!verifiedUser) {
      setLocalError('Session expired. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      // Update the user's profile with the display name
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(verifiedUser, { displayName });

      // Create user profile in Firestore
      // Role is automatically set to 'user' via Cloud Function
      const { createUserProfile } = await import('@/lib/firebase/userService');
      await createUserProfile(
        verifiedUser.uid,
        verifiedUser.phoneNumber || '',
        displayName,
        undefined // email is optional
      );

      router.push('/biblestudygroups');
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to save name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'phone-verification') {
      setStep('phone');
      setVerificationCode('');
    } else if (step === 'name-input') {
      setStep('phone-verification');
      setDisplayName('');
      setNameError('');
    }
    setLocalError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Back Button - only show on phone step */}
          {step === 'phone' && (
            <div className="mb-4">
              <Link
                href="/biblestudygroups"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/youthscc-logo.png"
                alt="Youth SCC Logo"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
            {step !== 'phone' && (
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {step === 'phone-verification' && 'Enter Code'}
                {step === 'name-input' && 'Welcome!'}
              </h1>
            )}
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              {step === 'phone' && 'Enter your phone number to continue'}
              {step === 'phone-verification' && `We sent a verification code to ${identifier}`}
              {step === 'name-input' && 'Your name so that we can reach out'}
            </p>
          </div>

          {/* Error Message */}
          {localError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{localError}</p>
            </div>
          )}

          {/* Step 1: Phone Input */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <PhoneInput
                  id="phone"
                  placeholder="Enter phone number"
                  value={identifier}
                  onChange={(value) => setIdentifier(value || '')}
                  defaultCountry="US"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !identifier}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {isLoading ? 'Sending Code...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 2: Phone Verification */}
          {step === 'phone-verification' && (
            <form onSubmit={handlePhoneVerification} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={verificationCode}
                  onChange={(value) => setVerificationCode(value)}
                  className="gap-3"
                >
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot index={0} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-2xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Name Input (for new users) */}
          {step === 'name-input' && (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="ex. John Doe"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (nameError && e.target.value.trim()) {
                      setNameError('');
                    }
                  }}
                  onBlur={() => displayName.trim() && validateName(displayName)}
                  className={`w-full px-4 py-2 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base`}
                  required
                  autoFocus
                />
                {nameError && (
                  <p className="text-sm text-red-600 mt-1">{nameError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !displayName}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {isLoading ? 'Completing Setup...' : 'Complete Setup'}
              </button>
            </form>
          )}

          {/* reCAPTCHA container */}
          <div className="flex justify-center overflow-hidden max-h-[78px] mt-6">
            <div id="recaptcha-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
