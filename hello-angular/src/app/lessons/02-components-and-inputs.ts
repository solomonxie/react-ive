// Components & Inputs — splits the greeting into a reusable, composable
// <app-greeting> component using the modern signal-based `input()`/`output()`
// functions.
// Goal: learn how data flows into a component via a typed input, and how a
// child notifies its parent via an output.
//
// Run:  cd hello-angular && npm run dev
//       npm run lesson -- 02
// Open: http://localhost:4200/

import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-greeting',
  standalone: true,
  template: `<h1 (click)="selected.emit(name())">Hello, {{ name() }}</h1>`,
  styles: `
    h1 {
      cursor: pointer;
    }
  `,
})
export class GreetingComponent {
  name = input.required<string>();
  selected = output<string>();
}

@Component({
  selector: 'app-lesson-02',
  standalone: true,
  imports: [GreetingComponent],
  template: `
    <app-greeting name="World" (selected)="onSelected($event)" />
    <app-greeting name="TypeScript" (selected)="onSelected($event)" />
    @if (lastClicked) {
      <p>Last clicked: {{ lastClicked }}</p>
    }
  `,
})
export class Lesson02Component {
  protected lastClicked: string | null = null;

  protected onSelected(name: string): void {
    this.lastClicked = name;
  }
}
