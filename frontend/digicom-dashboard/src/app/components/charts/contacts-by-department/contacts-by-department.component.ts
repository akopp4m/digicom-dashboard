import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { DepartmentStatisticsDTO } from '../../../models/dashboard.model';
import { departmentColor, departmentLabel, formatChartNumber } from '../department-chart.utils';

echarts.use([PieChart, TooltipComponent, CanvasRenderer]);

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
      tooltip: {
        trigger: 'item',
        renderMode: 'html',
        confine: true,
        formatter: (params) => {
          const item = Array.isArray(params) ? params[0] : params;
          const value = Number(item.value);
          return `<strong>${echarts.format.encodeHTML(item.name)}</strong><br/>${item.marker}Kontakte: ${formatChartNumber(value, 0)} (${percentage(value)} %)`;
        },
      },
      series: [
        {
          name: 'Kontakte',
          type: 'pie',
          radius: ['26%', '64%'],
          center: ['50%', '50%'],
          stillShowZeroSum: false,
          data: data.map((item) => ({
            name: departmentLabel(item.department),
            value: item.contactAmount,
            itemStyle: { color: departmentColor(item.department) },
          })),
          itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
          label: {
            show: total > 0,
            position: 'outside',
            bleedMargin: 5,
            overflow: 'break',
            formatter: (params) => `${params.name}\n${percentage(Number(params.value))} %`,
            color: '#444',
            fontSize: 12,
          },
          labelLine: { show: total > 0, length: 5, length2: 5 },
          emphasis: { scale: true },
          animationDuration: 600,
          animationEasing: 'cubicOut',
        },
      ],
    };
  });
}
