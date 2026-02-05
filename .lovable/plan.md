

# Remove Ineffective `frame-ancestors` CSP Directive

## Background

The browser console warns that `frame-ancestors` is ignored when delivered via a `<meta>` element. This directive only works when sent as an HTTP header—placing it in a meta tag has no effect and just creates console noise.

## Current CSP (line 16)

```text
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://cdn.gpteng.co https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://www.paypal.com wss://*.supabase.co ws: wss:; frame-src https://js.stripe.com https://www.paypal.com; frame-ancestors 'self' https://*; media-src 'self' blob: https://*.supabase.co; manifest-src 'self' https://lovable.dev;
```

## Change

Remove the `frame-ancestors 'self' https://*;` segment.

### Updated CSP

```text
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://cdn.gpteng.co https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://www.paypal.com wss://*.supabase.co ws: wss:; frame-src https://js.stripe.com https://www.paypal.com; media-src 'self' blob: https://*.supabase.co; manifest-src 'self' https://lovable.dev;
```

## File to Edit

| File | Action |
|------|--------|
| `index.html` | Remove `frame-ancestors 'self' https://*;` from line 16 |

## Validation

1. Reload the app in preview.
2. Open the browser console.
3. Confirm the `frame-ancestors is ignored` warning no longer appears.

