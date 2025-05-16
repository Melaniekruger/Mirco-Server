import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment'; // ✅ Import environment config

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['student', Validators.required]
    });
  }

  onSubmit() {
    const formData = this.registerForm.value;
    console.log('Form data:', formData);

    this.http.post<any>(`${environment.apiUrl}/auth/register`, formData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);

        const payload = JSON.parse(atob(res.token.split('.')[1]));
        const role = payload.user.role;

        if (role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/student-dashboard']);
        }
      },
      error: (err) => {
        alert('Registration failed. Try a different username.');
        console.error(err);
      }
    });
  }
}
