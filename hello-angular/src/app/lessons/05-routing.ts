// Routing — Angular Router with static routes and a dynamic /user/:id route.
// Goal: learn client-side navigation and reading route params.
//
// This lesson owns a small nested router rather than reconfiguring the
// app-level one: the root `Router` service is already provided (with an
// empty initial config) in `app.config.ts`, so this component just installs
// its own routes into it via `resetConfig()` and renders its own
// <router-outlet>. That keeps the whole demo self-contained in this file.
//
// Run:  cd hello-angular && npm run dev
//       npm run lesson -- 05
// Open: http://localhost:4200/

import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink, RouterOutlet, Routes } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-lesson-05-home',
  standalone: true,
  template: `
    <h1>Hello, World</h1>
    <p>A progressive Angular learning app.</p>
  `,
})
export class HomePageComponent {}

@Component({
  selector: 'app-lesson-05-about',
  standalone: true,
  template: `<p>A progressive Angular learning app, built one concept at a time.</p>`,
})
export class AboutPageComponent {}

@Component({
  selector: 'app-lesson-05-user',
  standalone: true,
  template: `
    @if (error()) {
      <p>Error: {{ error() }}</p>
    } @else if (!user()) {
      <p>Loading...</p>
    } @else {
      <p>Fetched user: {{ user()!.name }}</p>
    }
  `,
})
export class UserPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  protected user = signal<User | null>(null);
  protected error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '1';
    try {
      const user = await firstValueFrom(
        this.http.get<User>(`https://jsonplaceholder.typicode.com/users/${id}`),
      );
      this.user.set(user);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Request failed');
    }
  }
}

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'about', component: AboutPageComponent },
  { path: 'user/:id', component: UserPageComponent },
];

@Component({
  selector: 'app-lesson-05',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/" queryParamsHandling="preserve">Home</a> |
      <a routerLink="/about" queryParamsHandling="preserve">About</a> |
      <a routerLink="/user/1" queryParamsHandling="preserve">User 1</a>
    </nav>
    <router-outlet />
  `,
})
export class Lesson05Component {
  private router = inject(Router);

  constructor() {
    this.router.resetConfig(routes);
  }
}
