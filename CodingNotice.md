### Color scheme

Components should use the purpose of a color.

Surface - backgrounds

- `surface-page`: page or layout background.
- `surface-content`: article cards, content blocks, and input interiors.
- `surface-nav`: top navigation background.
- `surface-sidebar`: sidebars and dark tool surfaces.
- `surface-popover`: dialogs, dropdowns, and floating panels.
- `surface-muted`: subtle sections, table heads, muted containers, and tracks.

Text - text

- `text-main`: default body text.
- `text-muted`: secondary copy, summaries, and descriptions.
- `text-inverse`: text on dark surfaces.
- `text-on-accent`: text placed on accent backgrounds.
- `text-brand`: strongly emphasized text.

Accent - highlight colors

- `accent-primary`: primary brand accent.
- `accent-secondary`: secondary accent.
- `accent-warm`: warm decorative accent.
- `accent-active`: emphasis when no background change.

Interaction - UI states

- `interactive-hover-bg`: hover background.
- `interactive-hover-text`: hover text color.
- `active-bg`: active background.
- `active-text`: text on `active-bg`.
- `focus-ring`: keyboard focus outline.
- `border-default`: default border color.

Avoid theme-specific color patches `dark:hover:*`

### Scrolling

use this for navigation in the same page

```js
@click="scrollToHash($event, to)"
const { scrollToHash } = useHashScroll();
```

### GitHub and GitLab synchronization

```
git remote add gitlab https://gitlab.igem.org/2026/greatbay-scie.git
git fetch origin main
git fetch gitlab main

git checkout main
git pull --ff-only origin main

git merge -s ours gitlab/main -m "Merge GitLab GitHub diff"

git push origin main
```
