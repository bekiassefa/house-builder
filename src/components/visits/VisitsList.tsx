import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { Calendar, ImageIcon, FileText, Clock, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { VisitModeModal } from '../modals/VisitModeModal';
import { cn } from '../../lib/utils';

export function VisitsList() {
  const { t } = useLanguage();
  const { dailyLogs } = useAppData();
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter logs that have photos or notes
  const visitLogs = dailyLogs
    .filter(log => (log.photos && log.photos.length > 0) || (log.notes && log.notes.trim().length > 0))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
        <div className="flex justify-between items-center bg-card p-4 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-card/80">
            <div>
                <h1 className="text-2xl font-bold">{t('visits')}</h1>
                <p className="text-sm text-muted-foreground">{visitLogs.length} logs recorded</p>
            </div>
            <Button onClick={() => setShowVisitModal(true)} className="gap-2 shadow-lg shadow-primary/20">
                <ImageIcon className="h-4 w-4" />
                {t('visitMode')}
            </Button>
        </div>

        {visitLogs.length === 0 ? (
             <div className="p-12 text-center border-2 border-dashed rounded-3xl bg-secondary/5">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">No visits recorded</h3>
                <p className="text-muted-foreground mb-4">{t('noVisits')}</p>
                <Button onClick={() => setShowVisitModal(true)}>Record your first visit</Button>
             </div>
        ) : (
            <div className="relative pl-4 md:pl-8 space-y-8">
                {/* Timeline Line */}
                <div className="absolute left-[19px] md:left-[35px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />

                {visitLogs.map((log, index) => (
                    <div key={log.id} className="relative pl-8 md:pl-10 animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                        {/* Timeline Dot */}
                        <div className="absolute left-3 md:left-[27px] top-6 w-4 h-4 rounded-full bg-background border-4 border-primary shadow-sm z-10" />

                        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-4 border-b bg-secondary/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center justify-center bg-background rounded-lg border p-1.5 min-w-[50px]">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">{new Date(log.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-xl font-bold leading-none">{new Date(log.date).getDate()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{formatDate(log.date)}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Visit Log
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5 space-y-4">
                                {/* Notes Section */}
                                {log.notes && (
                                    <div className="flex gap-4 p-4 rounded-xl bg-secondary/20">
                                        <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                                            {log.notes}
                                        </div>
                                    </div>
                                )}

                                {/* Photos Grid */}
                                {log.photos && log.photos.length > 0 && (
                                    <div className={cn(
                                        "grid gap-2", 
                                        log.photos.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-4"
                                    )}>
                                        {log.photos.map((photo, idx) => (
                                            <div 
                                                key={idx} 
                                                className={cn(
                                                    "rounded-xl overflow-hidden bg-secondary relative cursor-pointer group shadow-sm hover:ring-2 ring-primary/50 transition-all",
                                                    log.photos.length === 1 ? "aspect-video max-h-[300px]" : "aspect-square"
                                                )}
                                                onClick={() => setSelectedImage(photo)}
                                            >
                                                <img src={photo} alt={`Visit photo ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        <VisitModeModal 
            open={showVisitModal} 
            onClose={() => setShowVisitModal(false)} 
        />

        {/* Image Preview Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none shadow-2xl">
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    {selectedImage && (
                        <img src={selectedImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl" />
                    )}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-4 right-4 text-white hover:bg-white/20" 
                        onClick={() => setSelectedImage(null)}
                    >
                        <span className="text-2xl">&times;</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}