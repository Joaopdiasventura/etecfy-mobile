import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ModalConfig } from '../../interfaces/config/modal';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-modal',
  imports: [LucideAngularModule, IonButton],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input({ required: true }) public config!: ModalConfig;
  @Output() public close = new EventEmitter<void>();

  public isArray(msg: unknown): msg is string[] {
    return Array.isArray(msg);
  }

  @HostListener('document:keydown.enter')
  public onOverlayClick(): void {
    this.close.emit();
  }
}
