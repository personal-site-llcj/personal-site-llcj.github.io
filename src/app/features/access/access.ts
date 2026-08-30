import {
  Component,
  inject,
  signal,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  ThemeService
} from '../../core/services/theme.service';


@Component({
  selector: 'app-access',
  standalone: true,
  templateUrl: './access.html',
  styleUrl: './access.css'
})
export class Access implements OnInit {

  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);


  readonly isDark = this.themeService.isDark;


  readonly word = signal('');
  readonly error = signal('');
  readonly entering = signal(false);


  readonly showHint = signal(
    !this.themeService.hasSeenHint()
  );


  ngOnInit(): void {

    if (this.themeService.hasAccess()) {

      this.router.navigate([
        '/home'
      ]);

    }

  }


  toggleTheme(): void {

    this.themeService.toggle();

  }


  async enter(): Promise<void> {

    this.error.set('');


    const value =
      this.word().trim();


    if (!value) {

      this.error.set(
        'Inténtalo de nuevo.'
      );

      return;

    }


    const valid =
      await this.themeService
        .validateExperience(value);


    if (!valid) {

      this.error.set(
        'Inténtalo de nuevo.'
      );

      return;

    }


    this.entering.set(true);


    this.themeService
      .markAccessGranted();


    setTimeout(() => {

      this.router.navigate([
        '/home'
      ]);

    }, 600);

  }

}