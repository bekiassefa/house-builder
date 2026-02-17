
export interface Worker {
  id: string;
  name: string;
  phone: string;
  dailyRate: number;
  notes?: string;
  createdAt: string;
}

export interface WeeklyPayment {
  id: string;
  workerId: string;
  weekStart: string;
  payments: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  notes?: string;
  createdAt: string;
}

export type TransactionCategory = 
  | 'materials' 
  | 'labor' 
  | 'contracts' 
  | 'admin' 
  | 'water' 
  | 'electricity'
  | 'transport'
  | 'other';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: TransactionCategory;
  description: string;
  receiptPhoto?: string;
  notes?: string;
  createdAt: string;
  contractId?: string;
}

export interface BudgetInjection {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  source?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  name: string;
  contractorName: string;
  phone?: string;
  totalAmount: number;
  payments: ContractPayment[];
  status: 'active' | 'completed' | 'paused';
  notes?: string;
  createdAt: string;
}

export interface ContractPayment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  checklistId?: string; // Links to CONSTRUCTION_CHECKLIST item id
  date: string;
  photos?: string[];
  notes?: string;
}

export interface DailyLog {
  id: string;
  date: string;
  tasks: Task[];
  issues: string[];
  photos: string[];
  weatherNotes?: string;
  workersPresent: number;
  notes?: string;
}

export interface ChecklistState {
  buildingType: number; // 0 to 8 storeys
  completedItems: string[]; // IDs of completed items
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  expectedFinishDate?: string;
  endDate?: string;
  projectType?: string;
  initialBudget: number;
  budgetInjections: BudgetInjection[];
  transactions: Transaction[];
  workers: Worker[];
  weeklyPayments: WeeklyPayment[];
  contracts: Contract[];
  dailyLogs: DailyLog[];
  status: 'active' | 'completed' | 'archived';
  checklist: ChecklistState;
  createdAt: string;
}

export type BudgetStatus = 'on_track' | 'warning' | 'over_budget';

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'Transaction' | 'Labor' | 'Contract';
  category?: string;
}
