/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

export default function TelegramLogin() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).onTelegramAuth = async (user: any) => {
      const result = await signIn("telegram", {
        redirect: false,
        ...user,
      });

      if (result?.error) {
        console.error("Auth error:", result.error);
        alert("Authentication failed.");
        console.error("Full NextAuth Error:", result); 
  alert(`Login failed: ${result.error}`);
      } else {
       
        window.location.href = "/";
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "astrospectrumbot");
    script.setAttribute("data-size", "medium");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    containerRef.current?.appendChild(script);
  }, []);

  return <div ref={containerRef} />;
}