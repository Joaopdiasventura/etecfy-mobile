import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { User } from '../../../core/models/user';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { IonButton, IonMenuToggle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-sidebar',
  imports: [LucideAngularModule, RouterLink, IonButton, IonMenuToggle],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() public onClose?: () => void;
  @Output() public closeEvent = new EventEmitter<void>();

  public currentUser = signal<User | null>(null);

  private readonly authService = inject(AuthService);

  public ngOnInit(): void {
    this.authService.user$.subscribe((user) => this.currentUser.set(user));
  }

  public handleClose(): void {
    if (this.onClose) this.onClose();
    this.closeEvent.emit();
  }

  public logOut(): void {
    this.authService.disconnectUser();
  }
}
