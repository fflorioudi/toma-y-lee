import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="page-container">Cargando...</main>}>
      <LoginPageClient />
    </Suspense>
  );
}