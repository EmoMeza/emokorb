import { Injectable, inject, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private readonly auth = inject(AuthService);
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;
    this.socket = io(environment.socketUrl, {
      auth: { token: this.auth.token() },
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinLista(listaId: string) {
    this.socket?.emit('lista:join', listaId);
  }

  leaveLista(listaId: string) {
    this.socket?.emit('lista:leave', listaId);
  }

  on<T>(event: string, cb: (data: T) => void) {
    this.socket?.on(event, cb);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
