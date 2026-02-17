import { useLanguage } from '../../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import { Wallet } from 'lucide-react';

interface AddBudgetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (amount: number, notes?: string, source?: string) => void;
}

export function AddBudgetModal({ open, onClose, onSave }: AddBudgetModalProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Number(amount), notes, source);
    setAmount('');
    setSource('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t('injections')} {/* Using 'Injections' or similar to signify adding to budget */}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('amount')} ({t('etb')})</Label>
            <Input 
                placeholder="0.00" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required
                className="text-lg font-semibold"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('source')}</Label>
            <Input 
                placeholder="e.g. Bank Loan, Personal Savings" 
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>{t('notes')}</Label>
            <Textarea 
                placeholder="Add details about this injection..." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
            />
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">{t('save')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}