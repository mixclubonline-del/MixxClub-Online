# Contract Expiration Notification Cron Setup

## Overview
This document explains how to set up the automated daily check for expiring contracts with email notifications.

## Prerequisites
- Supabase project with `pg_cron` and `pg_net` extensions enabled ✅
- RESEND_API_KEY secret configured ✅
- Edge functions deployed ✅

## Setup Instructions

### Step 1: Run the Cron Job Setup SQL

Execute the following SQL in your Supabase SQL Editor to schedule the daily contract expiration check:

```sql
-- Schedule the contract expiration check to run daily at 9 AM UTC
SELECT cron.schedule(
  'check-contract-expiration-daily',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://htvmkylgrrlaydhdbonl.supabase.co/functions/v1/trigger-contract-check',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dm1reWxncnJsYXlkaGRib25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTUwODIsImV4cCI6MjA3NDU5MTA4Mn0.peKF6_Gf15ZJCrwlnS2Kizy0tOkJ_9BJxXcs1TGM5Cc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
```

### Step 2: Verify Cron Job Setup

Check that the cron job was created successfully:

```sql
SELECT * FROM cron.job WHERE jobname = 'check-contract-expiration-daily';
```

### Step 3: Test the Function Manually

You can test the contract expiration check immediately by calling:

```sql
SELECT
  net.http_post(
      url:='https://htvmkylgrrlaydhdbonl.supabase.co/functions/v1/trigger-contract-check',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dm1reWxncnJsYXlkaGRib25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTUwODIsImV4cCI6MjA3NDU5MTA4Mn0.peKF6_Gf15ZJCrwlnS2Kizy0tOkJ_9BJxXcs1TGM5Cc"}'::jsonb,
      body:='{"time": "now"}'::jsonb
  ) as request_id;
```

## How It Works

### Notification Thresholds
The system checks for contracts expiring in:
- **30 days** - First reminder
- **7 days** - Second reminder
- **1 day** - Final urgent reminder

### Email Notifications
- Sent to the contact email associated with each enterprise account
- Beautiful HTML-formatted emails with contract details
- Different urgency levels based on days remaining
- Includes CTA button to contact enterprise team

### In-App Notifications
- Creates notifications for all admin users
- Shows contract number, organization name, and days until expiration
- Links directly to the enterprise contracts page

### Duplicate Prevention
- Tracks sent notifications in `contract_expiration_notifications` table
- Only sends one notification per threshold per contract
- Prevents spam even if cron runs multiple times

## Monitoring

### View Sent Notifications
```sql
SELECT 
  cen.*,
  ec.contract_number,
  ea.organization_name,
  ec.end_date
FROM contract_expiration_notifications cen
JOIN enterprise_contracts ec ON cen.contract_id = ec.id
JOIN enterprise_accounts ea ON ec.account_id = ea.id
ORDER BY cen.sent_at DESC
LIMIT 20;
```

### Check Cron Job Execution History
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid FROM cron.job 
  WHERE jobname = 'check-contract-expiration-daily'
)
ORDER BY start_time DESC
LIMIT 10;
```

### View Edge Function Logs
Check the Supabase dashboard:
1. Go to Edge Functions
2. Select `check-contract-expiration` or `trigger-contract-check`
3. View the Logs tab

## Customization

### Change Schedule
To run at a different time, update the cron expression:
- `'0 9 * * *'` - 9 AM UTC daily
- `'0 */6 * * *'` - Every 6 hours
- `'0 8 * * 1'` - 8 AM UTC every Monday

### Change Thresholds
Edit the `thresholds` array in `supabase/functions/check-contract-expiration/index.ts`:
```typescript
const thresholds = [30, 7, 1]; // Change to [60, 30, 14, 7, 1] for more reminders
```

### Customize Email Template
Edit the `generateEmailHTML` function in `supabase/functions/check-contract-expiration/index.ts` to modify:
- Email styling
- Content and messaging
- Contact information
- CTA buttons

## Troubleshooting

### Cron Job Not Running
1. Verify `pg_cron` extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Check for errors:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE status = 'failed'
   ORDER BY start_time DESC;
   ```

### Emails Not Sending
1. Verify RESEND_API_KEY is set correctly
2. Check Resend dashboard for delivery status
3. Verify your domain is validated in Resend
4. Check edge function logs for errors

### No Notifications Generated
1. Verify contracts exist with expiration dates in the target ranges
2. Check that contracts have `status = 'active'`
3. Ensure enterprise accounts have valid contact emails
4. Review the `contract_expiration_notifications` table for existing records

## Cleanup

To remove the cron job:
```sql
SELECT cron.unschedule('check-contract-expiration-daily');
```

To clear notification history:
```sql
TRUNCATE TABLE contract_expiration_notifications;
```
