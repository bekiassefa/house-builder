import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { cn } from '../../lib/utils';
import { TrendingDown, AlertTriangle, CheckCircle, History, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { BudgetHistoryModal } from '../modals/BudgetHistoryModal';

interface BudgetCardProps {
  onAddBudget?: () => void;
}

export function BudgetCard({ onAddBudget }: BudgetCardProps) {
  const { t } = useLanguage();
  const {
    activeProject,
    totalBudget,
    totalSpent,
    remainingBudget,
    budgetPercentage,
    budgetStatus,
  } = useAppData();
  
  const [showHistory, setShowHistory] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { notation: "compact", maximumFractionDigits: 1 }).format(amount);
  };

  const fullCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET').format(amount);
  }

  const getStatusConfig = () => {
    switch (budgetStatus) {
      case 'on_track':
        return {
          textColor: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          icon: CheckCircle,
          message: t('onTrack'),
          progressColor: 'bg-gradient-to-r from-emerald-500 to-teal-400'
        };
      case 'warning':
        return {
          textColor: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          icon: AlertTriangle,
          message: t('budgetWarning'),
          progressColor: 'bg-gradient-to-r from-amber-500 to-orange-400'
        };
      case 'over_budget':
        return {
          textColor: 'text-rose-500',
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/20',
          icon: TrendingDown,
          message: t('overBudget'),
          progressColor: 'bg-gradient-to-r from-rose-500 to-red-400'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const injectionTotal = activeProject?.budgetInjections.reduce((sum, i) => sum + i.amount, 0) || 0;

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-md transition-all hover:shadow-lg group">
        {/* Ambient Gradient Background */}
        <div className={cn("absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl")} />
        
        {/* Header */}
        <div className="relative z-10 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
                <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{t('budgetStatus')}</h2>
            
            <div className="flex items-center bg-secondary/50 rounded-full p-1 ml-2 border border-border/50">
                <button 
                    onClick={() => setShowHistory(true)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-background"
                    title={t('budgetHistory')}
                >
                    <History className="h-3.5 w-3.5" />
                </button>
                {onAddBudget && (
                  <>
                    <div className="w-px h-3 bg-border mx-0.5"></div>
                    <button 
                        onClick={onAddBudget}
                        className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-full hover:bg-background"
                        title={t('addBudget')}
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
            </div>
          </div>
          
          <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border backdrop-blur-sm", statusConfig.bgColor, statusConfig.textColor, statusConfig.borderColor)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.message}
          </div>
        </div>

        {/* Breakdown Text */}
        <div className="relative z-10 mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-md border border-transparent hover:border-border transition-colors cursor-help" title={`Initial: ${fullCurrency(activeProject?.initialBudget || 0)}`}>
              {t('initialBudget')}: <span className="text-foreground font-semibold">{formatCurrency(activeProject?.initialBudget || 0)}</span>
          </span>
          {injectionTotal > 0 && (
             <>
                <span className="text-muted-foreground">+</span>
                <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800 font-semibold cursor-help" title={`Total Injections: ${fullCurrency(injectionTotal)}`}>
                    {t('injections')}: {formatCurrency(injectionTotal)}
                </span>
             </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mb-6">
          <div className="h-5 overflow-hidden rounded-full bg-secondary/50 border border-black/5 dark:border-white/5 relative">
            <div
              className={cn("h-full transition-all duration-1000 ease-out rounded-full shadow-sm relative overflow-hidden", statusConfig.progressColor)}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium">
             <span className="text-muted-foreground">0%</span>
             <span className={statusConfig.textColor}>{budgetPercentage.toFixed(1)}% {t('spent').toLowerCase()}</span>
             <span className="text-muted-foreground">100%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {/* Total Budget Card */}
          <div className="rounded-2xl bg-secondary/20 p-4 flex flex-col justify-center border border-border/50 hover:bg-secondary/30 transition-colors">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1 opacity-70">{t('totalBudget')}</p>
            <p className="text-lg font-bold text-foreground truncate" title={fullCurrency(totalBudget)}>{formatCurrency(totalBudget)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t('etb')}</p>
          </div>
          
          {/* Spent Card */}
          <div className="rounded-2xl bg-orange-500/5 p-4 flex flex-col justify-center border border-orange-500/10 hover:bg-orange-500/10 transition-colors">
            <p className="text-[10px] uppercase tracking-wider text-orange-600 dark:text-orange-400 font-bold mb-1 opacity-80">{t('spent')}</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400 truncate" title={fullCurrency(totalSpent)}>{formatCurrency(totalSpent)}</p>
            <p className="text-[10px] text-orange-600/60 dark:text-orange-400/60 mt-0.5">{t('etb')}</p>
          </div>
          
          {/* Remaining Card */}
          <div className="rounded-2xl bg-emerald-500/5 p-4 flex flex-col justify-center border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors">
            <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-1 opacity-80">{t('remaining')}</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate" title={fullCurrency(remainingBudget)}>{formatCurrency(remainingBudget)}</p>
            <p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60 mt-0.5">{t('etb')}</p>
          </div>
        </div>
      </div>

      <BudgetHistoryModal open={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}