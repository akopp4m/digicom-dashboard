import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardDTO } from '../../models/dashboard.model';
import { WaitingTimeByDepartmentComponent } from '../charts/waiting-time-by-department/waiting-time-by-department.component';
import { CommonModule } from '@angular/common';
import { ContactsOverTimeComponent } from '../charts/contacts-over-time/contacts-over-time.component';
import { WaitingQualityScatterComponent } from '../charts/waiting-quality-scatter/waiting-quality-scatter.component';
import { AverageQualityScoreByDepartmentComponent } from '../charts/average-quality-score-by-department/average-quality-score-by-department.component';
import { ContactsByDepartmentComponent } from '../charts/contacts-by-department/contacts-by-department.component';
import { KpiCardContainerComponent } from '../_shared/kpi-card-container/kpi-card-container.component';
import {
  PeriodDates,
  PeriodFilterComponent,
} from '../_shared/period-filter/period-filter.component';
import { Subscription } from 'rxjs';

@Component({
  imports: [
    PeriodFilterComponent,
    KpiCardContainerComponent,
    WaitingTimeByDepartmentComponent,
    ContactsOverTimeComponent,
    WaitingQualityScatterComponent,
    AverageQualityScoreByDepartmentComponent,
    ContactsByDepartmentComponent,
    CommonModule,
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  public readonly dashboard = signal<DashboardDTO | undefined>(undefined);
  public readonly loading = signal<boolean>(true);
  public readonly selectedPeriod = signal<PeriodDates>({ option: 'all' });

  private dashboardSubscription?: Subscription;

  ngOnInit(): void {
    this.loadDashboard();
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
          console.log(dashboard);
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
