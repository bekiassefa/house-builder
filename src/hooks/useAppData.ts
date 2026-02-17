import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { 
  Project, 
  Transaction, 
  Worker, 
  WeeklyPayment, 
  Contract, 
  ContractPayment, 
  BudgetInjection, 
  Task, 
  DailyLog, 
  BudgetStatus, 
  TransactionCategory,
  ChecklistState,
  PaymentHistoryItem
} from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultProject = (): Project => ({
  id: generateId(),
  name: 'My First Project',
  description: 'My construction project',
  startDate: new Date().toISOString().split('T')[0],
  expectedFinishDate: '',
  projectType: 'G+0',
  initialBudget: 0,
  budgetInjections: [],
  transactions: [],
  workers: [],
  weeklyPayments: [],
  contracts: [],
  dailyLogs: [],
  status: 'active',
  checklist: { buildingType: 0, completedItems: [] },
  createdAt: new Date().toISOString(),
});

export function useAppData() {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', [createDefaultProject()]);
  const [activeProjectId, setActiveProjectId] = useLocalStorage<string>('activeProjectId', projects[0]?.id || '');

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || projects.find(p => p.status === 'active') || projects[0],
    [projects, activeProjectId]
  );

  const updateActiveProject = useCallback((updater: (project: Project) => Project) => {
    setProjects(prev => 
      prev.map(p => p.id === activeProject?.id ? updater(p) : p)
    );
  }, [activeProject?.id, setProjects]);

  // Import / Restore Data
  const importProjectData = useCallback((importedProjects: Project[]) => {
    setProjects(importedProjects);
    if (importedProjects.length > 0) {
        setActiveProjectId(importedProjects[0].id);
    }
  }, [setProjects, setActiveProjectId]);

  // Budget calculations
  const totalBudget = useMemo(() => {
    if (!activeProject) return 0;
    const injections = activeProject.budgetInjections.reduce((sum, i) => sum + i.amount, 0);
    return activeProject.initialBudget + injections;
  }, [activeProject]);

  const totalSpent = useMemo(() => {
    if (!activeProject) return 0;
    const transactionSpent = activeProject.transactions.reduce((sum, t) => sum + t.amount, 0);
    const contractSpent = activeProject.contracts.reduce((sum, c) => 
      sum + c.payments.reduce((ps, p) => ps + p.amount, 0), 0);
    
    // Sum all labor payments
    const laborSpent = activeProject.weeklyPayments.reduce((sum, wp) => {
      if (!wp.payments) return sum;
      return sum + (Object.values(wp.payments) as number[]).reduce((dSum, dVal) => dSum + dVal, 0);
    }, 0);

    return transactionSpent + contractSpent + laborSpent;
  }, [activeProject]);

  const remainingBudget = totalBudget - totalSpent;
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const budgetStatus: BudgetStatus = useMemo(() => {
    if (budgetPercentage >= 100) return 'over_budget';
    if (budgetPercentage >= 80) return 'warning';
    return 'on_track';
  }, [budgetPercentage]);

  // Unified Payment History
  const recentPayments: PaymentHistoryItem[] = useMemo(() => {
    if (!activeProject) return [];
    
    const items: PaymentHistoryItem[] = [];

    // Transactions
    activeProject.transactions.forEach(t => {
      items.push({
        id: t.id,
        date: t.date,
        amount: t.amount,
        description: t.description,
        type: 'Transaction',
        category: t.category
      });
    });

    // Contract Payments
    activeProject.contracts.forEach(c => {
      c.payments.forEach(p => {
        items.push({
          id: p.id,
          date: p.date,
          amount: p.amount,
          description: `Payment to ${c.contractorName} (${c.name})`,
          type: 'Contract'
        });
      });
    });

    // Labor Payments (Flattened by day)
    activeProject.weeklyPayments.forEach(wp => {
      if (!wp.payments) return;
      const weekStart = new Date(wp.weekStart);
      const worker = activeProject.workers.find(w => w.id === wp.workerId);
      const workerName = worker ? worker.name : 'Unknown Worker';
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
      
      days.forEach((day, index) => {
        const amount = wp.payments[day];
        if (amount > 0) {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + index);
          items.push({
            id: `${wp.id}-${day}`,
            date: date.toISOString().split('T')[0],
            amount: amount,
            description: `Labor: ${workerName}`,
            type: 'Labor'
          });
        }
      });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeProject]);

  // Daily Spent Calculation
  const getDailySpent = useCallback((date: string) => {
    return recentPayments
      .filter(p => p.date === date)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [recentPayments]);

  // Project management
  const createProject = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'budgetInjections' | 'transactions' | 'workers' | 'weeklyPayments' | 'contracts' | 'dailyLogs' | 'checklist'>) => {
    const newProject: Project = {
      ...data,
      id: generateId(),
      budgetInjections: [],
      transactions: [],
      workers: [],
      weeklyPayments: [],
      contracts: [],
      dailyLogs: [],
      checklist: { buildingType: 0, completedItems: [] },
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    return newProject;
  }, [setProjects, setActiveProjectId]);

  const archiveProject = useCallback((projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: 'archived' as const, endDate: new Date().toISOString().split('T')[0] } : p
    ));
    const activeProjects = projects.filter(p => p.status === 'active' && p.id !== projectId);
    if (activeProjects.length > 0) {
      setActiveProjectId(activeProjects[0].id);
    }
  }, [projects, setProjects, setActiveProjectId]);

  const restoreProject = useCallback((projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: 'active' as const, endDate: undefined } : p
    ));
  }, [setProjects]);

  // Budget management
  const setInitialBudget = useCallback((amount: number) => {
    updateActiveProject(p => ({ ...p, initialBudget: amount }));
  }, [updateActiveProject]);

  const addBudgetInjection = useCallback((amount: number, notes?: string, source?: string) => {
    const injection: BudgetInjection = {
      id: generateId(),
      amount,
      date: new Date().toISOString().split('T')[0],
      notes,
      source,
      createdAt: new Date().toISOString(),
    };
    updateActiveProject(p => ({
      ...p,
      budgetInjections: [...p.budgetInjections, injection],
    }));
  }, [updateActiveProject]);

  const updateBudgetInjection = useCallback((id: string, data: Partial<BudgetInjection>) => {
    updateActiveProject(p => ({
      ...p,
      budgetInjections: p.budgetInjections.map(i => i.id === id ? { ...i, ...data } : i),
    }));
  }, [updateActiveProject]);

  const deleteBudgetInjection = useCallback((id: string) => {
    updateActiveProject(p => ({
      ...p,
      budgetInjections: p.budgetInjections.filter(i => i.id !== id),
    }));
  }, [updateActiveProject]);

  // Transaction management
  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    updateActiveProject(p => ({
      ...p,
      transactions: [transaction, ...p.transactions],
    }));
  }, [updateActiveProject]);

  const updateTransaction = useCallback((id: string, data: Partial<Transaction>) => {
    updateActiveProject(p => ({
      ...p,
      transactions: p.transactions.map(t => t.id === id ? { ...t, ...data } : t),
    }));
  }, [updateActiveProject]);

  const deleteTransaction = useCallback((id: string) => {
    updateActiveProject(p => ({
      ...p,
      transactions: p.transactions.filter(t => t.id !== id),
    }));
  }, [updateActiveProject]);

  // Worker management
  const addWorker = useCallback((data: Omit<Worker, 'id' | 'createdAt'>) => {
    const worker: Worker = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    updateActiveProject(p => ({
      ...p,
      workers: [...p.workers, worker],
    }));
  }, [updateActiveProject]);

  const updateWorker = useCallback((id: string, data: Partial<Worker>) => {
    updateActiveProject(p => ({
      ...p,
      workers: p.workers.map(w => w.id === id ? { ...w, ...data } : w),
    }));
  }, [updateActiveProject]);

  const deleteWorker = useCallback((id: string) => {
    updateActiveProject(p => ({
      ...p,
      workers: p.workers.filter(w => w.id !== id),
    }));
  }, [updateActiveProject]);

  // Weekly payments
  const addWeeklyPayment = useCallback((data: Omit<WeeklyPayment, 'id' | 'createdAt'>) => {
    const payment: WeeklyPayment = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    updateActiveProject(p => ({
      ...p,
      weeklyPayments: [payment, ...p.weeklyPayments],
    }));
  }, [updateActiveProject]);

  const updateWeeklyPayment = useCallback((id: string, data: Partial<WeeklyPayment>) => {
    updateActiveProject(p => ({
      ...p,
      weeklyPayments: p.weeklyPayments.map(wp => wp.id === id ? { ...wp, ...data } : wp),
    }));
  }, [updateActiveProject]);

  const deleteWeeklyPayment = useCallback((id: string) => {
    updateActiveProject(p => ({
      ...p,
      weeklyPayments: p.weeklyPayments.filter(wp => wp.id !== id),
    }));
  }, [updateActiveProject]);

  // Contract management
  const addContract = useCallback((data: Omit<Contract, 'id' | 'createdAt' | 'payments'>) => {
    const contract: Contract = {
      ...data,
      id: generateId(),
      payments: [],
      createdAt: new Date().toISOString(),
    };
    updateActiveProject(p => ({
      ...p,
      contracts: [...p.contracts, contract],
    }));
    return contract;
  }, [updateActiveProject]);

  const updateContract = useCallback((id: string, data: Partial<Contract>) => {
    updateActiveProject(p => ({
      ...p,
      contracts: p.contracts.map(c => c.id === id ? { ...c, ...data } : c),
    }));
  }, [updateActiveProject]);

  const deleteContract = useCallback((id: string) => {
    updateActiveProject(p => ({
      ...p,
      contracts: p.contracts.filter(c => c.id !== id),
    }));
  }, [updateActiveProject]);

  const addContractPayment = useCallback((contractId: string, amount: number, date: string, notes?: string) => {
    const payment: ContractPayment = {
      id: generateId(),
      amount,
      date: date || new Date().toISOString().split('T')[0],
      notes,
    };
    updateActiveProject(p => ({
      ...p,
      contracts: p.contracts.map(c => 
        c.id === contractId 
          ? { ...c, payments: [...c.payments, payment] }
          : c
      ),
    }));
  }, [updateActiveProject]);

  // Daily logs & tasks
  const addDailyLog = useCallback((data: Omit<DailyLog, 'id'>) => {
    const log: DailyLog = {
      ...data,
      id: generateId(),
    };
    updateActiveProject(p => ({
      ...p,
      dailyLogs: [log, ...p.dailyLogs],
    }));
  }, [updateActiveProject]);

  const updateDailyLog = useCallback((id: string, data: Partial<DailyLog>) => {
    updateActiveProject(p => ({
      ...p,
      dailyLogs: p.dailyLogs.map(l => l.id === id ? { ...l, ...data } : l),
    }));
  }, [updateActiveProject]);

  const addTaskToLog = useCallback((logId: string, task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: generateId() };
    updateActiveProject(p => ({
      ...p,
      dailyLogs: p.dailyLogs.map(l => 
        l.id === logId 
          ? { ...l, tasks: [...l.tasks, newTask] }
          : l
      ),
    }));
  }, [updateActiveProject]);

  const updateTaskInLog = useCallback((logId: string, taskId: string, data: Partial<Task>) => {
    updateActiveProject(p => ({
      ...p,
      dailyLogs: p.dailyLogs.map(l => 
        l.id === logId 
          ? { ...l, tasks: l.tasks.map(t => t.id === taskId ? { ...t, ...data } : t) }
          : l
      ),
    }));
  }, [updateActiveProject]);

  // Checklist Management
  const updateChecklist = useCallback((buildingType: number, completedItems: string[]) => {
    updateActiveProject(p => ({
      ...p,
      checklist: { buildingType, completedItems }
    }));
  }, [updateActiveProject]);

  // Get spending by category
  const spendingByCategory = useMemo(() => {
    if (!activeProject) return {};
    const categoryTotals: Record<TransactionCategory, number> = {
      materials: 0,
      labor: 0,
      contracts: 0,
      admin: 0,
      water: 0,
      electricity: 0,
      transport: 0,
      other: 0,
    };
    
    // Transactions
    activeProject.transactions.forEach(t => {
      categoryTotals[t.category] += t.amount;
    });
    
    // Contracts
    activeProject.contracts.forEach(c => {
      c.payments.forEach(p => {
        categoryTotals.contracts += p.amount;
      });
    });

    // Labor (Weekly Payments)
    activeProject.weeklyPayments.forEach(wp => {
        if (!wp.payments) return;
        const totalWeek = (Object.values(wp.payments) as number[]).reduce((sum, val) => sum + val, 0);
        categoryTotals.labor += totalWeek;
    });

    return categoryTotals;
  }, [activeProject]);

  return {
    // Project data
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    archiveProject,
    restoreProject,
    importProjectData,
    
    // Budget
    totalBudget,
    totalSpent,
    remainingBudget,
    budgetPercentage,
    budgetStatus,
    setInitialBudget,
    addBudgetInjection,
    updateBudgetInjection,
    deleteBudgetInjection,
    getDailySpent,
    
    // Payments & Transactions
    transactions: activeProject?.transactions || [],
    recentPayments,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Workers
    workers: activeProject?.workers || [],
    addWorker,
    updateWorker,
    deleteWorker,
    
    // Weekly payments
    weeklyPayments: activeProject?.weeklyPayments || [],
    addWeeklyPayment,
    updateWeeklyPayment,
    deleteWeeklyPayment,
    
    // Contracts
    contracts: activeProject?.contracts || [],
    addContract,
    updateContract,
    deleteContract,
    addContractPayment,
    
    // Daily logs
    dailyLogs: activeProject?.dailyLogs || [],
    addDailyLog,
    updateDailyLog,
    addTaskToLog,
    updateTaskInLog,

    // Checklist
    checklist: activeProject?.checklist || { buildingType: 0, completedItems: [] },
    updateChecklist,
    
    // Reports
    spendingByCategory,
  };
}