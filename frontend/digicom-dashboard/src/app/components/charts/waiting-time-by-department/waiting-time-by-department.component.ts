import { Component, input, computed } from '@angular/core';
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
} from '../department-chart.utils';

const formatWaitingTime = (value: number) => `${formatNumber(value, 2)} s`;

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-waiting-time-by-department',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './waiting-time-by-department.component.html',
})
export class WaitingTimeByDepartmentComponent {
  readonly data = input<DepartmentStatisticsDTO[]>([]);

  readonly chartData = computed(() =>
    this.data()
      .filter(
        (
          department,
        ): department is DepartmentStatisticsDTO & { averageWaitingTimeSeconds: number } =>
          department.averageWaitingTimeSeconds != null,
      )
      .sort((a, b) => b.averageWaitingTimeSeconds - a.averageWaitingTimeSeconds),
  );

  readonly chartOptions = computed<EChartsOption>(() => {
    const departments = this.chartData();

    return {
      tooltip: departmentBarTooltip('Durchschnittliche Wartezeit', formatWaitingTime),
      grid: DEPARTMENT_BAR_GRID,
      xAxis: {
        ...DEPARTMENT_VALUE_AXIS,
        min: 0,
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
