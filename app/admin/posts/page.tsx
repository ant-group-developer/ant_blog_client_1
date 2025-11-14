"use client";

import { Suspense } from "react";
import PostsPage from "./post-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostsPage />
    </Suspense>
  );
}
