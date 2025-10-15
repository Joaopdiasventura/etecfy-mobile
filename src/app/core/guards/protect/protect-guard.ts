import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { User } from '../../models/user';
import { AuthService } from '../../services/user/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ProtectGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public canActivate(): Observable<boolean | UrlTree> {
    return this.authService.user$.pipe(switchMap((user) => this.connectUser(user)));
  }

  private connectUser(user: User | null): Observable<boolean | UrlTree> {
    if (user) return of(true);
    return of(this.router.parseUrl('/user/login'));
  }
}
