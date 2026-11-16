'use client';

import { CircleAlert } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  type FormEvent,
  type ReactNode,
  startTransition,
  use,
  useActionState,
} from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NativeSelect } from './fields';

export interface OnboardingFormState {
  /** Shown above the fields. */
  message?: string;
  /** Per-field messages, keyed by the input's `name`. */
  fieldErrors?: Record<string, string>;
}

export type OnboardingAction = (
  prev: OnboardingFormState,
  data: FormData,
) => Promise<OnboardingFormState>;

const FormContext = createContext<{ state: OnboardingFormState; pending: boolean }>({
  state: {},
  pending: false,
});

/**
 * Wraps an onboarding step in a form bound to its Server Action. Submits through a transition
 * rather than the `action` prop so React doesn't reset the fields when validation fails.
 */
export function OnboardingForm({
  action,
  className,
  children,
}: {
  action: OnboardingAction;
  className?: string;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <FormContext value={{ state, pending }}>
      <form onSubmit={onSubmit} noValidate className={className} aria-busy={pending}>
        {children}
      </form>
    </FormContext>
  );
}

/** Form-level message (validation summary or API failure). */
export function FormMessage() {
  const { state } = use(FormContext);
  if (!state.message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-md bg-danger-soft px-3.5 py-3 text-ui text-danger"
    >
      <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
      {state.message}
    </p>
  );
}

/** Inline message under a field; its id is `${name}-error` for aria-describedby. */
export function FieldError({ name, className }: { name: string; className?: string }) {
  const { state } = use(FormContext);
  const message = state.fieldErrors?.[name];
  if (!message) return null;
  return (
    <p id={`${name}-error`} className={cn('text-xs font-medium text-danger', className)}>
      {message}
    </p>
  );
}

export function useOnboardingForm() {
  return use(FormContext);
}

export function SubmitButton({
  className,
  pendingLabel,
  children,
}: {
  className?: string;
  pendingLabel: string;
  children: ReactNode;
}) {
  const { pending } = use(FormContext);
  return (
    <button type="submit" disabled={pending} className={cn(className, 'disabled:opacity-60')}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Field error state for a control: wire `aria-invalid` / `aria-describedby`. */
function useFieldError(name: string | undefined) {
  const { state } = use(FormContext);
  const error = name ? state.fieldErrors?.[name] : undefined;
  return error
    ? { 'aria-invalid': true as const, 'aria-describedby': `${name}-error` }
    : { 'aria-invalid': undefined, 'aria-describedby': undefined };
}

/** Input that turns red and points at its FieldError when the form reports an error for it. */
export function FormInput(props: InputProps & { name: string }) {
  return <Input {...props} {...useFieldError(props.name)} />;
}

export function FormSelect(props: ComponentProps<typeof NativeSelect> & { name: string }) {
  return <NativeSelect {...props} {...useFieldError(props.name)} />;
}
