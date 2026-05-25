import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../shared/models/usuario.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal('');

  creandoForm = signal(false);
  nuevoUsuario = { email: '', username: '', nombre: '', apellido: '', password: '', role: 'usuario' as 'usuario' | 'administrador' };

  passwordModal = signal<{ id: string; username: string } | null>(null);
  nuevaPassword = '';

  ngOnInit() { this.cargar(); }

  cargar() {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => { this.usuarios.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  crear() {
    const { email, username, nombre, apellido, password, role } = this.nuevoUsuario;
    if (!email || !username || !nombre || !apellido || !password) {
      this.error.set('Completa todos los campos');
      return;
    }
    this.usuarioService.crearUsuario({ email, username, nombre, apellido, password, role }).subscribe({
      next: (u) => {
        this.usuarios.update((l) => [...l, u]);
        this.nuevoUsuario = { email: '', username: '', nombre: '', apellido: '', password: '', role: 'usuario' };
        this.creandoForm.set(false);
        this.error.set('');
      },
      error: (e) => this.error.set(e.error?.message ?? 'Error al crear usuario'),
    });
  }

  eliminar(u: Usuario) {
    if (!confirm(`¿Eliminar a ${u.username}?`)) return;
    this.usuarioService.eliminarUsuario(u._id).subscribe({
      next: () => this.usuarios.update((l) => l.filter((x) => x._id !== u._id)),
    });
  }

  abrirPasswordModal(u: Usuario) {
    this.passwordModal.set({ id: u._id, username: u.username });
    this.nuevaPassword = '';
  }

  guardarPassword() {
    const modal = this.passwordModal();
    if (!modal || !this.nuevaPassword) return;
    this.usuarioService.cambiarPasswordUsuario(modal.id, this.nuevaPassword).subscribe({
      next: () => { this.passwordModal.set(null); this.nuevaPassword = ''; },
    });
  }
}
