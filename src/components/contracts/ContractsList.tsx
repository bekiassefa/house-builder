import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { Button } from '../ui/button';
import { Plus, FileText, History } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';
import { AddContractModal } from '../modals/AddContractModal';
import { Contract } from '../../types';

export function ContractsList() {
  const { t } = useLanguage();
  const { contracts, addContract, addContractPayment } = useAppData();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  const handleOpenPaymentModal = (contractId: string) => {
    setSelectedContractId(contractId);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentNotes('');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId || !paymentAmount) return;

    addContractPayment(selectedContractId, Number(paymentAmount), paymentDate, paymentNotes);
    toast.success(t('savedSuccess'));
    setSelectedContractId(null);
  };

  const handleAddContract = (data: Omit<Contract, 'id' | 'createdAt' | 'payments'>) => {
    addContract(data);
    setShowAddContractModal(false);
    toast.success(t('savedSuccess'));
  };

  const selectedContract = contracts.find(c => c.id === selectedContractId);

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('contracts')}</h1>
        <Button onClick={() => setShowAddContractModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addContract')}
        </Button>
      </div>
      
      {contracts.length === 0 ? (
        <div className="p-8 text-center border rounded-xl bg-card">
          <p className="text-muted-foreground">{t('noData')}</p>
          <Button variant="link" onClick={() => setShowAddContractModal(true)}>Create your first contract</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contracts.map(c => {
            const paid = c.payments.reduce((sum, p) => sum + p.amount, 0);
            const progress = c.totalAmount > 0 ? (paid / c.totalAmount) * 100 : 0;
            const isExpanded = expandedContractId === c.id;
            
            return (
              <div key={c.id} className="p-5 border rounded-xl bg-card shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{c.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {c.contractorName}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium capitalize">
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid: {new Intl.NumberFormat('en-ET').format(paid)}</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-right text-xs text-muted-foreground">
                    Total: {new Intl.NumberFormat('en-ET').format(c.totalAmount)} ETB
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setExpandedContractId(isExpanded ? null : c.id)}
                    >
                        <History className="h-4 w-4 mr-2" />
                        {isExpanded ? t('hideHistory') : t('viewHistory')}
                    </Button>
                    <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleOpenPaymentModal(c.id)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addPayment')}
                    </Button>
                </div>

                {isExpanded && (
                    <div className="pt-4 border-t animate-in slide-in-from-top-2 duration-200">
                        <h4 className="font-medium text-sm mb-3">{t('paymentHistory')}</h4>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            {c.payments.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-2">{t('noData')}</p>
                            ) : (
                                c.payments
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map(p => (
                                    <div key={p.id} className="bg-secondary/30 p-2.5 rounded-lg text-sm space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">{new Intl.NumberFormat('en-ET').format(p.amount)} ETB</span>
                                            <span className="text-xs text-muted-foreground">{p.date}</span>
                                        </div>
                                        {p.notes && <p className="text-xs text-muted-foreground break-words">{p.notes}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Payment Modal */}
      <Dialog open={!!selectedContractId} onOpenChange={(open) => !open && setSelectedContractId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addPayment')} - {selectedContract?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('amount')} ({t('etb')})</Label>
              <Input 
                type="number" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                placeholder="0.00"
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('date')}</Label>
              <Input 
                type="date" 
                value={paymentDate} 
                onChange={(e) => setPaymentDate(e.target.value)} 
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('description')}</Label>
              <Textarea 
                value={paymentNotes} 
                onChange={(e) => setPaymentNotes(e.target.value)} 
                placeholder="Optional notes..."
              />
            </div>
            <Button type="submit" className="w-full">{t('save')}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Contract Modal */}
      <AddContractModal 
        open={showAddContractModal}
        onClose={() => setShowAddContractModal(false)}
        onSave={handleAddContract}
      />
    </div>
  );
}