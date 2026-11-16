/** Reads a text field from FormData (files and missing fields become ""). */
export function textField(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value : '';
}

/** Shown when the API rejects a password found in known data leaks (Have I Been Pwned). */
export const BREACHED_PASSWORD_MESSAGE =
  'This password appears in known data leaks, so attackers try it first. Try three or four random words, like river-plantain-copper-41.';
