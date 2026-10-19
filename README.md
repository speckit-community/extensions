# SpecKit Extensions Catalog

A web UI for browsing [SpecKit](https://github.com/github/spec-kit) community extensions. The site is statically generated and auto-rebuilds once a day.

## Getting Started

Clone the repository (use a shallow clone to avoid downloading the full `gh-pages` history):

```bash
git clone --depth 5 https://github.com/speckit-community/extensions
```

Initialize the spec-kit submodule:

```bash
git submodule update --init
```

Install dependencies with [pnpm](https://pnpm.io/):

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open <http://localhost:3000> in your browser.

## Building for Production

```bash
pnpm build
```

The static site is output to the `out/` directory.

## How Highlighted Extensions Are Computed

The "Highlighted extensions" shown on the homepage are the top 6 extensions ranked by **live GitHub star count**. At build time the site fetches the `stargazers_count` for each extension's repository from the GitHub API (using `GITHUB_TOKEN` when available) and sorts extensions in descending order of stars, with ties broken alphabetically by name. If a live fetch fails (network error or timeout), the star count from the catalog JSON is used as a fallback.

## Contributing

### Publisher catalog installation instructions

`data/publisher-catalogs.json` lists publisher-maintained installation catalogs
by extension repository. A listed extension shows `specify extension add <id>`
as its primary command, together with the required one-time catalog registration
and an explicit explanation that the default community catalog is discovery-only.
Other extensions retain the direct archive command. Only add a publisher catalog
after checking its entries and release digests; listing it here does not mark an
extension as verified or change the CLI's trust configuration.

The AEE catalog supplies AEE and Evaluator. AEE provisions its Python engine and
composer dependencies on first use and its Evaluator companion on assess/compose.
The publisher catalog must be published before these instructions are deployed.

Contributions are welcome! See the [GitHub issues](https://github.com/speckit-community/extensions/issues) for open tasks.

## License

Licensed under Apache License, Version 2.0 ([LICENSE](LICENSE) or http://www.apache.org/licenses/LICENSE-2.0)
