import { Component, input, computed } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { DepartmentStatisticsDTO } from '../../../models/dashboard.model';
import { departmentColor, departmentLabel, formatChartNumber } from '../department-chart.utils';

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
          return `<strong>${echarts.format.encodeHTML(item.name)}</strong><br/>${item.marker}Durchschnittliche Wartezeit: ${formatChartNumber(Number(item.value), 2)} s`;
        },
      },

      grid: {
        left: 20,
        right: 80,
        top: 20,
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
        data: data.map((x) => departmentLabel(x.department)),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#444',
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
            formatter: (params) => `${formatChartNumber(Number(params.value), 2)} s`,
            fontSize: 12,
            fontWeight: 600,
          },

          emphasis: {
            focus: 'series',
            itemStyle: {
              opacity: 0.85,
            },
          },

          animationDuration: 600,
          animationEasing: 'cubicOut',
        },
      ],
    };
  });
}
