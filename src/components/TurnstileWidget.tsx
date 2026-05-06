"use client";

import { useEffect, useRef, useState } from "react";
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
  const [debugMessage, setDebugMessage] = useState("");

  useEffect(() => {
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

    if (!sitekey) {
      setDebugMessage("Falta NEXT_PUBLIC_TURNSTILE_SITE_KEY");
      return;
    }

    const renderWidget = () => {
      if (!window.turnstile) {
        setDebugMessage("Turnstile script no cargó todavía");
        return;
      }

      if (!containerRef.current) {
        setDebugMessage("No existe el contenedor del captcha");
        return;
      }

      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        callback: (token: string) => {
          setDebugMessage("");
          onVerify(token);
        },
        "expired-callback": () => {
          setDebugMessage("El captcha expiró");
          onExpire?.();
        },
        "error-callback": () => {
          setDebugMessage("Error al cargar Turnstile");
          onError?.();
        },
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
      {debugMessage && (
        <p style={{ color: "red", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          {debugMessage}
        </p>
      )}
    </>
  );
}