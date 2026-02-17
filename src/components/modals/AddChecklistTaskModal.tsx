import { useLanguage } from '../../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { CONSTRUCTION_CHECKLIST } from '../../constants';
import { useAppData } from '../../hooks/useAppData';
import { useState } from 'react';
import { CheckSquare, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Task } from '../../types';

interface AddChecklistTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id'>) => void;
  selectedDate: string;
}

export function AddChecklistTaskModal({ open, onClose, onAdd, selectedDate }: AddChecklistTaskModalProps) {
  const { t } = useLanguage();
  const { checklist } = useAppData();
  const [openPhases, setOpenPhases] = useState<string[]>(['P01']);

  const handleTogglePhase = (phaseId: string) => {
    setOpenPhases(prev => 
      prev.includes(phaseId) ? prev.filter(id => id !== phaseId) : [...prev, phaseId]
    );
  };

  const handleAddItem = (item: any) => {
    onAdd({
      title: item.title,
      status: 'not_started',
      priority: 'high', // Milestones usually high priority
      date: selectedDate,
      checklistId: item.id
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('constructionProgress')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          {CONSTRUCTION_CHECKLIST.phases.map(phase => {
            // Filter items relevant to building type
            const activeItems = phase.items.filter(item => 
              checklist.buildingType >= item.min && checklist.buildingType <= item.max
            );

            if (activeItems.length === 0) return null;

            const isOpen = openPhases.includes(phase.id);
            const completedInPhase = activeItems.filter(i => checklist.completedItems.includes(i.id)).length;

            return (
              <div key={phase.id} className="border rounded-xl bg-card overflow-hidden">
                <button 
                  onClick={() => handleTogglePhase(phase.id)}
                  className="flex items-center justify-between w-full p-4 hover:bg-accent/50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold border">
                      {phase.id.replace('P', '')}
                    </div>
                    <div>
                      <h3 className="font-semibold">{phase.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {completedInPhase}/{activeItems.length} completed
                      </p>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                {isOpen && (
                  <div className="p-2 space-y-1 bg-secondary/5 border-t">
                    {activeItems.map(item => {
                      const isCompleted = checklist.completedItems.includes(item.id);
                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-5 w-5 rounded border flex items-center justify-center",
                              isCompleted ? "bg-green-100 border-green-200 text-green-700" : "border-muted-foreground"
                            )}>
                                {isCompleted && <Check className="h-3 w-3" />}
                            </div>
                            <div>
                                <p className={cn("text-sm font-medium", isCompleted && "text-muted-foreground")}>
                                    {item.title}
                                </p>
                                <span className="text-[10px] text-muted-foreground border px-1 rounded bg-background">
                                    {item.type === 'M' ? 'Mandatory' : item.type === 'H' ? 'Hold Point' : 'Optional'}
                                </span>
                            </div>
                          </div>
                          
                          {!isCompleted && (
                            <Button size="sm" variant="outline" onClick={() => handleAddItem(item)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                          )}
                          {isCompleted && (
                              <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded">Done</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}