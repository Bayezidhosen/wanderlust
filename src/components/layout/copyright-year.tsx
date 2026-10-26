"use client";

import * as React from "react";

export function CopyrightYear() {
  // `new Date()` is unstable during prerender, so compute it after hydration.
  // `useSyncExternalStore` reads it without setState-in-effect.
  const year = React.useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => null,
  );

  return <>{year ?? ""}</>;
}
