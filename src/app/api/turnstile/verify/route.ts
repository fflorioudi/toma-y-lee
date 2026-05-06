import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Falta el token de verificación." },
        { status: 400 }
      );
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Falta configurar TURNSTILE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);

    const cfResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await cfResponse.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: "No se pudo validar la verificación anti-bot." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error interno al validar Turnstile." },
      { status: 500 }
    );
  }
}