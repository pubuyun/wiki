### Loading animation

data-critical-image attribute is added to imgs that need to be loaded before the page is considered fully loaded.

### Color scheme

```css
@theme {
    --color-secondary: #65dbbe;
    --color-primary-deep: #142e85;
    --color-tertiary: #ffec8e;
    --color-tertiary: #ffda3a;

    --color-primary-norm: #4f7fff;
    --color-primary-deep: #fa5c4f;
    --color-secondary: #ff3e8a;
    --color-primary-light: #c6eeff;
    --color-primary-light: #81ebf9;
    --font-momo-trust-display: "Momo Trust Display", sans-serif;
    --font-righteous: "Righteous", sans-serif;
    --font-belanosima: "Belanosima", serif;
    --font-main:
        -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
```

### Scrolling

use this for navigation in the same page

```js
@click="scrollToHash($event, to)"
const { scrollToHash } = useHashScroll();
```
