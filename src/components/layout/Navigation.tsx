import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Calendar, 
  FileText, 
  FileSignature, 
  FolderKanban,
  CheckSquare,
  Camera
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'transactions', label: t('transactions'), icon: Receipt },
    { id: 'visits', label: t('visits'), icon: Camera },
    { id: 'contracts', label: t('contracts'), icon: FileSignature },
    { id: 'labor', label: t('labor'), icon: Users },
    { id: 'progress', label: t('progress'), icon: CheckSquare },
    { id: 'planner', label: t('planner'), icon: Calendar },
    { id: 'reports', label: t('reports'), icon: FileText },
    { id: 'projects', label: t('projects'), icon: FolderKanban },
  ];

  return (
    <>
      {/* Mobile Floating Navigation */}
      <nav className="fixed bottom-4 left-2 right-2 z-50 md:hidden">
        <div className="flex items-center px-1 py-1.5 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 min-w-[68px] shrink-0",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md transform scale-105" 
                    : "text-muted-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1 transition-transform", isActive && "-translate-y-0.5")} />
                <span className="text-[10px] font-semibold leading-none whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col gap-2 p-4 h-full">
        <div className="mb-6 px-2">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Menu</h2>
        </div>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-sm font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "fill-current")} />
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/20 rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}