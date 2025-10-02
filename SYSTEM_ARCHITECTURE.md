# MixClub System Architecture

## 🏗️ Architecture Overview

MixClub is a full-stack music production platform built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query + React Context
- **Routing**: React Router v6
- **Mobile**: PWA + Capacitor (iOS/Android ready)

---

## 📁 Project Structure

```
mixclub/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── admin/          # Admin panel components
│   │   ├── crm/            # CRM system components
│   │   ├── collaboration/  # Real-time collaboration
│   │   ├── daw/            # DAW interface components
│   │   ├── mobile/         # Mobile-specific components
│   │   └── layouts/        # Page layouts
│   ├── pages/              # Route pages
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External integrations
│   │   └── supabase/       # Supabase client & types
│   ├── lib/                # Utility functions
│   └── index.css           # Global styles & design tokens
├── supabase/
│   ├── functions/          # Edge Functions (serverless)
│   │   ├── _shared/        # Shared utilities
│   │   ├── chat-*/         # AI chatbot functions
│   │   ├── *-payment*/     # Payment processing
│   │   ├── mastering/      # Audio mastering
│   │   └── ...
│   └── config.toml         # Supabase configuration
└── public/                 # Static assets

```

---

## 🎯 Core Features & Components

### 1. **User Management**
- **Authentication**: Email/password, OAuth (Google), magic links
- **Roles**: Artist, Engineer, Admin
- **Profiles**: Full profile management with avatars, bio, musical preferences
- **Onboarding**: Guided setup for new users

### 2. **CRM System**
Located in `src/pages/ArtistCRM.tsx` and `src/pages/EngineerCRM.tsx`

**Artist Features:**
- Project management
- Engineer discovery (AI-powered matching)
- Job postings
- Payment processing
- Review system

**Engineer Features:**
- Task management
- Job applications
- Earnings tracking
- Payout management
- Badge & achievement system

### 3. **Collaboration Studio**
Located in `src/components/collaboration/`

**Real-Time Features:**
- Live audio streaming
- Video/screen sharing
- Session chat
- Audio mixer controls
- Track synchronization
- Voice commands

### 4. **Payment System**
**Integrations:**
- Stripe (primary)
- PayPal
- Cryptocurrency (Coinbase Commerce)

**Features:**
- Package subscriptions (Mixing, Mastering, Distribution)
- One-time payments
- Engineer payouts
- Revenue tracking
- Automated invoicing

### 5. **Services**

#### **Mixing** (`/mixing-showcase`, `/mixing-studio`)
- Professional mixing services
- AI-powered mixing suggestions
- Real-time collaboration
- Track versioning

#### **Mastering** (`/mastering-showcase`, `/mastering-studio`)
- AI-powered mastering engine
- Platform optimization (Spotify, Apple Music, etc.)
- Reference track comparison
- Instant preview

#### **Distribution** (`/distribution`)
- White-label distribution via multiple partners
- Release management
- Revenue sharing
- Analytics tracking

### 6. **Marketplace** (`/marketplace`, `/merch`)
- Sample packs
- Preset packs
- Merchandise (Printful integration)
- Courses & tutorials

### 7. **Gamification**
- Achievements & badges
- Leaderboards
- Mix battles & tournaments
- Community milestones
- Monthly awards

---

## 🗄️ Database Schema

### Key Tables

#### **User & Profile Management**
- `profiles` - Extended user information
- `user_roles` - Role assignments (artist/engineer/admin)
- `onboarding_profiles` - Onboarding progress
- `musical_profiles` - Musical preferences & skills

#### **Projects & Collaboration**
- `projects` - Music projects
- `audio_files` - Project audio files
- `tasks` - Project tasks for engineers
- `collaboration_sessions` - Real-time sessions
- `session_participants` - Session members
- `audio_streams` - Live audio streams

#### **Jobs & Applications**
- `job_postings` - Job listings by artists
- `job_applications` - Engineer applications
- `saved_jobs` - Bookmarked jobs

#### **Payments & Subscriptions**
- `payments` - All payment records
- `user_mixing_subscriptions` - Mixing package subscriptions
- `user_mastering_subscriptions` - Mastering package subscriptions
- `user_distribution_subscriptions` - Distribution subscriptions
- `engineer_earnings` - Engineer payment tracking
- `stripe_payouts` - Payout records

#### **Reviews & Ratings**
- `project_reviews` - Project reviews
- `engineer_reviews` - Engineer ratings
- `engineer_profiles` - Engineer stats & ratings

#### **Gamification**
- `achievements` - User achievements
- `engineer_badges` - Engineer badges
- `engineer_leaderboard` - Leaderboard rankings
- `monthly_awards` - Monthly winners
- `community_milestones` - Platform milestones

#### **Admin & Analytics**
- `audit_logs` - All system actions
- `admin_alerts` - System alerts
- `revenue_analytics` - Financial tracking
- `system_metrics` - Performance metrics

---

## 🔐 Security

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Users can only access their own data
- Engineers can access assigned projects
- Admins have elevated permissions
- Public data (profiles, engineers) has read access

### Authentication
- JWT-based authentication via Supabase Auth
- Secure session management
- Role-based access control (RBAC)

### Rate Limiting
Implemented in Edge Functions:
- API endpoint protection
- Abuse prevention
- DDoS mitigation

### Data Protection
- Encrypted at rest (PostgreSQL encryption)
- Encrypted in transit (HTTPS/TLS)
- Audit logging for sensitive operations

---

## 🚀 Edge Functions

