"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../components/LoadingSpinner";
import Image from "next/image";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("amltab_token");
    const userData = localStorage.getItem("amltab_user");

    if (!token || !userData) {
      router.push("/signin?callbackUrl=/api-docs");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--background)'
      }}>
        <LoadingSpinner text="Authenticating Developer Access..." />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
