# Greatbay-SCIE 2026 iGEM Wiki

The wiki for the Greatbay-SCIE team in the 2026 iGEM competition, documenting our project, research, experimental results, and team activities.

## Tech Stack

- Nuxt 4, Vue 3, and TypeScript
- Nuxt Content for Markdown-based content
- Tailwind CSS 4 for styling
- GSAP, ECharts, and Three.js for animations and visualizations

## Getting Started

Use Node.js 22 and Yarn 4.9.1.

```sh
corepack enable
yarn install
yarn dev
```

The development site is available at [localhost:3000](http://localhost:3000). If a development server is already running, reuse it.

## Project Structure

- `app/` — pages, components, styles, and application utilities
- `content/` — wiki content written in Markdown
- `public/` — static assets served directly
- `modules/` — custom Nuxt modules
- `server/` — server routes and API handlers

## Deployment

```sh
yarn generate
```

Generates the static site in `.output/public/` with the `/greatbay-scie/` base path for iGEM hosting. The GitLab CI pipeline publishes this output on pushes to the default branch.

For deployment at the domain root, use `yarn generate:vercel`.

## Contributing

Edit wiki content in `content/` and site features in `app/`. Check your changes in the local development site before opening a merge request.

## License

This repository is licensed under [Creative Commons Attribution 4.0 International](LICENSE).
