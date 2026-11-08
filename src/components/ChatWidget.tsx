import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Check, CheckCheck, Mail, User, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Conversation, ChatMessage } from '@/types';

const STORAGE_KEY = 'homescout_chat_conversation_id';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [stage, setStage] = useState<'intro' | 'form' | 'chat' | 'connecting'>('intro');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore conversation from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setConversationId(stored);
      setStage('chat');
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages + subscribe to realtime
  useEffect(() => {
    if (!conversationId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // Fetch existing messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      setMessages((data as ChatMessage[]) || []);

      // Reset customer unread count when they open the chat
      await supabase
        .from('conversations')
        .update({ customer_unread_count: 0 })
        .eq('id', conversationId);
      setUnreadCount(0);

      // Subscribe to new messages in this conversation
      channel = supabase
        .channel(`chat:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages((prev) =>
              prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
            );
            // If admin sent a message, it shows in the UI; unread is reset since they're viewing
            if (newMsg.sender === 'admin') {
              supabase
                .from('conversations')
                .update({ customer_unread_count: 0 })
                .eq('id', conversationId)
                .then();
            }
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Check for unread admin messages when widget is closed
  useEffect(() => {
    if (!conversationId || isOpen) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data } = await supabase
        .from('conversations')
        .select('customer_unread_count')
        .eq('id', conversationId)
        .maybeSingle();
      if (data) setUnreadCount(data.customer_unread_count || 0);

      channel = supabase
        .channel(`chat-badge:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `id=eq.${conversationId}`,
          },
          (payload) => {
            const updated = payload.new as Conversation;
            setUnreadCount(updated.customer_unread_count || 0);
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, isOpen]);

  const startConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStage('connecting');

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        customer_name: name.trim(),
        customer_email: email.trim(),
        status: 'open',
      })
      .select()
      .single();

    if (error || !data) {
      setStage('form');
      return;
    }

    const convId = (data as Conversation).id;
    localStorage.setItem(STORAGE_KEY, convId);
    setConversationId(convId);
    setStage('chat');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    const { data } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender: 'customer',
        content,
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) => [...prev, data as ChatMessage]);
    }
    setSending(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (conversationId) {
      // Reset unread when opening
      supabase
        .from('conversations')
        .update({ customer_unread_count: 0 })
        .eq('id', conversationId)
        .then();
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-navy-900 text-white shadow-2xl hover:bg-navy-800 hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Open chat support"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-scale-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[min(600px,calc(100vh-5rem))] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-navy-900 px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 backdrop-blur-md">
                <Home className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-white font-display">HomeScout Support</p>
                <p className="text-[11px] text-navy-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Body */}
          {stage === 'intro' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-50 mb-4">
                <MessageCircle className="w-8 h-8 text-navy-600" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">We're here to help</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Have a question about a property or need help finding your next home? Chat with our support team in real time.
              </p>
              <button
                onClick={() => setStage('form')}
                className="w-full py-3 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
              >
                Start a Conversation
              </button>
            </div>
          )}

          {stage === 'form' && (
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="text-lg font-bold text-navy-900 mb-1">Let's get started</h3>
              <p className="text-sm text-slate-500 mb-4">Tell us your name and email so we can reply to you.</p>
              <form onSubmit={startConversation} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => setStage('intro')}
                  className="w-full text-xs text-slate-500 hover:text-slate-700"
                >
                  Back
                </button>
              </form>
            </div>
          )}

          {stage === 'connecting' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-navy-200 border-t-navy-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Connecting you to support...</p>
              </div>
            </div>
          )}

          {stage === 'chat' && (
            <>
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-navy-100 mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-navy-600" />
                    </div>
                    <p className="text-sm text-slate-500">Send a message to start chatting with our team.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 bg-white shrink-0">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-navy-900 focus:border-navy-400 focus:ring-2 focus:ring-navy-100 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center hover:bg-navy-800 transition-colors disabled:opacity-40 shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isCustomer = message.sender === 'customer';
  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isCustomer ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isCustomer
              ? 'bg-navy-900 text-white rounded-br-md'
              : 'bg-white border border-slate-200 text-navy-900 rounded-bl-md'
          }`}
        >
          {message.content}
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1 ${isCustomer ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-slate-400">{time}</span>
          {isCustomer && (
            <Check className="w-3 h-3 text-slate-400" />
          )}
        </div>
      </div>
    </div>
  );
}
