import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

type HomeView = 'home' | 'mood' | 'choosing';

type MoodId =
  | 'tired'
  | 'overwhelmed'
  | 'bad-day'
  | 'disconnect'
  | 'encouragement'
  | 'alone'
  | 'good'
  | 'unsure';

type TutorialTarget = 'welcome' | 'from-me' | 'options' | 'surprise' | 'theme' | 'none';

interface MoodOption {
  id: MoodId;
  symbol: string;
  title: string;
  subtitle: string;
}

interface Destination {
  route: string;
  experience?: string;
}

interface TutorialStep {
  target: TutorialTarget;
  eyebrow: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnDestroy {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  private readonly tutorialStorageKey = 'vela-tutorial-seen';

  readonly view = signal<HomeView>('home');
  readonly choosingLine = signal('Déjamelo a mí…');

  readonly isDark = this.themeService.isDark;

  readonly tutorialOpen = signal(false);
  readonly tutorialStepIndex = signal(0);
  readonly tutorialSpotlightVisible = signal(false);

  readonly tutorialSteps: TutorialStep[] = [
    {
      target: 'welcome',
      eyebrow: 'Este espacio es para ti',
      title: 'Puedes venir cuando lo necesites.',
      text: 'No tienes que saber exactamente qué buscas. Puedes entrar, mirar un momento y quedarte con lo que te haga bien.',
    },
    {
      target: 'from-me',
      eyebrow: 'Algo especial para ti',
      title: 'También dejé algo de mi parte.',
      text: 'Cuando quieras leer algo escrito por mí, aquí encontrarás notas que dejare para ti. Solo podrás leer una al día.',
    },
    {
      target: 'options',
      eyebrow: 'Empieza por aquí',
      title: 'Elige lo que necesites en ese momento.',
      text: 'Cada espacio tiene algo distinto para ti:',
    },
    {
      target: 'surprise',
      eyebrow: 'Si no sabes qué elegir',
      title: 'Déjamelo a mí.',
      text: 'Toca “Déjame elegir por ti”, dime cómo te sientes y yo escogeré algo para ti. Después de eso, tú ya no tienes que decidir nada.',
    },
    {
      target: 'theme',
      eyebrow: 'Hazlo cómodo para ti',
      title: 'También puedes cambiar cómo se ve.',
      text: 'Si la pantalla se siente muy clara o simplemente prefieres algo más tranquilo, puedes cambiar entre el modo claro y el modo oscuro en la parte superior derecha.',
    },
    {
      target: 'none',
      eyebrow: 'Este es un espacio privado',
      title: 'Lo que escribas aquí es solo para ti.',
      text: 'En algunas partes te voy a pedir que escribas lo que piensas o cómo te sientes. Nada de eso se guarda ni se envía a ningún lado. Es solo parte del ejercicio y nadie más, ni siquiera yo, podrá verlo.',
    },
  ];

  readonly moods: MoodOption[] = [
    {
      id: 'tired',
      symbol: '◌',
      title: 'Estoy cansada',
      subtitle: 'Hoy ya me está pesando un poquito.',
    },
    {
      id: 'overwhelmed',
      symbol: '〰',
      title: 'Tengo demasiadas cosas en la cabeza',
      subtitle: 'Necesito bajar el ruido un momento.',
    },
    {
      id: 'bad-day',
      symbol: '☁',
      title: 'Hoy no fue un buen día',
      subtitle: 'Solo necesito que este día pese menos.',
    },
    {
      id: 'disconnect',
      symbol: '○',
      title: 'Necesito despejarme',
      subtitle: 'Quiero pensar en cualquier otra cosa.',
    },
    {
      id: 'encouragement',
      symbol: '♡',
      title: 'Necesito un poquito de ánimo',
      subtitle: 'Recuérdame algo que me haga bien.',
    },
    {
      id: 'alone',
      symbol: '⌁',
      title: 'Me siento un poquito sola',
      subtitle: 'Me vendría bien sentir compañía.',
    },
    {
      id: 'good',
      symbol: '☼',
      title: 'Estoy bien, solo quiero algo bonito',
      subtitle: 'Algo pequeño que haga bonito este momento.',
    },
    {
      id: 'unsure',
      symbol: '✦',
      title: 'No sé qué necesito',
      subtitle: 'Elige completamente por mí.',
    },
  ];

  private timeoutIds: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    this.openTutorialOnFirstVisit();
  }

