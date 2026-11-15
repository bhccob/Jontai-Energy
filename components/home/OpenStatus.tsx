'use client';

import { useEffect, useState, type HTMLAttributes } from 'react';
import { hoursFact } from '@/lib/firstView';
import { arubaNow, openState } from '@/lib/store';

/**
 * "Open now, until 7:00 PM", in Aruba time. Worked out after load, so the server and the visitor's clock never
 * disagree; until then it says what is always true. As the first view's Hours fact (variant "fact", round 54) the
 * state is bold and the time follows it, as two parts the translator knows.
 */
export function OpenStatus({ className = '', variant = 'line', ...rest }: HTMLAttributes<HTMLSpanElement> & { variant?: 'line' | 'fact' }) {
  const [state, setState] = useState<{ open: boolean; line: string } | null>(null);
  useEffect(() => {
    const { day, hour } = arubaNow();
    setState(openState(day, hour));
  }, []);
  const line = state?.line ?? 'Open every day';
  if (variant === 'fact') {
    const { strong, rest: after } = hoursFact(line);
    return (
      <span className={`status status--fact ${className}`.trim()} data-open={state?.open} {...rest}>
        <b>{strong}</b>
        {after}
      </span>
    );
  }
  return (
    <span className={`status ${className}`.trim()} data-open={state?.open} {...rest}>
      <i aria-hidden="true" />
      <span>{line}</span>
    </span>
  );
}
