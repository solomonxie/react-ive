// Hello World — renders a single standalone component with an inline template.
// Goal: see the smallest possible Angular component render pipeline.
//
// Run:  cd hello-angular && npm run dev
// Open: http://localhost:4200/

import { Component } from '@angular/core';

@Component({
  selector: 'app-lesson-01',
  standalone: true,
  template: `<h1>Hello, World</h1>`,
})
export class Lesson01Component {}
