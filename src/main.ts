import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import {
  ChevronLeft,
  Download,
  House,
  Lock,
  LogIn,
  LogOut,
  LucideAngularModule,
  Mail,
  Maximize2,
  Menu,
  Minimize2,
  Music,
  Pause,
  Play,
  Repeat,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  User,
  UserPlus,
  Volume2,
  X,
} from 'lucide-angular';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      LucideAngularModule.pick({
        Music,
        House,
        LogOut,
        LogIn,
        UserPlus,
        Menu,
        Search,
        Download,
        Play,
        ChevronLeft,
        Lock,
        User,
        Mail,
        Shuffle,
        SkipBack,
        Pause,
        SkipForward,
        Repeat,
        Volume2,
        X,
        Minimize2,
        Maximize2,
      })
    ),
  ],
});
