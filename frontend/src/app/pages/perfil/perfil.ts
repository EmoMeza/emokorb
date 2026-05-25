import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario, UsuarioResumen } from '../../shared/models/usuario.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);

  perfil = signal<Usuario | null>(null);

  passwordForm = { passwordActual: '', passwordNueva: '', confirmar: '' };
  mensaje = signal('');
  error = signal('');
  cargando = signal(false);

  busqueda = '';
  resultados = signal<UsuarioResumen[]>([]);
  buscando = signal(false);

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.usuarioService.getMiPerfil().subscribe({
      next: (u) => this.perfil.set(u),
    });
  }

  cambiarPassword() {
    const { passwordActual, passwordNueva, confirmar } = this.passwordForm;
    if (!passwordActual || !passwordNueva) { this.error.set('Completa todos los campos'); return; }
    if (passwordNueva !== confirmar) { this.error.set('Las contraseñas no coinciden'); return; }

    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');

    this.usuarioService.cambiarMiPassword(passwordActual, passwordNueva).subscribe({
      next: () => {
        this.mensaje.set('Contraseña actualizada correctamente');
        this.passwordForm = { passwordActual: '', passwordNueva: '', confirmar: '' };
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Error al cambiar contraseña');
        this.cargando.set(false);
      },
    });
  }

  buscar() {
    if (!this.busqueda.trim()) return;
    this.buscando.set(true);
    this.usuarioService.buscar(this.busqueda.trim()).subscribe({
      next: (r) => { this.resultados.set(r); this.buscando.set(false); },
      error: () => this.buscando.set(false),
    });
  }

  esAmigo(id: string) {
    return this.perfil()?.amigos.some((a) => a._id === id) ?? false;
  }

  agregarAmigo(u: UsuarioResumen) {
    this.usuarioService.agregarAmigo(u._id).subscribe({
      next: () => this.perfil.update((p) => p ? { ...p, amigos: [...p.amigos, u] } : p),
    });
  }

  eliminarAmigo(id: string) {
    this.usuarioService.eliminarAmigo(id).subscribe({
      next: () => this.perfil.update((p) => p ? { ...p, amigos: p.amigos.filter((a) => a._id !== id) } : p),
    });
  }
}
