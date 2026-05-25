import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/models/usuario.model';

interface AuthResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _token = signal<string | null>(localStorage.getItem('token'));
  private _usuario = signal<Usuario | null>(
    JSON.parse(localStorage.getItem('usuario') ?? 'null'),
  );

  readonly token = this._token.asReadonly();
  readonly usuario = this._usuario.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._usuario()?.role === 'administrador');

  login(identificador: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { identificador, password })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  registro(datos: { email: string; username: string; nombre: string; apellido: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/registro`, datos)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this._token.set(null);
    this._usuario.set(null);
    this.router.navigate(['/auth/login']);
  }

  private guardarSesion(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('usuario', JSON.stringify(res.usuario));
    this._token.set(res.token);
    this._usuario.set(res.usuario);
    this.router.navigate(['/listas']);
  }
}
