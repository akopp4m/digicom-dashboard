import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { DepartmentStatisticsDTO } from '../../../models/dashboard.model';

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
            .map((item) => `${item.department}: ${item.contactAmount} Kontakte`)
            .join('; ')
        : 'Keine Daten verfügbar.'),
  );

  readonly chartOptions = computed<EChartsOption>(() => {
    const data = [...this.data()].sort((a, b) => b.contactAmount - a.contactAmount);
    const total = data.reduce((sum, item) => sum + item.contactAmount, 0);

    return {
      title: {
        text: 'Kontaktverteilung',
        subtext: total > 0 ? 'Nach Abteilung' : 'Keine Kontakte verfügbar',
        left: 0,
        top: 0,
        textStyle: { fontSize: 18, fontWeight: 600, color: '#333' },
        subtextStyle: { fontSize: 12, color: '#595959' },
      },
      color: ['#2563eb', '#047857', '#b45309', '#7e22ce', '#be123c', '#0e7490'],
      tooltip: {
        trigger: 'item',
        renderMode: 'richText',
        formatter: '{b}\n{c} Kontakte ({d} %)',
      },
      series: [
        {
          name: 'Kontakte',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '58%'],
          stillShowZeroSum: false,
          data: data.map((item) => ({ name: item.department, value: item.contactAmount })),
          itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
          label: {
            show: total > 0,
            formatter: '{b}\n{d} %',
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
