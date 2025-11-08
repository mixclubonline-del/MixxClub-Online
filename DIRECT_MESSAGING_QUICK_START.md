# Direct Messaging - Quick Start Guide

## 🚀 Getting Started

### Step 1: Deploy Database Schema

```bash
# Run the Supabase migration
supabase migration up

# Or manually execute in Supabase SQL editor:
# Copy contents of: /supabase/migrations/20251107_create_direct_messages.sql
# Paste into Supabase SQL editor and execute
```

### Step 2: Test in Development

```bash
# Start development server
npm run dev

# Navigate to CRM
# Artist: http://localhost:5173/artist-crm?tab=messages
# Engineer: http://localhost:5173/engineer-crm?tab=messages
```

### Step 3: Send First Message

1. Log in as Artist account
2. Click "Messages" in sidebar
3. Click on an engineer name
4. Type a message
5. Press Enter or click Send button
6. Log in as Engineer account in another tab
7. Click "Messages" tab
8. See message from artist appears in real-time!

---

## 💬 Using Direct Messaging

### Sending a Message

1. Open Messages tab in CRM
2. Click on a conversation in the left panel (or search for user)
3. Type your message in the input field at bottom
4. Press Enter or click Send
5. Message appears in conversation immediately

### Attaching Files

1. Click the paperclip icon in message input
2. Select file from computer
3. File shows in preview below input
4. Type optional message text
5. Click Send
6. File appears as downloadable link in message

### Managing Conversations

- **Search**: Type name in search box to filter conversations
- **Unread**: Red badge shows unread message count
- **Read Receipt**: ✓✓ indicator shows message was read
- **Timestamps**: Hover over messages to see exact time sent

### Mobile Usage

- Full responsive design works on mobile
- Conversation list collapses on narrow screens
- Touch-friendly buttons and scroll areas
- File download works on mobile browsers

---

## 🔧 Architecture Reference

### File Structure

```
src/
├── hooks/
│   └── useDirectMessaging.ts (244 lines)
│       ├── fetchConversations()
│       ├── fetchConversationMessages(recipientId)
│       ├── sendMessage({ recipientId, messageText, fileUrl })
│       ├── markAsRead(messageIds)
│       └── Real-time subscriptions
├── components/
│   └── crm/
│       └── DirectMessaging.tsx (358 lines)
│           ├── Conversation list (search, unread count)
│           ├── Message view (full thread, timestamps)
│           └── Message input (text, file attachments)
└── pages/
    ├── ArtistCRM.tsx (updated)
    │   └── Added: case 'messages': return <DirectMessaging userType="artist" />
    └── EngineerCRM.tsx (updated)
        └── Added: case 'messages': return <DirectMessaging userType="engineer" />

supabase/
└── migrations/
    └── 20251107_create_direct_messages.sql
        ├── Table: direct_messages
        ├── Indexes for performance
        ├── RLS policies for security
        └── Helper functions
```

### Data Model

```typescript
DirectMessage {
  id: UUID
  sender_id: UUID
  recipient_id: UUID
  message_text: string
  file_url?: string
  file_name?: string
  created_at: timestamp
  read_at?: timestamp
}

Conversation {
  id: string
  other_user: {
    id: UUID
    display_name: string
    avatar_url?: string
  }
  last_message_text: string
  last_message_time: timestamp
  unread_count: number
}
```

---

## 🔐 Security Features

### Row Level Security (RLS)

- ✅ Users can ONLY see their own messages (as sender or recipient)
- ✅ INSERT: Verified sender_id must match authenticated user
- ✅ UPDATE: Users can only mark their received messages as read
- ✅ DELETE: Users can only delete their sent messages

### Data Validation

- ✅ Message requires text OR file (not empty)
- ✅ Sender must not equal recipient (no self-messaging)
- ✅ Timestamps auto-managed (no tampering)
- ✅ File URLs must be valid

### Privacy

- ✅ Messages not exposed in list preview
- ✅ Only last message snippet shown
- ✅ Read receipts don't leak content
- ✅ Deleted messages permanently removed

---

## 🚀 Performance Optimization

### Database Indexes

- Conversation queries: O(1) lookup
- Unread count: O(1) with filter
- Message history: O(log n) with composite index

### Real-time Updates

