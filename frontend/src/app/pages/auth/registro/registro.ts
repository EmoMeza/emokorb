import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {
  private readonly auth = inject(AuthService);

  form = { email: '', username: '', nombre: '', apellido: '', password: '' };
  error = signal('');
  cargando = signal(false);

  submit() {
    const { email, username, nombre, apellido, password } = this.form;
    if (!email || !username || !nombre || !apellido || !password) {
      this.error.set('Completa todos los campos');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.auth.registro(this.form).subscribe({
      error: (e) => {
        this.error.set(e.error?.message ?? 'Error al registrarse');
        this.cargando.set(false);
      },
    });
  }
}
