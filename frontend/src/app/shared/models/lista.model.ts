export interface Producto {
  _id: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  total: number;
}

export interface Lista {
  _id: string;
  nombre: string;
  owner: { _id: string; username: string; nombre: string; apellido: string };
  colaboradores: { _id: string; username: string; nombre: string; apellido: string }[];
  productos: Producto[];
  estado: 'activo' | 'finalizado';
  fechaCierre: string | null;
  total: number;
  boleta: string | null;
  createdAt: string;
}
