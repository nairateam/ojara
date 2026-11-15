/** Reads a text field from FormData (files and missing fields become ""). */
export function textField(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value : '';
}
