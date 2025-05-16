import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment'; // ✅ import environment

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [CommonModule, HttpClientModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {
  submissions: any[] = [];

  newAssignment = {
    title: '',
    description: '',
    dueDate: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>(`${environment.apiUrl}/api/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(data => this.submissions = data);
  }

  uploadAssignment() {
    const token = localStorage.getItem('token');
    this.http.post(`${environment.apiUrl}/api/assignments`, this.newAssignment, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert('Assignment uploaded!');
        this.newAssignment = { title: '', description: '', dueDate: '' };
      },
      error: (err) => {
        console.error(err);
        alert('Upload failed');
      }
    });
  }

  giveFeedback(submissionId: string, feedback: string, gradeInput: string) {
    const token = localStorage.getItem('token');
    const grade = Number(gradeInput);

    if (isNaN(grade)) {
      alert('Please enter a valid number for grade.');
      return;
    }

    console.log('Submitting feedback for Submission ID:', submissionId);
    console.log('Feedback:', feedback);
    console.log('Grade:', grade);

    this.http.put(`${environment.apiUrl}/api/submissions/${submissionId}/feedback`, {
      feedback,
      mark: grade
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => alert('Feedback submitted!'),
      error: err => {
        console.error('Feedback error:', err);
        alert('Failed to submit feedback');
      }
    });
  }
}
