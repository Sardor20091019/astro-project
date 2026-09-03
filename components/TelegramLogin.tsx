"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

export default function TelegramLogin() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.onTelegramAuth = async (user: TelegramUser) => {
      const result = await signIn("telegram", {
        redirect: false,
        id: user.id.toString(),
        first_name: user.first_name || "",
        username: user.username || "",
        photo_url: user.photo_url || "",
        auth_date: user.auth_date.toString(),
        hash: user.hash,
        callbackUrl: "/",
      });

      if (result?.error) {
        console.error("Auth error:", result.error);
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

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }
  }, []);

  return <div ref={containerRef} />;
}