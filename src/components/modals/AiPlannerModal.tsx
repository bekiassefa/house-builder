import { useLanguage } from '../../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { toast } from 'sonner';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface AiPlannerModalProps {
  open: boolean;
  onClose: () => void;
  selectedDate: string;
}

export function AiPlannerModal({ open, onClose, selectedDate }: AiPlannerModalProps) {
  const { t } = useLanguage();
  const { activeProject, addTaskToLog, addDailyLog, dailyLogs } = useAppData();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleGenerate = async () => {
    // Check if API Key is available
    if (!process.env.API_KEY) {
        toast.error("API Key is missing. Please check your environment variables.");
        return;
    }

    setIsLoading(true);
    setSuggestions([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `You are a construction site manager assistant. 
      The project is a ${activeProject?.projectType || 'G+0'} residential building.
      Suggest 5-7 distinct, actionable daily tasks appropriate for the described construction phase.
      Return the response as a JSON array of strings.`;

      const userPrompt = prompt 
        ? `Current phase/status: ${prompt}. Suggest daily tasks.` 
        : `Suggest daily tasks for a ${activeProject?.projectType} building construction project.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            }
          }
        }
      });

      if (response.text) {
        const tasks = JSON.parse(response.text);
        if (Array.isArray(tasks)) {
            setSuggestions(tasks);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTasks = (taskTitle: string) => {
    const existingLog = dailyLogs.find(l => l.date === selectedDate);
    
    if (!existingLog) {
       addDailyLog({
        date: selectedDate,
        tasks: [{
          id: Math.random().toString(36).substr(2, 9),
          title: taskTitle,
          status: 'not_started',
          priority: 'medium',
          date: selectedDate
        }],
        issues: [],
        photos: [],
        workersPresent: 0
      });
    } else {
        addTaskToLog(existingLog.id, {
            title: taskTitle,
            status: 'not_started',
            priority: 'medium',
            date: selectedDate
        });
    }
    
    // Remove from suggestions to avoid dupes visually
    setSuggestions(prev => prev.filter(t => t !== taskTitle));
    toast.success("Task added to planner");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            {t('suggestTasks')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea 
              placeholder={t('aiPromptPlaceholder')}
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('generating')}
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('suggestTasks')}
                </>
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-2 mt-4 animate-in slide-in-from-bottom-2">
                <p className="text-sm font-medium text-muted-foreground">Suggestions:</p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {suggestions.map((task, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border text-sm">
                            <span>{task}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleAddTasks(task)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}