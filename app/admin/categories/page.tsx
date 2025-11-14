"use client";

import { Suspense } from "react";
import CategoriesPage from "./category-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoriesPage />
    </Suspense>
  );
}
