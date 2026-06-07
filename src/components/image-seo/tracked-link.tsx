'use client';

import { trackEvent } from '@/lib/analytics';
import { forwardRef, type AnchorHTMLAttributes } from 'react';

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  eventName: string;
  eventPayload?: Record<string, string | number | boolean | null | undefined>;
};

export const TrackedLink = forwardRef<HTMLAnchorElement, TrackedLinkProps>(
  function TrackedLink({ eventName, eventPayload, onClick, ...props }, ref) {
    return (
      <a
        ref={ref}
        {...props}
        onClick={(event) => {
          trackEvent(eventName, eventPayload);
          onClick?.(event);
        }}
      />
    );
  }
);
