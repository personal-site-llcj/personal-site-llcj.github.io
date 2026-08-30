import { Injectable, computed, signal } from '@angular/core';

export type VelaTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private readonly storageKey = 'vela-theme';

  private readonly accessStorageKey = 'vela_access';
  private readonly hintStorageKey = 'vela_hint_seen';

  private readonly experienceToken =
    'b7e507f7b30caff568e11c613de215eba2f861b8545ef8c30298fdf9ddcd97e8';

  private initialized = false;

  readonly theme = signal<VelaTheme>('dark');
  readonly isDark = computed(() => this.theme() === 'dark');


  initialize(): void {

    if (this.initialized) {
      return;
    }

    this.initialized = true;

    let savedTheme: VelaTheme | null = null;

    try {

      const stored = localStorage.getItem(this.storageKey);

      if (stored === 'light' || stored === 'dark') {
        savedTheme = stored;
      }

    } catch {
      // Si localStorage no está disponible, se usa el tema claro.
    }

    this.setTheme(savedTheme ?? 'dark', false);
  }


  toggle(): void {

    this.setTheme(
      this.isDark()
        ? 'light'
        : 'dark'
    );

  }


  setTheme(
    theme: VelaTheme,
    persist = true
  ): void {

    this.theme.set(theme);

    if (typeof document !== 'undefined') {

      document.documentElement.dataset['theme'] = theme;
      document.documentElement.style.colorScheme = theme;

    }

    if (persist) {

      try {

        localStorage.setItem(
          this.storageKey,
          theme
        );

      } catch {
        // El tema sigue funcionando durante la sesión.
      }

    }
  }


  async validateExperience(
    value: string
  ): Promise<boolean> {

    const normalized =
      value
        .trim()
        .toLowerCase();


    const hash =
      await this.generateHash(normalized);


    return hash === this.experienceToken;

  }


  markAccessGranted(): void {

    try {

      sessionStorage.setItem(
        this.accessStorageKey,
        'true'
      );

      localStorage.setItem(
        this.hintStorageKey,
        'true'
      );

    } catch {
      // Continúa sin persistencia.
    }

  }


  hasAccess(): boolean {

    try {

      return (
        sessionStorage.getItem(
          this.accessStorageKey
        ) === 'true'
      );

    } catch {

      return false;

    }

  }


  hasSeenHint(): boolean {

    try {

      return (
        localStorage.getItem(
          this.hintStorageKey
        ) === 'true'
      );

    } catch {

      return false;

    }

  }


  private async generateHash(
    value: string
  ): Promise<string> {

    const encoder =
      new TextEncoder();


    const data =
      encoder.encode(value);


    const hashBuffer =
      await crypto.subtle.digest(
        'SHA-256',
        data
      );


    const hashArray =
      Array.from(
        new Uint8Array(hashBuffer)
      );


    return hashArray
      .map(
        b => b.toString(16).padStart(2, '0')
      )
      .join('');

  }

}