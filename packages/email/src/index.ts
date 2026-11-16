import { createElement, type ComponentType } from 'react';
import { render } from 'react-email';
import {
  OrderConfirmationEmail,
  type OrderConfirmationEmailProps,
} from './templates/order-confirmation-email.js';
import {
  PasswordResetEmail,
  type PasswordResetEmailProps,
} from './templates/password-reset-email.js';
import { NewOrderEmail, type NewOrderEmailProps } from './templates/new-order-email.js';
import { VerifyEmail, type VerifyEmailProps } from './templates/verify-email.js';
import { WelcomeEmail, type WelcomeEmailProps } from './templates/welcome-email.js';

export { emailTokens } from './tokens.js';
export type { EmailOrderLine } from './components/order-lines.js';
export { NewOrderEmail, OrderConfirmationEmail, PasswordResetEmail, VerifyEmail, WelcomeEmail };
export type {
  NewOrderEmailProps,
  OrderConfirmationEmailProps,
  PasswordResetEmailProps,
  VerifyEmailProps,
  WelcomeEmailProps,
};

/** Registry of templates by name. Queue jobs reference templates by this key, never by component. */
export interface EmailTemplateProps {
  welcome: WelcomeEmailProps;
  'verify-email': VerifyEmailProps;
  'password-reset': PasswordResetEmailProps;
  'order-confirmation': OrderConfirmationEmailProps;
  'new-order': NewOrderEmailProps;
}
export type EmailTemplateName = keyof EmailTemplateProps;

const templates: { [K in EmailTemplateName]: ComponentType<EmailTemplateProps[K]> } = {
  welcome: WelcomeEmail,
  'verify-email': VerifyEmail,
  'password-reset': PasswordResetEmail,
  'order-confirmation': OrderConfirmationEmail,
  'new-order': NewOrderEmail,
};

export interface RenderedEmail {
  html: string;
  text: string;
}

export async function renderEmail<K extends EmailTemplateName>(
  name: K,
  props: EmailTemplateProps[K],
): Promise<RenderedEmail> {
  const Template = templates[name];
  const element = createElement(Template, props);
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
  return { html, text };
}
