import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('keeps custom font sizes next to text colours', () => {
    expect(cn('text-ui font-medium', 'text-fg')).toBe('text-ui font-medium text-fg');
    expect(cn('text-2xs text-fg-subtle uppercase')).toBe('text-2xs text-fg-subtle uppercase');
  });
  it('still lets a later size override an earlier one', () => {
    expect(cn('text-ui', 'text-title')).toBe('text-title');
    expect(cn('text-sm', 'text-h-page')).toBe('text-h-page');
  });
});
