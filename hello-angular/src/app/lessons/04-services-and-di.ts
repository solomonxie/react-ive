// Services & DI — an injectable service wrapping HttpClient, consumed via
// `inject()`.
// Goal: learn how Angular's DI system provides shared, singleton services to
// components, and how to fetch data through one.
//
// Run:  cd hello-angular && npm run dev
//       npm run lesson -- 04
// Open: http://localhost:4200/

import { Component, Injectable, OnInit, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

interface User {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`https://jsonplaceholder.typicode.com/users/${id}`);
  }
}

@Component({
  selector: 'app-greeting',
  standalone: true,
  template: `<h1>Hello, {{ name() }}</h1>`,
})
export class GreetingComponent {
  name = input.required<string>();
}

@Component({
  selector: 'app-lesson-04',
  standalone: true,
  imports: [GreetingComponent],
  template: `
    <app-greeting name="World" />
    @if (error()) {
      <p>Error: {{ error() }}</p>
    } @else if (!user()) {
      <p>Loading...</p>
    } @else {
      <p>Fetched user: {{ user()!.name }}</p>
    }
  `,
})
export class Lesson04Component implements OnInit {
  private userService = inject(UserService);

  protected user = signal<User | null>(null);
  protected error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const user = await firstValueFrom(this.userService.getUser(1));
      this.user.set(user);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Request failed');
    }
  }
}
