import { createCn } from 'cn/config';

/**
 * Class merger (clsx + tailwind-merge semantics, via shadcn's `cn` package), taught the custom
 * font-size tokens from globals.css. Without this, `text-ui`, `text-2xs`, … look like colour
 * classes and get dropped when a `text-<colour>` class is merged in the same call.
 * Keep in sync with the `--text-*` sizes in src/app/globals.css.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: ['micro', '2xs', 'ui', 'title', 'h-panel', 'h-page'] }],
    },
  },
});
