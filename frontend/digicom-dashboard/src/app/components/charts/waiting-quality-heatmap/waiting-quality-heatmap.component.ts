import { Component, computed, input } from '@angular/core';
import { calculatePercentage, formatNumber } from '../../../utils/number.utils';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { HeatmapChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { CommunicationEventDTO } from '../../../models/dashboard.model';
import { CHART_COLORS, CHART_TOOLTIP_STYLE, contrastingTextColor } from '../chart.utils';

echarts.use([
  HeatmapChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

const waitingTimeBands = [
  { label: '0–15', lowerLimit: 0, upperLimit: 15 },
  { label: '15–30', lowerLimit: 15, upperLimit: 30 },
  { label: '30–60', lowerLimit: 30, upperLimit: 60 },
  { label: '60–90', lowerLimit: 60, upperLimit: 90 },
  { label: '90–120', lowerLimit: 90, upperLimit: 120 },
  { label: '≥120', lowerLimit: 120, upperLimit: Infinity },
];

const qualityRatings = [
  { score: 1, label: '1/5', color: CHART_COLORS.quality[1] },
  { score: 2, label: '2/5', color: CHART_COLORS.quality[2] },
  { score: 3, label: '3/5', color: CHART_COLORS.quality[3] },
  { score: 4, label: '4/5', color: CHART_COLORS.quality[4] },
  { score: 5, label: '5/5', color: CHART_COLORS.quality[5] },
];

interface HeatmapCell {
  bandIndex: number;
  rating: number;
  count: number;
  bandTotal: number;
  percentage: number;
}

@Component({
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  selector: 'app-waiting-quality-heatmap',
  styleUrl: './waiting-quality-heatmap.component.css',
  templateUrl: './waiting-quality-heatmap.component.html',
})
export class WaitingQualityHeatmapComponent {
  readonly data = input<CommunicationEventDTO[]>([]);

  readonly chartData = computed<HeatmapCell[]>(() => {
    const buckets: { countsByRating: Record<number, number> }[] = waitingTimeBands.map(() => ({
      countsByRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }));

    for (const event of this.data()) {
      if (event.direction !== 'Inbound' || event.qualityScore == null) {
        continue;
      }

      const bandIndex = waitingTimeBands.findIndex(
        (band) => event.waitingTimeSeconds < band.upperLimit,
      );
      const bucket = buckets[bandIndex];
      bucket.countsByRating[event.qualityScore]++;
    }

    return buckets.flatMap((bucket, bandIndex) => {
      const bandTotal = Object.values(bucket.countsByRating).reduce((sum, count) => sum + count, 0);
      return qualityRatings.map(({ score }) => {
        const count = bucket.countsByRating[score];
        return {
          bandIndex,
          rating: score,
          count,
          bandTotal,
          percentage: calculatePercentage(count, bandTotal),
        };
      });
    });
  });

  readonly chartOptions = computed<EChartsOption>(() => {
    const data = this.chartData();
    const colorScaleMax = Math.max(1, ...data.map((cell) => cell.percentage));
    const cellsByRating = qualityRatings.map(({ score }) =>
      data.filter((cell) => cell.rating === score),
    );

    return {
      tooltip: {
        ...CHART_TOOLTIP_STYLE,
        trigger: 'item',
      },
      legend: {
        bottom: 0,
        left: 'center',
        selectedMode: false,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: CHART_COLORS.mutedText, fontSize: 12 },
        data: qualityRatings.map((rating) => ({
          name: rating.label,
          itemStyle: { color: rating.color },
        })),
      },
      grid: {
        left: 5,
        right: 20,
        top: 15,
        bottom: 45,
        outerBoundsMode: 'same',
      },
      xAxis: {
        type: 'category',
        data: waitingTimeBands.map((band) => `${band.label} s`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: CHART_COLORS.mutedText, interval: 0 },
        splitArea: { show: true },
      },
      yAxis: {
        type: 'category',
        data: qualityRatings.map(({ score }) => String(score)),
        name: 'Qualitätsbewertung',
        nameLocation: 'middle',
        nameGap: 35,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: CHART_COLORS.mutedText },
        splitArea: { show: true },
      },
      // Each rating series has its own white-to-color gradient, using the same percentage scale.
      visualMap: qualityRatings.map(({ color }, index) => ({
        type: 'continuous',
        show: false,
        min: 0,
        max: colorScaleMax,
        dimension: 2, // Shade by the percentage, the third value in each cell.
        seriesIndex: index, // Apply this gradient to the corresponding rating series.
        inRange: { color: [CHART_COLORS.white, color] },
      })),
      series: cellsByRating.map((cells, index) => ({
        name: qualityRatings[index].label,
        type: 'heatmap',
        data: cells.map((cell) =>
          this.createHeatmapPoint(cell, qualityRatings[index].color, colorScaleMax),
        ),
        itemStyle: { borderColor: CHART_COLORS.white, borderWidth: 2 },
        label: {
          show: true,
          fontSize: 11,
          fontWeight: 600,
          opacity: 1,
          textBorderWidth: 0,
        },
      })),
    };
  });

  private createHeatmapPoint(cell: HeatmapCell, ratingColor: string, maximumPercentage: number) {
    const intensity = cell.percentage / maximumPercentage;
    const backgroundColor = echarts.color.lerp(intensity, [CHART_COLORS.white, ratingColor])!;

    return {
      // ECharts cell values: [waiting-time band index, rating index, percentage]. Both indexes start at 0.
      value: [cell.bandIndex, cell.rating - 1, cell.percentage],
      tooltip: { formatter: () => this.formatTooltip(cell, ratingColor) },
      label: {
        color: contrastingTextColor(backgroundColor),
        formatter: () => (cell.bandTotal > 0 ? `${formatNumber(cell.percentage, 0)} %` : '–'),
      },
    };
  }

  private formatWaitingTimeRange(bandIndex: number): string {
    const { lowerLimit, upperLimit } = waitingTimeBands[bandIndex];
    if (upperLimit === Infinity) {
      return `Ab ${lowerLimit} Sekunden`;
    }
    return `${lowerLimit} bis unter ${upperLimit} Sekunden`;
  }

  private formatTooltip(cell: HeatmapCell, ratingColor: string): string {
    const waitingTime = this.formatWaitingTimeRange(cell.bandIndex);
    const marker = echarts.format.getTooltipMarker(ratingColor);
    const percentage =
      cell.bandTotal > 0 ? `${formatNumber(cell.percentage, 1)} %` : 'Keine Bewertungen';
    const count = formatNumber(cell.count, 0);
    const bandTotal = formatNumber(cell.bandTotal, 0);

    return `
      <div class="mb-2 text-sm font-semibold">${waitingTime}</div>
      <div class="mb-2.5">${marker}Bewertung <strong>${cell.rating} / 5</strong></div>
      <div class="text-2xl font-semibold leading-tight">${percentage}</div>
      <div class="mt-1 text-gray-600">Anteil in dieser Wartezeitgruppe</div>
      <div class="mt-2.5 border-t border-gray-200 pt-2">
        <strong>${count}</strong> von <strong>${bandTotal}</strong> bewerteten Kontakten
      </div>
    `;
  }
}
