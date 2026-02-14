import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2, ImageIcon } from 'lucide-react';
import { TriageCase } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatbotProps {
  contextCase?: TriageCase | null;
}

export function AIChatbot({ contextCase }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const contextInfo = contextCase
        ? `\nCurrent patient context: ${JSON.stringify({
            symptoms: contextCase.symptoms,
            risk_level: contextCase.risk_level,
            department: contextCase.recommended_department,
            ai_explanation: contextCase.ai_explanation,
          })}`
        : '';

      const { data, error } = await supabase.functions.invoke('medical-chat', {
        body: {
          messages: newMessages,
          context: contextInfo,
        },
      });

      if (error) throw error;
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (e: any) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: `[Uploaded image: ${file.name}]` }]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const { data, error } = await supabase.functions.invoke('medical-chat', {
          body: {
            messages: [...messages, { role: 'user', content: 'Analyze this medical image and identify potential symptoms or conditions.' }],
            image: base64,
          },
        });
        if (error) throw error;
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to analyze image.' }]);
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Medical AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-3 mb-3" ref={scrollRef as any}>
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Ask me about symptoms, medical conditions, or upload an image for analysis.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 mb-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}>
                {m.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-muted text-sm text-muted-foreground">Thinking...</div>
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about symptoms, conditions..."
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <Button size="icon" onClick={sendMessage} disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
