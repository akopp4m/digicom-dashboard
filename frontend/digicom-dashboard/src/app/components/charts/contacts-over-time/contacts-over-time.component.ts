import { Component, computed, input } from '@angular/core';
import { formatNumber } from '../../../utils/number-format.utils';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs/esm';
import { CommunicationEventDTO } from '../../../models/dashboard.model';
import type { PeriodDates } from '../../_shared/period-filter/period-filter.component';
import { CHART_COLORS } from '../chart.utils';

echarts.use([BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

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

  readonly aggregation = computed(() => {
    const option = this.period().option;
    return option === 'today' || option === 'yesterday' ? 'hour' : 'day';
  });

  readonly chartData = computed(() => {
    const period = this.period();
    const unit = this.aggregation();
    const events = this.data().map((event) => ({
      timestamp: dayjs(event.timestamp),
      direction: event.direction,
    }));

    const rangeStart = period.from ?? events.at(0)?.timestamp;
    const rangeEnd = period.to ?? events.at(-1)?.timestamp;
    if (!rangeStart || !rangeEnd) {
      return [];
    }

    const first = rangeStart.startOf(unit);
    const last = (period.to ? rangeEnd.subtract(1, 'millisecond') : rangeEnd).startOf(unit);
    const buckets = new Map<number, { timestamp: Date; inbound: number; outbound: number }>();

    // Fill the range with empty hourly or daily buckets before counting contacts.
    for (
      let bucketStart = first;
      !bucketStart.isAfter(last);
      bucketStart = bucketStart.add(1, unit)
    ) {
      buckets.set(bucketStart.valueOf(), {
        timestamp: bucketStart.toDate(),
        inbound: 0,
        outbound: 0,
      });
    }

    for (const event of events) {
      const bucket = buckets.get(event.timestamp.startOf(unit).valueOf())!;

      if (event.direction === 'Inbound') {
        bucket.inbound++;
      } else {
        bucket.outbound++;
      }
    }

    return [...buckets.values()];
  });

  readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.chartData();
    const hourly = this.aggregation() === 'hour';
    const axisLabels = data.map((bucket, index) => {
      const timestamp = dayjs(bucket.timestamp);
      if (!hourly) {
        return timestamp.format('DD.MM.');
      }

      const showDate = index === 0 || timestamp.hour() === 0;
      return timestamp.format(showDate ? 'DD.MM.' : 'HH:mm');
    });

    return {
      tooltip: {
        trigger: 'axis',
        renderMode: 'richText',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          const bucket = data[item.dataIndex];
          if (!bucket) {
            return '';
          }

          const date = bucket.timestamp.toLocaleDateString('de-DE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
          });
          const lines = [date];
          if (hourly) {
            const start = dayjs(bucket.timestamp);
            lines.push(`${start.format('HH:mm')}–${start.add(1, 'hour').format('HH:mm')} Uhr`);
          }
          lines.push(
            `Eingehend: ${formatNumber(bucket.inbound, 0)}`,
            `Ausgehend: ${formatNumber(bucket.outbound, 0)}`,
            `Gesamt: ${formatNumber(bucket.inbound + bucket.outbound, 0)}`,
          );
          return lines.join('\n');
        },
      },

      legend: {
        top: 0,
        right: 0,
      },

      grid: {
        left: 5,
        top: 35,
        outerBounds: {
          left: 5,
          right: 20,
          top: 35,
          bottom: 45,
        },
      },

      xAxis: {
        type: 'category',
        data: axisLabels,
        boundaryGap: true,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: CHART_COLORS.mutedText,
          hideOverlap: true,
        },
      },

      yAxis: {
        type: 'value',
        name: 'Kontakte',
        min: 0,
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
          color: CHART_COLORS.mutedText,
        },
        splitLine: {
          lineStyle: {
            color: CHART_COLORS.gridLine,
            type: 'dashed',
          },
        },
      },

      series: [
        {
          name: 'Eingehend',
          type: 'bar',
          data: data.map((x) => x.inbound),
          stack: 'contacts',
          barMaxWidth: 28,
          itemStyle: { color: CHART_COLORS.inbound },
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: 'Ausgehend',
          type: 'bar',
          data: data.map((x) => x.outbound),
          stack: 'contacts',
          barMaxWidth: 28,
          itemStyle: { color: CHART_COLORS.outbound },
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };
  });
}
