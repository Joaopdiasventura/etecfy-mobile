import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  shareReplay,
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
  filter,
  of,
} from 'rxjs';
import { Song } from '../../../core/models/song';
import { SongService } from '../../../core/services/song/song.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SongCardComponent } from '../../../shared/components/song-card/song-card.component';
import { PlayerConfig } from '../../../shared/interfaces/config/player';
import { PlayerService } from '../../../shared/services/player/player.service';
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home-page',
  imports: [HeaderComponent, SongCardComponent, AsyncPipe, IonContent, IonGrid, IonRow, IonCol],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  public sidebarOpen = signal(false);
  private playerSearchSnapshot = '';

  public skeletons = Array.from({ length: 5 }, (_, i) => i);

  private readonly songService = inject(SongService);
  private readonly playerService = inject(PlayerService);
  private readonly platform = inject(PLATFORM_ID);

  private readonly search$ = new BehaviorSubject<string>('');
  private readonly page$ = new BehaviorSubject<number>(0);
  private readonly limit = 10;
  private observer?: IntersectionObserver;

  public currentPlayerConfig: PlayerConfig = {
    playlist: [],
    currentIndex: -1,
    isPlaying: false,
    playEvent: this.handlePlayerIndexChange.bind(this),
    closeEvent: this.onPlayerClose.bind(this),
    playingChange: this.onPlayingChange.bind(this),
    loadMore: this.handlePlayerLoadMore.bind(this),
  };

  private readonly params$ = combineLatest([this.search$, this.page$]).pipe(
    shareReplay(1)
  );

  private readonly pageResult$ = this.params$.pipe(
    switchMap(([search, page]) =>
      this.songService
        .findMany({
          limit: this.limit,
          title: search,
          artist: search,
          page,
          orderBy: search ? 'title:asc' : 'createdAt:desc',
        })
        .pipe(map((list) => ({ page, list })))
    ),
    shareReplay(1)
  );

  public readonly songs$ = this.pageResult$.pipe(
    scan<{ page: number; list: Song[] }, Song[]>(
      (acc, cur) => (cur.page === 0 ? cur.list : [...acc, ...cur.list]),
      []
    ),
    shareReplay(1)
  );

  public readonly loading$ = merge(
    this.params$.pipe(map(() => true)),
    this.pageResult$.pipe(map(() => false))
  ).pipe(startWith(false), shareReplay(1));

  public ngOnInit(): void {
    this.playerService.player$.subscribe((data) => {
      if (data) this.currentPlayerConfig = data;
    });
  }

  private readonly requestState$ = merge(
    this.params$.pipe(map(([, page]) => ({ page, loading: true }))),
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

  public readonly label$ = combineLatest([this.songs$, this.search$]).pipe(
    map(([songs, search]) => {
      if (!songs || songs.length === 0) return 'Nenhuma musica encontrada';
      if (search) return 'Exibindo resultados para: ' + search;
      return 'Adicionadas recentemente';
    })
  );

  private gridEl?: ElementRef<HTMLDivElement>;
  private sentinelEl?: ElementRef<HTMLDivElement>;

  @ViewChild('gridCards')
  public set gridCards(el: ElementRef<HTMLDivElement> | undefined) {
    this.gridEl = el;
    this.setupObserver();
  }

  @ViewChild('infiniteSentinel')
  public set infiniteSentinel(el: ElementRef<HTMLDivElement> | undefined) {
    this.sentinelEl = el;
    this.setupObserver();
  }

  // Play from a song card (grid). Snapshots the current visible list for the player.
  public handleCardPlay(index: number): void {
    this.songs$.pipe(take(1)).subscribe((list) => {
      if (!list || index < 0 || index >= list.length) return;
      // Create a snapshot playlist independent from the grid list
      this.playerService.updatePlayerData({
        ...this.currentPlayerConfig,
        playlist: list,
        currentIndex: index,
        isPlaying: true,
      });
      this.playerSearchSnapshot = this.search$.getValue();
    });
  }

  // Index change coming from the player (play/pause/next/prev)
  public handlePlayerIndexChange(index: number): void {
    const list = this.currentPlayerConfig.playlist;
    if (!list || index < 0 || index >= list.length) return;
    if (this.currentPlayerConfig.currentIndex === index)
      this.playerService.updatePlayerData({
        ...this.currentPlayerConfig,
        isPlaying: !this.currentPlayerConfig.isPlaying,
      });
    else {
      this.playerService.updatePlayerData({
        ...this.currentPlayerConfig,
        currentIndex: index,
        isPlaying: true,
      });
    }
  }

  public onPlayerClose(): void {
    this.playerService.updatePlayerData({
      ...this.currentPlayerConfig,
      currentIndex: -1,
      isPlaying: false,
    });
  }

  public handlePlayPause(): void {
    this.playerService.updatePlayerData({
      ...this.currentPlayerConfig,
      isPlaying: !this.currentPlayerConfig.isPlaying,
    });
  }

  public changeSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  public onSearchChange(value: string): void {
    this.search$.next(value);
    this.page$.next(0);
  }

  public onPlayingChange(playing: boolean): void {
    this.playerService.updatePlayerData({
      ...this.currentPlayerConfig,
      isPlaying: playing,
    });
  }

  public ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  public handlePlayerLoadMore(): void {
    // Load more items only for the player's playlist, independent from the grid
    const snapshotSearch = this.playerSearchSnapshot;
    const orderBy = snapshotSearch ? 'title:asc' : 'createdAt:desc';
    const alreadyLoaded = this.currentPlayerConfig.playlist!.length;
    const nextPage = Math.floor(alreadyLoaded / this.limit);
    this.songService
      .findMany({
        limit: this.limit,
        title: snapshotSearch,
        artist: snapshotSearch,
        page: nextPage,
        orderBy,
      })
      .pipe(take(1))
      .subscribe((list) => {
        if (!list || list.length === 0) return;
        const merged = [...this.currentPlayerConfig.playlist!, ...list];
        this.playerService.updatePlayerData({
          ...this.currentPlayerConfig,
          playlist: merged,
        });
      });
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
        root: this.gridEl.nativeElement,
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

  public isCurrentSong(song: Song): boolean {
    if (!song) return false;
    const list = this.currentPlayerConfig.playlist!;
    const idx = this.currentPlayerConfig.currentIndex;
    if (idx < 0 || idx >= list.length) return false;
    return list[idx]?._id === song._id;
  }
}
