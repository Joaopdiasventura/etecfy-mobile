import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  imports: [
    LucideAngularModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonSearchbar,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() public showSearch = true;
  @Output() public menuClick = new EventEmitter<void>();
  @Output() public searchEvent = new EventEmitter<string>();
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  public onMenuClick(): void {
    this.menuClick.emit();
  }

  public onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  public ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((v) => this.searchEvent.emit(v));
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
