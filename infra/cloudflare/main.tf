resource "cloudflare_dns_record" "root_to_vercel" {
  count   = var.manage_root_dns_record ? 1 : 0
  zone_id = var.zone_id
  name    = var.root_domain
  type    = "A"
  content = var.vercel_apex_ip
  ttl     = 1
  proxied = var.root_dns_proxied
  comment = "Apex DNS for Vercel project."
}

resource "cloudflare_dns_record" "blog_redirect" {
  zone_id = var.zone_id
  name    = var.blog_domain
  type    = "A"
  content = "192.0.2.1"
  ttl     = 1
  proxied = true
  comment = "Placeholder proxied record for Cloudflare redirect handling."
}

resource "cloudflare_ruleset" "blog_redirect" {
  zone_id     = var.zone_id
  name        = "blog-subdomain-redirect"
  description = "Redirect the blog alias root to the main site's posts page."
  kind        = "zone"
  phase       = "http_request_dynamic_redirect"

  rules = [
    {
      ref         = "blog_root_to_posts"
      description = "Redirect blog.ahpx.me/ to ahpx.me/posts/."
      expression  = "(http.host eq \"${var.blog_domain}\" and http.request.uri.path eq \"/\")"
      action      = "redirect"
      action_parameters = {
        from_value = {
          status_code           = var.redirect_status_code
          preserve_query_string = true
          target_url = {
            value = var.blog_redirect_target
          }
        }
      }
    }
  ]
}
