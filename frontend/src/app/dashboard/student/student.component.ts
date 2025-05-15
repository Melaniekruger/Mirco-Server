import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ✅ add this
import { DatePipe } from '@angular/common';     // ✅ for the "date" pipe

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // ✅ add here
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
  providers: [DatePipe] // ✅ ensure this if needed
})
export class StudentDashboardComponent implements OnInit {
  assignments: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:5000/api/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe(data => this.assignments = data);
  }

  submitAssignment(assignmentId: string) {
  console.log('Submitting assignment with ID:', assignmentId); // Debugging output
  const token = localStorage.getItem('token');
  
  const submissionData = {
    assignmentId: assignmentId,     // ✅ sent in body, not in URL
    content: 'My submission'        // ✅ placeholder, update as needed
  };

  this.http.post('http://localhost:5000/api/submissions', submissionData, {
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
