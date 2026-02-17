import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { Button } from '../ui/button';
import { Plus, User, Users, Wallet, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { WeeklyPayment, Worker } from '../../types';
import { AddWorkerModal } from '../modals/AddWorkerModal';

export function LaborPayments() {
  const { t } = useLanguage();
  const { workers, weeklyPayments, addWeeklyPayment, updateWeeklyPayment, deleteWorker, updateWorker, addWorker } = useAppData();
  const [weekOffset, setWeekOffset] = useState(0);
  const [editingWorker, setEditingWorker] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', dailyRate: 0, phone: '' });
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);

  // Calculate current week start (Monday) based on offset
  const currentWeekStart = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  }, [weekOffset]);

  // Generate days for the header
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(currentWeekStart);
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const shortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push({
            label: `${shortNames[i]} ${d.getDate()}`,
            key: dayNames[i] as keyof WeeklyPayment['payments'],
            fullDate: d.toISOString().split('T')[0]
        });
    }
    return days;
  }, [currentWeekStart]);

  // Calculate Totals per week
  const totalWeeklyPayment = useMemo(() => {
      return weeklyPayments
        .filter(wp => wp.weekStart === currentWeekStart)
        .reduce((sum, wp) => {
            if (!wp.payments) return sum;
            return sum + Object.values(wp.payments).reduce((dSum, val) => dSum + (val || 0), 0);
        }, 0);
  }, [weeklyPayments, currentWeekStart]);

  // Calculate Daily Totals
  const dailyTotals = useMemo(() => {
      const totals: Record<string, number> = {};
      weekDays.forEach(day => {
          totals[day.key] = workers.reduce((sum, worker) => {
               const payment = weeklyPayments.find(wp => wp.workerId === worker.id && wp.weekStart === currentWeekStart);
               return sum + (payment?.payments?.[day.key] || 0);
          }, 0);
      });
      return totals;
  }, [workers, weeklyPayments, currentWeekStart, weekDays]);

  const handlePaymentChange = (workerId: string, dayKey: string, value: string) => {
      const numValue = parseInt(value) || 0;
      
      const existingPayment = weeklyPayments.find(
          wp => wp.workerId === workerId && wp.weekStart === currentWeekStart
      );

      if (existingPayment) {
          updateWeeklyPayment(existingPayment.id, {
              payments: {
                  ...existingPayment.payments,
                  [dayKey]: numValue
              }
          });
      } else {
          addWeeklyPayment({
              workerId,
              weekStart: currentWeekStart,
              payments: {
                  monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0,
                  [dayKey]: numValue
              }
          });
      }
  };

  const getPaymentValue = (workerId: string, dayKey: string) => {
      const payment = weeklyPayments.find(
          wp => wp.workerId === workerId && wp.weekStart === currentWeekStart
      );
      const val = payment?.payments?.[dayKey as keyof typeof payment.payments];
      return val === 0 ? '' : val; 
  };

  const getWorkerWeekTotal = (workerId: string) => {
      const payment = weeklyPayments.find(
          wp => wp.workerId === workerId && wp.weekStart === currentWeekStart
      );
      if (!payment || !payment.payments) return 0;
      return Object.values(payment.payments).reduce((sum, val) => sum + (val || 0), 0);
  };

  const handleDeleteWorker = (id: string) => {
      if (confirm(t('deleteConfirm'))) {
          deleteWorker(id);
          toast.success("Worker deleted");
      }
  }

  const startEditWorker = (worker: any) => {
      setEditingWorker(worker.id);
      setEditForm({ name: worker.name, dailyRate: worker.dailyRate, phone: worker.phone });
  }

  const saveEditWorker = () => {
      if(editingWorker) {
          updateWorker(editingWorker, editForm);
          setEditingWorker(null);
          toast.success("Worker updated");
      }
  }

  const handleAddWorker = (data: Omit<Worker, 'id' | 'createdAt'>) => {
      addWorker(data);
      setShowAddWorkerModal(false);
      toast.success(t('savedSuccess'));
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('labor')}</h1>
        <div className="flex flex-col md:flex-row gap-3">
             <div className="flex items-center gap-2 bg-card border p-1 rounded-lg self-start">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-24 text-center">
                    {new Date(currentWeekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o + 1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <Button onClick={() => setShowAddWorkerModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> {t('addWorker')}
            </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/5 z-0" />
             <Users className="h-8 w-8 text-primary mb-2 z-10" />
             <span className="text-3xl font-bold z-10">{workers.length}</span>
             <span className="text-sm text-muted-foreground z-10">{t('workers')}</span>
          </div>
          <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-orange-500/5 z-0" />
             <Wallet className="h-8 w-8 text-orange-500 mb-2 z-10" />
             <span className="text-3xl font-bold z-10">{new Intl.NumberFormat('en-ET').format(totalWeeklyPayment)}</span>
             <span className="text-sm text-muted-foreground z-10">ETB ({t('weeklyPayments')})</span>
          </div>
      </div>
      
      {workers.length === 0 ? (
        <div className="p-8 text-center border rounded-xl bg-card">
          <p className="text-muted-foreground">{t('noData')}</p>
          <Button variant="link" onClick={() => setShowAddWorkerModal(true)}>Add your first worker</Button>
        </div>
      ) : (
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            {/* Table View */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-secondary/30 text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="p-4 min-w-[150px] sticky left-0 bg-background/95 backdrop-blur z-20 border-r">{t('name')}</th>
                            <th className="p-4 min-w-[100px] border-r">{t('dailyRate')}</th>
                            {weekDays.map(day => (
                                <th key={day.key} className="p-4 min-w-[80px] text-center whitespace-nowrap border-r last:border-r-0">
                                    {day.label}
                                </th>
                            ))}
                            <th className="p-4 min-w-[100px] text-center font-bold bg-orange-100/80 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 sticky right-0 z-20 border-l border-orange-200 dark:border-orange-900 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">{t('totalPayment')}</th>
                            <th className="p-4 min-w-[80px] text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {workers.map(worker => {
                            const total = getWorkerWeekTotal(worker.id);
                            return (
                                <tr key={worker.id} className="hover:bg-secondary/5 group">
                                    <td className="p-4 font-medium sticky left-0 bg-background z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{worker.name}</div>
                                                <div className="text-xs text-muted-foreground">{worker.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted-foreground border-r">
                                        {worker.dailyRate} <span className="text-xs">ETB</span>
                                    </td>
                                    {weekDays.map(day => {
                                        const val = getPaymentValue(worker.id, day.key);
                                        const isToday = day.fullDate === new Date().toISOString().split('T')[0];
                                        
                                        return (
                                            <td key={day.key} className={cn("p-2 border-r last:border-r-0", isToday && "bg-primary/5")}>
                                                <Input 
                                                    type="number" 
                                                    className={cn(
                                                        "w-16 h-9 text-center mx-auto border-transparent bg-secondary/20 focus:bg-background focus:border-input transition-all",
                                                        val ? "font-bold text-foreground" : "text-muted-foreground"
                                                    )}
                                                    placeholder="0"
                                                    value={val}
                                                    onChange={(e) => handlePaymentChange(worker.id, day.key, e.target.value)}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="p-4 text-center font-bold text-orange-700 dark:text-orange-300 sticky right-0 bg-orange-50/80 dark:bg-orange-950/30 z-10 border-l border-orange-100 dark:border-orange-900 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                        {new Intl.NumberFormat('en-ET').format(total)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEditWorker(worker)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteWorker(worker.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-muted/50 font-semibold border-t">
                        <tr>
                            <td className="p-4 sticky left-0 bg-muted/50 z-10 border-r" colSpan={2}>Daily Total</td>
                            {weekDays.map(day => (
                                <td key={day.key} className="p-4 text-center border-r last:border-r-0">
                                    {dailyTotals[day.key] > 0 ? new Intl.NumberFormat('en-ET').format(dailyTotals[day.key]) : '-'}
                                </td>
                            ))}
                            <td className="p-4 text-center font-bold text-orange-800 dark:text-orange-200 sticky right-0 bg-orange-100/90 dark:bg-orange-900/60 z-10 border-l border-orange-200 dark:border-orange-800 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                {new Intl.NumberFormat('en-ET').format(totalWeeklyPayment)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
      )}

      {/* Edit Worker Dialog */}
      <Dialog open={!!editingWorker} onOpenChange={(open) => !open && setEditingWorker(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>{t('name')}</Label>
                    <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>{t('dailyRate')}</Label>
                    <Input type="number" value={editForm.dailyRate} onChange={e => setEditForm({...editForm, dailyRate: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                    <Label>{t('phone')}</Label>
                    <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <Button onClick={saveEditWorker} className="w-full">{t('save')}</Button>
            </div>
        </DialogContent>
      </Dialog>

      <AddWorkerModal 
        open={showAddWorkerModal} 
        onClose={() => setShowAddWorkerModal(false)} 
        onSave={handleAddWorker} 
      />
    </div>
  );
}