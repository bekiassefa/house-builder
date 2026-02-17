import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // App
  appName: { en: 'Homebuilder Tracker', am: 'የቤት ግንባታ ክትትል' },
  switchLanguage: { en: 'አማርኛ', am: 'English' },
  
  // Navigation
  dashboard: { en: 'Dashboard', am: 'ዳሽቦርድ' },
  transactions: { en: 'Transactions', am: 'ግብይቶች' },
  labor: { en: 'Labor', am: 'የሰራተኛ ክፍያ' },
  planner: { en: 'Planner', am: 'እቅድ' },
  reports: { en: 'Reports', am: 'ሪፖርቶች' },
  contracts: { en: 'Contracts', am: 'ውሎች' },
  projects: { en: 'Projects', am: 'ፕሮጀክቶች' },
  progress: { en: 'Progress', am: 'ሂደት' },
  visits: { en: 'Visits', am: 'ጉብኝቶች' },
  
  // Budget
  budgetStatus: { en: 'Budget Status', am: 'የበጀት ሁኔታ' },
  totalBudget: { en: 'Total Budget', am: 'ጠቅላላ በጀት' },
  spent: { en: 'Spent', am: 'የወጣ' },
  remaining: { en: 'Remaining', am: 'ቀሪ' },
  onTrack: { en: 'On Track', am: 'በትክክል' },
  budgetWarning: { en: 'Warning', am: 'ማስጠንቀቂያ' },
  overBudget: { en: 'Over Budget', am: 'ከበጀት በላይ' },
  etb: { en: 'ETB', am: 'ብር' },
  initialBudget: { en: 'Initial Budget', am: 'የመጀመሪያ በጀት' },
  injections: { en: 'Injections', am: 'ተጨማሪ በጀት' },
  budgetHistory: { en: 'Budget History', am: 'የበጀት ታሪክ' },
  dailySpent: { en: 'Daily Spent', am: 'የዕለት ወጪ' },
  injectedBudget: { en: 'Injected', am: 'ተጨማሪ' },
  source: { en: 'Source', am: 'ምንጭ' },
  
  // Quick Actions
  quickEntry: { en: 'Quick Entry', am: 'ፈጣን ግቤት' },
  addTransaction: { en: 'Add Transaction', am: 'ግብይት ጨምር' },
  addWorker: { en: 'Add Worker', am: 'ሰራተኛ ጨምር' },
  addBudget: { en: 'Add Budget', am: 'በጀት ጨምር' },
  visitMode: { en: 'Visit Mode', am: 'የጎብኝት ሁነታ' },
  addContract: { en: 'Add Contract', am: 'ውል ጨምር' },
  
  // Transactions
  recentPayments: { en: 'Recent Payments', am: 'የቅርብ ክፍያዎች' },
  allTransactions: { en: 'All Transactions', am: 'ሁሉም ግብይቶች' },
  materials: { en: 'Materials', am: 'ቁሳቁስ' },
  laborCost: { en: 'Labor', am: 'የሰራተኛ' },
  admin: { en: 'Admin', am: 'አስተዳደር' },
  water: { en: 'Water', am: 'ውሃ' },
  electricity: { en: 'Electricity', am: 'ኤሌክትሪክ' },
  transport: { en: 'Transport', am: 'ትራንስፖርት' },
  other: { en: 'Other', am: 'ሌላ' },
  
  // Contracts
  contractName: { en: 'Contract Name', am: 'የውል ስም' },
  contractorName: { en: 'Contractor', am: 'ተቋራጭ' },
  totalAmount: { en: 'Total Amount', am: 'ጠቅላላ መጠን' },
  paidAmount: { en: 'Paid Amount', am: 'የተከፈለ' },
  remainingAmount: { en: 'Remaining', am: 'ቀሪ' },
  addPayment: { en: 'Add Payment', am: 'ክፍያ ጨምር' },
  contractProgress: { en: 'Progress', am: 'ሂደት' },
  active: { en: 'Active', am: 'ንቁ' },
  completed: { en: 'Completed', am: 'ተጠናቋል' },
  paused: { en: 'Paused', am: 'ቆሟል' },
  paymentHistory: { en: 'Payment History', am: 'የክፍያ ታሪክ' },
  viewHistory: { en: 'History', am: 'ታሪክ' },
  hideHistory: { en: 'Hide', am: 'ደብቅ' },
  
  // Labor
  workers: { en: 'Workers', am: 'ሰራተኞች' },
  weeklyPayments: { en: 'Weekly Payments', am: 'ሳምንታዊ ክፍያ' },
  dailyRate: { en: 'Daily Rate', am: 'የቀን ክፍያ' },
  totalPayment: { en: 'Total Payment', am: 'ጠቅላላ ክፍያ' },
  monday: { en: 'Mon', am: 'ሰኞ' },
  tuesday: { en: 'Tue', am: 'ማክ' },
  wednesday: { en: 'Wed', am: 'ረቡ' },
  thursday: { en: 'Thu', am: 'ሐሙ' },
  friday: { en: 'Fri', am: 'አርብ' },
  saturday: { en: 'Sat', am: 'ቅዳ' },
  sunday: { en: 'Sun', am: 'እሑድ' },
  
  // Planner & AI
  todaysTasks: { en: "Today's Tasks", am: 'የዛሬ ተግባራት' },
  addTask: { en: 'Add Task', am: 'ተግባር ጨምር' },
  taskStatus: { en: 'Status', am: 'ሁኔታ' },
  notStarted: { en: 'Not Started', am: 'አልተጀመረም' },
  inProgress: { en: 'In Progress', am: 'በሂደት ላይ' },
  high: { en: 'High', am: 'ከፍተኛ' },
  medium: { en: 'Medium', am: 'መካከለኛ' },
  low: { en: 'Low', am: 'ዝቅተኛ' },
  issues: { en: 'Issues', am: 'ችግሮች' },
  workersPresent: { en: 'Workers Present', am: 'የተገኙ ሰራተኞች' },
  aiAssistant: { en: 'AI Assistant', am: 'ኤአይ ረዳት' },
  askAi: { en: 'Ask AI', am: 'ኤአይን ጠይቅ' },
  suggestTasks: { en: 'Generate Plan', am: 'እቅድ አውጣ' },
  generating: { en: 'Generating...', am: 'በማመንጨት ላይ...' },
  futurePlans: { en: 'Future Plans', am: 'የወደፊት እቅዶች' },
  completionRate: { en: 'Completion Rate', am: 'የማጠናቀቂያ መጠን' },
  today: { en: 'Today', am: 'ዛሬ' },
  aiPromptPlaceholder: { en: 'Describe current status e.g., Foundation work...', am: 'የአሁኑን ሁኔታ ይግለጹ...' },
  
  // Reports
  spendingByCategory: { en: 'Spending by Category', am: 'በምድብ ወጪ' },
  laborCostBreakdown: { en: 'Labor Cost Breakdown', am: 'የሰራተኛ ወጪ ዝርዝር' },
  contractPayments: { en: 'Contract Payments', am: 'የውል ክፍያዎች' },
  exportReport: { en: 'Export Report', am: 'ሪፖርት አውጣ' },
  backupData: { en: 'Backup Data', am: 'መረጃ አስቀምጥ' },
  
  // Projects
  newProject: { en: 'New Project', am: 'አዲስ ፕሮጀክት' },
  projectName: { en: 'Project Name', am: 'የፕሮጀክት ስም' },
  projectLocation: { en: 'Location', am: 'ቦታ' },
  archiveProject: { en: 'Archive Project', am: 'ፕሮጀክት ማህደር' },
  archivedProjects: { en: 'Archived Projects', am: 'የተማረከዱ ፕሮጀክቶች' },
  selectProject: { en: 'Select Project', am: 'ፕሮጀክት ምረጥ' },
  expectedFinish: { en: 'Expected Finish', am: 'የሚጠናቀቅበት' },
  started: { en: 'Started', am: 'ተጀምሯል' },
  projectType: { en: 'Type', am: 'ዓይነት' },
  workersCount: { en: 'No. Workers', am: 'የሰራተኞች ቁጥር' },
  
  // Progress
  selectBuildingType: { en: 'Select Building Type', am: 'የህንፃ ዓይነት ምረጥ' },
  constructionProgress: { en: 'Construction Progress', am: 'የግንባታ ሂደት' },
  mandatory: { en: 'Mandatory', am: 'አስገዳጅ' },
  optional: { en: 'Optional', am: 'አማራጭ' },
  hold: { en: 'Inspection', am: 'ቁጥጥር' },

  // Common
  save: { en: 'Save', am: 'አስቀምጥ' },
  cancel: { en: 'Cancel', am: 'ሰርዝ' },
  delete: { en: 'Delete', am: 'አጥፋ' },
  edit: { en: 'Edit', am: 'አርም' },
  confirm: { en: 'Confirm', am: 'አረጋግጥ' },
  close: { en: 'Close', am: 'ዝጋ' },
  search: { en: 'Search', am: 'ፈልግ' },
  filter: { en: 'Filter', am: 'አጣራ' },
  amount: { en: 'Amount', am: 'መጠን' },
  date: { en: 'Date', am: 'ቀን' },
  notes: { en: 'Notes', am: 'ማስታወሻ' },
  phone: { en: 'Phone', am: 'ስልክ' },
  name: { en: 'Name', am: 'ስም' },
  description: { en: 'Description', am: 'መግለጫ' },
  status: { en: 'Status', am: 'ሁኔታ' },
  category: { en: 'Category', am: 'ምድብ' },
  
  // Feedback
  savedSuccess: { en: 'Saved successfully!', am: 'በተሳካ ሁኔታ ተቀምጧል!' },
  greatJob: { en: 'Great job, keep going!', am: 'በጣም ጥሩ፣ ቀጥል!' },
  deleteConfirm: { en: 'Are you sure you want to delete this?', am: 'ይህን ለመሰረዝ እርግጠኛ ነዎት?' },
  noData: { en: 'No data yet', am: 'ምንም ውሂብ የለም' },
  
  // Visit Mode
  visitModeTitle: { en: 'Site Visit Mode', am: 'የጣቢያ ጉብኝት ሁነታ' },
  quickPayment: { en: 'Quick Payment', am: 'ፈጣን ክፍያ' },
  logTask: { en: 'Log Task', am: 'ተግባር መዝግብ' },
  takePhoto: { en: 'Take Photo', am: 'ፎቶ አንሳ' },
  addNote: { en: 'Add Note', am: 'ማስታወሻ ጨምር' },
  exitVisitMode: { en: 'Exit Visit Mode', am: 'ከጉብኝት ውጣ' },
  visitLogSaved: { en: 'Visit log updated', am: 'የጉብኝት መዝገብ ተዘምኗል' },
  noVisits: { en: 'No site visits recorded yet.', am: 'ምንም የጣቢያ ጉብኝት አልተመዘገበም' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const newLang = prev === 'en' ? 'am' : 'en';
      localStorage.setItem('language', newLang);
      return newLang;
    });
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[language] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}