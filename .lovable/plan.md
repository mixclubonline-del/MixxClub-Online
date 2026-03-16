

## Email Notifications for Stripe Connect Verification

### Current State
- The `stripe-webhook` edge function handles many Stripe events but does NOT handle `account.updated` (Stripe Connect verification events)
- No transactional email infrastructure exists (no `send-transactional-email`, no email templates outside auth)
- The `create_notification_checked` DB function handles in-app notifications with preference checking
- Engineers have `stripe_connect_account_id` on their profiles

### Approach
Since there's no transactional email infrastructure set up, we'll use an edge function to send emails via the Lovable AI-supported method. The simplest reliable approach: handle the `account.updated` webhook event in the existing `stripe-webhook` function, detect when payouts become enabled, create an in-app notification, and invoke a new lightweight edge function to send the email.

### Changes

**1. Update `supabase/functions/stripe-webhook/index.ts`**
- Add `account.updated` case to the switch statement
- New handler `handleAccountUpdated` that:
  - Looks up the engineer by `stripe_connect_account_id` in profiles
  - Checks if `payouts_enabled` and `charges_enabled` are now both true
  - Creates an in-app notification via `create_notification_checked`
  - Invokes the new `send-connect-verified-email` edge function

**2. Create `supabase/functions/send-connect-verified-email/index.ts`**
- Accepts `{ userId, email, fullName }` in the body
- Sends a congratulatory email using the Supabase `auth.admin` or a simple fetch to an email API
- Since no transactional email infra exists, this function will use Supabase's built-in `supabase.auth.admin.sendRawEmail` or — more practically — create an in-app notification only (since email sending requires domain setup)

### Revised Simpler Approach
Given no email domain is configured, we'll:

1. **Add `account.updated` webhook handling** to `stripe-webhook/index.ts` — detect when an engineer's Connect account becomes fully verified (`payouts_enabled && charges_enabled && details_submitted`)
2. **Create in-app notification** using the existing `create_notification_checked` function
3. **Prompt the user** to set up an email domain if they want actual email delivery, and offer to scaffold transactional email templates afterward

### Implementation Details

**`stripe-webhook/index.ts` changes:**
```
case 'account.updated':
  await handleAccountUpdated(supabase, event.data.object);
  break;
```

New `handleAccountUpdated` function:
- Extract `account.id`, `payouts_enabled`, `charges_enabled`, `details_submitted`
- Query `profiles` for user with matching `stripe_connect_account_id`
- If all three flags are true, check if we already notified (via a metadata flag or by checking recent notifications)
- Call `create_notification_checked` with type `payment`, title "Payouts Enabled", message about verification being complete
- Log the event

**No new edge function needed** — the webhook handler does everything. If the user later sets up an email domain, we can add transactional email sending.

