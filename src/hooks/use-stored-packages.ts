"use client";

import * as React from "react";

import {
  PACKAGES_STORAGE_KEY,
  type StoredPackage,
} from "@/lib/destinations";

/**
 * localStorage read as an external system. `useSyncExternalStore` keeps the
 * snapshot stable per storage value, avoids `setState` inside effects (to
 * satisfy the React Compiler lint rules), and provides an empty snapshot for
 * the server render without touching storage.
 */
const SUBSCRIBE_STORAGE = (listener: () => void) => {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
};
const SERVER_SNAPSHOT = () => "";

export function useStoredPackages(): StoredPackage[] {
  const snapshot = React.useSyncExternalStore(
    SUBSCRIBE_STORAGE,
    () => window.localStorage.getItem(PACKAGES_STORAGE_KEY) ?? "",
    SERVER_SNAPSHOT,
  );

  return React.useMemo(() => {
    if (!snapshot) return [];
    try {
      return JSON.parse(snapshot) as StoredPackage[];
    } catch {
      return [];
    }
  }, [snapshot]);
}