- Single Supabase subscription channel
- Server-side filtering (only user's messages)
- Auto-cleanup on component unmount
- No memory leaks

### Client-side Optimization

- Conversation list caches user profiles
- Messages lazy-loaded when clicked
- Auto-scroll to latest message
- Debounced search for large conversation lists

---

## 🐛 Troubleshooting

### Messages Not Sending

**Problem**: Message input disabled after click
**Solution**:

1. Check browser console for errors
2. Verify user is authenticated
3. Ensure recipient exists in profiles table
4. Check Supabase RLS policies are enabled

### Messages Not Appearing

**Problem**: Message sent but doesn't show up
**Solution**:

1. Refresh browser page
2. Check Supabase subscription status
3. Verify RLS policies allow recipient to view
4. Check message wasn't deleted

### File Not Downloading

**Problem**: File link shows but download fails
**Solution**:

1. Verify file URL is valid and accessible
2. Check CORS settings in Supabase storage
3. Try different browser or incognito mode
4. Check file hasn't been deleted from storage

### Conversations Not Loading

**Problem**: Empty conversation list
**Solution**:

1. Check if user has had any conversations
2. Verify database migration executed successfully
3. Check authentication token is valid
4. Clear browser cache and reload

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

- Message send success rate
- Average response time per message
- File attachment usage
- Read receipt rate
- Active conversation count per user

### Debugging

```typescript
// Enable debug logging in useDirectMessaging
const { conversations, messages, error } = useDirectMessaging();
console.log('Conversations:', conversations);
console.log('Error:', error);
```

### Performance Profiling

- Monitor Supabase query times
- Check component re-render frequency
- Profile real-time subscription performance
- Test with large message histories (1000+ messages)

---

## 🔄 Integration Points

### Next Feature Dependencies

All these features are now enabled:

1. **Phase 2: Collaborative Earnings Dashboard**
   - Links messages to revenue data
   - Shows "Messages about this project"
   - Tracks financial relationship

2. **Phase 3: Unified Project Board**
   - Shows projects discussed in messages
   - Real-time status in messages
   - Milestone tracking

3. **Notifications System**
   - Alert on new messages
   - Unread count badge
   - Toast notifications

4. **Message Search**
   - Full-text search across messages
   - Filter by user, date, file type
   - Message search history

---

## 📚 API Reference

### useDirectMessaging Hook

```typescript
const {
  conversations,      // Array<Conversation>
  messages,          // Array<DirectMessage>
  loading,           // boolean
  error,             // string | null
  
  fetchConversations,              // () => Promise<void>
  fetchConversationMessages,       // (recipientId: string) => Promise<DirectMessage[]>
  sendMessage,                     // (params) => Promise<boolean>
  markAsRead                       // (messageIds: string[]) => Promise<boolean>
} = useDirectMessaging();
```

### DirectMessaging Component Props

```typescript
interface DirectMessagingProps {
  userType: 'artist' | 'engineer';
  preselectedUserId?: string;
}
```

---

## ✅ Pre-Launch Checklist

- [ ] Database migration executed in production
- [ ] RLS policies verified working
- [ ] Two test accounts created (artist + engineer)
- [ ] Test message sending between accounts
- [ ] Test file attachment upload/download
- [ ] Test read receipts
- [ ] Verify mobile responsiveness
- [ ] Test with slow internet connection
- [ ] Verify error messages display properly
- [ ] Load test with multiple conversations
- [ ] Check timestamp accuracy
- [ ] Monitor Supabase query performance

---

## 🎯 Success Criteria

- ✅ Messages send and receive in real-time (< 1 sec)
- ✅ Conversations persist across sessions
- ✅ Read receipts work correctly
- ✅ File attachments upload/download reliably
- ✅ UI is responsive on all devices
- ✅ No unhandled errors in console
- ✅ Proper error messages display to users
- ✅ RLS prevents unauthorized data access

---

## 🚀 Next Steps

1. **Deploy database migration** to production
2. **Test in production environment** with real users
3. **Gather user feedback** on messaging experience
4. **Monitor performance metrics** over first week
5. **Build Phase 2: Collaborative Earnings Dashboard**
6. **Build Phase 3: Unified Project Board**
7. **Add notifications system**
8. **Implement message search**

---

## 💡 Tips & Best Practices

1. **Performance**: Don't load full message history on mount (lazy load)
2. **Security**: Always validate recipient exists before sending
3. **UX**: Show typing indicator (future enhancement)
4. **Retention**: Archive old messages after 1 year (optional)
5. **Moderation**: Flag inappropriate messages (future feature)
6. **Spam**: Rate limit messages per user (future feature)
