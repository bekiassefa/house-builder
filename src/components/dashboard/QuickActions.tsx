import { useLanguage } from '../../contexts/LanguageContext';
import { Plus, Users, Wallet, Camera, FileSignature } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuickActionsProps {
  onAddTransaction: () => void;
  onAddWorker: () => void;
  onAddBudget: () => void;
  onVisitMode: () => void;
  onAddContract: () => void;
}

export function QuickActions({
  onAddTransaction,
  onAddWorker,
  onAddBudget,
  onVisitMode,
  onAddContract
}: QuickActionsProps) {
  const { t } = useLanguage();

  const actions = [
    {
      label: 'addTransaction',
      icon: Plus,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100/50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
      onClick: onAddTransaction
    },
    {
      label: 'addWorker',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100/50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/40',
      onClick: onAddWorker
    },
    {
      label: 'addBudget',
      icon: Wallet,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100/50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/40',
      onClick: onAddBudget
    },
    {
      label: 'addContract',
      icon: FileSignature,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100/50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/40',
      onClick: onAddContract
    },
    {
      label: 'visitMode',
      icon: Camera,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-100/50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-800',
      hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/40',
      onClick: onVisitMode
    }
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-foreground flex items-center gap-2">
        <span className="w-1 h-6 bg-primary rounded-full"></span>
        {t('quickEntry')}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={action.onClick}
              className={cn(
                "group flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
                action.bg,
                action.border,
                action.hover
              )}
            >
              <div className={cn(
                "p-3 rounded-full bg-white dark:bg-background shadow-sm transition-transform group-hover:scale-110", 
                action.color
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-foreground/80 text-center leading-tight">
                {t(action.label)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}