"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EntityHistoryPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/history/all");
  }, [router]);
  
  return null;
}
