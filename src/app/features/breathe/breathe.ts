import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type BreatheMode = 'menu' | 'choosing' | 'breathing' | 'grounding' | 'unload' | 'release';

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'complete';

type RandomExperience = 'breathing' | 'grounding' | 'unload' | 'release';

interface GroundingStep {
  number: number;
  title: string;
  text: string;
}

interface ReleaseStep {
  label: string;
  title: string;
  text: string;
  detail: string;
  symbol: string;
}

@Component({
  selector: 'app-breathe',
  imports: [RouterLink],
  templateUrl: './breathe.html',
  styleUrl: './breathe.css',
})
export class Breathe {
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const experience = this.route.snapshot.queryParamMap.get('experience');

    queueMicrotask(() => {
      switch (experience) {
        case 'breathing': this.openBreathing(); break;
        case 'grounding': this.openGrounding(); break;
        case 'unload': this.openUnload(); break;
        case 'release': this.openRelease(); break;
      }
    });
  }

  mode = signal<BreatheMode>('menu');

  // =========================
  // RESPIRACIÓN
  // =========================

  breathingPhase = signal<BreathingPhase>('idle');
  secondsLeft = signal(4);
  isRunning = signal(false);
  completedCycles = signal(0);

  // =========================
  // 5-4-3-2-1
  // =========================

  groundingIndex = signal(0);
  groundingChanging = signal(false);
  groundingComplete = signal(false);

  // =========================
  // DESCARGAR PENSAMIENTOS
  // =========================

  unloadStep = signal(1);
  unloadThought = signal('');
  unloadAction = signal('');
  unloadChanging = signal(false);

  // =========================
  // SOLTAR TENSIÓN
  // =========================

  releaseIndex = signal(0);
  releaseChanging = signal(false);
  releaseComplete = signal(false);

  // =========================
  // ELEGIR POR ELLA
  // =========================

  choosingText = signal('Déjamelo a mí…');

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private choosingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // =========================
  // PASOS 5-4-3-2-1
  // =========================

  private readonly groundingSteps: GroundingStep[] = [
    {
      number: 5,
      title: 'Mira a tu alrededor.',
      text: 'Encuentra cinco cosas que puedas ver.',
    },
    {
      number: 4,
      title: 'Ahora usa tus manos.',
      text: 'Encuentra cuatro cosas que puedas tocar.',
    },
    {
      number: 3,
      title: 'Escucha un momento.',
      text: 'Identifica tres sonidos que puedas escuchar.',
    },
    {
      number: 2,
      title: 'Respira despacio.',
      text: 'Encuentra dos cosas que puedas oler.',
    },
    {
      number: 1,
      title: 'Una última cosa.',
      text: 'Piensa en algo que puedas saborear ahora mismo.',
    },
  ];

  // =========================
  // PASOS PARA SOLTAR TENSIÓN
  // =========================

  private readonly releaseSteps: ReleaseStep[] = [
    {
      label: 'Primero',
      title: 'Suelta un poquito la mandíbula.',
      text: 'A veces la apretamos sin darnos cuenta.',
      detail: 'Separa apenas los dientes y deja descansar la lengua. No tienes que hacer nada más.',
      symbol: '◡',
    },
    {
      label: 'Ahora',
      title: 'Deja caer los hombros.',
      text: 'No necesitan estar cargando todo.',
      detail: 'Súbelos un poquito hacia las orejas y después déjalos caer lentamente.',
      symbol: '⌄',
    },
    {
      label: 'Un poquito más',
      title: 'Afloja las manos.',
      text: 'Mira si estás sosteniendo tensión ahí también.',
      detail: 'Abre las manos despacio, mueve un poco los dedos y déjalos descansar.',
      symbol: '○',
    },
    {
      label: 'Respira',
      title: 'Haz una exhalación larga.',
      text: 'No tienes que controlar perfectamente la respiración.',
      detail: 'Toma aire con calma y deja que salga un poquito más lento de lo que entró.',
      symbol: '≈',
    },
    {
      label: 'Por último',
      title: 'Suelta lo que puedas del resto del cuerpo.',
      text: 'No todo. Solo un poquito.',
      detail:
        'Nota tu cara, cuello, espalda y piernas. Si encuentras tensión, dale permiso de bajar un poco.',
      symbol: '✦',
    },
  ];

  // =========================
  // COMPUTED
  // =========================

  currentGroundingStep = computed(() => this.groundingSteps[this.groundingIndex()]);

  currentReleaseStep = computed(() => this.releaseSteps[this.releaseIndex()]);

  releaseProgress = computed(() => `${this.releaseIndex() + 1} de ${this.releaseSteps.length}`);

  phaseLabel = computed(() => {
    switch (this.breathingPhase()) {
      case 'inhale':
        return 'Inhala';

      case 'hold':
        return 'Mantén';

      case 'exhale':
        return 'Exhala';

      case 'complete':
        return 'Bien';

      default:
        return 'Respira';
    }
  });

  // =========================
  // NAVEGACIÓN
  // =========================

  openBreathing(): void {
    this.stopChoosing();
    this.mode.set('breathing');
    this.resetBreathing();
  }

  openGrounding(): void {
    this.stopTimer();
    this.stopChoosing();

    this.mode.set('grounding');
    this.resetGrounding();
  }

  openUnload(): void {
    this.stopTimer();
    this.stopChoosing();

    this.resetUnload();
    this.mode.set('unload');
  }

  openRelease(): void {
    this.stopTimer();
    this.stopChoosing();

    this.resetRelease();
    this.mode.set('release');
  }

  goBackToMenu(): void {
    this.stopTimer();
    this.stopChoosing();

    this.resetBreathing();
    this.resetGrounding();
    this.resetUnload();
    this.resetRelease();

    this.choosingText.set('Déjamelo a mí…');

    this.mode.set('menu');
  }

  // =========================
  // NO SÉ QUÉ NECESITO
  // =========================

  chooseForMe(): void {
    if (this.mode() === 'choosing') {
      return;
    }

    this.stopTimer();
    this.stopChoosing();

    this.resetBreathing();
    this.resetGrounding();
    this.resetUnload();
    this.resetRelease();

    this.choosingText.set('Déjamelo a mí…');
    this.mode.set('choosing');

    this.choosingTimeoutId = setTimeout(() => {
      this.choosingText.set('Preparando…');

      this.choosingTimeoutId = setTimeout(() => {
        const experiences: RandomExperience[] = ['breathing', 'grounding', 'unload', 'release'];

        const randomIndex = Math.floor(Math.random() * experiences.length);

        const selectedExperience = experiences[randomIndex];

        this.openRandomExperience(selectedExperience);
      }, 1400);
    }, 1600);
  }

  private openRandomExperience(experience: RandomExperience): void {
    switch (experience) {
      case 'breathing':
        this.openBreathing();
        break;

      case 'grounding':
        this.openGrounding();
        break;

      case 'unload':
        this.openUnload();
        break;

      case 'release':
        this.openRelease();
        break;
    }
  }

  private stopChoosing(): void {
    if (this.choosingTimeoutId !== null) {
      clearTimeout(this.choosingTimeoutId);
      this.choosingTimeoutId = null;
    }
  }

  // =========================
  // RESPIRACIÓN
  // =========================

  startBreathing(): void {
    if (this.isRunning()) {
      return;
    }

    if (this.breathingPhase() === 'idle' || this.breathingPhase() === 'complete') {
      this.breathingPhase.set('inhale');
      this.secondsLeft.set(4);
    }

    this.isRunning.set(true);
    this.startTimer();
  }

  pauseBreathing(): void {
    this.isRunning.set(false);
    this.stopTimer();
  }

  finishBreathing(): void {
    this.stopTimer();

    this.isRunning.set(false);
    this.breathingPhase.set('complete');
    this.secondsLeft.set(0);
  }

  restartBreathing(): void {
    this.stopTimer();

    this.completedCycles.set(0);
    this.breathingPhase.set('inhale');
    this.secondsLeft.set(4);
    this.isRunning.set(true);

    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();

    this.intervalId = setInterval(() => {
      const currentSeconds = this.secondsLeft();

      if (currentSeconds > 1) {
        this.secondsLeft.set(currentSeconds - 1);
        return;
      }

      this.advancePhase();
    }, 1000);
  }

  private advancePhase(): void {
    switch (this.breathingPhase()) {
      case 'inhale':
        this.breathingPhase.set('hold');
        this.secondsLeft.set(4);
        break;

      case 'hold':
        this.breathingPhase.set('exhale');
        this.secondsLeft.set(6);
        break;

      case 'exhale':
        this.completedCycles.update((value) => value + 1);

        this.breathingPhase.set('inhale');
        this.secondsLeft.set(4);
        break;

      default:
        this.pauseBreathing();
        break;
    }
  }

  private resetBreathing(): void {
    this.stopTimer();

    this.isRunning.set(false);
    this.breathingPhase.set('idle');
    this.secondsLeft.set(4);
    this.completedCycles.set(0);
  }

  private stopTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // =========================
  // 5-4-3-2-1
  // =========================

  nextGroundingStep(): void {
    if (this.groundingChanging()) {
      return;
    }

    this.groundingChanging.set(true);

    setTimeout(() => {
      const currentIndex = this.groundingIndex();

      if (currentIndex < this.groundingSteps.length - 1) {
        this.groundingIndex.set(currentIndex + 1);
      } else {
        this.groundingComplete.set(true);
      }

      setTimeout(() => {
        this.groundingChanging.set(false);
      }, 60);
    }, 250);
  }

  restartGrounding(): void {
    if (this.groundingChanging()) {
      return;
    }

    this.groundingChanging.set(true);

    setTimeout(() => {
      this.groundingIndex.set(0);
      this.groundingComplete.set(false);

      setTimeout(() => {
        this.groundingChanging.set(false);
      }, 60);
    }, 250);
  }

  private resetGrounding(): void {
    this.groundingIndex.set(0);
    this.groundingChanging.set(false);
    this.groundingComplete.set(false);
  }

  // =========================
  // DESCARGAR PENSAMIENTOS
  // =========================

  updateUnloadThought(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;

    this.unloadThought.set(textarea.value);
  }

  updateUnloadAction(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;

    this.unloadAction.set(textarea.value);
  }

  nextUnloadStep(): void {
    if (this.unloadChanging() || !this.unloadThought().trim()) {
      return;
    }

    this.changeUnloadStep(2);
  }

  canDoSomethingNow(): void {
    this.changeUnloadStep(3);
  }

  cannotDoSomethingNow(): void {
    this.changeUnloadStep(4);
  }

  finishUnloadAction(): void {
    if (this.unloadChanging() || !this.unloadAction().trim()) {
      return;
    }

    this.changeUnloadStep(5);
  }

  restartUnload(): void {
    if (this.unloadChanging()) {
      return;
    }

    this.unloadChanging.set(true);

    setTimeout(() => {
      this.unloadStep.set(1);
      this.unloadThought.set('');
      this.unloadAction.set('');

      setTimeout(() => {
        this.unloadChanging.set(false);
      }, 60);
    }, 250);
  }

  private changeUnloadStep(step: number): void {
    if (this.unloadChanging()) {
      return;
    }

    this.unloadChanging.set(true);

    setTimeout(() => {
      this.unloadStep.set(step);

      setTimeout(() => {
        this.unloadChanging.set(false);
      }, 60);
    }, 250);
  }

  private resetUnload(): void {
    this.unloadStep.set(1);
    this.unloadThought.set('');
    this.unloadAction.set('');
    this.unloadChanging.set(false);
  }

  // =========================
  // SOLTAR TENSIÓN
  // =========================

  nextReleaseStep(): void {
    if (this.releaseChanging()) {
      return;
    }

    this.releaseChanging.set(true);

    setTimeout(() => {
      const currentIndex = this.releaseIndex();

      if (currentIndex < this.releaseSteps.length - 1) {
        this.releaseIndex.set(currentIndex + 1);
      } else {
        this.releaseComplete.set(true);
      }

      setTimeout(() => {
        this.releaseChanging.set(false);
      }, 60);
    }, 300);
  }

  restartRelease(): void {
    if (this.releaseChanging()) {
      return;
    }

    this.releaseChanging.set(true);

    setTimeout(() => {
      this.releaseIndex.set(0);
      this.releaseComplete.set(false);

      setTimeout(() => {
        this.releaseChanging.set(false);
      }, 60);
    }, 300);
  }

  private resetRelease(): void {
    this.releaseIndex.set(0);
    this.releaseChanging.set(false);
    this.releaseComplete.set(false);
  }
}
