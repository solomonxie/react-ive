// Root component. Angular's bootstrap is single-shot (`bootstrapApplication`
// mounts one component tree and stays there), unlike a Vite dev server that
// can hot-swap the mounted module per lesson. So instead of each lesson
// bootstrapping itself, this root reads `?lesson=NN` from the URL once and
// uses `@switch` to render the matching lesson component.

import { Component, OnInit, signal } from '@angular/core';

import { Lesson01Component } from './lessons/01-hello-world';
import { Lesson02Component } from './lessons/02-components-and-inputs';
import { Lesson03Component } from './lessons/03-state-and-events';
import { Lesson04Component } from './lessons/04-services-and-di';
import { Lesson05Component } from './lessons/05-routing';

const KNOWN_LESSONS = ['01', '02', '03', '04', '05'] as const;
type LessonId = (typeof KNOWN_LESSONS)[number];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Lesson01Component, Lesson02Component, Lesson03Component, Lesson04Component, Lesson05Component],
  template: `
    @switch (lesson()) {
      @case ('01') {
        <app-lesson-01 />
      }
      @case ('02') {
        <app-lesson-02 />
      }
      @case ('03') {
        <app-lesson-03 />
      }
      @case ('04') {
        <app-lesson-04 />
      }
      @case ('05') {
        <app-lesson-05 />
      }
      @default {
        <app-lesson-01 />
      }
    }
  `,
})
export class AppComponent implements OnInit {
  protected readonly lesson = signal<LessonId>('01');

  ngOnInit(): void {
    const requested = new URLSearchParams(window.location.search).get('lesson') ?? '01';
    if ((KNOWN_LESSONS as readonly string[]).includes(requested)) {
      this.lesson.set(requested as LessonId);
    } else {
      console.warn(`Unknown lesson "${requested}". Starting lesson 01 instead.`);
    }
  }
}
