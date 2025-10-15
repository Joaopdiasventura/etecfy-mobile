import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  BehaviorSubject,
  filter,
  shareReplay,
  combineLatest,
  switchMap,
  map,
  scan,
  merge,
  startWith,
  distinctUntilChanged,
  take,
  Observable,
  timer,
  takeUntil,
  of,
} from 'rxjs';
import { Playlist } from 'src/app/core/models/playlist';
import { User } from 'src/app/core/models/user';
import { PlaylistService } from 'src/app/core/services/playlist/playlist.service';
import { AuthService } from 'src/app/core/services/user/auth/auth.service';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { IonContent, IonButton, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile-page',
  imports: [
    HeaderComponent,
    AsyncPipe,
    RouterLink,
    LucideAngularModule,
    IonContent,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit, AfterViewInit, OnDestroy {
  public currentUser = signal<User | null>(null);
  public sidebarOpen = signal(false);

  @ViewChild('gridPlaylists') private gridEl?: ElementRef<HTMLElement>;
  @ViewChild('infiniteSentinel') private sentinelEl?: ElementRef<HTMLElement>;
  private observer?: IntersectionObserver;

  private readonly authService = inject(AuthService);
  private readonly playlistService = inject(PlaylistService);
  private readonly platform = inject(PLATFORM_ID);

  private readonly search$ = new BehaviorSubject<string>('');
  private readonly page$ = new BehaviorSubject<number>(0);
  private readonly limit = 10;

  private readonly user$ = this.authService.user$.pipe(
    filter((u): u is User => !!u),
    shareReplay(1)
  );

  private readonly refresh$ = new BehaviorSubject<number>(0);

  private readonly params$ = combineLatest([
    this.user$,
    this.search$,
    this.page$,
    this.refresh$,
  ]).pipe(shareReplay(1));

  private readonly pageResult$ = this.params$.pipe(
    switchMap(([user, search, page]) =>
      this.playlistService
        .findMany({
          user: user._id,
          limit: this.limit,
          name: search,
          page,
          orderBy: search ? 'name:asc' : 'createdAt:desc',
        })
        .pipe(map((list) => ({ page, list })))
    ),
    shareReplay(1)
  );

  public readonly playlists$ = this.pageResult$.pipe(
    scan<{ page: number; list: Playlist[] }, Playlist[]>(
      (acc, cur) => (cur.page === 0 ? cur.list : [...acc, ...cur.list]),
      []
    ),
    shareReplay(1)
  );

  public readonly loading$ = merge(
    this.params$.pipe(map(() => true)),
    this.pageResult$.pipe(map(() => false))
  ).pipe(startWith(false), shareReplay(1));

  private readonly requestState$ = merge(
    this.params$.pipe(map(([, , page]) => ({ page, loading: true }))),
    this.pageResult$.pipe(map(({ page }) => ({ page, loading: false })))
  ).pipe(shareReplay(1));

  private readonly isInitialLoading$ = this.requestState$.pipe(
    map((s) => s.loading && s.page === 0),
    distinctUntilChanged(),
    shareReplay(1)
  );
  private readonly isMoreLoading$ = this.requestState$.pipe(
    map((s) => s.loading && s.page > 0),
    distinctUntilChanged(),
    shareReplay(1)
  );
  public readonly loadingInitial$ = this.applyLoadingDelay(
    this.isInitialLoading$,
    150
  );
  public readonly loadingMore$ = this.applyLoadingDelay(
    this.isMoreLoading$,
    150
  );

  private readonly hasMore$ = this.pageResult$.pipe(
    map((r) => r.list.length >= this.limit),
    startWith(true),
    shareReplay(1)
  );

  public readonly label$ = combineLatest([this.playlists$, this.search$]).pipe(
    map(([playlists, search]) => {
      if (!playlists || playlists.length === 0)
        return 'Nenhuma playlist encontrada';
      if (search) return 'Exibindo resultados para: ' + search;
      return 'Suas playlists';
    })
  );

  public ngOnInit(): void {
    this.user$.pipe(take(1)).subscribe((u) => this.currentUser.set(u));
  }

  public ngAfterViewInit(): void {
    this.setupObserver();
  }

  public ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  public onSearchChange(value: string): void {
    this.search$.next(value);
    this.page$.next(0);
  }

  public changeSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  private setupObserver(): void {
    if (!isPlatformBrowser(this.platform)) return;
    if (!this.gridEl || !this.sentinelEl) return;
    if (this.observer) this.observer.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting) return;
        this.loadMore();
      },
      {
        /* Usa o viewport (IonContent) como root para não exigir container scrollável */
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1,
      }
    );
    this.observer.observe(this.sentinelEl.nativeElement);
  }

  private loadMore(): void {
    combineLatest([this.loading$, this.hasMore$])
      .pipe(take(1))
      .subscribe(([loading, hasMore]) => {
        if (!loading && hasMore) this.page$.next(this.page$.getValue() + 1);
      });
  }

  private applyLoadingDelay(
    source$: Observable<boolean>,
    delayMs: number
  ): Observable<boolean> {
    return source$.pipe(
      switchMap((isLoading) =>
        isLoading
          ? timer(delayMs).pipe(
              map(() => true),
              takeUntil(source$.pipe(filter((v) => !v)))
            )
          : of(false)
      ),
      startWith(false),
      shareReplay(1)
    );
  }

  public onDeletePlaylist(ev: Event, id: string): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.playlistService
      .delete(id)
      .pipe(take(1))
      .subscribe(() => {
        // reset list and trigger refresh
        this.page$.next(0);
        this.refresh$.next(this.refresh$.getValue() + 1);
      });
  }
}
