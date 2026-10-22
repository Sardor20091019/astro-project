/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleOneTap() {
  const { status } = useSession();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (initializedRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || typeof window === "undefined") return;

    const initGsi = () => {
      if (!window.google?.accounts?.id || initializedRef.current) return;
      initializedRef.current = true;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential: string }) => {
            await signIn("google", {
              credential: response.credential,
              redirect: false,
            });
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (
            notification?.isNotDisplayed?.() ||
            notification?.isSkippedMoment?.() ||
            notification?.isDismissedMoment?.()
          ) {
            // Dismissed or skipped quietly
          }
        });
      } catch {}
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGsi();
        }
      }, 200);

      return () => {
        clearInterval(interval);
        try {
          window.google?.accounts?.id?.cancel();
        } catch {}
      };
    }

    return () => {
      try {
        window.google?.accounts?.id?.cancel();
      } catch {}
    };
  }, [status]);

  return null;
}