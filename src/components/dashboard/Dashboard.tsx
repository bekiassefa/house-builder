import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { BudgetCard } from './BudgetCard';
import { QuickActions } from './QuickActions';
import { RecentTransactions } from './RecentTransactions';
import { useState } from 'react';
import { AddTransactionModal } from '../modals/AddTransactionModal';
import { AddWorkerModal } from '../modals/AddWorkerModal';
import { AddBudgetModal } from '../modals/AddBudgetModal';
import { AddContractModal } from '../modals/AddContractModal';
import { VisitModeModal } from '../modals/VisitModeModal';
import { toast } from 'sonner';
import { Transaction, Worker, Contract } from '../../types';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Dashboard() {
  const { t } = useLanguage();
  const {
    addTransaction,
    addWorker,
    addBudgetInjection,
    addContract,
    dailyLogs,
    updateTaskInLog
  } = useAppData();

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showVisitMode, setShowVisitMode] = useState(false);

  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    addTransaction(data);
    setShowTransactionModal(false);
    toast.success(t('savedSuccess'), {
      description: t('greatJob'),
    });
  };

  const handleAddWorker = (data: Omit<Worker, 'id' | 'createdAt'>) => {
    addWorker(data);
    setShowWorkerModal(false);
    toast.success(t('savedSuccess'));
  };

  const handleAddBudget = (amount: number, notes?: string, source?: string) => {
    addBudgetInjection(amount, notes, source);
    setShowBudgetModal(false);
    toast.success(t('savedSuccess'));
  };

  const handleAddContract = (data: Omit<Contract, 'id' | 'createdAt' | 'payments'>) => {
    addContract(data);
    setShowContractModal(false);
    toast.success(t('savedSuccess'));
  };

  // Get Today's Tasks
  const today = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find(l => l.date === today);
  const tasks = todayLog?.tasks || [];

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <BudgetCard onAddBudget={() => setShowBudgetModal(true)} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <QuickActions
          onAddTransaction={() => setShowTransactionModal(true)}
          onAddWorker={() => setShowWorkerModal(true)}
          onAddBudget={() => setShowBudgetModal(true)}
          onVisitMode={() => setShowVisitMode(true)}
          onAddContract={() => setShowContractModal(true)}
        />
        <RecentTransactions />
      </div>

      {/* Today's Tasks Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t('todaysTasks')}</h2>
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">{t('noData')}</p>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-border/50">
                 <button
                  onClick={() => {
                    const nextStatus = task.status === 'completed' ? 'not_started' : 'completed';
                    if (todayLog) updateTaskInLog(todayLog.id, task.id, { status: nextStatus });
                  }}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <span className={cn("text-sm", task.status === 'completed' && "line-through text-muted-foreground")}>
                  {task.title}
                </span>
                <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-full capitalize", 
                  task.priority === 'high' ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"
                )}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddTransactionModal
        open={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSave={handleAddTransaction}
      />
      <AddWorkerModal
        open={showWorkerModal}
        onClose={() => setShowWorkerModal(false)}
        onSave={handleAddWorker}
      />
      <AddBudgetModal
        open={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSave={handleAddBudget}
      />
      <AddContractModal
        open={showContractModal}
        onClose={() => setShowContractModal(false)}
        onSave={handleAddContract}
      />
      <VisitModeModal
        open={showVisitMode}
        onClose={() => setShowVisitMode(false)}
      />
    </div>
  );
}