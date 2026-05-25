import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Lista, Producto } from '../../shared/models/lista.model';

@Injectable({ providedIn: 'root' })
export class ListaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/listas`;

  getListas() {
    return this.http.get<Lista[]>(this.base);
  }

  getLista(id: string) {
    return this.http.get<Lista>(`${this.base}/${id}`);
  }

  crearLista(nombre: string, productos?: { nombre: string; cantidad: number }[]) {
    return this.http.post<Lista>(this.base, { nombre, productos });
  }

  editarLista(id: string, datos: { nombre?: string; estado?: string }) {
    return this.http.patch<Lista>(`${this.base}/${id}`, datos);
  }

  eliminarLista(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  agregarProducto(listaId: string, producto: { nombre: string; precioUnitario?: number; cantidad?: number }) {
    return this.http.post<Producto>(`${this.base}/${listaId}/productos`, producto);
  }

  editarProducto(listaId: string, pid: string, datos: Partial<Omit<Producto, '_id' | 'total'>>) {
    return this.http.patch<Producto>(`${this.base}/${listaId}/productos/${pid}`, datos);
  }

  eliminarProducto(listaId: string, pid: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${listaId}/productos/${pid}`);
  }

  agregarColaborador(listaId: string, uid: string) {
    return this.http.post<{ message: string }>(`${this.base}/${listaId}/colaboradores/${uid}`, {});
  }

  quitarColaborador(listaId: string, uid: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${listaId}/colaboradores/${uid}`);
  }

  subirBoleta(listaId: string, archivo: File) {
    const form = new FormData();
    form.append('boleta', archivo);
    return this.http.post<{ message: string; boletaId: string }>(`${this.base}/${listaId}/boleta`, form);
  }

  descargarBoleta(listaId: string) {
    return this.http.get(`${this.base}/${listaId}/boleta`, { responseType: 'blob' });
  }
}
