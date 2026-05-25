import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListaService } from '../../core/services/lista.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Lista, Producto } from '../../shared/models/lista.model';
import { UsuarioResumen } from '../../shared/models/usuario.model';

@Component({
  selector: 'app-lista-detalle',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './lista-detalle.html',
  styleUrl: './lista-detalle.css',
})
export class ListaDetalleComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly listaService = inject(ListaService);
  private readonly socket = inject(SocketService);
  private readonly usuarioService = inject(UsuarioService);
  readonly auth = inject(AuthService);

  lista = signal<Lista | null>(null);
  cargando = signal(true);
  error = signal('');

  nuevoNombre = '';
  agregando = signal(false);

  mostrarModalColaboradores = signal(false);
  amigos = signal<UsuarioResumen[]>([]);

  mostrarModalFinalizar = signal(false);
  mostrarModalBoleta = signal(false);
  boletaBlobUrl = signal<string | null>(null);
  boletaArchivo = signal<File | null>(null);
  finalizando = signal(false);

  get listaId() { return this.route.snapshot.paramMap.get('id')!; }
  get esOwner() { return this.lista()?.owner._id === this.auth.usuario()?._id; }
  get estaActiva() { return this.lista()?.estado === 'activo'; }

  estaListo(p: Producto) { return p.precioUnitario > 0 && p.cantidad > 0; }

  get productosOrdenados() {
    return [...(this.lista()?.productos ?? [])].sort((a, b) =>
      (this.estaListo(a) ? 1 : 0) - (this.estaListo(b) ? 1 : 0)
    );
  }

  ngOnInit() {
    this.cargar();
    this.socket.connect();
    this.socket.joinLista(this.listaId);

    this.socket.on<{ producto: Producto }>('producto:agregado', ({ producto }) => {
      this.lista.update((l) => l ? this.conProductosActualizados([...l.productos, producto]) : l);
    });
    this.socket.on<{ producto: Producto }>('producto:editado', ({ producto }) => {
      this.lista.update((l) => l ? this.conProductosActualizados(
        l.productos.map((p) => p._id === producto._id ? producto : p)
      ) : l);
    });
    this.socket.on<{ pid: string }>('producto:eliminado', ({ pid }) => {
      this.lista.update((l) => l ? this.conProductosActualizados(
        l.productos.filter((p) => p._id !== pid)
      ) : l);
    });
    this.socket.on<Lista>('lista:actualizada', (lista) => this.lista.set(lista));
  }

  ngOnDestroy() {
    this.socket.leaveLista(this.listaId);
    ['producto:agregado', 'producto:editado', 'producto:eliminado', 'lista:actualizada']
      .forEach((e) => this.socket.off(e));
  }

  cargar() {
    this.listaService.getLista(this.listaId).subscribe({
      next: (data) => { this.lista.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar la lista'); this.cargando.set(false); },
    });
  }

  agregarProducto() {
    if (!this.nuevoNombre.trim()) return;
    this.agregando.set(true);
    this.listaService.agregarProducto(this.listaId, { nombre: this.nuevoNombre.trim() }).subscribe({
      next: () => { this.nuevoNombre = ''; this.agregando.set(false); },
      error: () => this.agregando.set(false),
    });
  }

  onNombreBlur(p: Producto, event: Event) {
    const nombre = (event.target as HTMLInputElement).value.trim();
    if (!nombre || nombre === p.nombre) return;
    this.guardarCampo(p, { nombre });
  }

  onPrecioBlur(p: Producto, event: Event) {
    const precioUnitario = Number((event.target as HTMLInputElement).value) || 0;
    if (precioUnitario === p.precioUnitario) return;
    this.guardarCampo(p, { precioUnitario });
  }

  onCantidadBlur(p: Producto, event: Event) {
    const cantidad = Number((event.target as HTMLInputElement).value) || 0;
    if (cantidad === p.cantidad) return;
    this.guardarCampo(p, { cantidad });
  }

  private guardarCampo(p: Producto, cambio: Partial<Omit<Producto, '_id' | 'total'>>) {
    const base = { ...p, ...cambio };
    const actualizado: Producto = { ...base, total: base.precioUnitario * base.cantidad };
    this.lista.update((l) => l ? this.conProductosActualizados(
      l.productos.map((x) => x._id === p._id ? actualizado : x)
    ) : l);
    this.listaService.editarProducto(this.listaId, p._id, cambio).subscribe();
  }

  private conProductosActualizados(productos: Producto[]): Lista {
    return { ...this.lista()!, productos, total: productos.reduce((s, p) => s + p.total, 0) };
  }

  eliminarProducto(pid: string) {
    if (!confirm('¿Eliminar producto?')) return;
    this.listaService.eliminarProducto(this.listaId, pid).subscribe();
  }

  // --- Finalizar con modal ---

  abrirModalFinalizar() {
    this.boletaArchivo.set(null);
    this.mostrarModalFinalizar.set(true);
  }

  seleccionarBoleta(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.boletaArchivo.set(file);
  }

  confirmarFinalizar() {
    this.finalizando.set(true);
    const archivo = this.boletaArchivo();

    const finalizar = () => {
      this.listaService.editarLista(this.listaId, { estado: 'finalizado' }).subscribe({
        next: (l) => {
          this.lista.update((prev) => prev ? { ...prev, estado: l.estado } : prev);
          if (archivo) this.lista.update((prev) => prev ? { ...prev, boleta: 'uploaded' } : prev);
          this.mostrarModalFinalizar.set(false);
          this.finalizando.set(false);
        },
        error: () => this.finalizando.set(false),
      });
    };

    if (archivo) {
      this.listaService.subirBoleta(this.listaId, archivo).subscribe({
        next: () => finalizar(),
        error: () => this.finalizando.set(false),
      });
    } else {
      finalizar();
    }
  }

  reactivar() {
    this.listaService.editarLista(this.listaId, { estado: 'activo' }).subscribe({
      next: (l) => this.lista.update((prev) => prev ? { ...prev, estado: l.estado } : prev),
    });
  }

  // --- Colaboradores ---

  abrirModalColaboradores() {
    this.mostrarModalColaboradores.set(true);
    this.usuarioService.getMiPerfil().subscribe({ next: (u) => this.amigos.set(u.amigos) });
  }

  esColaborador(uid: string) {
    return this.lista()?.colaboradores.some((c) => c._id === uid) ?? false;
  }

  agregarColaborador(uid: string) {
    this.listaService.agregarColaborador(this.listaId, uid).subscribe({ next: () => this.cargar() });
  }

  quitarColaborador(uid: string) {
    this.listaService.quitarColaborador(this.listaId, uid).subscribe({ next: () => this.cargar() });
  }

  // --- Boleta existente ---

  abrirModalBoleta() {
    this.mostrarModalBoleta.set(true);
    if (this.boletaBlobUrl()) return;
    this.listaService.descargarBoleta(this.listaId).subscribe({
      next: (blob) => this.boletaBlobUrl.set(URL.createObjectURL(blob)),
    });
  }

  cerrarModalBoleta() {
    const url = this.boletaBlobUrl();
    if (url) URL.revokeObjectURL(url);
    this.boletaBlobUrl.set(null);
    this.mostrarModalBoleta.set(false);
  }

  subirBoletaExistente(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.boletaBlobUrl.set(null); // reset cached blob on replace
    this.listaService.subirBoleta(this.listaId, file).subscribe({
      next: (res) => this.lista.update((l) => l ? { ...l, boleta: res.boletaId } : l),
    });
  }
}
