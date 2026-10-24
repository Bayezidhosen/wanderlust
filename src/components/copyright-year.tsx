"use client";

import * as React from "react";

export function CopyrightYear() {
  // `new Date()` is unstable during prerender, so compute it after hydration.
  const [year, setYear] = React.useState<number | null>(null);

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <>{year ?? ""}</>;
}
