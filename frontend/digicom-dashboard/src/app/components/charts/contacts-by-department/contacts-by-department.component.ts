import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { DepartmentStatisticsDTO } from '../../../models/dashboard.model';
import { departmentColor, departmentLabel, formatChartNumber } from '../department-chart.utils';

echarts.use([PieChart, TitleComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-contacts-by-department',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './contacts-by-department.component.html',
  styleUrl: './contacts-by-department.component.css',
})
export class ContactsByDepartmentComponent {
  readonly data = input<DepartmentStatisticsDTO[]>([]);

  readonly chartDescription = computed(
    () =>
      'Kontaktverteilung nach Abteilung. ' +
      (this.data().length
        ? this.data()
            .map(
              (item) =>
                `${departmentLabel(item.department)}: ${formatChartNumber(item.contactAmount, 0)} Kontakte`,
            )
            .join('; ')
        : 'Keine Daten verfügbar.'),
  );

  readonly chartOptions = computed<EChartsOption>(() => {
    const data = [...this.data()].sort((a, b) => b.contactAmount - a.contactAmount);
    const total = data.reduce((sum, item) => sum + item.contactAmount, 0);
    const percentage = (value: number) =>
      formatChartNumber(total > 0 ? (value / total) * 100 : 0, 1);

    return {
      title: {
        text: 'Kontaktverteilung',
        subtext: total > 0 ? 'Nach Abteilung' : 'Keine Kontakte verfügbar',
        left: 0,
        top: 0,
        textStyle: { fontSize: 18, fontWeight: 600, color: '#333' },
        subtextStyle: { fontSize: 12, color: '#595959' },
      },
      tooltip: {
        trigger: 'item',
        renderMode: 'richText',
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          const value = Number(item.value);
          return `${item.name}\n${formatChartNumber(value, 0)} Kontakte (${percentage(value)} %)`;
        },
      },
      series: [
        {
          name: 'Kontakte',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '58%'],
          stillShowZeroSum: false,
          data: data.map((item) => ({
            name: departmentLabel(item.department),
            value: item.contactAmount,
            itemStyle: { color: departmentColor(item.department) },
          })),
          itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
          label: {
            show: total > 0,
            formatter: (params) => `${params.name}\n${percentage(Number(params.value))} %`,
            color: '#444',
            fontSize: 12,
          },
          labelLine: { show: total > 0 },
          labelLayout: { hideOverlap: true },
          emphasis: { scale: true },
          animationDuration: 600,
          animationEasing: 'cubicOut',
        },
      ],
    };
  });
}
