"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

type Props = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
};

export default function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
        callback: (token: string) => onVerify(token),
        "expired-callback": () => onExpire?.(),
        "error-callback": () => onError?.(),
        theme: "auto",
      });
    };

    const interval = setInterval(() => {
      if (window.turnstile) {
        renderWidget();
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [onVerify, onExpire, onError]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div ref={containerRef} />
    </>
  );
}