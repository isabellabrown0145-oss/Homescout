import { useEffect, useRef, useState } from 'react';
import { Send, Search, Mail, Clock, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Conversation, ChatMessage } from '@/types';

export default function AdminInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  useEffect(() => {
    fetchConversations();

    // Subscribe to conversation updates (for unread counts + new conversations)
    const channel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // If the message belongs to the selected conversation, it's handled by the messages subscription
          const newMsg = payload.new as ChatMessage;
          if (selectedId && newMsg.conversation_id === selectedId) return;
          // Otherwise just refresh conversations to update unread counts
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId]);

  async function fetchConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    const convs = (data as Conversation[]) || [];
    setConversations(convs);
    setTotalUnread(convs.reduce((sum, c) => sum + (c.admin_unread_count || 0), 0));
    setLoading(false);
  }

  // Load messages for selected conversation + subscribe to new ones
  useEffect(() => {
    if (!selectedId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: true });
      setMessages((data as ChatMessage[]) || []);

      // Reset admin unread count for this conversation
      await supabase
        .from('conversations')
        .update({ admin_unread_count: 0 })
        .eq('id', selectedId);

      // Subscribe to new messages
      channel = supabase
        .channel(`admin-msgs:${selectedId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedId}`,
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages((prev) =>
              prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
            );
            // If customer sent a message, reset admin unread (admin is viewing)
            if (newMsg.sender === 'customer') {
              supabase
                .from('conversations')
                .update({ admin_unread_count: 0 })
                .eq('id', selectedId)
                .then();
            }
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    const { data } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedId,
        sender: 'admin',
        content,
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) => [...prev, data as ChatMessage]);
    }
    setSending(false);
  };

  const closeConversation = async (id: string) => {
    await supabase.from('conversations').update({ status: 'closed' }).eq('id', id);
    fetchConversations();
  };

  const reopenConversation = async (id: string) => {
    await supabase.from('conversations').update({ status: 'open' }).eq('id', id);
    fetchConversations();
  };

  const filtered = conversations.filter(
    (c) =>
      !search ||
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_email.toLowerCase().includes(search.toLowerCase())
  );

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-13rem)] min-h-[500px]">
      {/* Conversation list */}
      <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Inbox
            </h3>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                {totalUnread} unread
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {search ? 'No conversations match your search.' : 'No conversations yet.'}
              </p>
            </div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                  selectedId === conv.id ? 'bg-navy-50 border-l-3 border-l-navy-600' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-navy-900 truncate max-w-[180px]">
                    {conv.customer_name}
                  </span>
                  {conv.admin_unread_count > 0 && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.admin_unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 shrink-0" /> {conv.customer_email}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatRelativeShort(conv.updated_at)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      conv.status === 'open'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {conv.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message panel */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-50 mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-navy-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-1">Select a conversation</h3>
              <p className="text-sm text-slate-500">Choose a conversation from the list to view messages.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy-900 truncate">{selected.customer_name}</p>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {selected.customer_email}
                </p>
              </div>
              <button
                onClick={() =>
                  selected.status === 'open'
                    ? closeConversation(selected.id)
                    : reopenConversation(selected.id)
                }
                className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selected.status === 'open'
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {selected.status === 'open' ? 'Close' : 'Reopen'}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-500">No messages yet. Send the first reply below.</p>
                </div>
              )}
              {messages.map((msg) => (
                <AdminMessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 shrink-0">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selected.status === 'closed' ? 'Reopen conversation to reply...' : 'Type your reply...'}
                  disabled={selected.status === 'closed'}
                  className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending || selected.status === 'closed'}
                  className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center hover:bg-navy-800 transition-colors disabled:opacity-40 shrink-0"
                  aria-label="Send reply"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function AdminMessageBubble({ message }: { message: ChatMessage }) {
  const isAdmin = message.sender === 'admin';
  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
        {!isAdmin && (
          <span className="text-[10px] font-semibold text-slate-500 mb-1 px-1">Customer</span>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isAdmin
              ? 'bg-navy-900 text-white rounded-br-md'
              : 'bg-white border border-slate-200 text-navy-900 rounded-bl-md'
          }`}
        >
          {message.content}
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-slate-400">{time}</span>
          {isAdmin && <CheckCheck className="w-3 h-3 text-navy-400" />}
        </div>
      </div>
    </div>
  );
}

function formatRelativeShort(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
