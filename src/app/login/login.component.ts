import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly loginBgImage = '/image/login-image.jpg';

  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  hidePassword = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly auth: AuthService,
  ) {
    this.loginForm = this.fb.nonNullable.group({
      username: ['SysAdmin', [Validators.required]],
      password: ['SysAdmin', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.errorMessage = null;
    this.loading = true;
    const { username, password } = this.loginForm.getRawValue();
    this.auth.login(username, password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.responseCode === '00' && res?.token) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res?.responseMessage ?? 'Login failed';
        }
      },
      error: (err) => {
        this.loading = false;
        if (err?.name === 'TimeoutError') {
          this.errorMessage = 'Login request timed out. Please try again.';
        } else {
          this.errorMessage = 'Unable to connect. Please try again.';
        }
      },
    });
  }
}
