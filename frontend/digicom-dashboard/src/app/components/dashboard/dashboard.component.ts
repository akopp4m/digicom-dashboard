import { Component, inject, type OnDestroy, type OnInit, signal } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import type { DashboardDTO } from '../../models/dashboard.model';
import { WaitingTimeByDepartmentComponent } from '../charts/waiting-time-by-department/waiting-time-by-department.component';
import { ContactsOverTimeComponent } from '../charts/contacts-over-time/contacts-over-time.component';
import { WaitingQualityHeatmapComponent } from '../charts/waiting-quality-heatmap/waiting-quality-heatmap.component';
import { AverageQualityScoreByDepartmentComponent } from '../charts/average-quality-score-by-department/average-quality-score-by-department.component';
import { ContactsByDepartmentComponent } from '../charts/contacts-by-department/contacts-by-department.component';
import { KpiCardContainerComponent } from './kpi-card-container/kpi-card-container.component';
import {
  type PeriodDates,
  PeriodFilterComponent,
} from '../_shared/period-filter/period-filter.component';
import type { Subscription } from 'rxjs';

@Component({
  imports: [
    PeriodFilterComponent,
    KpiCardContainerComponent,
    WaitingTimeByDepartmentComponent,
    ContactsOverTimeComponent,
    WaitingQualityHeatmapComponent,
    AverageQualityScoreByDepartmentComponent,
    ContactsByDepartmentComponent,
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);

  public readonly dashboard = signal<DashboardDTO | undefined>(undefined);
  public readonly loading = signal<boolean>(true);
  public readonly selectedPeriod = signal<PeriodDates>({ option: 'all' });

  private dashboardSubscription?: Subscription;

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.dashboardSubscription?.unsubscribe();
  }

  onPeriodChange(event: PeriodDates) {
    this.loadDashboard(event);
  }

  private loadDashboard(period: PeriodDates = { option: 'all' }): void {
    this.dashboardSubscription?.unsubscribe();
    this.loading.set(true);

    const { from, to } = period;
    this.dashboardSubscription = this.dashboardService
      .getDashboard(from?.toISOString(), to?.toISOString())
      .subscribe({
        next: (dashboard) => {
          this.selectedPeriod.set(period);
          this.dashboard.set(dashboard);
          this.loading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.loading.set(false);
        },
      });
  }
}
