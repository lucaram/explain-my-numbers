'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const magic = searchParams.get('magic');
  const intent = searchParams.get('intent');

  const handleContinue = () => {
    setLoading(true);
    router.push(`/?magic=${magic}&intent=${intent}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] p-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">Sign-in Verified</h1>
      <p className="mb-8 max-w-xs text-zinc-600">
        Click below to open <strong>Explain My Numbers</strong> in your browser.
      </p>
      
      <button
        onClick={handleContinue}
        disabled={loading}
        className="w-full max-w-xs rounded-full bg-blue-600 py-4 font-semibold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? 'Opening...' : 'Continue to App'}
      </button>
      
      <p className="mt-6 text-xs text-zinc-400">
        Using an email app? Tap the three dots (⋮) and select <br /> 
        <strong>"Open in Chrome"</strong> or <strong>"Open in Safari"</strong>
      </p>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}