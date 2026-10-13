import { Component, input, computed } from '@angular/core';
import { formatNumber } from '../../../utils/number.utils';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { DepartmentStatisticsDTO } from '../../../models/dashboard.model';
import {
  DEPARTMENT_BAR_GRID,
  departmentAxis,
  departmentBarStyle,
  departmentBarTooltip,
  departmentColor,
  departmentLabel,
} from '../chart.utils';

const formatWaitingTime = (value: number) => `${formatNumber(value, 2)} s`;

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-waiting-time-by-department',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  styleUrl: './waiting-time-by-department.component.css',
  templateUrl: './waiting-time-by-department.component.html',
})
export class WaitingTimeByDepartmentComponent {
  readonly data = input<DepartmentStatisticsDTO[]>([]);

  readonly chartData = computed(() =>
    [...this.data()].sort((a, b) => b.averageWaitingTimeSeconds - a.averageWaitingTimeSeconds),
  );

  readonly chartDescription = computed(() => {
    const departments = this.chartData();
    const title = 'Durchschnittliche Wartezeit nach Abteilung.';
    if (departments.length === 0) {
      return `${title} Keine Daten verfügbar.`;
    }

    const waitingTimes = departments
      .map(
        (item) =>
          `${departmentLabel(item.department)}: ${formatWaitingTime(item.averageWaitingTimeSeconds)}`,
      )
      .join('; ');
    return `${title} ${waitingTimes}`;
  });

  readonly chartOptions = computed<EChartsOption>(() => {
    const departments = this.chartData();

    return {
      tooltip: departmentBarTooltip('Durchschnittliche Wartezeit', formatWaitingTime),
      grid: DEPARTMENT_BAR_GRID,
      xAxis: {
        type: 'value',
        show: false,
        splitLine: { show: false },
      },

      yAxis: departmentAxis(departments.map((item) => item.department)),
      series: [
        {
          ...departmentBarStyle(formatWaitingTime),
          type: 'bar',
          data: departments.map((x) => ({
            value: x.averageWaitingTimeSeconds,
            itemStyle: { color: departmentColor(x.department) },
          })),
        },
      ],
    };
  });
}
