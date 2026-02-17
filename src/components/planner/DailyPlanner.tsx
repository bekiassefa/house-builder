import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
    CheckCircle2, 
    Circle, 
    Plus, 
    ChevronLeft, 
    ChevronRight, 
    CalendarDays, 
    Users, 
    CheckCircle, 
    ListTodo,
    Sparkles,
    CalendarClock,
    Link,
    Trophy,
    Medal
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { Progress } from '../ui/progress';
import { AiPlannerModal } from '../modals/AiPlannerModal';
import { AddChecklistTaskModal } from '../modals/AddChecklistTaskModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Task } from '../../types';

export function DailyPlanner() {
  const { t } = useLanguage();
  const { 
      dailyLogs, 
      addDailyLog, 
      addTaskToLog, 
      updateTaskInLog, 
      updateDailyLog, 
      checklist,
      updateChecklist 
  } = useAppData();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [workersInput, setWorkersInput] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Get log for selected date
  const currentLog = useMemo(() => dailyLogs.find(l => l.date === selectedDate), [dailyLogs, selectedDate]);
  
  // Stats for the day
  const dailyTasks = currentLog?.tasks || [];
  const completedTasks = dailyTasks.filter(t => t.status === 'completed');
  const progress = dailyTasks.length > 0 ? (completedTasks.length / dailyTasks.length) * 100 : 0;
  
  // Future Plans (Tasks from dates after selected date)
  const futureLogs = useMemo(() => {
    return dailyLogs
        .filter(l => l.date > selectedDate)
        .sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyLogs, selectedDate]);

  const handleDateChange = (days: number) => {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + days);
      setSelectedDate(d.toISOString().split('T')[0]);
      setWorkersInput(''); // Reset input when changing date
  };

  const jumpToToday = () => {
      setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
        title: newTaskTitle,
        status: 'not_started',
        priority: newTaskPriority,
        date: selectedDate
    });
    
    setNewTaskTitle('');
    setNewTaskPriority('medium');
  };

  const addTask = (taskData: Omit<Task, 'id'>) => {
    if (!currentLog) {
      addDailyLog({
        date: selectedDate,
        tasks: [{
          ...taskData,
          id: Math.random().toString(36).substr(2, 9),
        }],
        issues: [],
        photos: [],
        workersPresent: 0
      });
    } else {
      addTaskToLog(currentLog.id, taskData);
    }
    toast.success(t('savedSuccess'));
  };

  const toggleTaskStatus = (taskId: string, currentStatus: string, checklistId?: string) => {
    if (!currentLog) return;
    const nextStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
    
    // 1. Update the Daily Planner Task
    updateTaskInLog(currentLog.id, taskId, { status: nextStatus as any });

    // 2. Sync with Global Construction Checklist if linked
    if (checklistId) {
        let newCompletedItems = [...checklist.completedItems];
        
        if (nextStatus === 'completed') {
            if (!newCompletedItems.includes(checklistId)) {
                newCompletedItems.push(checklistId);
                toast.success("Milestone achieved!", {
                    description: "Construction progress updated."
                });
            }
        } else {
            // If unchecking in planner, remove from global progress to keep sync
            newCompletedItems = newCompletedItems.filter(id => id !== checklistId);
        }
        
        updateChecklist(checklist.buildingType, newCompletedItems);
    }
  };

  const handleSaveWorkers = () => {
      const count = parseInt(workersInput);
      if (isNaN(count)) return;

      if (!currentLog) {
         addDailyLog({
            date: selectedDate,
            tasks: [],
            issues: [],
            photos: [],
            workersPresent: count
         });
      } else {
          updateDailyLog(currentLog.id, { workersPresent: count });
      }
      toast.success(t('savedSuccess'));
  };

  const formatDateDisplay = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return "border-l-red-500";
      case 'medium': return "border-l-orange-500";
      case 'low': return "border-l-green-500";
      default: return "border-l-gray-300";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high': return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      case 'medium': return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
      case 'low': return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Date Navigation Card */}
      <div className="bg-card border rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-10 backdrop-blur-md bg-card/80">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => handleDateChange(-1)}>
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                    <span>{formatDateDisplay(selectedDate)}</span>
                </div>
                {selectedDate === new Date().toISOString().split('T')[0] && (
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{t('today')}</span>
                )}
            </div>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => handleDateChange(1)}>
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
        
        {selectedDate !== new Date().toISOString().split('T')[0] && (
            <Button variant="secondary" size="sm" onClick={jumpToToday} className="text-xs rounded-full">
                Back to Today
            </Button>
        )}
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-5 flex flex-col justify-between text-white shadow-lg shadow-blue-500/20">
              <div className="flex justify-between items-start z-10">
                  <div>
                      <h3 className="text-3xl font-bold">{dailyTasks.length}</h3>
                      <p className="text-sm opacity-90">{t('todaysTasks')}</p>
                  </div>
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <ListTodo className="h-5 w-5 text-white" />
                  </div>
              </div>
              <div className="mt-6 z-10">
                   <div className="flex justify-between text-xs mb-1.5 opacity-90 font-medium">
                      <span>{t('completionRate')}</span>
                      <span>{Math.round(progress)}%</span>
                   </div>
                   <Progress value={progress} className="h-2 bg-black/20" />
              </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-5 flex flex-col justify-between text-white shadow-lg shadow-emerald-500/20">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-3xl font-bold">{completedTasks.length}</h3>
                      <p className="text-sm opacity-90">{t('taskStatus')}: {t('completed')}</p>
                  </div>
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <CheckCircle className="h-5 w-5 text-white" />
                  </div>
              </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 flex flex-col justify-between text-white shadow-lg shadow-orange-500/20">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-3xl font-bold">
                        {currentLog?.workersPresent || 0}
                      </h3>
                      <p className="text-sm opacity-90">{t('workersPresent')}</p>
                  </div>
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Users className="h-5 w-5 text-white" />
                  </div>
              </div>
              <div className="mt-4 flex gap-2">
                 <Input 
                    type="number" 
                    placeholder="0"
                    className="h-8 bg-white/20 border-transparent text-white placeholder:text-white/50 focus-visible:ring-white/50" 
                    value={workersInput}
                    onChange={(e) => setWorkersInput(e.target.value)}
                 />
                 <Button size="sm" variant="secondary" className="h-8 bg-white text-orange-600 hover:bg-white/90 border-0" onClick={handleSaveWorkers}>
                    {t('save')}
                 </Button>
              </div>
          </div>
      </div>

      {/* Task List Section */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-secondary/5 flex flex-col md:flex-row justify-between items-center gap-3">
            <h2 className="font-bold flex items-center gap-2 text-lg">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                {t('todaysTasks')}
            </h2>
            <div className="flex gap-2 w-full md:w-auto">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 md:flex-none gap-2 rounded-xl"
                    onClick={() => setShowChecklistModal(true)}
                >
                    <Link className="h-3.5 w-3.5" />
                    Link Milestone
                </Button>
                <Button 
                    size="sm" 
                    className="flex-1 md:flex-none gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:opacity-90 rounded-xl"
                    onClick={() => setShowAiModal(true)}
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('suggestTasks')}
                </Button>
            </div>
        </div>
        
        <div className="p-6">
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mb-8">
                <div className="flex-1">
                    <Input 
                        placeholder={t('addTask')} 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="bg-background h-12 text-base rounded-xl"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={newTaskPriority} onValueChange={(v: any) => setNewTaskPriority(v)}>
                        <SelectTrigger className="w-[110px] h-12 rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="high">{t('high')}</SelectItem>
                            <SelectItem value="medium">{t('medium')}</SelectItem>
                            <SelectItem value="low">{t('low')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit" size="icon" className="bg-primary h-12 w-12 rounded-xl shrink-0 shadow-lg shadow-primary/25">
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            </form>

            <div className="space-y-3">
            {dailyTasks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-secondary/5">
                    <ListTodo className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">{t('noData')}</p>
                    <p className="text-xs text-muted-foreground/70 mb-4">Start your day by adding tasks</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="link" size="sm" onClick={() => setShowChecklistModal(true)}>
                            Import from Checklist
                        </Button>
                        <Button variant="link" size="sm" onClick={() => setShowAiModal(true)}>
                            Ask AI to generate a plan
                        </Button>
                    </div>
                </div>
            ) : (
                dailyTasks.map(task => {
                    const isCompleted = task.status === 'completed';
                    const isMilestone = !!task.checklistId;

                    return (
                        <div key={task.id} className={cn(
                            "group flex items-center gap-4 p-4 rounded-2xl border bg-card transition-all duration-200 hover:shadow-md border-l-4",
                            getPriorityColor(task.priority),
                            isCompleted && "opacity-60 bg-secondary/20"
                        )}>
                            <button 
                                onClick={() => toggleTaskStatus(task.id, task.status, task.checklistId)}
                                className="shrink-0 transition-transform active:scale-90"
                            >
                            {isCompleted ? (
                                <CheckCircle2 className={cn("h-6 w-6", isMilestone ? "text-green-600" : "text-primary")} />
                            ) : (
                                <Circle className={cn(
                                    "h-6 w-6 transition-colors",
                                    isMilestone ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground group-hover:text-primary"
                                )} />
                            )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "text-base block font-medium truncate transition-all", 
                                        isCompleted && "line-through text-muted-foreground font-normal"
                                    )}>
                                        {task.title}
                                    </span>
                                    {isMilestone && (
                                        <span className={cn(
                                            "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border transition-colors",
                                            isCompleted 
                                                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800"
                                                : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800"
                                        )}>
                                            {isCompleted ? <Medal className="h-3 w-3" /> : <Trophy className="h-3 w-3" />}
                                            Milestone
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className={cn("text-[10px] px-2.5 py-1 rounded-full capitalize font-bold tracking-wide", 
                                    getPriorityBadge(task.priority)
                                )}>
                                    {t(task.priority)}
                                </span>
                            </div>
                        </div>
                    );
                })
            )}
            </div>
        </div>
      </div>

      {/* Future Plans Section */}
      {futureLogs.length > 0 && (
          <div className="space-y-4 pt-6">
              <h3 className="font-bold text-muted-foreground flex items-center gap-2 text-sm uppercase tracking-wider pl-1">
                  <CalendarClock className="h-4 w-4" />
                  {t('futurePlans')}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {futureLogs.map(log => (
                      <div key={log.id} className="bg-card/50 border rounded-2xl p-5 hover:bg-card hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedDate(log.date)}>
                          <div className="flex justify-between items-center mb-4">
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors">{formatDateDisplay(log.date)}</span>
                              <span className="text-xs bg-secondary px-2.5 py-1 rounded-full font-medium">{log.tasks.length} tasks</span>
                          </div>
                          <div className="space-y-2">
                              {log.tasks.slice(0, 3).map(t => (
                                  <div key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <div className={cn("h-2 w-2 rounded-full shrink-0", 
                                          t.priority === 'high' ? "bg-red-500" :
                                          t.priority === 'medium' ? "bg-orange-500" : "bg-green-500"
                                      )} />
                                      <span className="truncate">{t.title}</span>
                                  </div>
                              ))}
                              {log.tasks.length > 3 && (
                                  <p className="text-xs text-primary font-medium pl-4">+ {log.tasks.length - 3} more</p>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* AI Modal */}
      <AiPlannerModal 
        open={showAiModal} 
        onClose={() => setShowAiModal(false)} 
        selectedDate={selectedDate}
      />

      {/* Checklist Import Modal */}
      <AddChecklistTaskModal 
        open={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        onAdd={addTask}
        selectedDate={selectedDate}
      />
    </div>
  );
}