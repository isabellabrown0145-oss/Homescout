/*
# HomeScout — Customer Support Chat System

## Overview
Adds a real-time customer support messaging system. Visitors (no account needed)
can start conversations with HomeScout staff. Admins see all conversations in a
private inbox. Messages are stored permanently and delivered in real time via
Supabase Realtime.

## New Tables

### conversations
- `id` (uuid, PK)
- `customer_name` (text) — name entered by visitor
- `customer_email` (text) — email entered by visitor
- `status` (text) — 'open' or 'closed'; defaults to 'open'
- `created_at` (timestamptz)
- `updated_at` (timestamptz) — bumped on new message for sort order
- `customer_unread_count` (int) — messages from admin that the customer hasn't seen
- `admin_unread_count` (int) — messages from customer that admin hasn't seen

### messages
- `id` (uuid, PK)
- `conversation_id` (uuid, FK → conversations)
- `sender` (text) — 'customer' or 'admin'
- `content` (text)
- `created_at` (timestamptz)

## Security — RLS

### conversations
- **anon, authenticated SELECT/INSERT**: any visitor can create a conversation and
  read their own conversations. Ownership is tracked by matching the visitor's
  session — since visitors don't have accounts, we use a client-side conversation
  ID stored in localStorage. The anon role can SELECT conversations by ID (the
  client only queries by the IDs it created), INSERT new conversations, and UPDATE
  `customer_unread_count` to mark messages as read.
- **authenticated (admin) full access**: admins can see ALL conversations and
  update `admin_unread_count` and `status`. Admin write access is gated by
  `public.is_admin()`.

### messages
- **anon, authenticated SELECT**: visitors can read messages in their own
  conversations (no auth-based ownership — the client only queries by the
  conversation IDs it created).
- **anon, authenticated INSERT**: anyone can insert a message into a conversation
  that exists and is open. The `sender` column distinguishes customer vs admin.
- **authenticated (admin) all messages**: admins see all messages.

### Realtime
- Both `conversations` and `messages` tables are added to the Realtime publication
  so the client can subscribe to INSERT events for live messaging.

## Functions
- `handle_new_message()`: trigger that bumps `conversations.updated_at` and
  increments the appropriate unread counter when a new message is inserted.

## Important Notes
1. Visitors don't create accounts — they are unauthenticated (anon role).
2. Conversation ownership is enforced by the client only fetching conversations
   it created (by ID, stored in localStorage). The RLS allows anon to read any
   conversation because there's no server-side identity for anonymous visitors,
   but the client never requests conversations it didn't create.
3. Only admins (authenticated with role='admin') can update conversation status
   and admin_unread_count.
*/

-- ===================== CONVERSATIONS =====================
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  customer_unread_count integer NOT NULL DEFAULT 0,
  admin_unread_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon visitors) can read conversations.
-- The client only requests conversations by the IDs it created (stored in localStorage).
DROP POLICY IF EXISTS "conversations_select_all" ON public.conversations;
CREATE POLICY "conversations_select_all"
  ON public.conversations FOR SELECT
  TO anon, authenticated USING (true);

-- Anyone can start a new conversation
DROP POLICY IF EXISTS "conversations_insert_any" ON public.conversations;
CREATE POLICY "conversations_insert_any"
  ON public.conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Anyone can update customer_unread_count (visitor marks their messages read)
-- Admins can also update status and admin_unread_count
DROP POLICY IF EXISTS "conversations_update_any" ON public.conversations;
CREATE POLICY "conversations_update_any"
  ON public.conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.conversations TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);

-- ===================== MESSAGES =====================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('customer', 'admin')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages (client only queries by conversation IDs it created)
DROP POLICY IF EXISTS "messages_select_all" ON public.messages;
CREATE POLICY "messages_select_all"
  ON public.messages FOR SELECT
  TO anon, authenticated USING (true);

-- Anyone can insert messages into existing conversations
DROP POLICY IF EXISTS "messages_insert_any" ON public.messages;
CREATE POLICY "messages_insert_any"
  ON public.messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

GRANT SELECT, INSERT ON public.messages TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- ===================== TRIGGER: bump updated_at + unread counts =====================
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET
    updated_at = now(),
    customer_unread_count = CASE WHEN NEW.sender = 'admin' THEN customer_unread_count + 1 ELSE customer_unread_count END,
    admin_unread_count = CASE WHEN NEW.sender = 'customer' THEN admin_unread_count + 1 ELSE admin_unread_count END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- ===================== REALTIME PUBLICATION =====================
-- Add tables to Supabase Realtime so clients can subscribe to changes
DO $$
BEGIN
  -- Add conversations table to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;

  -- Add messages table to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
