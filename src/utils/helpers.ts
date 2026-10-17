export const formatCurrency = (amount: number): string => {
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'In Progress': 'bg-blue-500',
    'Design Phase': 'bg-amber-500',
    'Inspection': 'bg-purple-500',
    'Completed': 'bg-emerald-500',
    'Delayed': 'bg-red-500',
    'Approved': 'bg-emerald-500',
    'Pending': 'bg-amber-500',
    'Rejected': 'bg-red-500',
    'In Review': 'bg-blue-500',
    'Open': 'bg-blue-500',
    'Closed': 'bg-emerald-500',
    'Overdue': 'bg-red-500',
    'Draft': 'bg-slate-500',
    'Approved for Construction': 'bg-emerald-500',
    'Under Review': 'bg-amber-500',
    'Superseded': 'bg-red-500',
    'Active': 'bg-emerald-500',
    'Inactive': 'bg-slate-500',
    'Maintenance': 'bg-amber-500',
    'Critical': 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
};

export const getHealthStatus = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Healthy';
  if (score >= 50) return 'Warning';
  return 'Critical';
};
