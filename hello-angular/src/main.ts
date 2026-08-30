// Stable application entry point. There is no `ng build` step actually run in
// this project, so we pull in the JIT compiler explicitly — it lets Angular
// compile the inline `template`/`styles` in each component at runtime instead
// of relying on the AOT compilation the CLI would normally do at build time.
import '@angular/compiler';

import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
