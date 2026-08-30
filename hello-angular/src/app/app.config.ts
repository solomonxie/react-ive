import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

// Routes start empty: lesson 05 owns and installs its own nested router
// config at runtime via `Router.resetConfig()`, so it stays self-contained
// in its own file instead of leaking lesson-specific routes in here.
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideRouter([])],
};
