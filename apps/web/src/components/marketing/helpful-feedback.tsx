'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

/** "Was this helpful?" row at the end of a help article (01.06). Local-only for now. */
export function HelpfulFeedback() {
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
      {answer ? (
        <p role="status" className="text-[15px] font-semibold">
          {answer === 'yes'
            ? 'Thanks — glad it helped.'
            : 'Thanks for telling us. Message us on WhatsApp and we’ll sort it out.'}
        </p>
      ) : (
        <>
          <p className="text-[15px] font-semibold">Was this helpful?</p>
          {(
            [
              ['yes', 'Yes', ThumbsUp],
              ['no', 'No', ThumbsDown],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAnswer(value)}
              className="flex items-center gap-1.5 rounded-pill border border-line px-3.5 py-2 text-sm font-medium transition-colors hover:bg-surface focus-visible:shadow-focus focus-visible:outline-none"
            >
              <Icon aria-hidden className="size-[15px]" />
              {label}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
