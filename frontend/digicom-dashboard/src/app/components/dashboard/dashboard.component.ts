import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardDTO } from '../../models/dashboard.model';
import { WaitingTimeByDepartmentComponent } from '../charts/waiting-time-by-department/waiting-time-by-department.component';
import { CommonModule } from '@angular/common';

@Component({
  imports: [WaitingTimeByDepartmentComponent, CommonModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  public readonly dashboard = signal<DashboardDTO | undefined>(undefined);

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        console.log(dashboard);
        this.dashboard.set(dashboard);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
