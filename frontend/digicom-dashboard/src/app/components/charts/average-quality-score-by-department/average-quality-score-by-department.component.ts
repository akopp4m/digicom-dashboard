import { Component, computed, input } from '@angular/core';
import { formatNumber } from '../../../utils/number-format.utils';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { DepartmentStatisticsDTO } from '../../../models/dashboard.model';
import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  CHART_ANIMATION,
  DEPARTMENT_BAR_GRID,
  departmentColor,
  departmentLabel,
  formatDepartmentTooltip,
} from '../chart.utils';

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-average-quality-score-by-department',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './average-quality-score-by-department.component.html',
  styleUrl: './average-quality-score-by-department.component.css',
})
export class AverageQualityScoreByDepartmentComponent {
  readonly data = input<DepartmentStatisticsDTO[]>([]);

  readonly chartDescription = computed(
    () =>
      'Durchschnittlicher Qualitätsscore nach Abteilung. ' +
      (this.data().length
        ? this.data()
            .map(
              (item) =>
                `${departmentLabel(item.department)}: ${formatNumber(item.averageQualityScore, 1)}`,
            )
            .join('; ')
        : 'Keine Daten verfügbar.'),
  );

  readonly chartOptions = computed<EChartsOption>(() => {
    const data = [...this.data()].sort((a, b) => b.averageQualityScore - a.averageQualityScore);

    return {
      tooltip: {
        ...CHART_TOOLTIP_STYLE,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          return formatDepartmentTooltip(
            item.name,
            item.marker,
            'Durchschnittlicher Qualitätsscore',
            formatNumber(Number(item.value), 1),
          );
        },
      },
      grid: DEPARTMENT_BAR_GRID,
      xAxis: {
        type: 'value',
        show: false,
        splitLine: { show: false },
      },

      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map((item) => departmentLabel(item.department)),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: CHART_COLORS.label, fontSize: 13 },
      },
      series: [
        {
          name: 'Durchschnittlicher Qualitätsscore',
          type: 'bar',
          data: data.map((item) => ({
            value: item.averageQualityScore,
            itemStyle: { color: departmentColor(item.department) },
          })),
          barMaxWidth: 28,
          barMinHeight: 4,
          itemStyle: { borderRadius: [0, 6, 6, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: (params) => formatNumber(Number(params.value), 1),
            fontSize: 12,
            fontWeight: 600,
            color: CHART_COLORS.label,
          },
          emphasis: { focus: 'series', itemStyle: { opacity: 0.85 } },
          ...CHART_ANIMATION,
        },
      ],
    };
  });
}
