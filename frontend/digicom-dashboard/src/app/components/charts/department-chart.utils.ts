import { format } from 'echarts/core';
import type { BarSeriesOption, TooltipComponentOption, YAxisComponentOption } from 'echarts';
import { CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_ANIMATION } from './chart.utils';

export const DEPARTMENT_BAR_GRID = {
  left: 20,
  right: 80,
  top: 5,
  bottom: 20,
  outerBoundsMode: 'same',
} as const;

export const DEPARTMENT_VALUE_AXIS = {
  type: 'value',
  show: false,
  splitLine: { show: false },
} as const;

const departments: Record<string, { label: string; color: string }> = {
  support: { label: 'Kundenservice', color: CHART_COLORS.departments.support },
  orders: { label: 'Bestellungen', color: CHART_COLORS.departments.orders },
  sales: { label: 'Vertrieb', color: CHART_COLORS.departments.sales },
  accounting: { label: 'Buchhaltung', color: CHART_COLORS.departments.accounting },
};

export function departmentLabel(department: string): string {
  return departments[department.trim().toLowerCase()]?.label ?? department;
}

export function departmentColor(department: string): string {
  return departments[department.trim().toLowerCase()]?.color ?? CHART_COLORS.mutedText;
}

export function formatDepartmentTooltip(
  department: string,
  marker: ReturnType<typeof format.getTooltipMarker> | undefined,
  metric: string,
  value: string,
): string {
  return `
    <div class="mb-2 text-sm font-semibold">${format.encodeHTML(department)}</div>
    <div class="mb-2.5 text-gray-600">${marker}${format.encodeHTML(metric)}</div>
    <div class="border-t border-gray-200 pt-2">
      <div class="text-2xl font-semibold leading-tight">${format.encodeHTML(value)}</div>
    </div>
  `;
}

export function departmentAxis(departmentNames: string[]): YAxisComponentOption {
  return {
    type: 'category',
    inverse: true,
    data: departmentNames.map(departmentLabel),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: CHART_COLORS.label, fontSize: 13 },
  };
}

export function departmentBarStyle(formatValue: (value: number) => string): BarSeriesOption {
  return {
    barMaxWidth: 28,
    itemStyle: { borderRadius: [0, 6, 6, 0] },
    label: {
      show: true,
      position: 'right',
      formatter: (params) => formatValue(Number(params.value)),
      fontSize: 12,
      fontWeight: 600,
      color: CHART_COLORS.label,
    },
    emphasis: { focus: 'series', itemStyle: { opacity: 0.85 } },
    ...CHART_ANIMATION,
  };
}

export function departmentBarTooltip(
  metric: string,
  formatValue: (value: number) => string,
): TooltipComponentOption {
  return {
    ...CHART_TOOLTIP_STYLE,
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params) => {
      const item = Array.isArray(params) ? params[0] : params;
      return formatDepartmentTooltip(
        item.name,
        item.marker,
        metric,
        formatValue(Number(item.value)),
      );
    },
  };
}
