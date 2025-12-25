# 🚀 PHASE 1 QUICK START - TODAY'S TASKS

**Date**: December 26, 2025  
**Phase**: 1/5 - Backend Critical Path  
**Status**: 🟢 ACTIVE  

---

## ⚡ TODAY'S PRIORITY CHECKLIST

### For Backend Lead (2-3 hours)

**TASK 1.1: Create Supabase Project**
```
1. Go to https://app.supabase.com
2. Create new project: "mixclub-prod"
3. Save credentials to secure location
4. Enable required extensions (uuid-ossp, http, pg_net)
5. Enable daily backups
⏱️  Duration: 30 mins
✅ When done: Share database URL + keys with team
```

**TASK 1.2: Run Database Schema SQL**
```
1. Open SQL Editor in Supabase
2. Copy all SQL from PHASE_1_STARTUP_GUIDE.md (TASK 2 section)
3. Run the complete schema script
4. Verify all 14 tables created in Data Editor
5. Check all indexes created
⏱️  Duration: 15 mins
✅ When done: Confirm table creation in Slack
```

### For DevOps Lead (1-2 hours)

**TASK 1.3: Set Up Environment & Security**
```
1. Create .env.local file (git-ignored)
2. Add Supabase credentials:
   VITE_SUPABASE_URL=[from-step-1]
   VITE_SUPABASE_ANON_KEY=[from-step-1]
   
3. Configure CORS in Supabase:
   http://localhost:5173
   http://localhost:3000
   
4. Enable Auth providers:
   - Email/password (default)
   - Google OAuth (needs Google Cloud setup)
   - Apple OAuth (needs Apple developer account)

⏱️  Duration: 1 hour
✅ When done: Test signup at http://localhost:5173/signup
```

### For Finance Lead (45 mins)

**TASK 1.4: Create Stripe Account & Products**
```
1. Go to https://dashboard.stripe.com/register
2. Sign up for Stripe
3. Add bank account for payouts
4. In Products, create "Audio Processing":
   - STARTER: $9/month
   - PRO: $29/month
   - STUDIO: $99/month
   - ENTERPRISE: $999/year

5. Save all Price IDs to shared document:
   STARTER_PRICE_ID=price_xxx
   PRO_PRICE_ID=price_xxx
   STUDIO_PRICE_ID=price_xxx

⏱️  Duration: 45 mins
✅ When done: Share Price IDs with backend team
```

---

## 📋 VERIFICATION CHECKLIST

After completing tasks, verify:

```
✅ Can query Supabase tables
  → SELECT * FROM subscriptions LIMIT 1;

✅ Can insert data into database
  → INSERT into users_extended...

✅ Can sign up at /signup page
  → Fill form and create account

✅ Can see user in Supabase auth.users table
  → Check Authentication → Users

✅ Stripe test products visible
  → https://dashboard.stripe.com/products
```

---

## 🎯 TOMORROW'S TASKS (Day 2)

1. **Backend**: Deploy first Edge Function (checkout)
2. **DevOps**: Set up CI/CD pipeline
3. **QA**: Write first test cases

---

## 🆘 QUICK TROUBLESHOOTING

**Q: Supabase project taking too long to create?**  
A: Normal, can take 2-3 minutes. Keep the page open.

**Q: Can't find SQL Editor in Supabase?**  
A: Click your project name → SQL Editor tab on left

**Q: Google OAuth setup complicated?**  
A: Yes, but optional for Day 1. Can do later. Use email/password for now.

**Q: Stripe test mode vs. live?**  
A: Start in test mode! Settings → Test mode toggle at top

---

## 📞 CONTACT IF STUCK

- **Supabase docs**: https://supabase.com/docs
- **Stripe docs**: https://stripe.com/docs
- **Backend Lead**: [name]
- **DevOps Lead**: [name]

---

## 📊 PROGRESS TRACKING

Update this daily:

```
Day 1 (Dec 26):
- [ ] Supabase created
- [ ] Database tables created  
- [ ] Environment configured
- [ ] Stripe products created
→ Status: ___/4 tasks

Day 2 (Dec 27):
- [ ] Checkout endpoint deployed
- [ ] First payment test successful
- [ ] Webhook receiving events
→ Status: ___/3 tasks

Day 3-5 (Dec 28-30):
- [ ] All endpoints deployed
- [ ] Integration tests passing
- [ ] Security audit clean
→ Status: ___/3 tasks

Week 2 (Jan 2-6):
- [ ] Referral system working
- [ ] Full end-to-end testing
- [ ] Performance acceptable
→ Status: ___/3 tasks

Week 3 (Jan 7-15):
- [ ] All systems deployed to production
- [ ] Monitoring active
- [ ] Phase 1 complete ✅
→ Status: ___/3 tasks
```

---

**START TIME: Now 🚀**

Let's build this!
