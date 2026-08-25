/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

// Tell TypeScript that 'google' will be injected into the window object
declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleOneTap() {
  const { status } = useSession();

  useEffect(() => {
    // Only show One Tap if the user is not logged in
    if (status !== "unauthenticated") return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    // Check if window and window.google exist before trying to use them
    if (!clientId || typeof window === "undefined" || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        // Send the Google credential token to NextAuth
        await signIn("google", {
          credential: response.credential,
          redirect: false,
        });
      },
      auto_select: false, 
      cancel_on_tap_outside: true,
    });

    // Display the One Tap prompt UI
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log("One Tap prompt skipped or blocked:", notification.getNotDisplayedReason());
      }
    });
  }, [status]);

  return null;
}