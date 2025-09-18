# Drupal Portfolio (Custom Theme)

This repository contains a Drupal site configured with a custom theme `ds_custom` used to render a personal portfolio page.

## What’s Inside
- Custom theme: `web/themes/custom/ds_custom`
  - Templates: Twig files for the portfolio page and nodes
  - Assets: CSS/SCSS and JS for layout, dark mode, and API-driven rendering
  - Portfolio styles and script located in `assets/portfolio/`
- Custom module(s): optional blocks/components under `web/modules/custom/`
- DDEV config: local development environment under `.ddev/`

## Key Pages
- Portfolio: `/portfolio` (renders full‑width hero, selected work, skills, experience, and contact)
- JSON endpoints (must be accessible to anonymous users):
  - `/api/projects`
  - `/api/skills`
  - `/api/experience`
  - `/api/profile`

## Local Development
- Start environment: `ddev start`
- Clear caches: `ddev drush cr`
- Visit the site: `http://drupal-site.ddev.site/`

## Theme Notes
- The portfolio header and hero use full‑bleed sections; inner content is constrained by `.pf-wrap`/`.am-wrap`.
- Dark mode is toggled by a button; headings and sections are styled to remain readable in both themes.
- Selected Work cards are populated from `/api/projects`.
- Skills, Experience, and Contact sections are populated from the endpoints above by `assets/portfolio/script.js`.

## Deployment
- Use a standard Drupal deployment flow; exclude build artifacts and local files from VCS. A typical `.gitignore` should omit `vendor/`, `web/sites/default/files/`, `.ddev/`, and `node_modules/`.

## License
- Project code is provided as-is by the repository owner.
