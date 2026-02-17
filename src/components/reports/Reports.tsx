import { useLanguage } from '../../contexts/LanguageContext';
import { useAppData } from '../../hooks/useAppData';
import { TransactionCategory, Project } from '../../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Button } from '../ui/button';
import { Download, FileText, Database, ShieldCheck, Upload, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { useRef } from 'react';
import { cn } from '../../lib/utils';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(200, 70%, 50%)',
  'hsl(280, 70%, 50%)',
  'hsl(340, 70%, 50%)',
];

export function Reports() {
  const { t } = useLanguage();
  const { 
    spendingByCategory, 
    contracts, 
    weeklyPayments, 
    totalBudget, 
    totalSpent, 
    remainingBudget,
    projects,
    recentPayments,
    importProjectData
  } = useAppData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET').format(amount);
  };

  // Prepare pie chart data
  const pieData = Object.entries(spendingByCategory)
    .filter(([_, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      name: t(key as TransactionCategory),
      value: value as number,
    }));

  // Labor cost breakdown by week
  const laborByWeek = weeklyPayments.reduce((acc, wp) => {
    if (!wp.payments) return acc;
    const weekTotal = (Object.values(wp.payments) as number[]).reduce((sum, val) => sum + val, 0);
    if (!acc[wp.weekStart]) {
      acc[wp.weekStart] = 0;
    }
    acc[wp.weekStart] += weekTotal;
    return acc;
  }, {} as Record<string, number>);

  const laborChartData = Object.entries(laborByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, total]) => ({
      week: new Date(week).toLocaleDateString('en-ET', { month: 'short', day: 'numeric' }),
      total,
    }));

  // Contract progress
  const contractData = contracts.map(c => ({
    name: c.name,
    paid: c.payments.reduce((sum, p) => sum + p.amount, 0),
    remaining: c.totalAmount - c.payments.reduce((sum, p) => sum + p.amount, 0),
  }));

  const handleExportReport = () => {
    // Basic CSV construction for Excel compatibility
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Summary
    csvContent += "SUMMARY\n";
    csvContent += `Total Budget,${totalBudget}\n`;
    csvContent += `Total Spent,${totalSpent}\n`;
    csvContent += `Remaining,${remainingBudget}\n\n`;

    // Spending Categories
    csvContent += "SPENDING BY CATEGORY\nCategory,Amount\n";
    Object.entries(spendingByCategory).forEach(([key, val]) => {
      csvContent += `${key},${val}\n`;
    });
    csvContent += "\n";

    // Detailed Transactions
    csvContent += "DETAILED TRANSACTIONS REPORT\nDate,Type,Category,Description,Amount\n";
    recentPayments.forEach(p => {
        csvContent += `${p.date},${p.type},${p.category || '-'},"${p.description.replace(/"/g, '""')}",${p.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HBT_Pro_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Detailed report exported to CSV");
  };

  const handleBackup = () => {
    const backupData = JSON.stringify(projects, null, 2);
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HBT_Pro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup file created. Save this safe.');
  };

  const handleGoogleDriveBackup = () => {
    handleBackup();
    toast.info("File downloaded. Please upload this file to your Google Drive manually for secure cloud backup.", {
        duration: 5000,
        icon: <Cloud className="h-4 w-4" />
    });
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (Array.isArray(data) && data.length > 0 && data[0].id) {
                  importProjectData(data as Project[]);
                  toast.success("Data restored successfully!");
              } else {
                  toast.error("Invalid backup file format.");
              }
          } catch (error) {
              console.error(error);
              toast.error("Failed to parse backup file.");
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">{t('reports')}</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleGoogleDriveBackup}>
             <Cloud className="h-4 w-4 mr-2 text-blue-500" />
             Save to Drive
          </Button>
          <div className="relative">
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleRestore} 
                  className="hidden" 
                  accept=".json"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Restore (JSON)
              </Button>
          </div>
          <Button variant="outline" onClick={handleBackup}>
            <Database className="h-4 w-4 mr-2" />
            Backup (JSON)
          </Button>
          <Button onClick={handleExportReport}>
            <FileText className="h-4 w-4 mr-2" />
            {t('exportReport')}
          </Button>
        </div>
      </div>

      {/* Financial Health Infographic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5 mb-4">
            <h3 className="font-semibold leading-none tracking-tight text-primary">{t('totalBudget')}</h3>
            <p className="text-sm text-muted-foreground">Allocated Resources</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold">{formatCurrency(totalBudget)}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('etb')}</p>
          </div>
        </div>

        <div className="md:col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5 mb-4">
            <h3 className="font-semibold leading-none tracking-tight text-destructive">{t('spent')}</h3>
            <p className="text-sm text-muted-foreground">Total Outflow</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-foreground">{formatCurrency(totalSpent)}</p>
            <div className="w-full bg-secondary h-2 mt-4 rounded-full overflow-hidden">
              <div 
                className="bg-destructive h-full" 
                style={{ width: `${Math.min((totalSpent/totalBudget)*100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5 mb-4">
            <h3 className="font-semibold leading-none tracking-tight text-success">{t('remaining')}</h3>
            <p className="text-sm text-muted-foreground">Available Funds</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold">{formatCurrency(remainingBudget)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {totalBudget > 0 ? ((remainingBudget/totalBudget)*100).toFixed(1) : 0}% Available
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Category Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="font-semibold leading-none tracking-tight">{t('spendingByCategory')}</h3>
          </div>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${formatCurrency(value)} ETB`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">{t('noData')}</div>
            )}
          </div>
        </div>

        {/* Labor Trend */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="font-semibold leading-none tracking-tight">{t('laborCostBreakdown')}</h3>
            <p className="text-sm text-muted-foreground">Weekly Trend</p>
          </div>
          <div className="h-[300px]">
            {laborChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={laborChartData}>
                  <defs>
                    <linearGradient id="colorLabor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: number) => [`${formatCurrency(value)} ETB`]} />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorLabor)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">{t('noData')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Contract Status */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col space-y-1.5 mb-6">
          <h3 className="font-semibold leading-none tracking-tight">{t('contractPayments')}</h3>
        </div>
        <div className="h-[300px]">
          {contractData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractData} layout="vertical" barSize={20}>
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip formatter={(value: number) => [`${formatCurrency(value)} ETB`]} />
                <Legend />
                <Bar dataKey="paid" name="Paid" fill="hsl(var(--success))" stackId="a" radius={[0, 4, 4, 0]} />
                <Bar dataKey="remaining" name="Remaining" fill="hsl(var(--muted))" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">{t('noData')}</div>
          )}
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col space-y-1.5 mb-6">
            <h3 className="font-semibold leading-none tracking-tight">Detailed Financial Report</h3>
            <p className="text-sm text-muted-foreground">Comprehensive list of all expenses and payments</p>
        </div>
        
        {recentPayments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                No transactions found.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-secondary/50 text-muted-foreground font-semibold">
                        <tr>
                            <th className="p-3 border-b">Date</th>
                            <th className="p-3 border-b">Type</th>
                            <th className="p-3 border-b">Category / Source</th>
                            <th className="p-3 border-b">Description</th>
                            <th className="p-3 border-b text-right">Amount (ETB)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {recentPayments.map((p, idx) => (
                            <tr key={`${p.id}-${idx}`} className="hover:bg-secondary/10">
                                <td className="p-3 whitespace-nowrap">{p.date}</td>
                                <td className="p-3">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-medium",
                                        p.type === 'Transaction' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                        p.type === 'Labor' ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" :
                                        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                    )}>
                                        {p.type}
                                    </span>
                                </td>
                                <td className="p-3 capitalize text-muted-foreground">
                                    {p.category || '-'}
                                </td>
                                <td className="p-3 font-medium text-foreground/90 max-w-[200px] truncate" title={p.description}>
                                    {p.description}
                                </td>
                                <td className="p-3 text-right font-bold tabular-nums">
                                    {formatCurrency(p.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}