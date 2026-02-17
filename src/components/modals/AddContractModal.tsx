import { useLanguage } from '../../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';

export function AddContractModal({ open, onClose, onSave }: any) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [contractor, setContractor] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave({ name, contractorName: contractor, totalAmount: Number(amount), status: 'active' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('addContract')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder={t('contractName')} value={name} onChange={(e: any) => setName(e.target.value)} />
          <Input placeholder={t('contractorName')} value={contractor} onChange={(e: any) => setContractor(e.target.value)} />
          <Input placeholder={t('totalAmount')} type="number" value={amount} onChange={(e: any) => setAmount(e.target.value)} />
          <Button type="submit">{t('save')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}