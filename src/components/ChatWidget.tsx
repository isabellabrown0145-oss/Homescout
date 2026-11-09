import { useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Check,
  Mail,
  User,
  Home,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/types';

const STORAGE_KEY = 'homescout_chat_conversation_id';
const TOKEN_KEY = 'homescout_chat_access_token';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [stage, setStage] = useState<
    'intro' | 'form' | 'chat' | 'connecting'
  >('intro');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore saved conversation and private access token
  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedId && storedToken) {
      setConversationId(storedId);
      setAccessToken(storedToken);
      setStage('chat');
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Secure message and unread-count polling
  useEffect(() => {
    if (!conversationId || !accessToken) return;

    let active = true;

    const loadMessages = async () => {
      const { data, error: fetchError } = await supabase.rpc(
        'customer_get_messages',
        {
          p_conversation_id: conversationId,
          p_access_token: accessToken,
        }
      );

      if (!active || fetchError) return;

      setMessages((data as ChatMessage[]) || []);

      await supabase.rpc('customer_mark_read', {
        p_conversation_id: conversationId,
        p_access_token: accessToken,
      });

      if (active) setUnreadCount(0);
    };

    const loadUnreadCount = async () => {
      const { data, error: unreadError } = await supabase.rpc(
        'customer_get_unread_count',
        {
          p_conversation_id: conversationId,
          p_access_token: accessToken,
        }
      );

      if (!active || unreadError) return;

      setUnreadCount(isOpen ? 0 : Number(data) || 0);
    };

    if (isOpen) {
      loadMessages();
    } else {
      loadUnreadCount();
    }

    const interval = window.setInterval(() => {
      if (isOpen) {
        loadMessages();
      } else {
        loadUnreadCount();
      }
    }, 4000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [conversationId, accessToken, isOpen]);

  // Start a new customer conversation
  const startConversation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) return;

    setStage('connecting');
    setError('');

    const { data, error: createError } = await supabase.rpc(
      'create_customer_conversation',
      {
        p_customer_name: name.trim(),
        p_customer_email: email.trim(),
      }
    );

    if (createError || !data?.conversation_id || !data?.access_token) {
      setStage('form');
      setError('Unable to start your conversation. Please try again.');
      return;
    }

    const convId = data.conversation_id as string;
    const token = data.access_token as string;

    localStorage.setItem(STORAGE_KEY, convId);
    localStorage.setItem(TOKEN_KEY, token);

    setConversationId(convId);
    setAccessToken(token);
    setMessages([]);
    setUnreadCount(0);
    setStage('chat');
  };

  // Send a customer message securely
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !conversationId || !accessToken || sending) {
      return;
    }

    const content = input.trim();

    setSending(true);
    setError('');

    const { data, error: sendError } = await supabase.rpc(
      'customer_send_message',
      {
        p_conversation_id: conversationId,
        p_access_token: accessToken,
        p_content: content,
      }
    );

    if (sendError) {
      setError('Message could not be sent. Please try again.');
      setSending(false);
      return;
    }

    const newMessage = (Array.isArray(data) ? data[0] : data) as ChatMessage;

    if (newMessage) {
      setMessages((prev) =>
        prev.some((message) => message.id === newMessage.id)
          ? prev
          : [...prev, newMessage]
      );
    }

    setInput('');
    setSending(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-navy-900 text-white shadow-2xl hover:bg-navy-800 hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Open chat support"
        >
          <MessageCircle className="w-6 h-6" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[min(600px,calc(100vh-5rem))] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scale-in">

          <div className="bg-navy-900 px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15">
                <Home className="w-4.5 h-4.5 text-white" />
              </div>

              <div>
                <p className="text-sm font-bold text-white font-display">
                  HomeScout Support
                </p>
                <p className="text-[11px] text-navy-300 flex items-center gap-1">
                  <span               onChange={(e) => setEmail(e.target.value)}
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
