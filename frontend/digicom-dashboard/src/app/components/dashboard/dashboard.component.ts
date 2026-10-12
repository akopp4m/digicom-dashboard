import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardDTO } from '../../models/dashboard.model';
import { WaitingTimeByDepartmentComponent } from '../charts/waiting-time-by-department/waiting-time-by-department.component';
import { CommonModule } from '@angular/common';
import { ContactsOverTimeComponent } from '../charts/contacts-over-time/contacts-over-time.component';
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
    this.selectedPeriod.set(event);
    const { from, to } = event;
    this.loadDashboard(from?.toISOString(), to?.toISOString());
  }

  private loadDashboard(from?: string, to?: string): void {
    this.dashboardSubscription?.unsubscribe();
    this.loading.set(true);

    this.dashboardSubscription = this.dashboardService.getDashboard(from, to).subscribe({
      next: (dashboard) => {
        console.log(dashboard);
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
