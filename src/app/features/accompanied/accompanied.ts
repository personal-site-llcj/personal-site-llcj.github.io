import { Component, OnDestroy, computed, signal, inject } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { VelaContentService } from '../../core/services/vela-content.service';

type View =
  'menu' | 'stay' | 'hear' | 'bad-day' | 'beautiful-memory' | 'saved-memories' | 'from-me';

type BadDayStage = 'choice' | 'write' | 'released' | 'quiet' | 'enough';

type PhraseCategory = 'arrival' | 'permission' | 'release' | 'company' | 'closing';

interface CompanionPhrase {
  id: number;
  category: PhraseCategory;
  text: string;
}

type HearCategory =
  | 'self-doubt'
  | 'enough'
  | 'tired'
  | 'pressure'
  | 'mistakes'
  | 'self-demand'
  | 'qualities'
  | 'from-me';

interface HearMessage {
  id: number;
  category: HearCategory;
  text: string;
}

type BeautifulMemoryCategory = 'small-things' | 'about-you' | 'life';

interface BeautifulMemory {
  id: number;
  category: BeautifulMemoryCategory;
  title: string;
  text: string;
  isPersonal?: boolean;
  note?: string;
}

interface FromMeMessage {
  id: number;
  text: string;
  opening?: boolean;
  note?: string;
}

