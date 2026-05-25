import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  isDark = signal(false);

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    this.isDark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  toggleTheme() {
    const dark = !this.isDark();
    this.isDark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  cerrarSesion() {
    if (confirm('¿Seguro que quieres salir?')) this.auth.logout();
  }

  get initiales() {
    const u = this.auth.usuario();
    return u?.username?.charAt(0)?.toUpperCase() ?? '?';
  }
}
