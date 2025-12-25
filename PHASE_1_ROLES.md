# 👥 PHASE 1 - ROLE-BASED QUICK REFERENCE

Each team member should read their section and bookmark the relevant documents.

---

## 🔧 FOR BACKEND LEAD

**Your Responsibility**: Database design, API architecture, core systems

### TODAY (Dec 26)
```
9:00 AM - Create Supabase project
10:00 AM - Run SQL schema
11:00 AM - Verify tables & indexes
12:00 PM - Share credentials with team
```

**Key Documents:**
- [PHASE_1_STARTUP_GUIDE.md](PHASE_1_STARTUP_GUIDE.md) - Main reference
- [PHASE_1_TODAY.md](PHASE_1_TODAY.md) - Today's checklist
- [ACTION_PLAN_COMPLETE.md](ACTION_PLAN_COMPLETE.md) - Full timeline

**Week 1 Tasks (5 days):**
- Task 1: Create Supabase ✅ (TODAY)
- Task 2: Run SQL schema ✅ (TODAY)
- Task 3: Configure Auth (Dec 27)
- Task 4: Stripe config (Dec 27)

**Week 2 Tasks (5 days):**
- Task 5: Payment endpoints
- Task 6: Webhook handler
- Task 7: Usage management

**Week 3 Tasks (5 days):**
- Task 8: Referral system
- Task 9: Testing & deployment

**Key Success Metrics:**
- [ ] All SQL tables created
- [ ] Stripe test payment successful
- [ ] All endpoints deployed
- [ ] Security audit passed
- [ ] 99%+ uptime in testing

