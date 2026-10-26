"use client";

import * as React from "react";

import {
  DELETED_SAMPLES_STORAGE_KEY,
  PACKAGES_STORAGE_KEY,
  type StoredPackage,
} from "@/lib/destinations";

/**
 * localStorage read as an external system. `useSyncExternalStore` keeps the
 * snapshot stable per storage value, avoids `setState` inside effects (to
 * satisfy the React Compiler lint rules), and provides an empty snapshot for
 * the server render without touching storage. Writers additionally dispatch a
 * synthetic `storage` event so same-tab writes refresh subscribers too.
 */
const SUBSCRIBE_STORAGE = (listener: () => void) => {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
};
const SERVER_SNAPSHOT = () => "";

const EMPTY_PACKAGES: StoredPackage[] = [];
const EMPTY_IDS: string[] = [];

function useStoredJson<T>(key: string, fallback: T): T {
  const snapshot = React.useSyncExternalStore(
    SUBSCRIBE_STORAGE,
    () => window.localStorage.getItem(key) ?? "",
    SERVER_SNAPSHOT,
  );

  return React.useMemo(() => {
    if (!snapshot) return fallback;
    try {
      return JSON.parse(snapshot) as T;
    } catch {
      return fallback;
    }
  }, [snapshot, fallback]);
}

/** Packages the user added or edited from the UI (localStorage backed). */
export function useStoredPackages(): StoredPackage[] {
  return useStoredJson<StoredPackage[]>(PACKAGES_STORAGE_KEY, EMPTY_PACKAGES);
}

/** Ids of curated samples the user deleted, hidden across all views. */
export function useDeletedSampleIds(): string[] {
  return useStoredJson<string[]>(DELETED_SAMPLES_STORAGE_KEY, EMPTY_IDS);
}
