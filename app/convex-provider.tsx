"use client";

import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { api } from "../convex/_generated/api";

type ConvexSyncContextValue = {
  connected: boolean;
  syncing: boolean;
  snapshot: unknown;
  saveSnapshot: (database: unknown) => Promise<void>;
  clearSnapshot: () => Promise<void>;
};

const fallback: ConvexSyncContextValue = {
  connected: false,
  syncing: false,
  snapshot: null,
  saveSnapshot: async () => undefined,
  clearSnapshot: async () => undefined,
};

const ConvexSyncContext = createContext<ConvexSyncContextValue>(fallback);
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

function parseSnapshot(remote: unknown) {
  if (!remote || typeof remote !== "object" || !("payload" in remote)) return null;
  try { return JSON.parse(String(remote.payload)); } catch { return null; }
}

function ConnectedConvex({ children }: { children: ReactNode }) {
  const remote = useQuery(api.crm.getSnapshot);
  const replace = useMutation(api.crm.replaceSnapshot);
  const clear = useMutation(api.crm.clearSnapshot);
  const saveSnapshot = useCallback(async (database: unknown) => {
    await replace({ payload: JSON.stringify(database) });
  }, [replace]);
  const clearSnapshot = useCallback(async () => {
    await clear({});
  }, [clear]);
  const value = useMemo<ConvexSyncContextValue>(() => ({
    connected: true,
    syncing: remote === undefined,
    snapshot: parseSnapshot(remote),
    saveSnapshot,
    clearSnapshot,
  }), [remote, saveSnapshot, clearSnapshot]);
  return <ConvexSyncContext.Provider value={value}>{children}</ConvexSyncContext.Provider>;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexClient) return <ConvexSyncContext.Provider value={fallback}>{children}</ConvexSyncContext.Provider>;
  return <ConvexProvider client={convexClient}><ConnectedConvex>{children}</ConnectedConvex></ConvexProvider>;
}

export function useConvexSync() { return useContext(ConvexSyncContext); }