@Component({
  selector: 'app-accompanied',
  imports: [RouterLink],
  templateUrl: './accompanied.html',
  styleUrl: './accompanied.css',
})
export class Accompanied implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly velaContentService = inject(VelaContentService);

  constructor() {
    this.loadContent();

    const experience = this.route.snapshot.queryParamMap.get('experience');

    queueMicrotask(() => {
      switch (experience) {
        case 'stay':
          this.openStayWithMe();
          break;
        case 'hear':
          this.openHearMessage();
          break;
        case 'bad-day-quiet':
          this.openBadDayQuietDirect();
          break;
        case 'bad-day-enough':
          this.openBadDayEnoughDirect();
          break;
        case 'beautiful-memory':
          this.openBeautifulMemory();
          break;
        case 'from-me':
          this.openFromMe();
          break;
      }
    });
  }

  private readonly storageKey = 'vela-companion-recent';
  private readonly hearStorageKey = 'vela-hear-recent';
  private readonly badDayStorageKey = 'vela-bad-day-recent';
  private readonly beautifulMemoryStorageKey = 'vela-beautiful-memory-recent';
  private readonly beautifulMemorySavedKey = 'vela-beautiful-memory-saved';
  private readonly fromMeRecentKey = 'vela-from-me-recent';
  private readonly fromMeOpeningSeenKey = 'vela-from-me-opening-seen';

  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  private phrases: CompanionPhrase[] = [];

  private hearMessages: HearMessage[] = [];

  private readonly badDayQuietMessages: string[] = [
    'Entonces no hablemos de eso. No tienes que explicarlo para que yo entienda que hoy fue pesado.',
    'No voy a buscarle el lado bueno. Si hoy estuvo horrible, podemos dejar que haya sido horrible.',
    'No necesitas contarme qué pasó. Puedes simplemente quedarte aquí y dejar que el día termine un poquito.',
    'No hace falta convertir este día en una lección. A veces un mal día solo necesita acabarse.',
    'No voy a preguntarte qué podrías haber hecho diferente. Por ahora, solo quiero hacerte compañía.',
    'Si no quieres volver a pensar en lo que pasó, no lo hagamos. Ya tuviste suficiente por hoy.',
    'No tienes que defender cómo te sientes. Si el día te cansó, te frustró o te dolió, eso basta.',
    'Podemos dejar el día exactamente donde está. No tienes que llevártelo entero contigo.',
    'No hace falta hablar para que yo me quede. Podemos simplemente dejar que este momento sea más tranquilo.',
    'Hoy no tienes que convencerte de que todo estará bien. Solo llegar hasta aquí ya fue bastante.',
    'Si algo salió mal, no tienes que repasarlo conmigo. Prefiero que por un momento descanses de ello.',
    'No voy a intentar hacer pequeño lo que hoy se sintió grande. Solo quiero que no tengas que cargarlo sola este ratito.',
    'Quizá hoy no fue justo, fácil ni bonito. No necesito cambiarle el nombre para acompañarte.',
    'Puedes estar molesta con el día. No tienes que reconciliarte con él antes de descansar.',
    'No tienes que encontrar una explicación que haga que todo se sienta mejor.',
    'Si hoy fue uno de esos días que solo quieres dejar atrás, podemos empezar por dejarlo quieto aquí.',
    'No quiero darte soluciones que no pediste. Solo recordarte que sigo aquí.',
    'No hace falta rescatar nada bueno de hoy para merecer un momento de calma.',
    'Lo que pasó hoy no necesita ocupar también todo este momento.',
    'No tienes que contar la historia completa. Con saber que fue difícil, me basta para quedarme contigo.',
  ];

  private readonly badDayEnoughMessages: string[] = [
    'Ya fue suficiente por hoy. No tienes que sacarle una cosa más a este día.',
    'Hiciste lo que pudiste con el día que te tocó. Lo demás puede esperar.',
    'Por hoy, basta. Mañana no necesita que empieces a resolverlo desde esta noche.',
    'No tienes que terminar el día ganándole a todo. Llegar hasta aquí también cuenta.',
    'Puedes cerrar por hoy aunque todavía haya cosas abiertas.',
    'Ya diste suficiente energía por hoy. No tienes que encontrar otra reserva escondida.',
    'No necesitas hacer una última cosa para merecer descansar.',
    'Hoy ya pidió bastante de ti. Puedes dejar de responderle por un rato.',
    'Lo pendiente puede seguir pendiente. Tú ya puedes parar.',
    'No hace falta que hoy termine perfecto para poder dejarlo terminar.',
    'Si tu cabeza te dice que todavía falta algo, recuérdale que también falta descansar.',
    'Por hoy no tienes que demostrar nada más. De verdad, ya fue suficiente.',
    'No tienes que recuperar el día antes de que termine.',
    'Puedes dejar que hoy se acabe sin arreglar cada parte que salió mal.',
    'Lo que no alcanzaste hoy no borra todo lo que sí sostuviste.',
    'No necesitas llegar al límite para darte permiso de parar.',
    'Hoy puedes poner el punto final tú, aunque tu lista todavía tenga comas.',
    'Mañana habrá tiempo para volver a intentar. Esta noche no tiene que cargar con eso.',
    'Ya puedes soltar el día. No porque todo esté resuelto, sino porque tú también necesitas terminar.',
    'Si necesitabas que alguien te lo dijera: sí, por hoy ya hiciste suficiente.',
  ];

  private readonly beautifulMemories: BeautifulMemory[] = [
    {
      id: 1,
      category: 'small-things',
      title: 'Las cosas pequeñas también se quedan.',
      text: 'Una canción que llega justo en el momento correcto, una comida que te encanta, una conversación que se alarga sin darte cuenta. No todo lo bonito necesita ser enorme para importar.',
    },
    {
      id: 2,
      category: 'life',
      title: 'Todavía te faltan días que vas a querer recordar.',
      text: 'Hay lugares que todavía no conoces, canciones que todavía no son tus favoritas y momentos que hoy ni siquiera imaginas. Algunas cosas bonitas todavía vienen en camino.',
    },
    {
      id: 3,
      category: 'about-you',
      title: 'Hay cosas buenas de ti que ya haces sin darte cuenta.',
      text: 'A veces lo que para ti es simplemente tu manera de ser, para alguien más puede ser exactamente la razón por la que disfruta tenerte cerca.',
      isPersonal: true,
      note: 'Esta quería que estuviera aquí.',
    },
    {
      id: 4,
      category: 'small-things',
      title: 'Piensa en una risa que no pudiste controlar.',
      text: 'De esas veces en las que intentas dejar de reírte y eso solo lo empeora. Ese momento existió. Y seguramente todavía quedan muchos así.',
    },
    {
      id: 5,
      category: 'life',
      title: 'No todos los días importantes avisan que lo serán.',
      text: 'A veces un día empieza completamente normal y termina convirtiéndose en uno de esos recuerdos que años después todavía te hacen sonreír.',
    },
    {
      id: 6,
      category: 'about-you',
      title: 'También eres parte de los recuerdos bonitos de otras personas.',
      text: 'Hay momentos que alguien recuerda con cariño simplemente porque tú estabas ahí. Probablemente muchos más de los que imaginas.',
    },
    {
      id: 7,
      category: 'small-things',
      title: 'Hay canciones que son pequeñas máquinas del tiempo.',
      text: 'Basta escuchar unos segundos para volver a un lugar, una etapa o una persona. Qué bonito que podamos guardar momentos así sin proponérnoslo.',
    },
    {
      id: 8,
      category: 'life',
      title: 'Has llegado a lugares que antes solo estaban en tu cabeza.',
      text: 'Algunas cosas que hoy parecen normales para ti alguna vez fueron planes, nervios, primeras veces o algo que todavía no sabías si ibas a conseguir.',
    },
    {
      id: 9,
      category: 'about-you',
      title: 'Tu manera de querer a la gente también deja huella.',
      text: 'Los detalles que recuerdas, las veces que estás y la forma en que te importa la gente no desaparecen cuando el momento termina.',
    },
    {
      id: 10,
      category: 'small-things',
      title: 'Un atardecer nunca sabe que alguien lo necesitaba.',
      text: 'Y aun así aparece. Hay cosas bonitas que no intentan solucionar nada; simplemente están ahí un momento y hacen el día un poquito distinto.',
    },
    {
      id: 11,
      category: 'life',
      title: 'Ya sobreviviste días que en su momento parecían larguísimos.',
      text: 'Y entre ellos también hubo cafés, risas, viajes, conversaciones y momentos inesperados. La vida nunca ha sido solamente sus días difíciles.',
    },
    {
      id: 12,
      category: 'about-you',
      title: 'Hay versiones tuyas que estarían orgullosas de verte ahora.',
      text: 'No porque todo sea perfecto, sino porque has aprendido, cambiado y llegado más lejos de lo que alguna vez podías ver desde atrás.',
    },
    {
      id: 13,
      category: 'small-things',
      title: 'Recuerda una comida que te hizo cerrar los ojos del gusto.',
      text: 'Sí, cuenta. Las cosas bonitas también pueden durar veinte minutos y venir en un plato.',
    },
    {
      id: 14,
      category: 'life',
      title: 'Todavía puedes tener una primera vez a cualquier edad.',
      text: 'Un lugar nuevo, una canción, una tradición, una persona, una decisión espontánea. Nunca se terminan del todo las cosas por descubrir.',
    },
    {
      id: 15,
      category: 'about-you',
      title: 'Tu presencia cambia algunos lugares.',
      text: 'Hay mesas, conversaciones y planes que no serían exactamente iguales si tú no estuvieras en ellos.',
      isPersonal: true,
      note: 'Esta la dejé para ti.',
    },
    {
      id: 16,
      category: 'small-things',
      title: 'Piensa en algún plan que salió mejor porque no salió como estaba planeado.',
      text: 'A veces lo que termina convirtiéndose en anécdota empezó siendo un pequeño desastre.',
    },
    {
      id: 17,
      category: 'life',
      title: 'No necesitas recordar toda una etapa para conservarla.',
      text: 'A veces basta una foto, una frase, un olor o una canción para saber que hubo un tiempo de tu vida que valió la pena vivir.',
    },
    {
      id: 18,
      category: 'about-you',
      title: 'Hay personas que seguramente sonríen cuando ven tu nombre aparecer.',
      text: 'No porque tengas que hacer algo especial cada vez. A veces basta con que seas tú.',
    },
    {
      id: 19,
      category: 'small-things',
      title: 'Los lugares también guardan versiones de nosotros.',
      text: 'Una calle, una cafetería, un asiento, un camino. Puedes pasar por el mismo sitio años después y encontrar ahí un pedacito de quien eras.',
    },
    {
      id: 20,
      category: 'life',
      title: 'Algunos de tus mejores recuerdos todavía no tienen fecha.',
      text: 'Eso me gusta pensarlo: en algún punto del calendario hay días completamente normales que terminarán significando muchísimo para ti.',
    },
    {
      id: 21,
      category: 'about-you',
      title: 'No todo lo bonito de ti necesita que tú lo notes para existir.',
      text: 'Tu forma de reír, entusiasmarte, preocuparte o contar algo que te gusta puede ser un detalle pequeño para ti y muy querido para alguien más.',
    },
    {
      id: 22,
      category: 'small-things',
      title: 'Hay abrazos que duran mucho más que el abrazo.',
      text: 'No por cuánto tiempo estuvieron los brazos alrededor, sino por cómo te hicieron sentir después.',
    },
    {
      id: 23,
      category: 'life',
      title: 'Has tenido días que quisiste que duraran un poquito más.',
      text: 'Eso también forma parte de tu historia. No todo han sido cosas que querías terminar rápido.',
    },
    {
      id: 24,
      category: 'about-you',
      title:
        'También mereces ser recordada por quién eres cuando no estás haciendo nada por nadie.',
      text: 'No solo por lo que resuelves, ayudas o consigues. También por tu humor, tus gustos, tus ideas y todas esas cosas que simplemente te hacen tú.',
    },
  ];

  private fromMeMessages: FromMeMessage[] = [];

  readonly view = signal<View>('menu');

  readonly currentMessage = signal('');

  readonly messageVisible = signal(false);

  readonly stayFinished = signal(false);

  readonly hearMessage = signal('');
  readonly hearVisible = signal(false);
  readonly hearTransitioning = signal(false);

  readonly badDayStage = signal<BadDayStage>('choice');
  readonly badDayText = signal('');
  readonly badDayMessage = signal('');
  readonly badDayMessageVisible = signal(false);
  readonly badDayTransitioning = signal(false);

  readonly beautifulMemory = signal<BeautifulMemory | null>(null);
  readonly beautifulMemoryVisible = signal(false);
  readonly beautifulMemoryTransitioning = signal(false);
  readonly beautifulMemorySaved = signal(false);

  readonly savedMemories = signal<BeautifulMemory[]>([]);
  readonly savedMemoriesEmpty = computed(() => this.savedMemories().length === 0);

  readonly fromMeMessage = signal<FromMeMessage | null>(null);
  readonly fromMeVisible = signal(false);
  readonly fromMeTransitioning = signal(false);

  readonly isMenu = computed(() => this.view() === 'menu');

  readonly isStay = computed(() => this.view() === 'stay');
  readonly isHear = computed(() => this.view() === 'hear');
  readonly isBadDay = computed(() => this.view() === 'bad-day');
  readonly isBeautifulMemory = computed(() => this.view() === 'beautiful-memory');
  readonly isSavedMemories = computed(() => this.view() === 'saved-memories');
  readonly isFromMe = computed(() => this.view() === 'from-me');

  private currentSequence: CompanionPhrase[] = [];

  private currentIndex = 0;

  private loadContent(): void {
    this.velaContentService.getAccompanied().subscribe((content) => {
      this.phrases = content.stay;
      this.hearMessages = content.hear;
      this.fromMeMessages = content.fromMe;

      const experience = this.route.snapshot.queryParamMap.get('experience');

      switch (experience) {
        case 'stay':
          this.openStayWithMe();
          break;

        case 'hear':
          this.openHearMessage();
          break;

        case 'bad-day-quiet':
          this.openBadDayQuietDirect();
          break;

        case 'bad-day-enough':
          this.openBadDayEnoughDirect();
          break;

        case 'beautiful-memory':
          this.openBeautifulMemory();
          break;

        case 'from-me':
          this.openFromMe();
          break;
      }
    });
  }

  openStayWithMe(): void {
    this.clearTimers();

    this.view.set('stay');
    this.stayFinished.set(false);
    this.currentMessage.set('');
    this.messageVisible.set(false);

    this.currentSequence = this.createSequence();
    this.currentIndex = 0;

    this.addTimer(() => {
      this.showCurrentPhrase();
    }, 700);
  }

  stayAWhileLonger(): void {
    this.clearTimers();

    this.stayFinished.set(false);
    this.messageVisible.set(false);

    this.currentSequence = this.createSequence();
    this.currentIndex = 0;

    this.addTimer(() => {
      this.showCurrentPhrase();
    }, 850);
  }

  openHearMessage(): void {
    this.clearTimers();

    this.view.set('hear');
    this.hearMessage.set('');
    this.hearVisible.set(false);
    this.hearTransitioning.set(true);

    this.addTimer(() => {
      this.selectHearMessage();
      this.hearVisible.set(true);
      this.hearTransitioning.set(false);
    }, 500);
  }

  nextHearMessage(): void {
    if (this.hearTransitioning()) {
      return;
    }

    this.clearTimers();
    this.hearTransitioning.set(true);
    this.hearVisible.set(false);

    this.addTimer(() => {
      this.selectHearMessage();
      this.hearVisible.set(true);
      this.hearTransitioning.set(false);
    }, 420);
  }

  openBadDay(): void {
    this.clearTimers();
    this.view.set('bad-day');
    this.badDayStage.set('choice');
    this.badDayText.set('');
    this.badDayMessage.set('');
    this.badDayMessageVisible.set(false);
    this.badDayTransitioning.set(false);
  }

  openBadDayQuietDirect(): void {
    this.clearTimers();
    this.view.set('bad-day');
    this.openBadDayMessageStage('quiet');
  }

  openBadDayEnoughDirect(): void {
    this.clearTimers();
    this.view.set('bad-day');
    this.openBadDayMessageStage('enough');
  }

  openBadDayWrite(): void {
    this.clearTimers();
    this.badDayStage.set('write');
    this.badDayText.set('');
    this.badDayMessage.set('');
    this.badDayMessageVisible.set(false);
    this.badDayTransitioning.set(false);
  }

  updateBadDayText(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    this.badDayText.set(target?.value ?? '');
  }

  releaseBadDay(): void {
    this.clearTimers();
    this.badDayStage.set('released');
    this.badDayTransitioning.set(true);
    this.badDayMessageVisible.set(false);
    this.badDayText.set('');

    this.addTimer(() => {
      this.badDayMessage.set(
        'Bien. No tienes que hacer nada más con eso ahora. Déjalo aquí un ratito.',
      );
      this.badDayMessageVisible.set(true);
      this.badDayTransitioning.set(false);
    }, 420);
  }

  openBadDayQuiet(): void {
    this.openBadDayMessageStage('quiet');
  }

  openBadDayEnough(): void {
    this.openBadDayMessageStage('enough');
  }

  nextBadDayMessage(): void {
    const stage = this.badDayStage();

    if (this.badDayTransitioning() || (stage !== 'quiet' && stage !== 'enough')) {
      return;
    }

    this.clearTimers();
    this.badDayTransitioning.set(true);
    this.badDayMessageVisible.set(false);

    this.addTimer(() => {
      this.selectBadDayMessage(stage);
      this.badDayMessageVisible.set(true);
      this.badDayTransitioning.set(false);
    }, 420);
  }

  backToBadDayChoice(): void {
    this.clearTimers();
    this.badDayStage.set('choice');
    this.badDayText.set('');
    this.badDayMessage.set('');
    this.badDayMessageVisible.set(false);
    this.badDayTransitioning.set(false);
  }

  private openBadDayMessageStage(stage: 'quiet' | 'enough'): void {
    this.clearTimers();
    this.badDayStage.set(stage);
    this.badDayText.set('');
    this.badDayMessage.set('');
    this.badDayMessageVisible.set(false);
    this.badDayTransitioning.set(true);

    this.addTimer(() => {
      this.selectBadDayMessage(stage);
      this.badDayMessageVisible.set(true);
      this.badDayTransitioning.set(false);
    }, 500);
  }

  private selectBadDayMessage(stage: 'quiet' | 'enough'): void {
    const prefix = stage === 'quiet' ? 'quiet' : 'enough';
    const messages = stage === 'quiet' ? this.badDayQuietMessages : this.badDayEnoughMessages;

    const recentKeys = this.getBadDayRecentKeys();
    const candidates = messages
      .map((message, index) => ({
        message,
        key: `${prefix}-${index}`,
      }))
      .filter((item) => !recentKeys.includes(item.key));

    const pool =
      candidates.length > 0
        ? candidates
        : messages.map((message, index) => ({
            message,
            key: `${prefix}-${index}`,
          }));

    const selected = pool[Math.floor(Math.random() * pool.length)];

    this.badDayMessage.set(selected.message);
    this.rememberBadDayMessage(selected.key);
  }

  private rememberBadDayMessage(key: string): void {
    try {
      const recentKeys = this.getBadDayRecentKeys();

      const updated = [key, ...recentKeys.filter((recentKey) => recentKey !== key)].slice(0, 28);

      localStorage.setItem(this.badDayStorageKey, JSON.stringify(updated));
    } catch {
      // La experiencia sigue funcionando si localStorage no está disponible.
    }
  }

  private getBadDayRecentKeys(): string[] {
    try {
      const stored = localStorage.getItem(this.badDayStorageKey);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((value) => typeof value === 'string');
    } catch {
      return [];
    }
  }

  openBeautifulMemory(): void {
    this.clearTimers();
    this.view.set('beautiful-memory');
    this.beautifulMemory.set(null);
    this.beautifulMemoryVisible.set(false);
    this.beautifulMemoryTransitioning.set(true);
    this.beautifulMemorySaved.set(false);

    this.addTimer(() => {
      this.selectBeautifulMemory();
      this.beautifulMemoryVisible.set(true);
      this.beautifulMemoryTransitioning.set(false);
    }, 520);
  }

  nextBeautifulMemory(): void {
    if (this.beautifulMemoryTransitioning()) {
      return;
    }

    this.clearTimers();
    this.beautifulMemoryTransitioning.set(true);
    this.beautifulMemoryVisible.set(false);

    this.addTimer(() => {
      this.selectBeautifulMemory();
      this.beautifulMemoryVisible.set(true);
      this.beautifulMemoryTransitioning.set(false);
    }, 650);
  }

  toggleBeautifulMemorySaved(): void {
    const memory = this.beautifulMemory();
    if (!memory) return;

    const savedIds = this.getBeautifulMemorySavedIds();
    const isSaved = savedIds.includes(memory.id);
    const updated = isSaved ? savedIds.filter((id) => id !== memory.id) : [memory.id, ...savedIds];

    try {
      localStorage.setItem(this.beautifulMemorySavedKey, JSON.stringify(updated));
    } catch {}

    this.beautifulMemorySaved.set(!isSaved);

    if (this.isSavedMemories()) {
      this.loadSavedMemories();
    }
  }

  private selectBeautifulMemory(): void {
    const currentId = this.beautifulMemory()?.id;
    const recentIds = this.getBeautifulMemoryRecentIds();
    const savedIds = this.getBeautifulMemorySavedIds();

    let available = this.beautifulMemories.filter(
      (memory) => memory.id !== currentId && !recentIds.includes(memory.id),
    );

    if (available.length === 0) {
      available = this.beautifulMemories.filter((memory) => memory.id !== currentId);
    }

    const weightedPool = [
      ...available,
      ...available.filter((memory) => savedIds.includes(memory.id)),
    ];

    const pool = weightedPool.length > 0 ? weightedPool : this.beautifulMemories;
    const selected = pool[Math.floor(Math.random() * pool.length)];

    this.beautifulMemory.set(selected);
    this.beautifulMemorySaved.set(savedIds.includes(selected.id));
    this.rememberBeautifulMemory(selected.id);
  }

  private rememberBeautifulMemory(id: number): void {
    try {
      const recentIds = this.getBeautifulMemoryRecentIds();
      const updated = [id, ...recentIds.filter((recentId) => recentId !== id)].slice(0, 16);
      localStorage.setItem(this.beautifulMemoryStorageKey, JSON.stringify(updated));
    } catch {}
  }

  private getBeautifulMemoryRecentIds(): number[] {
    try {
      const stored = localStorage.getItem(this.beautifulMemoryStorageKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'number') : [];
    } catch {
      return [];
    }
  }

  private getBeautifulMemorySavedIds(): number[] {
    try {
      const stored = localStorage.getItem(this.beautifulMemorySavedKey);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'number') : [];
    } catch {
      return [];
    }
  }

  openFromMe(): void {
    this.clearTimers();
    this.view.set('from-me');
    this.fromMeMessage.set(null);
    this.fromMeVisible.set(false);
    this.fromMeTransitioning.set(true);

    this.addTimer(() => {
      this.selectFromMeMessage(true);
      this.fromMeVisible.set(true);
      this.fromMeTransitioning.set(false);
    }, 600);
  }

  nextFromMeMessage(): void {
    if (this.fromMeTransitioning()) {
      return;
    }

    this.clearTimers();
    this.fromMeTransitioning.set(true);
    this.fromMeVisible.set(false);

    this.addTimer(() => {
      this.selectFromMeMessage(false);
      this.fromMeVisible.set(true);
      this.fromMeTransitioning.set(false);
    }, 800);
  }

  keepFromMeMessage(): void {
    this.backToMenu();
  }

  private selectFromMeMessage(preferOpening: boolean): void {
    const openingSeen = this.getFromMeOpeningSeen();

    if (preferOpening && !openingSeen) {
      const opening = this.fromMeMessages.find((message) => message.opening);

      if (opening) {
        this.fromMeMessage.set(opening);
        this.rememberFromMeMessage(opening.id);
        this.markFromMeOpeningSeen();
        return;
      }
    }

    const currentId = this.fromMeMessage()?.id;
    const recentIds = this.getFromMeRecentIds();

    let available = this.fromMeMessages.filter(
      (message) => !message.opening && message.id !== currentId && !recentIds.includes(message.id),
    );

    if (available.length === 0) {
      available = this.fromMeMessages.filter(
        (message) => !message.opening && message.id !== currentId,
      );
    }

    const pool =
      available.length > 0 ? available : this.fromMeMessages.filter((message) => !message.opening);

    const selected = pool[Math.floor(Math.random() * pool.length)];

    this.fromMeMessage.set(selected);
    this.rememberFromMeMessage(selected.id);
  }

  private rememberFromMeMessage(id: number): void {
    try {
      const recentIds = this.getFromMeRecentIds();

      const updated = [id, ...recentIds.filter((recentId) => recentId !== id)].slice(0, 6);

      localStorage.setItem(this.fromMeRecentKey, JSON.stringify(updated));
    } catch {
      // La experiencia sigue funcionando si localStorage no está disponible.
    }
  }

  private getFromMeRecentIds(): number[] {
    try {
      const stored = localStorage.getItem(this.fromMeRecentKey);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'number') : [];
    } catch {
      return [];
    }
  }

  private markFromMeOpeningSeen(): void {
    try {
      localStorage.setItem(this.fromMeOpeningSeenKey, 'true');
    } catch {
      // No bloquea la experiencia.
    }
  }

  private getFromMeOpeningSeen(): boolean {
    try {
      return localStorage.getItem(this.fromMeOpeningSeenKey) === 'true';
    } catch {
      return false;
    }
  }

  openSavedMemories(): void {
    this.clearTimers();
    this.loadSavedMemories();
    this.view.set('saved-memories');
  }

  removeSavedMemory(id: number): void {
    const savedIds = this.getBeautifulMemorySavedIds().filter((savedId) => savedId !== id);

    try {
      localStorage.setItem(this.beautifulMemorySavedKey, JSON.stringify(savedIds));
    } catch {
      // La vista sigue funcionando si localStorage no está disponible.
    }

    this.savedMemories.set(this.beautifulMemories.filter((memory) => savedIds.includes(memory.id)));

    const current = this.beautifulMemory();
    if (current?.id === id) {
      this.beautifulMemorySaved.set(false);
    }
  }

  reopenSavedMemory(id: number): void {
    const memory = this.beautifulMemories.find((item) => item.id === id);

    if (!memory) {
      return;
    }

    this.clearTimers();
    this.view.set('beautiful-memory');
    this.beautifulMemory.set(memory);
    this.beautifulMemorySaved.set(true);
    this.beautifulMemoryTransitioning.set(false);
    this.beautifulMemoryVisible.set(false);

    this.addTimer(() => {
      this.beautifulMemoryVisible.set(true);
    }, 120);
  }

  private loadSavedMemories(): void {
    const savedIds = this.getBeautifulMemorySavedIds();

    const memories = savedIds
      .map((id) => this.beautifulMemories.find((memory) => memory.id === id))
      .filter((memory): memory is BeautifulMemory => Boolean(memory));

    this.savedMemories.set(memories);
  }

  backToMenu(): void {
    this.clearTimers();

    this.messageVisible.set(false);
    this.stayFinished.set(false);
    this.currentMessage.set('');
    this.currentSequence = [];
    this.currentIndex = 0;

    this.hearMessage.set('');
    this.hearVisible.set(false);
    this.hearTransitioning.set(false);

    this.badDayStage.set('choice');
    this.badDayText.set('');
    this.badDayMessage.set('');
    this.badDayMessageVisible.set(false);
    this.badDayTransitioning.set(false);

    this.beautifulMemory.set(null);
    this.beautifulMemoryVisible.set(false);
    this.beautifulMemoryTransitioning.set(false);
    this.beautifulMemorySaved.set(false);
    this.savedMemories.set([]);

    this.fromMeMessage.set(null);
    this.fromMeVisible.set(false);
    this.fromMeTransitioning.set(false);

    this.view.set('menu');
  }

  private showCurrentPhrase(): void {
    const phrase = this.currentSequence[this.currentIndex];

    if (!phrase) {
      this.finishStayExperience();
      return;
    }

    this.currentMessage.set(phrase.text);
    this.messageVisible.set(true);

    this.rememberPhrase(phrase.id);

    this.addTimer(() => {
      if (this.currentIndex >= this.currentSequence.length - 1) {
        this.finishStayExperience();
        return;
      }

      this.messageVisible.set(false);

      this.addTimer(() => {
        this.currentIndex++;
        this.showCurrentPhrase();
      }, 850);
    }, 5200);
  }

  private finishStayExperience(): void {
    this.addTimer(() => {
      this.stayFinished.set(true);
    }, 1800);
  }

  private createSequence(): CompanionPhrase[] {
    const recentIds = this.getRecentIds();

    const categories: PhraseCategory[] = [
      'arrival',
      'permission',
      'release',
      'company',
      'release',
      'company',
      'closing',
    ];

    const selectedIds = new Set<number>();

    return categories
      .map((category) => {
        const available = this.phrases.filter(
          (phrase) =>
            phrase.category === category &&
            !recentIds.includes(phrase.id) &&
            !selectedIds.has(phrase.id),
        );

        const fallback = this.phrases.filter(
          (phrase) => phrase.category === category && !selectedIds.has(phrase.id),
        );

        const pool = available.length > 0 ? available : fallback;

        if (pool.length === 0) {
          return null;
        }

        const selected = pool[Math.floor(Math.random() * pool.length)];

        selectedIds.add(selected.id);

        return selected;
      })
      .filter((phrase): phrase is CompanionPhrase => phrase !== null);
  }

  private rememberPhrase(id: number): void {
    try {
      const recentIds = this.getRecentIds();

      const updated = [id, ...recentIds.filter((recentId) => recentId !== id)].slice(0, 84);

      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch {
      // Si localStorage no está disponible,
      // la experiencia sigue funcionando normalmente.
    }
  }

  private getRecentIds(): number[] {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((value) => typeof value === 'number');
    } catch {
      return [];
    }
  }

  private selectHearMessage(): void {
    const recentIds = this.getHearRecentIds();

    const available = this.hearMessages.filter((message) => !recentIds.includes(message.id));

    const pool = available.length > 0 ? available : this.hearMessages;

    const selected = pool[Math.floor(Math.random() * pool.length)];

    this.hearMessage.set(selected.text);
    this.rememberHearMessage(selected.id);
  }

  private rememberHearMessage(id: number): void {
    try {
      const recentIds = this.getHearRecentIds();

      const updated = [id, ...recentIds.filter((recentId) => recentId !== id)].slice(0, 60);

      localStorage.setItem(this.hearStorageKey, JSON.stringify(updated));
    } catch {
      // La experiencia sigue funcionando si localStorage no está disponible.
    }
  }

  private getHearRecentIds(): number[] {
    try {
      const stored = localStorage.getItem(this.hearStorageKey);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((value) => typeof value === 'number');
    } catch {
      return [];
    }
  }

  private addTimer(callback: () => void, delay: number): void {
    const timer = setTimeout(callback, delay);

    this.timers.push(timer);
  }

  private clearTimers(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.length = 0;
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }
}
