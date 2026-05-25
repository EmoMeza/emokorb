import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);

  identificador = '';
  password = '';
  error = signal('');
  cargando = signal(false);

  submit() {
    if (!this.identificador || !this.password) {
      this.error.set('Completa todos los campos');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.auth.login(this.identificador, this.password).subscribe({
      error: (e) => {
        this.error.set(e.error?.message ?? 'Error al iniciar sesión');
        this.cargando.set(false);
      },
    });
  }
}
