const departments: Record<string, { label: string; color: string }> = {
  support: { label: 'Kundenservice', color: '#2563eb' },
  orders: { label: 'Bestellungen', color: '#047857' },
  sales: { label: 'Vertrieb', color: '#b45309' },
  accounting: { label: 'Buchhaltung', color: '#7e22ce' },
};

export function departmentLabel(department: string): string {
  return departments[department.trim().toLowerCase()]?.label ?? department;
}

export function departmentColor(department: string): string {
  return departments[department.trim().toLowerCase()]?.color ?? '#595959';
}

export function formatChartNumber(value: number, decimals: number): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
