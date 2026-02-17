import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
// FIX 1: Import the CORRECT class name
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function GlobalAiAssistant() {
  const { t } = useLanguage();
  const { activeProject, totalBudget, totalSpent, remainingBudget, dailyLogs, workers } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your HBT Pro assistant. I have analyzed your current project data. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Analyze budget health",
    "Project status summary",
    "Suggest tasks for tomorrow",
    "Draft a material list",
    "Write a weekly report"
  ];

  const generateContext = () => {
     if (!activeProject) return "No active project selected.";
     
     const today = new Date().toISOString().split('T')[0];
     const todaysLog = dailyLogs.find(l => l.date === today);
     const todaysTasks = todaysLog?.tasks.map(t => `${t.title} (${t.status})`).join(', ') || "No tasks logged for today.";
     
     return JSON.stringify({
         projectName: activeProject.name,
         budget: {
             total: totalBudget,
             spent: totalSpent,
             remaining: remainingBudget,
             currency: "ETB"
         },
         workersCount: workers.length,
         todaysDate: today,
         todaysTasks: todaysTasks,
         projectDescription: activeProject.description,
         projectType: activeProject.projectType
     });
  };

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim()) return;
    
    // Check for API Key in various environment variable formats
    const apiKey = process.env.GEMINI_API_KEY || 
                   process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                   (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        toast.error("API Key missing");
        return;
    }

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
        // FIX 2: Use the CORRECT class name for initialization
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash-preview",
            systemInstruction: `You are the AI Assistant for HBT Pro, a construction management app.
        
            Current Project Context Data:
            ${generateContext()}
            
            Rules:
            1. Be concise, professional, and helpful.
            2. Use the provided context to answer questions about budget, tasks, and workers accurately.
            3. If you suggest actions, keep them related to construction management (e.g., "Add a worker", "Review budget").
            4. When asked for lists or reports, format them cleanly.
            5. Assume the currency is ETB unless specified otherwise.`
        });

        // Start chat session with history
        const chat = model.startChat({
            history: messages.slice(1).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }))
        });

        // Send message and stream response
        const result = await chat.sendMessageStream(userMsg);
        
        setMessages(prev => [...prev, { role: 'model', text: '' }]); // Placeholder

        let fullResponse = "";
        for await (const chunk of result.stream) {
             const text = chunk.text();
             if (text) {
                 fullResponse += text;
                 setMessages(prev => {
                     const newHistory = [...prev];
                     const lastMsg = newHistory[newHistory.length - 1];
                     if (lastMsg.role === 'model') {
                        lastMsg.text = fullResponse;
                     }
                     return newHistory;
                 });
             }
        }

    } catch (error) {
        console.error(error);
        toast.error("Failed to get response");
        setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please check your internet or API key." }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
          <Button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-110 transition-transform z-50 p-0"
          >
            <Sparkles className="h-7 w-7 text-white animate-pulse" />
          </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-[90vw] md:w-[400px] h-[550px] max-h-[70vh] bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5 duration-300 overflow-hidden ring-1 ring-white/20">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">HBT Assistant</h3>
                        <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-muted-foreground">Online & Trained</span>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/20">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-2 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                            msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-card text-indigo-500"
                        )}>
                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                        </div>
                        <div className={cn(
                            "p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap leading-relaxed",
                            msg.role === 'user' 
                                ? "bg-primary text-primary-foreground rounded-tr-none" 
                                : "bg-card border text-foreground rounded-tl-none"
                        )}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-2 max-w-[85%]">
                        <div className="h-8 w-8 rounded-full bg-card border flex items-center justify-center shrink-0">
                            <Sparkles className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="p-3 rounded-2xl bg-card border text-foreground rounded-tl-none flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Prompts & Input */}
            <div className="shrink-0 bg-card/50 backdrop-blur-md border-t">
                {/* Quick Prompts Scroll */}
                <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar mask-linear-fade">
                    {quickPrompts.map((p, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => handleSend(p)} 
                            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-secondary/80 text-xs font-medium border border-border/50 hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 shadow-sm"
                            disabled={isTyping}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <div className="p-3 pt-0">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2 relative"
                    >
                        <Input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask AI assistant..." 
                            className="rounded-2xl pl-4 pr-12 bg-background border-border/60 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all h-11"
                        />
                        <Button 
                            type="submit" 
                            size="icon" 
                            disabled={!input.trim() || isTyping}
                            className="absolute right-1.5 top-1.5 h-8 w-8 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        >
                            <Send className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
      )}
    </>
  );
}