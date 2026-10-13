import { Component, computed, input } from '@angular/core';
import { formatNumber } from '../../../utils/number.utils';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { DepartmentStatisticsDTO } from '../../../models/dashboard.model';
import {
  DEPARTMENT_BAR_GRID,
  DEPARTMENT_VALUE_AXIS,
  departmentAxis,
  departmentBarStyle,
  departmentBarTooltip,
  departmentColor,
  departmentLabel,
} from '../department-chart.utils';

const formatQualityScore = (value: number) => formatNumber(value, 1);

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

  readonly chartData = computed(() =>
    [...this.data()].sort((a, b) => b.averageQualityScore - a.averageQualityScore),
  );

  readonly chartDescription = computed(() => {
    const departments = this.chartData();
    const title = 'Durchschnittlicher Qualitätsscore nach Abteilung.';

    if (departments.length === 0) {
      return `${title} Keine Daten verfügbar.`;
    }

    const scores = departments
      .map(
        (item) =>
          `${departmentLabel(item.department)}: ${formatQualityScore(item.averageQualityScore)}`,
      )
      .join('; ');
    return `${title} ${scores}`;
  });

  readonly chartOptions = computed<EChartsOption>(() => {
    const departments = this.chartData();

    return {
      tooltip: departmentBarTooltip('Durchschnittlicher Qualitätsscore', formatQualityScore),
      grid: DEPARTMENT_BAR_GRID,
      xAxis: {
        ...DEPARTMENT_VALUE_AXIS,
        min: 0,
        max: 5,
      },

      yAxis: departmentAxis(departments.map((item) => item.department)),
      series: [
        {
          name: 'Durchschnittlicher Qualitätsscore',
          ...departmentBarStyle(formatQualityScore),
          type: 'bar',
          data: departments.map((item) => ({
            value: item.averageQualityScore,
            itemStyle: { color: departmentColor(item.department) },
          })),
        },
      ],
    };
  });
}
