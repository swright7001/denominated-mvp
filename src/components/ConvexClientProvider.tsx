"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode, useMemo } from "react";

type ConvexClientProviderProps = {
  children: ReactNode;
  url: string;
};

export function ConvexClientProvider({
  children,
  url,
}: ConvexClientProviderProps) {
  const convex = useMemo(() => new ConvexReactClient(url), [url]);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
