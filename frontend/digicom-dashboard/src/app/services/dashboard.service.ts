import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardDTO } from '../models/dashboard.model';

@Service()
export class DashboardService {
    private readonly http = inject(HttpClient);

    getDashboard(): Observable<DashboardDTO> {
        return this.http.get<DashboardDTO>('/api/dashboard');
    }
}
