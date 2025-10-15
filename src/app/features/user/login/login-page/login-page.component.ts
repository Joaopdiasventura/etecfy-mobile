import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../../core/services/user/auth/auth.service';
import { UserService } from '../../../../core/services/user/user.service';
import { ModalConfig } from '../../../../shared/interfaces/config/modal';
import { PlayerService } from '../../../../shared/services/player/player.service';
import { IonContent, IonButton, IonInput, IonAlert } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login-page',
  imports: [
    LucideAngularModule,
    RouterLink,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonAlert,
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly playerService = inject(PlayerService);
  private readonly router = inject(Router);

  public loading = signal(false);

  public modalConfig = signal<ModalConfig | null>(null);

  public get modalHeader(): string {
    return this.modalConfig()?.title || '';
  }

  public get modalMessage(): string {
    const c = this.modalConfig()?.content as string | string | undefined;
    if (!c) return '';
    return Array.isArray(c) ? c.join('<br/>') : c;
  }

  public form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d^A-Za-z0-9!?@#$%&*._-]{8,}$/
        ),
      ],
    ],
  });

  public ngOnInit(): void {
    this.playerService.updatePlayerData(null);
  }

  public get f(): FormGroup['controls'] {
    return this.form.controls;
  }

  public submit(): void {
    console.log(this.modalConfig());

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.userService.login(this.form.value).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.authService.updateUserData(res.user);
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.modalConfig.set({
          title: 'Erro',
          content:
            err?.error?.message ?? 'Não foi possível entrar. Tente novamente.',
        });
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
