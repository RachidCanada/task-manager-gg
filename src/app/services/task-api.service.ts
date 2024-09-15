import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private apiUrl = 'https://monkfish-app-9x56s.ondigitalocean.app/v1/tasks';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'x-access-token': token || "",
    });
  }

  getTasksCreatedBy(): Observable<any> {
    return this.http.get(`${this.apiUrl}/createdby`, { headers: this.getHeaders() });
  }

  getTasksAssignedTo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/assignedto`, { headers: this.getHeaders() });
  }

  updateTaskStatus(taskUid: string, done: boolean): Observable<any> {
    const body = { done };
    return this.http.patch(`${this.apiUrl}/${taskUid}`, body, { headers: this.getHeaders() });
  }

  deleteTask(taskUid: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${taskUid}`, { headers: this.getHeaders() });
  }

  createTask(description: string, assignedToUid: string): Observable<any> {
    const body = {
      description,
      assignedToUid
    };
    return this.http.post(this.apiUrl, body, { headers: this.getHeaders() });
  }

  updateTask(taskId: string, task: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}`, task, { headers: this.getHeaders() });
  }
}