### AI & Processing
- `chat-simple` - Basic chatbot
- `chat-vercel-ai` - Advanced AI chat
- `admin-chat-enhanced` - Admin AI assistant
- `mastering-chat` - Mastering AI assistant
- `ai-audio-processing` - Audio AI processing
- `analyze-audio` - Audio analysis
- `advanced-mastering` - Mastering service

### Payments
- `create-payment-intent` - Stripe payments
- `stripe-webhook` - Stripe event handling
- `create-paypal-order` - PayPal orders
- `capture-paypal-order` - PayPal capture
- `create-crypto-checkout` - Crypto payments
- `crypto-payment-webhook` - Crypto webhooks
- `create-stripe-payout` - Engineer payouts

### Integrations
- `printful-sync-products` - Sync merch products
- `printful-create-order` - Create merch orders
- `docusign-send-for-review` - Contract signing
- `docusign-webhook` - DocuSign events

### Utilities
- `send-welcome-email` - Onboarding emails
- `send-payment-receipt` - Payment confirmations
- `export-audio` - Audio file exports
- `financial-forecast` - Revenue forecasting
- `generate-financial-insights` - Analytics

---

## 🎨 Design System

### Color Tokens
Defined in `src/index.css`:
- `--primary` - Brand primary color
- `--secondary` - Secondary accent
- `--accent` - Highlight color
- `--background` - Page background
- `--foreground` - Text color
- `--muted` - Muted elements
- `--border` - Border color

### Component Library
Using shadcn/ui components with customization:
- Buttons, Cards, Dialogs
- Forms, Inputs, Selects
- Toasts, Alerts, Badges
- Tables, Tabs, Accordions
- Navigation, Sidebar, Menus

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px, 1536px
- Flexible layouts with CSS Grid & Flexbox
- Mobile-specific components

---

## 📱 Mobile Features

### PWA Support
- Installable app
- Offline functionality
- Push notifications
- App-like experience

### Capacitor Integration
- Native iOS/Android apps
- Camera access
- File system access
- Push notifications
- Native hardware access

### Mobile Optimization
- Touch-optimized UI
- Pull-to-refresh
- Bottom navigation
- Responsive layouts
- Reduced animations

---

## 🔄 State Management

### React Query
- Server state caching
- Automatic refetching
- Optimistic updates
- Background sync

### React Context
- Authentication state (`useAuth`)
- Service access (`useServiceAccess`)
- Collaboration state (`useCollaboration`)
- Mobile detection (`useMobileDetect`)

---

## 🧪 Testing Strategy

### Manual Testing
- Critical user flows
- Payment processing
- Real-time collaboration
- Mobile experience

### Automated Testing (Recommended)
- Unit tests: Vitest
- Integration tests: React Testing Library
- E2E tests: Playwright/Cypress

---

## 📊 Analytics & Monitoring

### Metrics Tracked
- User signups & onboarding
- Project completions
- Revenue & subscriptions
- Engineer performance
- Community milestones

### Admin Dashboard
- Real-time stats
- Financial reports
- User management
- System health

---

## 🚀 Deployment

### Frontend
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy: Automatic via Lovable

### Backend
- Edge Functions: Auto-deployed on save
- Database migrations: Manual approval required
- Secrets: Managed via Supabase dashboard

---

## 🔧 Environment Variables

### Required Secrets
- `STRIPE_SECRET_KEY` - Stripe payments
- `STRIPE_PUBLISHABLE_KEY` - Stripe client
- `OPENAI_API_KEY` - AI features
- `PRINTFUL_API_KEY` - Merch store
- `RESEND_API_KEY` - Email service
- `COINBASE_COMMERCE_API_KEY` - Crypto payments
- `SUPABASE_SERVICE_ROLE_KEY` - Backend operations

### Supabase Config
- Project ID: `htvmkylgrrlaydhdbonl`
- Anon Key: (in code)
- Service Role: (secret)

---

## 🐛 Common Issues & Solutions

### Toast Import Errors
**Issue**: Import from old path
**Fix**: Use `@/hooks/use-toast` instead of `@/components/ui/use-toast`

### Page Reload on Navigation
**Issue**: Using `<a>` tags
**Fix**: Use React Router `<Link>` or `navigate()`

### Auth Redirect Loops
**Issue**: Missing auth checks
**Fix**: Verify `useAuth()` hook usage

### RLS Policy Errors
**Issue**: Missing permissions
**Fix**: Check RLS policies in Supabase

---

## 📈 Future Enhancements

### Phase 1: Core Improvements
- [ ] Real-time DAW collaboration (in progress)
- [ ] Advanced AI mastering
- [ ] Mobile app release

### Phase 2: Marketplace Expansion
- [ ] Course platform
- [ ] Plugin marketplace
- [ ] Sample library expansion

### Phase 3: Social Features
- [ ] User following system
- [ ] Public profiles
- [ ] Community forums

### Phase 4: Advanced Features
- [ ] AI voice synthesis
- [ ] Automated mixing
- [ ] Multi-language support

---

## 📞 Support & Resources

- **Documentation**: `docs/`
- **API Reference**: Supabase dashboard
- **Design System**: shadcn/ui docs
- **Community**: Discord (coming soon)

---

## 👥 Team Roles

- **Artists**: Create projects, hire engineers
- **Engineers**: Complete projects, earn rewards
- **Admins**: Manage platform, monitor health

---

## 🎯 Success Metrics

- **User Growth**: 1000+ users in beta
- **Project Completion Rate**: 85%+
- **Engineer Satisfaction**: 4.5+ stars
- **Platform Stability**: 99.9% uptime
- **Revenue Growth**: Month-over-month growth

---

Last Updated: 2025-01-15
Version: 1.0.0
