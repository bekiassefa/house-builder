import { useLanguage } from '../../contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useState, useRef } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { toast } from 'sonner';
import { Camera, StickyNote, Loader2, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../../lib/utils';

export function VisitModeModal({ open, onClose }: any) {
  const { t } = useLanguage();
  const { addDailyLog, dailyLogs, updateDailyLog } = useAppData();
  const [note, setNote] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      try {
        const compressedBase64 = await compressImage(e.target.files[0]);
        setSelectedImage(compressedBase64);
      } catch (error) {
        console.error("Error processing image", error);
        toast.error("Failed to process image");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveVisit = () => {
    if (!note.trim() && !selectedImage) {
        toast.error("Please add a note or take a photo");
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const existingLog = dailyLogs.find(l => l.date === today);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const noteWithTimestamp = note.trim() ? `[${timestamp}] ${note}` : '';

    if (existingLog) {
        // Update existing log
        const updatedNotes = existingLog.notes 
            ? existingLog.notes + (noteWithTimestamp ? '\n\n' + noteWithTimestamp : '')
            : noteWithTimestamp;
        
        const updatedPhotos = selectedImage 
            ? [...existingLog.photos, selectedImage] 
            : existingLog.photos;

        updateDailyLog(existingLog.id, {
            notes: updatedNotes,
            photos: updatedPhotos
        });
    } else {
        // Create new log
        addDailyLog({
            date: today,
            tasks: [],
            issues: [],
            photos: selectedImage ? [selectedImage] : [],
            notes: noteWithTimestamp,
            workersPresent: 0
        });
    }
    
    toast.success(t('visitLogSaved'));
    
    // Reset form
    setNote('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{t('visitModeTitle')}</DialogTitle></DialogHeader>
        
        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button 
            variant={selectedImage ? "default" : "outline"} 
            className="h-24 flex flex-col gap-2 relative overflow-hidden" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
             {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
             ) : selectedImage ? (
                <>
                    <img src={selectedImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="z-10 flex flex-col items-center">
                         <ImageIcon className="h-8 w-8" />
                         <span className="text-xs">Retake</span>
                    </div>
                </>
             ) : (
                <>
                    <Camera className="h-8 w-8 text-primary" />
                    <span>{t('takePhoto')}</span>
                </>
             )}
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => document.getElementById('visit-note')?.focus()}>
             <StickyNote className="h-8 w-8 text-orange-500" />
             <span>{t('addNote')}</span>
          </Button>
        </div>

        <div className="space-y-2">
          <Textarea 
            id="visit-note"
            placeholder="Quick site observation..." 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
            <Button className="flex-1" onClick={handleSaveVisit}>{t('save')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}