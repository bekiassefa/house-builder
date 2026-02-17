import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { AddTransactionModal } from '../modals/AddTransactionModal';
import { Transaction } from '../../types';
import { toast } from 'sonner';

export function TransactionsList() {
  const { t } = useLanguage();
  const { transactions, addTransaction } = useAppData();
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    addTransaction(data);
    setShowAddTransactionModal(false);
    toast.success(t('savedSuccess'));
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('transactions')}</h1>
        <Button onClick={() => setShowAddTransactionModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addTransaction')}
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="mb-2">{t('noData')}</p>
            <Button variant="link" onClick={() => setShowAddTransactionModal(true)}>Add your first transaction</Button>
          </div>
        ) : (
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 flex justify-between items-center hover:bg-secondary/20 transition-colors">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{transaction.date}</span>
                    <span>•</span>
                    <span className="capitalize">{transaction.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{new Intl.NumberFormat('en-ET').format(transaction.amount)}</p>
                  <p className="text-xs uppercase text-muted-foreground">{t('etb')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddTransactionModal 
        open={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        onSave={handleAddTransaction}
      />
    </div>
  );
}