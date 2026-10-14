import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import type { Observable } from 'rxjs';
import type { DashboardDTO } from '../models/dashboard.model';

@Service()
export class DashboardService {
  private readonly http = inject(HttpClient);

  getDashboard(from?: string, to?: string): Observable<DashboardDTO> {
    let params = new HttpParams();

    if (from != null && to != null) {
      params = params.set('from', from).set('to', to);
    }

    return this.http.get<DashboardDTO>('/api/dashboard', { params });
  }
}
