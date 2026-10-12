import { Component, input, computed } from '@angular/core';
import { formatNumber } from '../../../utils/number-format.utils';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { DepartmentStatisticsDTO } from '../../../models/dashboard.model';
import {
  CHART_COLORS,
  CHART_ANIMATION,
  DEPARTMENT_BAR_GRID,
  departmentColor,
  departmentLabel,
  formatDepartmentTooltip,
} from '../chart.utils';

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

  readonly chartOptions = computed<EChartsOption>(() => {
    const data = [...this.data()].sort(
      (a, b) => b.averageWaitingTimeSeconds - a.averageWaitingTimeSeconds,
    );

    return {
      tooltip: {
        trigger: 'axis',
        renderMode: 'html',
        confine: true,
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          return formatDepartmentTooltip(
            item.name,
            item.marker,
            'Durchschnittliche Wartezeit',
            `${formatNumber(Number(item.value), 2)} s`,
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
        data: data.map((x) => departmentLabel(x.department)),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: CHART_COLORS.label,
          fontSize: 13,
        },
      },

      series: [
        {
          type: 'bar',
          data: data.map((x) => ({
            value: x.averageWaitingTimeSeconds,
            itemStyle: { color: departmentColor(x.department) },
          })),

          barMaxWidth: 28,
          barMinHeight: 4,

          itemStyle: {
            borderRadius: [0, 6, 6, 0],
          },

          label: {
            show: true,
            position: 'right',
            formatter: (params) => `${formatNumber(Number(params.value), 2)} s`,
            fontSize: 12,
            fontWeight: 600,
          },

          emphasis: {
            focus: 'series',
            itemStyle: {
              opacity: 0.85,
            },
          },

          ...CHART_ANIMATION,
        },
      ],
    };
  });
}
