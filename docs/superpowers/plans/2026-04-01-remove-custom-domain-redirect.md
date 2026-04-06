# Remove Custom Domain Redirect — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the redirect from `speckit-community.github.io/extensions/` to `extensions.speckit-community.com/` and clean up all custom domain artifacts.

**Architecture:** Three-layer cleanup — remove the custom domain from GitHub Settings (manual), delete the CNAME from the `gh-pages` branch, and harden the deploy workflow with a verification step to prevent re-introduction.

**Tech Stack:** GitHub Pages, GitHub Actions (`JamesIves/github-pages-deploy-action@v4`), `gh` CLI

---

### Task 1: Remove custom domain from GitHub repository settings

This is a manual step performed via the GitHub UI or `gh` CLI.

**Files:** None (GitHub Settings change)

- [ ] **Step 1: Remove the custom domain via `gh` CLI**

Run:

```bash
gh api --method PUT repos/speckit-community/extensions/pages \
  -f cname="" \
  -F https_enforced=true \
  -f build_type="legacy" \
  -f source='{"branch":"gh-pages","path":"/"}'
```

Expected: HTTP 204 or 200 — the custom domain field is cleared.

- [ ] **Step 2: Verify the custom domain is removed**

Run:

```bash
gh api repos/speckit-community/extensions/pages --jq '.cname'
```

Expected: `null` or empty string — confirms no custom domain is configured.

---

### Task 2: Delete the CNAME file from the `gh-pages` branch

Remove the orphaned CNAME file that causes the redirect.

**Files:**
- Delete: `CNAME` on the `gh-pages` branch

- [ ] **Step 1: Check out `gh-pages`, delete CNAME, and push**

Run:

```bash
git fetch origin gh-pages
git checkout gh-pages
git rm CNAME
git commit -m "fix: remove custom domain CNAME to restore github.io hosting

The CNAME was causing a redirect from speckit-community.github.io/extensions/
to extensions.speckit-community.com which is no longer needed.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin gh-pages
git checkout -
```

Expected: The CNAME file is removed from `gh-pages` and pushed to origin.

- [ ] **Step 2: Verify the CNAME is gone**

Run:

```bash
git fetch origin gh-pages
git show origin/gh-pages:CNAME 2>/dev/null && echo "FAIL: CNAME still exists" || echo "OK: CNAME removed"
```

Expected: `OK: CNAME removed`

---

### Task 3: Add CNAME verification step to deploy workflow

Add a post-deploy check in the GitHub Actions workflow that warns if a CNAME file appears on `gh-pages` after deployment.

**Files:**
- Modify: `.github/workflows/deploy.yml:66-71` (add step after the deploy step)

- [ ] **Step 1: Add the verification step to `deploy.yml`**

Edit `.github/workflows/deploy.yml` — append this step after the existing "Deploy to GitHub Pages" step (after line 71):

```yaml

      - name: Verify no custom domain CNAME on gh-pages
        if: github.event_name != 'pull_request'
        run: |
          git fetch origin gh-pages
          if git show origin/gh-pages:CNAME 2>/dev/null; then
            echo "::error::Unexpected CNAME file found on gh-pages branch. This will cause a redirect away from speckit-community.github.io/extensions/. Remove it from GitHub Settings → Pages → Custom domain."
            exit 1
          else
            echo "✓ No CNAME file on gh-pages — site will be served at speckit-community.github.io/extensions/"
          fi
```

The full deploy.yml after the edit should look like:

```yaml
name: Build and Deploy
on:
  schedule:
    - cron: '0 6 * * *' # Daily at 06:00 UTC
  push:
    branches:
      - 'main'
  workflow_dispatch:
    inputs:
      catalogCommitHash:
        description: 'Commit hash of the spec-kit repository to use as the source for the build'
        type: string
  workflow_call:
    inputs:
      basePath:
        description: 'Base path for the build, see https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath'
        type: string
      catalogCommitHash:
        description: 'Commit hash of the spec-kit repository to use as the source for the build'
        type: string
permissions:
  contents: write
  pull-requests: write
jobs:
  build-and-deploy:
    concurrency: ci-${{ github.ref }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          submodules: true

      - name: Install pnpm
        uses: pnpm/action-setup@v5

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install required packages
        run: pnpm install --frozen-lockfile

      - name: Update spec-kit submodule to latest
        if: ${{ !inputs.catalogCommitHash }}
        working-directory: data/spec-kit
        run: |
          git fetch origin main
          git checkout origin/main

      - name: Update spec-kit submodule to specific commit
        if: ${{ inputs.catalogCommitHash }}
        working-directory: data/spec-kit
        run: |
          git fetch origin ${{ inputs.catalogCommitHash }}
          git checkout ${{ inputs.catalogCommitHash }}

      - name: Build
        run: pnpm run build
        env:
          NEXT_PUBLIC_BASE_PATH: ${{ inputs.basePath || '/extensions' }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy to GitHub Pages
        if: github.event_name != 'pull_request'
        uses: JamesIves/github-pages-deploy-action@v4
        with:
            folder: out

      - name: Verify no custom domain CNAME on gh-pages
        if: github.event_name != 'pull_request'
        run: |
          git fetch origin gh-pages
          if git show origin/gh-pages:CNAME 2>/dev/null; then
            echo "::error::Unexpected CNAME file found on gh-pages branch. This will cause a redirect away from speckit-community.github.io/extensions/. Remove it from GitHub Settings → Pages → Custom domain."
            exit 1
          else
            echo "✓ No CNAME file on gh-pages — site will be served at speckit-community.github.io/extensions/"
          fi
```

- [ ] **Step 2: Validate the YAML syntax**

Run:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml')); print('YAML valid')"
```

Expected: `YAML valid`

- [ ] **Step 3: Commit the workflow change**

Run:

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add CNAME verification step to prevent custom domain redirect

Fails the deploy workflow if a CNAME file is found on gh-pages after
deployment, preventing accidental redirects away from
speckit-community.github.io/extensions/.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Expected: Clean commit with only `deploy.yml` changed.

---

### Task 4: Verify the redirect is gone

End-to-end verification that the site is served correctly.

**Files:** None

- [ ] **Step 1: Check that GitHub Pages serves the site without redirect**

Run:

```bash
curl -sI https://speckit-community.github.io/extensions/ | head -20
```

Expected: HTTP 200 (not a 301/302 redirect to `extensions.speckit-community.com`).

**Note:** GitHub Pages may take a few minutes to propagate the change. If you still see a redirect, wait 5-10 minutes and retry.

- [ ] **Step 2: Verify the custom domain URL no longer resolves**

Run:

```bash
curl -sI https://extensions.speckit-community.com/ | head -5
```

Expected: Connection error or 404 — the custom domain should no longer resolve to this site. (Full DNS cleanup is out of scope but this confirms the GitHub side is clean.)

---

### Task 5: Informational — DNS cleanup reminder

This task is a reminder, not a code change.

- [ ] **Step 1: Notify DNS admin**

If someone on the team manages DNS for `speckit-community.com`, notify them to remove the CNAME record for `extensions.speckit-community.com` pointing to `speckit-community.github.io`. A dangling DNS record pointing to GitHub Pages with no matching configuration is a subdomain takeover risk.

No code changes required.
