# Remove Custom Domain Redirect from GitHub Pages

## Problem

Visiting `https://speckit-community.github.io/extensions/` redirects to `https://extensions.speckit-community.com/`. This redirect is caused by a `CNAME` file on the `gh-pages` branch containing `extensions.speckit-community.com`, paired with a custom domain configured in the repository's GitHub Pages settings. The custom domain was likely added by mistake or as a test and is no longer needed.

## Goal

Serve the site at `https://speckit-community.github.io/extensions/` without any redirect. Clean up all artifacts related to the custom domain configuration.

## Approach

Full cleanup across three layers: GitHub Settings, the `gh-pages` branch, and the deploy workflow.

## Design

### 1. Remove custom domain from GitHub Settings (manual)

Navigate to the repository **Settings → Pages → Custom domain**, clear the field, and click **Save**. This is the authoritative source of the redirect — GitHub Pages uses this setting to issue the 301 redirect and to write the CNAME file.

### 2. Delete CNAME from `gh-pages` branch

The `CNAME` file currently exists on the `gh-pages` branch. It must be removed. The next deploy from the workflow will overwrite the branch contents with the `out/` folder (which does not contain a CNAME), effectively removing it. If immediate removal is desired before the next deploy, a manual `git push` to the `gh-pages` branch can delete it.

### 3. Harden the deploy workflow

The `JamesIves/github-pages-deploy-action@v4` used in `deploy.yml` defaults to `clean: true`, which removes files on the target branch that are not in the source folder. However, this action is known to preserve CNAME files by default to avoid breaking custom domain setups.

To prevent re-introduction, add a post-deploy verification step that warns if a CNAME file unexpectedly appears on the `gh-pages` branch:

```yaml
- name: Verify no CNAME on gh-pages
  if: github.event_name != 'pull_request'
  run: |
    git fetch origin gh-pages
    if git show origin/gh-pages:CNAME 2>/dev/null; then
      echo "::warning::Unexpected CNAME file found on gh-pages branch"
    fi
```

### 4. DNS cleanup (informational / out of scope)

If a DNS CNAME record exists pointing `extensions.speckit-community.com` to `speckit-community.github.io`, it should be removed by whoever manages DNS for `speckit-community.com`. A dangling CNAME pointing to GitHub Pages with no matching configuration could be a security concern (subdomain takeover). This step is informational and outside the scope of this repository's changes.

## Changes Required

| Layer | Action | Who |
|-------|--------|-----|
| GitHub Settings → Pages | Clear custom domain field | Repo admin (manual) |
| `gh-pages` branch | Delete `CNAME` file (or let next deploy clean it) | Automated via deploy or manual push |
| `.github/workflows/deploy.yml` | Add optional CNAME verification step | Code change (PR) |
| DNS | Remove `extensions.speckit-community.com` record | DNS admin (manual, out of scope) |

## Out of Scope

- Changes to `next.config.js` — the `basePath: '/extensions'` is correct for GitHub Pages hosting
- Changes to the build process — the `out/` folder correctly omits CNAME
- Any changes to the site content or functionality
