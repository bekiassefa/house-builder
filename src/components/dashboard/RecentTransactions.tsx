import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { cn } from '../../lib/utils';
import { 
  Package, 
  Users, 
  FileText, 
  Settings, 
  MoreHorizontal, 
  Droplets, 
  Zap, 
  Truck,
  ArrowRight
} from 'lucide-react';

export function RecentTransactions() {
  const { t } = useLanguage();
  const { recentPayments } = useAppData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET').format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ET', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getIconAndColor = (type: string, category?: string) => {
    if (type === 'Labor') return { Icon: Users, color: 'bg-blue-500/10 text-blue-600' };
    if (type === 'Contract') return { Icon: FileText, color: 'bg-purple-500/10 text-purple-600' };
    
    switch (category) {
      case 'materials': return { Icon: Package, color: 'bg-emerald-500/10 text-emerald-600' };
      case 'admin': return { Icon: Settings, color: 'bg-orange-500/10 text-orange-600' };
      case 'water': return { Icon: Droplets, color: 'bg-cyan-500/10 text-cyan-600' };
      case 'transport': return { Icon: Truck, color: 'bg-indigo-500/10 text-indigo-600' };
      default: return { Icon: MoreHorizontal, color: 'bg-gray-500/10 text-gray-600' };
    }
  };

  const displayPayments = recentPayments.slice(0, 5);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
            {t('recentPayments')}
        </h2>
        {recentPayments.length > 5 && (
            <button className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
            </button>
        )}
      </div>
      
      {displayPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed rounded-2xl bg-secondary/5">
            <div className="p-3 bg-secondary rounded-full mb-3">
                <FileText className="h-6 w-6 opacity-50" />
            </div>
            <p>{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayPayments.map((payment, index) => {
            const { Icon, color } = getIconAndColor(payment.type, payment.category);
            
            return (
              <div
                key={`${payment.id}-${index}`}
                className="group flex items-center gap-4 rounded-2xl border bg-card p-3 transition-all hover:shadow-md hover:border-primary/20"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:scale-105", color)}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{payment.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-secondary">{payment.type === 'Transaction' && payment.category ? t(payment.category) : payment.type}</span>
                    <span>•</span>
                    <span>{formatDate(payment.date)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-foreground tabular-nums">-{formatCurrency(payment.amount)}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('etb')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}