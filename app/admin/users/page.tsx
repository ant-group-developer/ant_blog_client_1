"use client";

import { Suspense } from "react";
import UserPage from "./user-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserPage />
    </Suspense>
  );
}
