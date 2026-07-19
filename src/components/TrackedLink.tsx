"use client";

import Link, { type LinkProps } from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import {
  trackProductEvent,
  type ProductAnalyticsInput,
} from "@/lib/product-analytics";

type TrackedLinkProps = LinkProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps> & {
    analyticsEvent: ProductAnalyticsInput;
  };

export function TrackedLink({
  analyticsEvent,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackProductEvent(analyticsEvent);
        onClick?.(event);
      }}
    />
  );
}
