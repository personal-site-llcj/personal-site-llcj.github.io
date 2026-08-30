import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');

  private hoverEnabled = false;

  constructor(themeService: ThemeService) {
    themeService.initialize();
  }

  @HostListener('document:mousemove')
  enableHover(): void {
    if (this.hoverEnabled) {
      return;
    }

    this.hoverEnabled = true;
    document.documentElement.classList.add('hover-enabled');
  }
}