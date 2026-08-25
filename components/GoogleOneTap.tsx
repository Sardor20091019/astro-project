/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

export default function GoogleOneTap() {
  const { status } = useSession();

  useEffect(() => {
    // Only show One Tap if the user is not logged in
    if (status !== "unauthenticated") return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
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
      auto_select: false, // Set to true if you want auto-login when a single account is remembered
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