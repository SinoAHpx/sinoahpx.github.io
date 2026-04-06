variable "zone_id" {
  description = "Cloudflare zone ID for ahpx.me."
  type        = string
}

variable "manage_root_dns_record" {
  description = "When true, Terraform manages the apex DNS record that points to Vercel."
  type        = bool
  default     = false
}

variable "vercel_apex_ip" {
  description = "Vercel apex A record target."
  type        = string
  default     = "76.76.21.21"
}

variable "root_dns_proxied" {
  description = "Whether Cloudflare proxy is enabled for the apex record."
  type        = bool
  default     = false
}

variable "root_domain" {
  description = "Primary domain served by the Vercel project."
  type        = string
  default     = "ahpx.me"
}

variable "blog_domain" {
  description = "Alias domain that should forward visitors to the blog listing."
  type        = string
  default     = "blog.ahpx.me"
}

variable "blog_redirect_target" {
  description = "Absolute destination URL for blog_domain root requests."
  type        = string
  default     = "https://ahpx.me/posts/"
}

variable "redirect_status_code" {
  description = "HTTP status code used by the redirect rule."
  type        = number
  default     = 301

  validation {
    condition     = contains([301, 302, 307, 308], var.redirect_status_code)
    error_message = "redirect_status_code must be one of 301, 302, 307, or 308."
  }
}
