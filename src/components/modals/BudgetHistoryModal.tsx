import { useLanguage } from '../../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAppData } from '../../hooks/useAppData';

export function BudgetHistoryModal({ open, onClose }: any) {
  const { t } = useLanguage();
  const { activeProject } = useAppData();
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('budgetHistory')}</DialogTitle></DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
           <div className="flex justify-between border-b pb-2">
             <span className="font-medium">{t('initialBudget')}</span>
             <span className="font-bold">{new Intl.NumberFormat('en-ET').format(activeProject?.initialBudget || 0)} ETB</span>
           </div>
           
           <div className="space-y-3">
             {activeProject?.budgetInjections.length === 0 ? (
               <p className="text-center text-sm text-muted-foreground py-2">No injections recorded.</p>
             ) : (
               activeProject?.budgetInjections.map(i => (
                 <div key={i.id} className="p-3 bg-secondary/30 rounded-lg space-y-1">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-medium">{t('injections')} ({i.date})</span>
                     <span className="text-success font-bold">+{new Intl.NumberFormat('en-ET').format(i.amount)} ETB</span>
                   </div>
                   {(i.source || i.notes) && (
                     <div className="text-xs text-muted-foreground pt-1 border-t border-border/50 mt-1">
                       {i.source && <p><span className="font-semibold">{t('source')}:</span> {i.source}</p>}
                       {i.notes && <p className="italic mt-0.5">{i.notes}</p>}
                     </div>
                   )}
                 </div>
               ))
             )}
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}