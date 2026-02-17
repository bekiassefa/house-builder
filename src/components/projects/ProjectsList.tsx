import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { Button } from '../ui/button';
import { Plus, Folder, Check, Archive, Calendar, Building, Users, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

export function ProjectsList() {
  const { t } = useLanguage();
  const { projects, activeProjectId, setActiveProjectId, createProject, archiveProject } = useAppData();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [initialBudget, setInitialBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedFinishDate, setExpectedFinishDate] = useState('');
  const [projectType, setProjectType] = useState('G+0');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    createProject({
      name: newProjectName,
      description: 'New Project',
      startDate: startDate,
      expectedFinishDate: expectedFinishDate,
      projectType: projectType,
      initialBudget: Number(initialBudget) || 0,
      status: 'active'
    });

    setNewProjectName('');
    setInitialBudget('');
    setExpectedFinishDate('');
    setProjectType('G+0');
    setShowNewProjectModal(false);
    toast.success(t('savedSuccess'));
  };

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t('deleteConfirm'))) {
      archiveProject(id);
      toast.success("Project archived");
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-ET').format(amount);

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('projects')}</h1>
        <Button onClick={() => setShowNewProjectModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newProject')}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-muted-foreground">Active ({projects.filter(p => p.status === 'active').length})</h2>
        <div className="grid gap-6 md:grid-cols-2">
            {projects.filter(p => p.status === 'active').map(p => {
            const isActive = p.id === activeProjectId;
            
            // Calculate totals for card display
            const injections = p.budgetInjections.reduce((sum, i) => sum + i.amount, 0);
            const totalBudget = p.initialBudget + injections;
            
            const transactionSpent = p.transactions.reduce((sum, t) => sum + t.amount, 0);
            const contractSpent = p.contracts.reduce((sum, c) => 
                sum + c.payments.reduce((ps, pay) => ps + pay.amount, 0), 0);
            const laborSpent = p.weeklyPayments.reduce((sum, wp) => {
                if (!wp.payments) return sum;
                return sum + (Object.values(wp.payments) as number[]).reduce((dSum, dVal) => dSum + dVal, 0);
            }, 0);
            const spent = transactionSpent + contractSpent + laborSpent;

            return (
                <div 
                key={p.id} 
                className={cn(
                    "group p-6 border rounded-xl bg-card shadow-sm transition-all relative overflow-hidden cursor-pointer hover:shadow-md",
                    isActive ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"
                )}
                onClick={() => setActiveProjectId(p.id)}
                >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shadow-sm", isActive ? "bg-primary text-primary-foreground" : "bg-orange-100 text-orange-600")}>
                        <Folder className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">{p.description}</p>
                    </div>
                    </div>
                    {isActive ? (
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold flex items-center gap-1">
                            <Check className="h-3 w-3" /> {t('active')}
                        </div>
                    ) : (
                         <div className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                            {p.projectType || 'G+0'}
                         </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-secondary/20 p-3 rounded-lg text-center">
                        <span className="text-xs text-muted-foreground block mb-1">{t('totalBudget')}</span>
                        <span className="font-bold text-foreground">{formatCurrency(totalBudget)}</span>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-lg text-center">
                        <span className="text-xs text-muted-foreground block mb-1">{t('spent')}</span>
                        <span className="font-bold text-foreground">{formatCurrency(spent)}</span>
                    </div>
                    <div className="bg-secondary/20 p-3 rounded-lg text-center">
                        <span className="text-xs text-muted-foreground block mb-1">{t('workersCount')}</span>
                        <span className="font-bold text-foreground">{p.workers.length}</span>
                    </div>
                </div>

                {injections > 0 && (
                     <div className="mb-4 text-xs bg-green-50 text-green-700 px-3 py-2 rounded-md border border-green-100 flex justify-between">
                        <span>{t('initialBudget')}: {formatCurrency(p.initialBudget)}</span>
                        <span className="font-semibold">+ {t('injectedBudget')}: {formatCurrency(injections)}</span>
                     </div>
                )}
                
                <div className="pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs">{t('started')} {new Date(p.startDate).toLocaleDateString()}</span>
                        </div>
                        {p.expectedFinishDate && (
                            <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                                <Calendar className="h-3 w-3" />
                                <span>Exp. Finish: {new Date(p.expectedFinishDate).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-destructive" onClick={(e) => handleArchive(e, p.id)}>
                        <Archive className="h-3 w-3" /> {t('archiveProject')}
                    </Button>
                </div>
                </div>
            );
            })}
        </div>

        {projects.some(p => p.status === 'archived') && (
            <>
                <h2 className="text-lg font-semibold text-muted-foreground mt-8">{t('archivedProjects')}</h2>
                <div className="grid gap-6 md:grid-cols-2 opacity-75">
                    {projects.filter(p => p.status === 'archived').map(p => (
                        <div key={p.id} className="p-6 border rounded-xl bg-muted/20">
                            <h3 className="font-bold text-lg">{p.name}</h3>
                            <p className="text-sm text-muted-foreground">Ended: {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </>
        )}
      </div>

      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('newProject')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('projectName')}</Label>
              <Input 
                value={newProjectName} 
                onChange={(e) => setNewProjectName(e.target.value)} 
                placeholder="e.g. My Dream House"
                autoFocus
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>{t('projectType')}</Label>
                    <Select value={projectType} onValueChange={setProjectType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {['G+0', 'G+1', 'G+2', 'G+3', 'G+4', 'G+5'].map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>{t('initialBudget')} ({t('etb')})</Label>
                    <Input 
                        type="number"
                        value={initialBudget} 
                        onChange={(e) => setInitialBudget(e.target.value)} 
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>{t('started')}</Label>
                    <Input 
                        type="date"
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <Label>{t('expectedFinish')}</Label>
                    <Input 
                        type="date"
                        value={expectedFinishDate} 
                        onChange={(e) => setExpectedFinishDate(e.target.value)} 
                    />
                </div>
            </div>

            <Button type="submit" className="w-full mt-4">{t('save')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}