import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { DepartmentStatisticsDTO } from '../../../models/dashboard.model';
import { departmentColor, departmentLabel, formatChartNumber } from '../department-chart.utils';

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
                `${departmentLabel(item.department)}: ${formatChartNumber(item.averageQualityScore, 1)}`,
            )
            .join('; ')
        : 'Keine Daten verfügbar.'),
  );

  readonly chartOptions = computed<EChartsOption>(() => {
    const data = [...this.data()].sort((a, b) => b.averageQualityScore - a.averageQualityScore);

    return {
      tooltip: {
        trigger: 'axis',
        renderMode: 'html',
        confine: true,
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `<strong>${echarts.format.encodeHTML(item.name)}</strong><br/>${item.marker}Durchschnittlicher Qualitätsscore: ${formatChartNumber(Number(item.value), 1)}`;
        },
      },
      grid: {
        left: 20,
        right: 80,
        top: 5,
        bottom: 20,
        outerBoundsMode: 'same',
      },
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
        axisLabel: { color: '#444', fontSize: 13 },
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
            formatter: (params) => formatChartNumber(Number(params.value), 1),
            fontSize: 12,
            fontWeight: 600,
            color: '#444',
          },
          emphasis: { focus: 'series', itemStyle: { opacity: 0.85 } },
          animationDuration: 600,
          animationEasing: 'cubicOut',
        },
      ],
    };
  });
}
