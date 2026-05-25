import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListaService } from '../../core/services/lista.service';
import { Lista } from '../../shared/models/lista.model';

@Component({
  selector: 'app-listas',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './listas.html',
  styleUrl: './listas.css',
})
export class ListasComponent implements OnInit {
  private readonly listaService = inject(ListaService);

  listas = signal<Lista[]>([]);
  cargando = signal(true);
  error = signal('');

  mostrarModal = signal(false);
  nuevoNombre = '';
  listaBase = signal<Lista | null>(null);
  creando = signal(false);

  get listasFinalizadas() {
    return this.listas().filter((l) => l.estado === 'finalizado');
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.listaService.getListas().subscribe({
      next: (data) => { this.listas.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  abrirModal() {
    this.nuevoNombre = '';
    this.listaBase.set(null);
    this.error.set('');
    this.mostrarModal.set(true);
  }

  seleccionarBase(lista: Lista) {
    this.listaBase.set(this.listaBase()?._id === lista._id ? null : lista);
  }

  crear() {
    if (!this.nuevoNombre.trim()) { this.error.set('Ingresa un nombre'); return; }
    this.creando.set(true);
    this.error.set('');

    const base = this.listaBase();
    const productos = base
      ? base.productos.map((p) => ({ nombre: p.nombre, cantidad: p.cantidad }))
      : undefined;

    this.listaService.crearLista(this.nuevoNombre.trim(), productos).subscribe({
      next: (lista) => {
        this.listas.update((l) => [lista, ...l]);
        this.mostrarModal.set(false);
        this.creando.set(false);
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Error al crear lista');
        this.creando.set(false);
      },
    });
  }

  eliminar(lista: Lista, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm(`¿Eliminar "${lista.nombre}"?`)) return;
    this.listaService.eliminarLista(lista._id).subscribe({
      next: () => this.listas.update((l) => l.filter((x) => x._id !== lista._id)),
    });
  }
}