  get currentTutorialStep(): TutorialStep {
    return this.tutorialSteps[this.tutorialStepIndex()];
  }

  get tutorialStepNumber(): number {
    return this.tutorialStepIndex() + 1;
  }

  get tutorialStepCount(): number {
    return this.tutorialSteps.length;
  }

  get isFirstTutorialStep(): boolean {
    return this.tutorialStepIndex() === 0;
  }

  get isLastTutorialStep(): boolean {
    return this.tutorialStepIndex() === this.tutorialSteps.length - 1;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  openTutorial(): void {
    this.clearTimers();

    this.tutorialStepIndex.set(0);
    this.tutorialOpen.set(true);
    this.prepareTutorialStep();
  }

  closeTutorial(): void {
    this.clearTimers();

    this.tutorialSpotlightVisible.set(false);
    this.tutorialOpen.set(false);
    this.tutorialStepIndex.set(0);

    this.scrollHomeToTop(false);
  }

  previousTutorialStep(): void {
    const current = this.tutorialStepIndex();

    if (current <= 0) {
      return;
    }

    this.goToTutorialStep(current - 1);
  }

  nextTutorialStep(): void {
    const current = this.tutorialStepIndex();

    if (current >= this.tutorialSteps.length - 1) {
      this.finishTutorial();
      return;
    }

    this.goToTutorialStep(current + 1);
  }

  finishTutorial(): void {
    this.saveTutorialAsSeen();

    this.clearTimers();
    this.tutorialSpotlightVisible.set(false);
    this.tutorialOpen.set(false);
    this.tutorialStepIndex.set(0);

    this.scrollHomeToTop(true);
  }

  openMoodPicker(): void {
    this.clearTimers();
    this.view.set('mood');
  }

  backHome(): void {
    this.clearTimers();
    this.choosingLine.set('Déjamelo a mí…');
    this.view.set('home');
  }

  chooseMood(mood: MoodId): void {
    this.clearTimers();

    this.view.set('choosing');
    this.choosingLine.set('Déjamelo a mí…');

    const destination = this.pickDestination(mood);

    this.addTimer(() => {
      this.choosingLine.set('Creo que tengo algo para ti.');

      this.addTimer(() => {
        this.router.navigate([destination.route], {
          queryParams: destination.experience ? { experience: destination.experience } : undefined,
        });
      }, 1400);
    }, 1600);
  }

  private goToTutorialStep(index: number): void {
    this.clearTimers();

    this.tutorialSpotlightVisible.set(false);
    this.tutorialStepIndex.set(index);

    this.addTimer(() => {
      this.prepareTutorialStep();
    }, 40);
  }

  private prepareTutorialStep(): void {
    if (!this.tutorialOpen()) {
      return;
    }

    const target = this.currentTutorialStep.target;
    const isMobile = this.isMobileViewport();

    if (!isMobile) {
      this.addTimer(() => {
        this.tutorialSpotlightVisible.set(true);
      }, 120);

      return;
    }

    if (target === 'welcome' || target === 'theme'|| target === 'from-me') {
      this.scrollHomeToTop(true);

      this.addTimer(() => {
        this.tutorialSpotlightVisible.set(true);
      }, 520);

      return;
    }

    if (target === 'none') {
      this.scrollHomeToTop(true);
      return;
    }

    const element = document.querySelector<HTMLElement>(`[data-tutorial-target="${target}"]`);

    if (!element) {
      this.tutorialSpotlightVisible.set(true);
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: target === 'surprise' ? 'end' : 'start',
      inline: 'nearest',
    });

    /*
      El spotlight aparece después del desplazamiento para que el cambio
      se sienta como parte del recorrido, especialmente en “Déjamelo a mí”.
    */
    this.addTimer(() => {
      this.tutorialSpotlightVisible.set(true);
    }, 620);
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 480;
  }

