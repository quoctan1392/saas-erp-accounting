// Dashboard types and interfaces

export interface DashboardUser {
  name: string;
  email: string;
  picture?: string;
  accountType: 'Tập đoàn' | 'Chi nhánh' | 'Cửa hàng' | 'Nhân viên';
}

export interface InsightBanner {
  message: string;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
  period: string;
  date: string;
}

export interface FinancialCard {
  amount: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface FinancialSummary {
  totalRevenue: FinancialCard;
  totalExpense: FinancialCard;
}

export interface Reminder {
  id: string;
  type: 'debt' | 'inventory' | 'order' | 'meeting' | 'report';
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardOverview {
  user: DashboardUser;
  insight: InsightBanner;
  financialSummary: FinancialSummary;
  reminders: {
    total: number;
    items: Reminder[];
  };
  notifications: {
    unreadCount: number;
  };
}

export interface FinancialSummaryResponse {
  currentPeriod: {
    revenue: number;
    expense: number;
    profit: number;
  };
  previousPeriod: {
    revenue: number;
    expense: number;
    profit: number;
  };
  changes: {
    revenue: { percent: number; amount: number };
    expense: { percent: number; amount: number };
    profit: { percent: number; amount: number };
  };
}

export type TimeFilterOption = 
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom';

export interface TimeFilter {
  label: string;
  value: TimeFilterOption;
  startDate: Date;
  endDate: Date;
}

export interface QuickAccessItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  color: string;
  permission?: string;
}
