'use client';
import { useState } from 'react';

interface CheckoutButtonProps {
  tierId?: string;
  label?: string;
}

export default function CheckoutButton({ tierId = 'TIP_STANDARD', label }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tierId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="px-4 py-2 bg-white text-black rounded font-medium hover:bg-neutral-200 transition"
    >
      {loading ? 'Redirecting...' : label || 'Support Project'}
    </button>
  );
}