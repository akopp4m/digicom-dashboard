import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { DepartmentStatisticsDTO } from '../../../models/dashboard.model';
import { departmentColor, departmentLabel, formatChartNumber } from '../department-chart.utils';

echarts.use([BarChart, GridComponent, TitleComponent, TooltipComponent, CanvasRenderer]);

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
      title: {
        text: 'Durchschnittlicher Qualitätsscore',
        subtext: data.length ? 'Nach Abteilung' : 'Keine Daten verfügbar',
        left: 0,
        top: 0,
        textStyle: { fontSize: 18, fontWeight: 600, color: '#333' },
        subtextStyle: { fontSize: 12, color: '#595959' },
      },
      tooltip: {
        trigger: 'axis',
        renderMode: 'richText',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value) => formatChartNumber(Number(value), 1),
      },
      grid: {
        outerBounds: { left: 20, right: 20, top: 65, bottom: 25 },
      },
      xAxis: {
        type: 'value',
        name: 'Qualitätsscore',
        nameLocation: 'middle',
        nameGap: 30,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#595959', formatter: (value: number) => formatChartNumber(value, 1) },
        splitLine: { lineStyle: { color: '#eee', type: 'dashed' } },
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
