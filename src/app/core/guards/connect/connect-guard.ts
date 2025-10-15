import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanMatch, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { User } from '../../models/user';
import { AuthService } from '../../services/user/auth/auth.service';
import { UserService } from '../../services/user/user.service';

@Injectable({ providedIn: 'root' })
export class ConnectGuard implements CanMatch {
  private readonly platform = inject(PLATFORM_ID);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  public canMatch(): Observable<boolean | UrlTree> {
    return this.authService.user$.pipe(
      switchMap((user) => this.connectUser(user))
    );
  }

  private connectUser(user: User | null): Observable<boolean | UrlTree> {
    if (user) return of(true);

    if (!isPlatformBrowser(this.platform)) return of(true);
    const token = globalThis?.localStorage?.getItem('token') ?? null;

    if (!token) return of(true);

    return this.userService.decodeToken(token).pipe(
      map((decodedUser) => !!this.authService.updateUserData(decodedUser)),
      catchError(() => of(true))
    );
  }
}