  private scrollHomeToTop(smooth: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }

  private openTutorialOnFirstVisit(): void {
    try {
      const tutorialSeen = localStorage.getItem(this.tutorialStorageKey);

      if (tutorialSeen === 'true') {
        return;
      }
    } catch {
      return;
    }

    this.addTimer(() => {
      this.tutorialStepIndex.set(0);
      this.tutorialOpen.set(true);
      this.prepareTutorialStep();
    }, 900);
  }

  private saveTutorialAsSeen(): void {
    try {
      localStorage.setItem(this.tutorialStorageKey, 'true');
    } catch {
      // Si localStorage no está disponible,
      // el tutorial simplemente podrá mostrarse otra vez.
    }
  }

  private pickDestination(mood: MoodId): Destination {
    const options: Record<MoodId, Destination[]> = {
      tired: [
        {
          route: '/breathe',
          experience: 'release',
        },
        {
          route: '/pause',
          experience: 'one-minute',
        },
        {
          route: '/accompanied',
          experience: 'stay',
        },
      ],

      overwhelmed: [
        {
          route: '/breathe',
          experience: 'grounding',
        },
        {
          route: '/breathe',
          experience: 'unload',
        },
        {
          route: '/breathe',
          experience: 'release',
        },
        {
          route: '/breathe',
          experience: 'breathing',
        },
      ],

      'bad-day': [
        {
          route: '/accompanied',
          experience: 'bad-day-enough',
        },
        {
          route: '/accompanied',
          experience: 'bad-day-quiet',
        },
        {
          route: '/accompanied',
          experience: 'stay',
        },
        {
          route: '/accompanied',
          experience: 'hear',
        },
      ],

      disconnect: [
        {
          route: '/pause',
          experience: 'distraction',
        },
        {
          route: '/pause',
          experience: 'mission',
        },
        {
          route: '/pause',
          experience: 'beautiful',
        },
        {
          route: '/pause',
          experience: 'one-minute',
        },
      ],

      encouragement: [
        {
          route: '/motivation',
          experience: 'random',
        },
        {
          route: '/accompanied',
          experience: 'hear',
        },
        {
          route: '/accompanied',
          experience: 'from-me',
        },
      ],

      alone: [
        {
          route: '/accompanied',
          experience: 'stay',
        },
        {
          route: '/accompanied',
          experience: 'from-me',
        },
        {
          route: '/accompanied',
          experience: 'hear',
        },
      ],

      good: [
        {
          route: '/pause',
          experience: 'beautiful',
        },
        {
          route: '/accompanied',
          experience: 'beautiful-memory',
        },
        {
          route: '/accompanied',
          experience: 'from-me',
        },
      ],

      unsure: [
        {
          route: '/breathe',
          experience: 'breathing',
        },
        {
          route: '/breathe',
          experience: 'grounding',
        },
        {
          route: '/breathe',
          experience: 'release',
        },
        {
          route: '/pause',
          experience: 'one-minute',
        },
        {
          route: '/pause',
          experience: 'mission',
        },
        {
          route: '/pause',
          experience: 'distraction',
        },
        {
          route: '/pause',
          experience: 'beautiful',
        },
        {
          route: '/accompanied',
          experience: 'stay',
        },
        {
          route: '/accompanied',
          experience: 'hear',
        },
        {
          route: '/accompanied',
          experience: 'beautiful-memory',
        },
        {
          route: '/accompanied',
          experience: 'from-me',
        },
        {
          route: '/motivation',
          experience: 'random',
        },
      ],
    };

    const pool = options[mood];

    return pool[Math.floor(Math.random() * pool.length)];
  }

  private addTimer(callback: () => void, delay: number): void {
    const id = setTimeout(callback, delay);

    this.timeoutIds.push(id);
  }

  private clearTimers(): void {
    this.timeoutIds.forEach((id) => clearTimeout(id));

    this.timeoutIds = [];
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }
}
