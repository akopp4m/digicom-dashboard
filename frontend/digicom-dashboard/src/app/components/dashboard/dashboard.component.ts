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
import { ContactsOverTimeComponent } from '../charts/contacts-over-time/contacts-over-time.component';

@Component({
  imports: [WaitingTimeByDepartmentComponent, ContactsOverTimeComponent, CommonModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
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
