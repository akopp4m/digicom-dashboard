import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import { CommunicationEventDTO } from '../../../models/dashboard.model';
import type { PeriodDates } from '../../_shared/period-filter/period-filter.component';

echarts.use([
  LineChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-contacts-over-time',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  styleUrl: './contacts-over-time.component.css',
  templateUrl: './contacts-over-time.component.html',
})
export class ContactsOverTimeComponent {
  readonly data = input<CommunicationEventDTO[]>([]);
  readonly period = input<PeriodDates>({ option: 'all' });

  readonly chartData = computed(() => {
    const events = [...this.data()]
      .map((event) => ({
        ...event,
        timestamp: dayjs(event.timestamp),
      }))
      .sort((a, b) => a.timestamp.valueOf() - b.timestamp.valueOf());

    if (events.length === 0) {
      return [];
    }

    const buckets = new Map<
      string,
      {
        timestamp: dayjs.Dayjs;
        inbound: number;
        outbound: number;
      }
    >();

    for (const event of events) {
      const hour = event.timestamp.startOf('hour');
      const key = hour.toISOString();

      const bucket = buckets.get(key) ?? {
        timestamp: hour,
        inbound: 0,
        outbound: 0,
      };

      if (event.direction === 'Inbound') {
        bucket.inbound++;
      } else if (event.direction === 'Outbound') {
        bucket.outbound++;
      }

      buckets.set(key, bucket);
    }

    const firstHour = events.at(0)!.timestamp.startOf('hour');
    const lastHour = events.at(-1)!.timestamp.startOf('hour');

    let inbound = 0;
    let outbound = 0;

    const result: {
      timestamp: Date;
      inbound: number;
      outbound: number;
    }[] = [];

    for (
      let hour = firstHour;
      hour.isBefore(lastHour) || hour.isSame(lastHour);
      hour = hour.add(1, 'hour')
    ) {
      const bucket = buckets.get(hour.toISOString());

      inbound += bucket?.inbound ?? 0;
      outbound += bucket?.outbound ?? 0;

      result.push({
        timestamp: hour.toDate(),
        inbound,
        outbound,
      });
    }

    // Extend to show the last data point
    result.push({
      timestamp: lastHour.add(1, 'hour').toDate(),
      inbound,
      outbound,
    });

    return result;
  });

  readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.chartData();

    return {
      title: {
        text: 'Contacts over time',
        subtext: 'Cumulative communication volume by hour',
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
      },

      legend: {
        top: 5,
        right: 0,
      },

      grid: {
        outerBounds: {
          left: 20,
          right: 20,
          top: 70,
          bottom: 35,
        },
      },

      xAxis: {
        type: 'category',
        data: data.map((x) =>
          x.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        ),
        boundaryGap: false,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#777',
        },
      },

      yAxis: {
        type: 'value',
        name: 'Contacts',
        nameLocation: 'middle',
        nameGap: 35,
        minInterval: 1,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#777',
        },
        splitLine: {
          lineStyle: {
            color: '#eee',
            type: 'dashed',
          },
        },
      },

      series: [
        {
          name: 'Inbound',
          type: 'line',
          data: data.map((x) => x.inbound),
          stack: 'contacts',
          symbol: 'none',
          smooth: false,
          step: 'end',
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: 'Outbound',
          type: 'line',
          data: data.map((x) => x.outbound),
          stack: 'contacts',
          symbol: 'none',
          smooth: false,
          step: 'end',
          areaStyle: {},
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };
  });
}
