### Color scheme

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
