'use client';
import { useState } from 'react';

interface CheckoutButtonProps {
  amount: number; // in cents (e.g., 1000 for $10.00)
  name: string;
}

export default function CheckoutButton({ amount, name }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3005/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name }),
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
      {loading ? 'Redirecting...' : `Purchase (${(amount / 100).toFixed(2)} USD)`}
    </button>
  );
}