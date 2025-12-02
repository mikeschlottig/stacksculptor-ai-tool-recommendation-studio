import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, AlertTriangle, Clock } from 'lucide-react';
import { chatService, formatTime } from '@/lib/chat';
import type { Message } from '../../worker/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Skeleton } from './ui/skeleton';
interface SupportChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}
export function SupportChatPanel({ open, onOpenChange, sessionId }: SupportChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollableView = scrollAreaRef.current.querySelector('div');
      if (scrollableView) {
        scrollableView.scrollTop = scrollableView.scrollHeight;
      }
    }
  };
  useEffect(() => {
    if (open && sessionId) {
      chatService.switchSession(sessionId);
      const loadMessages = async () => {
        setIsLoading(true);
        const res = await chatService.getMessages();
        if (res.success && res.data) {
          setMessages(res.data.messages);
        }
        setIsLoading(false);
      };
      loadMessages();
    }
  }, [open, sessionId]);
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setStreamingMessage('');
    await chatService.sendMessage(messageContent, undefined, (chunk) => {
      setStreamingMessage(prev => prev + chunk);
    });
    const res = await chatService.getMessages();
    if (res.success && res.data) {
      setMessages(res.data.messages);
    }
    setIsLoading(false);
    setStreamingMessage('');
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="font-display text-2xl">Support Chat</SheetTitle>
          <SheetDescription>Ask for changes or clarifications on your stack.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {isLoading && messages.length === 0 && (
              <div className="space-y-4">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-16 w-3/4 ml-auto" />
              </div>
            )}
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && <Bot className="size-6 mb-2 flex-shrink-0" />}
                <div className={cn('max-w-[80%] p-3 rounded-2xl', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                </div>
                {msg.role === 'user' && <User className="size-6 mb-2 flex-shrink-0" />}
              </motion.div>
            ))}
            {streamingMessage && (
              <div className="flex items-end gap-2 justify-start">
                <Bot className="size-6 mb-2 flex-shrink-0" />
                <div className="max-w-[80%] p-3 rounded-2xl bg-muted">
                  <p className="whitespace-pre-wrap text-sm">{streamingMessage}<span className="animate-pulse">|</span></p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t bg-background">
          <div className="w-full space-y-2">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Can you suggest a cheaper vector database?"
                className="flex-1 min-h-[42px] max-h-24 resize-none"
                rows={1}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                <Send className="size-4" />
              </Button>
            </form>
            <div className="text-xs text-muted-foreground p-2 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500 flex-shrink-0" />
              <span>AI requests are subject to rate limits. Please be mindful of usage.</span>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}