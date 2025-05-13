import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [CommonModule, HttpClientModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {
  submissions: any[] = [];

  // Form model
  newAssignment = {
    title: '',
    description: '',
    dueDate: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:5000/api/submissions', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(data => this.submissions = data);
  }

  uploadAssignment() {
    const token = localStorage.getItem('token');
    this.http.post('http://localhost:5000/api/assignments', this.newAssignment, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert('Assignment uploaded!');
        this.newAssignment = { title: '', description: '', dueDate: '' }; // reset form
      },
      error: (err) => {
        console.error(err);
        alert('Upload failed');
      }
    });
  }

  giveFeedback(submissionId: string, feedback: string, grade: number) {
    const token = localStorage.getItem('token');
    this.http.post(`http://localhost:5000/api/submissions/${submissionId}/feedback`, {
      feedback,
      grade
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => alert('Feedback submitted!'),
      error: err => console.error(err)
    });
  }
}