**Tools You'll Use:**
- Supabase (https://app.supabase.com)
- Stripe Dashboard (https://dashboard.stripe.com)
- GitHub (source control)
- Sentry (error tracking)

**Daily Standups At**: 9 AM (with team)

---

## 🚀 FOR DEVOPS LEAD

**Your Responsibility**: Infrastructure, deployment, monitoring, security

### TODAY (Dec 26)
```
1:00 PM - Set up .env.local
1:30 PM - Configure Supabase CORS
2:00 PM - Test signup page
2:30 PM - Document setup
```

**Key Documents:**
- [PHASE_1_STARTUP_GUIDE.md](PHASE_1_STARTUP_GUIDE.md) - Task 3 (Auth setup)
- [PHASE_1_TODAY.md](PHASE_1_TODAY.md) - Today's checklist
- [phase1-deploy.sh](phase1-deploy.sh) - Deployment automation

**Week 1 Tasks:**
- Task 1-4: Infrastructure setup (Backend Lead + You)
- Deploy environment variables
- Configure CI/CD pipeline
- Set up monitoring dashboards

**Week 2-3 Tasks:**
- Deploy Edge Functions (use phase1-deploy.sh)
- Monitor deployment logs
- Handle performance optimization
- Set up alerts

**Key Configuration Files to Create:**
```
.env.local (git-ignored):
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=

.env.backend:
  SUPABASE_SERVICE_ROLE_KEY=
  DATABASE_URL=
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
```

**Deployment Commands:**
```bash
# Deploy all functions (Week 2)
./phase1-deploy.sh

# Monitor logs
supabase functions list
supabase functions logs checkout

# Test locally
supabase functions serve
```

**Monitoring Checklist:**
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Database performance
- [ ] API response times
- [ ] Webhook processing

---

## 💰 FOR FINANCE/OPS LEAD

**Your Responsibility**: Stripe setup, payment configuration, financial tracking

### TODAY (Dec 26)
```
2:00 PM - Create Stripe account
2:30 PM - Add bank account
3:00 PM - Create 3 subscription products
3:30 PM - Share Price IDs with Backend
```

**Key Documents:**
- [PHASE_1_STARTUP_GUIDE.md](PHASE_1_STARTUP_GUIDE.md) - Task 4 (Stripe setup)
- [PHASE_1_TODAY.md](PHASE_1_TODAY.md) - Today's checklist
- [ACTION_PLAN_COMPLETE.md](ACTION_PLAN_COMPLETE.md) - Revenue projections (page 20+)

**Products to Create in Stripe:**
```
1. STARTER ($9/month)
   - 10 tracks/month
   - Basic features

2. PRO ($29/month)
   - 100 tracks/month
   - Advanced features

3. STUDIO ($99/month)
   - Unlimited tracks
   - All features

4. ENTERPRISE ($999/year - create later)
   - Custom features
```

**Price IDs to Save:**
```
Document these and share with Backend Lead:
STARTER_PRICE_ID=price_xxx
PRO_PRICE_ID=price_xxx
STUDIO_PRICE_ID=price_xxx
ENTERPRISE_PRICE_ID=price_xxx
```

**Week 1 Setup:**
- [ ] Stripe account created
- [ ] Bank account added
- [ ] 3 products created
- [ ] Webhook secret saved
- [ ] Test API keys ready

**Week 2 Verification:**
- [ ] Test payment successful
- [ ] Webhook receiving events
- [ ] Invoice generation working
- [ ] Payout schedule confirmed

**Financial Dashboard (Later):**
- Daily revenue tracking
- Customer acquisition cost
- Lifetime value analysis
- Churn monitoring

---

## 🧪 FOR QA ENGINEER

**Your Responsibility**: Testing, quality assurance, bug reporting

### WEEK 1 (Starts after infrastructure ready)
```
- Database table verification
- Schema validation
- Security RLS testing
```

**Key Documents:**
- [PHASE_1_STARTUP_GUIDE.md](PHASE_1_STARTUP_GUIDE.md) - Task 9 (Testing checklist)
- [PHASE_1_TODAY.md](PHASE_1_TODAY.md) - Status tracking

**Testing Timeline:**

**Week 2 (Payment endpoints)**
- [ ] Stripe test card accepted
- [ ] Subscription created in DB
- [ ] Webhook events received
- [ ] Invoice generated
- [ ] Error handling tested
- [ ] Edge cases tested

**Week 3 (Referral system)**
- [ ] Code generation working
- [ ] Code validation correct
- [ ] Reward calculation accurate
- [ ] End-to-end referral flow

**Test Scenarios to Create:**
```
Payment Flow:
1. User signs up
2. Selects plan
3. Enters card info
4. Payment successful
5. Subscription active in DB
6. Email sent
7. Dashboard updated

Referral Flow:
1. User generates code
2. Share code with friend
3. Friend signs up with code
4. Both get $10 credit
5. Referrer sees stats
6. Credits appear in account
```

**Test Card Numbers (Stripe Test Mode):**
```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Amex: 3782 822463 10005
Exp: Any future date
CVC: Any 3 digits
```

**Bug Reporting Template:**
```
Title: [Component] Issue description
Steps to Reproduce:
1. ...
2. ...
Expected: 
Actual: 
Environment: [Dev/Test/Staging]
Severity: [Critical/High/Medium/Low]
```

---

## 👨‍💻 FOR FRONTEND DEVELOPER

**Your Responsibility**: Integration with backend APIs, UI testing

### WEEK 2-3 (After endpoints deployed)
```
- Integrate payment endpoints
- Test payment UI flows
- Verify success/error states
```

**Key Documents:**
- [PHASE_1_STARTUP_GUIDE.md](PHASE_1_STARTUP_GUIDE.md) - API endpoints section
- [ACTION_PLAN_COMPLETE.md](ACTION_PLAN_COMPLETE.md) - Phase 2 (Website Integration)

**Integration Tasks (Week 2):**
- Connect /checkout endpoint
- Handle Stripe response
- Show loading states
- Handle errors
- Redirect on success

**Component Updates Needed:**
- Pricing page → add checkout button
- Account settings → add payment method form
- Dashboard → show subscription status
- Referral page → show referral dashboard

**API Endpoints to Integrate:**
```
POST /checkout
  Request: { priceId, userId, successUrl, cancelUrl }
  Response: { sessionId, url }

GET /usage
  Request: Authorization header
  Response: { tracks_processed, storage_used, ... }

POST /referral?action=generate
  Request: Authorization header
  Response: { code, reward_value, ... }

POST /referral?action=join
  Request: { code }
  Response: { success, message }

GET /referral?action=stats
  Request: Authorization header
  Response: { totalReferred, totalEarned, ... }
```

**Test Checklist:**
- [ ] Payment flow works
- [ ] Error handling works
- [ ] Loading states display
- [ ] Success redirects correct
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## 📊 FOR PRODUCT MANAGER

**Your Responsibility**: Roadmap, prioritization, metrics

### PHASE 1 Monitoring
- Track daily progress
- Update stakeholders
- Handle blockers
- Ensure team stays on track

**Key Documents:**
- [ACTION_PLAN_COMPLETE.md](ACTION_PLAN_COMPLETE.md) - Complete roadmap
- [PHASE_1_STARTED.md](PHASE_1_STARTED.md) - Current status
- [PHASE_1_TODAY.md](PHASE_1_TODAY.md) - Daily checklist

**Daily Check-ins:**
- 9 AM: Team standup (15 min)
- 4 PM: Status update (5 min)
- Ask: What was completed? What's blocking? Do we need help?

**Weekly Check-ins:**
- End of Week 1: Database + Auth complete?
- End of Week 2: Payments working?
- End of Week 3: All systems tested?

**Metrics to Track:**
```
Week 1:
- Supabase project created ✅ or 🔴
- Database tables created ✅ or 🔴
- Auth configured ✅ or 🔴

Week 2:
- Payment endpoint deployed ✅ or 🔴
- Test payment successful ✅ or 🔴
- Webhooks receiving ✅ or 🔴

Week 3:
- All endpoints working ✅ or 🔴
- Tests passing ✅ or 🔴
- Ready for Phase 2 ✅ or 🔴
```

**Risk Watch:**
- Stripe integration delays?
- Database performance issues?
- Team blockers?
- Timeline slipping?

---

## 🎯 FOR EVERYONE

### Daily Standup (9 AM)
**Format: 5 minutes max**
```
Each person:
1. What did I complete yesterday?
2. What will I complete today?
3. What's blocking me?

Example:
"Yesterday: Created Supabase project
Today: Running SQL schema
Blockers: None"
```

### Weekly Summary (Friday 4 PM)
- What was completed this week?
- What's ready for next week?
- Metrics summary
- Any risks?

### Communication Channels
- **Urgent**: Slack DM
- **Questions**: Slack #phase1 channel
- **Documentation**: Update docs with findings
- **Issues**: Create GitHub issue
- **Meeting**: Schedule with Backend Lead

### Tools Access Checklist
```
Each team member should have:
- [ ] GitHub repo access
- [ ] Supabase account access
- [ ] Stripe dashboard access
- [ ] Slack channel access
- [ ] 1Password (for secrets)
- [ ] Linear/Jira board access
```

### Secrets Management
**NEVER commit to GitHub:**
- Stripe keys
- Supabase keys
- API keys
- Database passwords

**Store in:**
- 1Password (team vault)
- .env.local (git-ignored)
- Supabase Secrets (built-in)

---

## 📅 QUICK REFERENCE - THIS WEEK

| Day | Backend | DevOps | Finance | QA | Frontend |
|-----|---------|--------|---------|----|----|
| **Dec 26** | Create Supabase ✅ | .env setup ✅ | Stripe account ✅ | Setup | Docs review |
| **Dec 27** | SQL schema ✅ | CORS config ✅ | Products created ✅ | Setup | Docs review |
| **Dec 28** | Auth config ✅ | Test signup ✅ | Webhook setup ✅ | Start tests | Prep |
| **Dec 29** | Stripe integration | Monitoring | Bank verified | Continue | Prep |
| **Dec 30** | Integration testing | Deploy prep | Finalize setup | Complete | Stand by |

---

## 🚀 LAUNCH COMMAND

When everything is ready:

```bash
# From project root
./phase1-deploy.sh
```

This deploys all Edge Functions and gets the backend live!

---

**Questions?** Slack #phase1 or DM your role's lead.

**Let's ship it! 🚀**
