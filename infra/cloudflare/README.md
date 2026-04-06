# Cloudflare Terraform

This directory manages the minimal Cloudflare resources for this site:

- optional apex DNS (`ahpx.me`) that points to Vercel;
- a proxied placeholder DNS record for `blog.ahpx.me`;
- a redirect rule that sends `https://blog.ahpx.me/` to `https://ahpx.me/posts/`.

The site itself is deployed on Vercel. This Terraform stack manages Cloudflare-side DNS and redirects only.

## Prerequisites

1. Install Terraform CLI.
2. Create a Cloudflare API token.
3. Export the token in your shell:

```bash
export CLOUDFLARE_API_TOKEN="<your-token>"
```

Cloudflare's Terraform v5 docs recommend reading credentials from the `CLOUDFLARE_API_TOKEN` environment variable instead of committing them into `.tf` files.

## Optional local proxy

If provider downloads are slow from this machine, run Terraform through your local proxy:

```bash
export HTTP_PROXY="http://127.0.0.1:7890"
export HTTPS_PROXY="http://127.0.0.1:7890"
export ALL_PROXY="socks5://127.0.0.1:7890"
```


## Install Terraform CLI on macOS

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
terraform version
```

## Suggested token permissions

Use the smallest token that can manage these resources:

- `Zone > DNS > Edit`
- `Zone > Single Redirect > Edit`

Scope the token to the account and zone that contain `ahpx.me`.

## Vercel prerequisite

Add `ahpx.me` as a domain in your Vercel project first. This Terraform stack does not manage Vercel project domains.

## First-time setup

```bash
cd infra/cloudflare
cp terraform.tfvars.example terraform.tfvars
$EDITOR terraform.tfvars
./tf.sh init
./tf.sh plan
```

## Apply

```bash
./tf.sh apply
```

## Important notes about existing resources

- If `manage_root_dns_record = true` and `ahpx.me` already has a DNS record in Cloudflare, import `cloudflare_dns_record.root_to_vercel[0]` before apply.
- If `blog.ahpx.me` already exists as a DNS record, import `cloudflare_dns_record.blog_redirect` before apply.
- Cloudflare manages redirect rules through a phase entry-point ruleset. If you already have redirect rules in the `http_request_dynamic_redirect` phase, import that existing ruleset before apply instead of creating a second one from scratch.

## Import workflow

Use Cloudflare's import guidance or `cf-terraforming` to discover existing resource IDs, then import them into state before the first apply.
