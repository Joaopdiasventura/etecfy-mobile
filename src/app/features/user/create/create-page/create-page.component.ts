import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../../core/services/user/auth/auth.service';
import { UserService } from '../../../../core/services/user/user.service';
import { ModalConfig } from '../../../../shared/interfaces/config/modal';
import { PlayerService } from '../../../../shared/services/player/player.service';
import { IonContent, IonInput, IonButton, IonAlert } from '@ionic/angular/standalone';

function matchPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password != confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-create-user-page',
  imports: [
    LucideAngularModule,
    RouterLink,
    ReactiveFormsModule,
    IonAlert,
    IonContent,
    IonInput,
    IonButton,
  ],
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.scss'],
})
export class CreatePageComponent implements OnInit {
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

  public form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
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
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchPasswords }
  );

  public ngOnInit(): void {
    this.playerService.updatePlayerData(null);
  }

  public get f(): FormGroup['controls'] {
    return this.form.controls;
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { name, email, password } = this.form.value as {
      name: string;
      email: string;
      password: string;
    };
    this.userService.create({ name, email, password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.authService.updateUserData(res.user);
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.modalConfig.set({
          title: 'Erro',
          content: err?.error?.message ?? 'Não foi possível criar sua conta.',
        });
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
