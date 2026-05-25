import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;
  private readonly adminBase = `${environment.apiUrl}/admin/usuarios`;

  getMiPerfil() {
    return this.http.get<Usuario>(`${this.base}/me`);
  }

  buscar(q: string) {
    return this.http.get<Usuario[]>(`${this.base}/buscar`, { params: { q } });
  }

  agregarAmigo(id: string) {
    return this.http.post<{ message: string }>(`${this.base}/amigos/${id}`, {});
  }

  eliminarAmigo(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/amigos/${id}`);
  }

  cambiarMiPassword(passwordActual: string, passwordNueva: string) {
    return this.http.patch<{ message: string }>(`${this.base}/me/password`, { passwordActual, passwordNueva });
  }

  // Admin
  getUsuarios() {
    return this.http.get<Usuario[]>(this.adminBase);
  }

  getUsuario(id: string) {
    return this.http.get<Usuario>(`${this.adminBase}/${id}`);
  }

  crearUsuario(datos: Omit<Usuario, '_id' | 'listas' | 'amigos' | 'createdAt'> & { password: string }) {
    return this.http.post<Usuario>(this.adminBase, datos);
  }

  editarUsuario(id: string, datos: Partial<Usuario>) {
    return this.http.patch<Usuario>(`${this.adminBase}/${id}`, datos);
  }

  cambiarPasswordUsuario(id: string, passwordNueva: string) {
    return this.http.patch<{ message: string }>(`${this.adminBase}/${id}/password`, { passwordNueva });
  }

  eliminarUsuario(id: string) {
    return this.http.delete<{ message: string }>(`${this.adminBase}/${id}`);
  }
}
