import { color, format } from 'echarts/core';
import type { BarSeriesOption, TooltipComponentOption, YAxisComponentOption } from 'echarts';

export const CHART_COLORS = {
  white: '#fff',
  black: '#000',
  text: '#111827',
  mutedText: '#595959',
  label: '#444',
  gridLine: '#eee',
  inbound: '#5273e8',
  outbound: '#afd32a',
  departments: {
    support: '#2563eb',
    orders: '#047857',
    sales: '#b45309',
    accounting: '#7e22ce',
  },
  border: '#e5e7eb',
  quality: {
    1: '#b91c1c',
    2: '#c2410c',
    3: '#a16207',
    4: '#0f766e',
    5: '#1d4ed8',
  },
} as const;

export const CHART_TOOLTIP_STYLE = {
  renderMode: 'html',
  confine: true,
  backgroundColor: CHART_COLORS.white,
  borderColor: CHART_COLORS.border,
  padding: 14,
  textStyle: { color: CHART_COLORS.text, fontSize: 12 },
} as const;

export const CHART_ANIMATION = {
  animationDuration: 600,
  animationEasing: 'cubicOut',
} as const;

export const DEPARTMENT_BAR_GRID = {
  left: 20,
  right: 80,
  top: 5,
  bottom: 20,
  outerBoundsMode: 'same',
} as const;

// WCAG relative luminance uses linear sRGB channels and these standard weights.
const SRGB_LINEAR_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA = 2.4;
const RGB_CHANNEL_MAX = 255;
const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722];
const CONTRAST_OFFSET = 0.05;

export function contrastingTextColor(backgroundColor: string): string {
  const channels = color.parse(backgroundColor)!.slice(0, 3);
  const luminance = channels.reduce((sum, channel, index) => {
    const normalized = channel / RGB_CHANNEL_MAX;
    const linear =
      normalized <= SRGB_LINEAR_THRESHOLD
        ? normalized / SRGB_LINEAR_DIVISOR
        : ((normalized + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_GAMMA;
    return sum + linear * LUMINANCE_WEIGHTS[index];
  }, 0);

  const whiteContrast = (1 + CONTRAST_OFFSET) / (luminance + CONTRAST_OFFSET);
  const blackContrast = (luminance + CONTRAST_OFFSET) / CONTRAST_OFFSET;

  return whiteContrast > blackContrast ? CHART_COLORS.white : CHART_COLORS.black;
}

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
