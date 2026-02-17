import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { CONSTRUCTION_CHECKLIST } from '../../constants';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { CheckSquare, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';

export function ConstructionProgress() {
  const { t } = useLanguage();
  const { checklist, updateChecklist } = useAppData();
  const [openPhases, setOpenPhases] = useState<string[]>(['P01']);

  const handleTogglePhase = (phaseId: string) => {
    setOpenPhases(prev => 
      prev.includes(phaseId) ? prev.filter(id => id !== phaseId) : [...prev, phaseId]
    );
  };

  const handleToggleItem = (itemId: string) => {
    const isCompleted = checklist.completedItems.includes(itemId);
    const newCompleted = isCompleted
      ? checklist.completedItems.filter(id => id !== itemId)
      : [...checklist.completedItems, itemId];
    
    updateChecklist(checklist.buildingType, newCompleted);
  };

  const totalItems = CONSTRUCTION_CHECKLIST.phases.reduce((acc, phase) => {
    return acc + phase.items.filter(i => 
      checklist.buildingType >= i.min && checklist.buildingType <= i.max
    ).length;
  }, 0);

  const completedCount = checklist.completedItems.length;
  const percentage = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'M': return "bg-red-100 text-red-700 border-red-200";
      case 'O': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'H': return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100";
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'M': return t('mandatory');
      case 'O': return t('optional');
      case 'H': return t('hold');
      default: return type;
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-foreground">{t('constructionProgress')}</h1>
        
        {/* Storey Selector */}
        <div className="p-4 bg-card border rounded-xl space-y-2">
          <label className="text-sm font-medium">{t('selectBuildingType')}</label>
          <Select 
            value={checklist.buildingType.toString()} 
            onValueChange={(val) => updateChecklist(parseInt(val), checklist.completedItems)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Storeys" />
            </SelectTrigger>
            <SelectContent>
              {[0,1,2,3,4,5,6,7,8].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num === 0 ? "G+0 (Single Storey)" : `G+${num}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overall Progress */}
        <div className="p-6 bg-primary/5 border-primary/20 border rounded-xl">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-2xl font-bold text-primary">{percentage.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">{completedCount} / {totalItems} items</p>
            </div>
            <CheckSquare className="h-8 w-8 text-primary/40" />
          </div>
          <Progress value={percentage} className="h-3" />
        </div>
      </div>

      {/* Phases Accordion */}
      <div className="space-y-4">
        {CONSTRUCTION_CHECKLIST.phases.map(phase => {
          // Filter items relevant to building type
          const activeItems = phase.items.filter(item => 
            checklist.buildingType >= item.min && checklist.buildingType <= item.max
          );

          if (activeItems.length === 0) return null;

          const phaseCompletedCount = activeItems.filter(i => checklist.completedItems.includes(i.id)).length;
          const isPhaseComplete = phaseCompletedCount === activeItems.length;
          const isOpen = openPhases.includes(phase.id);

          return (
            <div 
              key={phase.id} 
              className={cn(
                "border rounded-xl bg-card overflow-hidden transition-all",
                isPhaseComplete && "border-green-200 bg-green-50/30"
              )}
            >
              <button 
                onClick={() => handleTogglePhase(phase.id)}
                className="flex items-center justify-between w-full p-4 hover:bg-accent/50 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border",
                    isPhaseComplete ? "bg-green-100 text-green-700 border-green-200" : "bg-secondary text-secondary-foreground"
                  )}>
                    {phase.id.replace('P', '')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{phase.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {phaseCompletedCount}/{activeItems.length} completed
                    </p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {isOpen && (
                <div className="p-2 space-y-1 bg-secondary/5 border-t">
                  {activeItems.map(item => {
                    const isChecked = checklist.completedItems.includes(item.id);
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => handleToggleItem(item.id)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
                          isChecked && "bg-accent/30"
                        )}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded border mt-0.5 flex items-center justify-center transition-colors",
                          isChecked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                        )}>
                          {isChecked && <CheckSquare className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1">
                          <p className={cn("text-sm font-medium", isChecked && "text-muted-foreground line-through")}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", getTypeStyle(item.type))}>
                              {getTypeLabel(item.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}