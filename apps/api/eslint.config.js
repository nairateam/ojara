import { nest } from '@ojara/eslint-config/nest';

export default [
  ...nest,
  { ignores: ['eslint.config.js', 'src/generated/**', 'dist/**'] },
];
