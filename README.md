# Hörschmiede Boo GmbH — Business Website

Production website for [Hörschmiede Boo GmbH](https://www.hoerschmiede-boo.ch/), an independent hearing-aid acoustics practice in Horgen, Switzerland. Built and maintained as a freelance client project — from initial concept through ongoing iteration based on the owner's real business needs (new locations, opening-hours changes, spam mitigation, content updates).

**Live site:** https://www.hoerschmiede-boo.ch/

## Project Context

This isn't a demo or tutorial project — it's a live, publicly indexed business site for a real hearing-aid acoustician with an active customer base. Work is scoped and prioritized directly with the business owner, covering everything from UX/design to SEO, spam protection, and legal-compliance content (Swiss data protection / impressum requirements).

## Highlights

- **Custom design system** — hand-built responsive layout (no page-builder or CMS), with a cohesive visual identity, scroll-based reveal animations, and an accessible mobile navigation.
- **Lead generation & spam protection** — contact form integrated with [Web3Forms](https://web3forms.com/) and server-side [hCaptcha](https://www.hcaptcha.com/) verification, replacing an earlier form that was being actively abused by bots.
- **SEO & structured data** — full `LocalBusiness` JSON-LD (address, geo-coordinates, opening hours, aggregate rating, reviews), Open Graph/Twitter meta tags, sitemap, and semantic markup.
- **Privacy-conscious by default** — Google Maps embed loads only after explicit user consent; cookie/consent banner via iubenda; dedicated Datenschutz (privacy policy) and Impressum pages meeting Swiss/EU requirements.
- **Interactive UX details** — image lightbox for directions/location photos, animated stats counters, testimonial slider, and a mobile off-canvas menu.
- **Iterative, requirements-driven delivery** — the site evolves through direct owner feedback: new business locations, updated opening hours, corrected service listings, and design refreshes are shipped incrementally.

## Tech Stack

- **HTML5** — semantic, accessible markup across all pages
- **CSS3** — custom design system (CSS custom properties, responsive grid/flex layouts, no framework dependency)
- **Vanilla JavaScript** — form validation & AJAX submission, scroll animations, mobile nav, lightbox, consent-gated embeds
- **Web3Forms + hCaptcha** — server-verified contact form submission
- **Schema.org / JSON-LD** — structured data for local search and rich results
- **iubenda** — cookie consent management

No build step, bundler, or backend required — deployable as static files to any web host.

## Author

**[Nicolas Kocher](https://www.linkedin.com/in/nicolaskocher/)** — Software Developer

Built and maintained on behalf of Hörschmiede Boo GmbH.
