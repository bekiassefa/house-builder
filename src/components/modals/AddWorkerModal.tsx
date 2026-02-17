import { useLanguage } from '../../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';

export function AddWorkerModal({ open, onClose, onSave }: any) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave({ name, dailyRate: Number(rate), phone: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('addWorker')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder={t('name')} value={name} onChange={(e: any) => setName(e.target.value)} />
          <Input placeholder={t('dailyRate')} type="number" value={rate} onChange={(e: any) => setRate(e.target.value)} />
          <Button type="submit">{t('save')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}