import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
  imports: [CommonModule, HttpClientModule],
  providers: [DatePipe]
})
export class StudentDashboardComponent implements OnInit {
  assignments: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>(`${environment.apiUrl}/api/assignments`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(data => this.assignments = data);
  }

  submitAssignment(assignmentId: string) {
    console.log('Submitting assignment with ID:', assignmentId);

    const token = localStorage.getItem('token');
    const submissionData = {
      assignmentId: assignmentId,
      content: 'My submission' // You can replace this with real content from a form
    };

    this.http.post(`${environment.apiUrl}/api/submissions`, submissionData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => alert('Assignment submitted successfully'),
      error: err => {
        console.error('Error submitting assignment:', err);
        alert('Submission failed');
      }
    });
  }
}

