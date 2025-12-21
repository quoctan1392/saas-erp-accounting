// Dashboard utility functions

/**
 * Format currency to Vietnamese format with abbreviations
 * @param amount - Amount in VND
 * @returns Formatted string like "700.24tr" or "1.5 tỷ"
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2) + ' tỷ';
  } else if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(2) + 'tr';
  } else if (amount >= 1_000) {
    return (amount / 1_000).toFixed(2) + 'k';
  }
  return amount.toLocaleString('vi-VN');
}

/**
 * Calculate percentage change between current and previous values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Object with percent and trend
 */
export function calculatePercentChange(
  current: number,
  previous: number
): {
  percent: number;
  trend: 'up' | 'down' | 'neutral';
} {
  if (previous === 0) {
    if (current > 0) return { percent: 100, trend: 'up' };
    if (current < 0) return { percent: 100, trend: 'down' };
    return { percent: 0, trend: 'neutral' };
  }

  const percent = ((current - previous) / previous) * 100;
  const trend = percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral';

  return { percent: Math.abs(percent), trend };
}

/**
 * Get time filter options
 */
export function getTimeFilterOptions(): Array<{
  label: string;
  value: string;
}> {
  return [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Tuần này', value: 'this_week' },
    { label: 'Tháng này', value: 'this_month' },
    { label: 'Tháng trước', value: 'last_month' },
    { label: 'Quý này', value: 'this_quarter' },
    { label: 'Năm này', value: 'this_year' },
  ];
}

/**
 * Get date range for time filter
 */
export function getDateRangeForFilter(filter: string): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };

    case 'this_week': {
      const dayOfWeek = now.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { startDate: monday, endDate: sunday };
    }

    case 'this_month':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };

    case 'last_month':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 0),
      };

    case 'this_quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      return {
        startDate: new Date(now.getFullYear(), quarter * 3, 1),
        endDate: new Date(now.getFullYear(), quarter * 3 + 3, 0),
      };
    }

    case 'this_year':
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear(), 11, 31),
      };

    default:
      return { startDate: today, endDate: today };
  }
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 giờ trước")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(d);
}
