// State & Events — signals (`signal`, `computed`) for state, and an event
// binding driving a controlled text input.
// Goal: learn how Angular signals track state and propagate changes to the
// template, without the manual dependency arrays effects need.
//
// Run:  cd hello-angular && npm run dev
//       npm run lesson -- 03
// Open: http://localhost:4200/

import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-greeting',
  standalone: true,
  template: `<h1>Hello, {{ name() }}</h1>`,
})
export class GreetingComponent {
  name = input.required<string>();
}

@Component({
  selector: 'app-lesson-03',
  standalone: true,
  imports: [GreetingComponent],
  template: `
    <app-greeting [name]="name()" />
    <input [value]="name()" (input)="onNameInput($event)" placeholder="Type a name" />
    <p>
      <button (click)="increment()">Clicked {{ count() }} times</button>
      (doubled: {{ doubledCount() }})
    </p>
  `,
})
export class Lesson03Component {
  protected name = signal('World');
  protected count = signal(0);
  protected doubledCount = computed(() => this.count() * 2);

  protected onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  protected increment(): void {
    this.count.update((c) => c + 1);
  }
}
