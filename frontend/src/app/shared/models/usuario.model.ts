export interface UsuarioResumen {
  _id: string;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
}

export interface Usuario {
  _id: string;
  email: string;
  username: string;
  nombre: string;
  apellido: string;
  role: 'usuario' | 'administrador';
  listas: string[];
  amigos: UsuarioResumen[];
  createdAt: string;
}
