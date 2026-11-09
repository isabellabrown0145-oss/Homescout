import { useEffect, useRef, useState, type FormEvent } from 'react';
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
  const [stage, setStage] = useState<'intro' | 'form' | 'chat' | 'connecting'>('intro');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    if (isOpen) loadMessages();
    else loadUnreadCount();

    const interval = window.setInterval(() => {
      if (isOpen) loadMessages();
      else loadUnreadCount();
    }, 4000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [conversationId, accessToken, isOpen]);

  const startConversation = async (e: FormEvent) => {
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
    set
