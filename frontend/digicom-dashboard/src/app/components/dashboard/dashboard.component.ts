import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.css',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: dashboard => {
        console.log(dashboard);
      },
      error: error => {
        console.error(error);
      }
    })
  }

}
