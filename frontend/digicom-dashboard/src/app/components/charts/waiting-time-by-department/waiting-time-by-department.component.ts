import { Component, input, computed } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { DepartmentWaitingTimeDTO } from '../../../models/dashboard.model';

echarts.use([BarChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

@Component({
  selector: 'app-waiting-time-by-department',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  styleUrl: './waiting-time-by-department.component.css',
  templateUrl: './waiting-time-by-department.component.html',
})
export class WaitingTimeByDepartmentComponent {
  readonly data = input<DepartmentWaitingTimeDTO[]>([]);

  readonly chartOptions = computed<EChartsOption>(() => {
    const data = [...this.data()].sort(
      (a, b) => b.averageWaitingTimeSeconds - a.averageWaitingTimeSeconds,
    );

    return {
      title: {
        text: 'Durchschnittliche Wartezeit',
        subtext: 'Nach Abteilung',
        left: 0,
        top: 0,
        textStyle: {
          fontSize: 18,
          fontWeight: 600,
        },
        subtextStyle: {
          fontSize: 12,
          color: '#888',
        },
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `
          <strong>${item.name}</strong><br />
          Durchschnittliche Wartezeit: <strong>${item.value} s</strong>
        `;
        },
      },

      grid: {
        outerBounds: {
          left: 20,
          right: 20,
          top: 65,
          bottom: 25,
        },
      },

      xAxis: {
        type: 'value',
        name: 'Sekunden',
        nameLocation: 'middle',
        nameGap: 30,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#777',
          formatter: '{value}s',
        },
        splitLine: {
          lineStyle: {
            color: '#eee',
            type: 'dashed',
          },
        },
      },

      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map((x) => x.department),
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
          data: data.map((x) => x.averageWaitingTimeSeconds),

          barMaxWidth: 28,
          barMinHeight: 4,

          itemStyle: {
            borderRadius: [0, 6, 6, 0],
          },

          label: {
            show: true,
            position: 'right',
            formatter: '{c}s',
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
