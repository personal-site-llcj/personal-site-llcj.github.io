import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type PauseMode = 'menu' | 'one-minute' | 'mission' | 'distraction' | 'beautiful';

interface MinuteMoment {
  from: number;
  to: number;
  message: string;
}

interface PauseMission {
  icon: string;
  title: string;
  description: string;
  duration: string;
}

interface DistractionItem {
  icon: string;
  category: string;
  title: string;
  text: string;
}

interface BeautifulMoment {
  image: string;
  alt: string;
  label: string;
  title: string;
  message: string;
  closingMessage: string;
  objectPosition?: string;
}

@Component({
  selector: 'app-pause',
  imports: [RouterLink],
  templateUrl: './pause.html',
  styleUrl: './pause.css',
})
export class Pause {
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const experience = this.route.snapshot.queryParamMap.get('experience');

    queueMicrotask(() => {
      switch (experience) {
        case 'one-minute':
          this.openOneMinute();
          break;
        case 'mission':
          this.openMission();
          break;
        case 'distraction':
          this.openDistraction();
          break;
        case 'beautiful':
          this.openBeautiful();
          break;
      }
    });
  }

  // =========================
  // NAVEGACIÓN
  // =========================

  mode = signal<PauseMode>('menu');

  isMenu = computed(() => this.mode() === 'menu');
  isOneMinute = computed(() => this.mode() === 'one-minute');
  isMission = computed(() => this.mode() === 'mission');
  isDistraction = computed(() => this.mode() === 'distraction');
  isBeautiful = computed(() => this.mode() === 'beautiful');

  // =========================
  // PAUSA DE UN MINUTO
  // =========================

  secondsLeft = signal(60);
  isRunning = signal(false);
  isComplete = signal(false);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  private readonly minuteMoments: MinuteMoment[] = [
    { from: 60, to: 51, message: 'Por este minuto no tienes que hacer nada.' },
    { from: 50, to: 41, message: 'Aparta un poquito la mirada de la pantalla.' },
    { from: 40, to: 31, message: 'Mueve los hombros. Solo un poquito.' },
    { from: 30, to: 21, message: 'Mira algo que tengas cerca y nunca observes con atención.' },
    { from: 20, to: 11, message: 'Piensa en algo que te gustaría hacer cuando termine el día.' },
    { from: 10, to: 1, message: 'Quédate aquí. Estos últimos segundos también son tuyos.' },
  ];

  currentMinuteMessage = computed(() => {
    const seconds = this.secondsLeft();
    const moment = this.minuteMoments.find((item) => seconds <= item.from && seconds >= item.to);

    return moment?.message ?? 'Este minuto es tuyo.';
  });

  minuteProgress = computed(() => ((60 - this.secondsLeft()) / 60) * 100);

  // =========================
  // HAZ ALGO DISTINTO
  // =========================

  currentMission = signal<PauseMission | null>(null);
  missionComplete = signal(false);
  private previousMissionIndex: number | null = null;

  private readonly missions: PauseMission[] = [
    {
      icon: '☕',
      title: 'Prepárate algo rico',
      description:
        'Hazte una bebida o un pequeño snack que disfrutes. Tómate unos minutos para hacerlo sin prisa.',
      duration: '5 minutos',
    },
    {
      icon: '🌿',
      title: 'Cambia de espacio',
      description:
        'Levántate y cambia de lugar aunque sea por unos minutos. Un pequeño cambio puede ayudar a despejar la mente.',
      duration: '2 minutos',
    },
    {
      icon: '🎵',
      title: 'Escucha una canción',
      description: 'Pon una canción que te guste y escúchala completa sin hacer nada más.',
      duration: '4 minutos',
    },
    {
      icon: '🪟',
      title: 'Mira por la ventana',
      description:
        'Observa lo que pasa afuera. El cielo, las personas, los árboles o cualquier pequeño detalle.',
      duration: '1 minuto',
    },
    {
      icon: '✏️',
      title: 'Escribe algo pequeño',
      description:
        'Escribe una idea, un pensamiento o cualquier cosa que tengas en la cabeza. No tiene que ser perfecto.',
      duration: '3 minutos',
    },
    {
      icon: '📷',
      title: 'Busca una foto bonita',
      description: 'Abre tu galería y encuentra una foto que te recuerde un momento agradable.',
      duration: '3 minutos',
    },
    {
      icon: '🧹',
      title: 'Ordena algo pequeño',
      description:
        'Acomoda tu escritorio, algunos documentos o un pequeño espacio. No tienes que arreglar todo.',
      duration: '5 minutos',
    },
    {
      icon: '💧',
      title: 'Ve por agua',
      description: 'Levántate un momento, toma agua y aprovecha para despejar un poco la mente.',
      duration: '3 minutos',
    },
    {
      icon: '🚶',
      title: 'Camina un poco',
      description: 'Levántate y da una pequeña vuelta antes de volver a lo que estabas haciendo.',
      duration: '3 minutos',
    },
    {
      icon: '☕',
      title: 'Ve por un café',
      description:
        'Date unos minutos para ir por un café o una bebida que disfrutes. A veces alejarte un momento ayuda.',
      duration: '5 minutos',
    },
    {
      icon: '🍬',
      title: 'Ve por un pequeño antojo',
      description:
        'Si tienes ganas de algo dulce o un snack, date ese pequeño gusto y disfruta el momento.',
      duration: '5 minutos',
    },
    {
      icon: '🌤️',
      title: 'Sal a respirar',
      description:
        'Si puedes, sal un momento, respira aire fresco y regresa cuando te sientas un poco más tranquila.',
      duration: '3 minutos',
    },
    {
      icon: '🖥️',
      title: 'Aléjate de la pantalla',
      description:
        'Deja la computadora unos minutos, cambia la vista y permite que tus ojos descansen.',
      duration: '2 minutos',
    },
    {
      icon: '📝',
      title: 'Haz una lista bonita',
      description:
        'Escribe tres cosas que te gustan, tres recuerdos bonitos o tres cosas que esperas vivir.',
      duration: '3 minutos',
    },
    {
      icon: '🎨',
      title: 'Dibuja sin pensar',
      description: 'Toma una hoja y dibuja cualquier cosa. No importa si queda bonito.',
      duration: '5 minutos',
    },
    {
      icon: '🧘',
      title: 'Estira tu cuerpo',
      description: 'Haz unos estiramientos suaves y deja que tu cuerpo se relaje un poco.',
      duration: '3 minutos',
    },
    {
      icon: '💭',
      title: 'Recuerda algo bonito',
      description: 'Piensa en un momento que te haya hecho sonreír.',
      duration: '2 minutos',
    },
    {
      icon: '💬',
      title: 'Platica un momento',
      description:
        'Busca a alguien con quien puedas compartir unos minutos o simplemente distraerte un poco.',
      duration: '5 minutos',
    },
    {
      icon: '🍫',
      title: 'Visita la maquinita',
      description:
        'Levántate un momento y date una vuelta. A veces un pequeño cambio ayuda a despejar la mente.',
      duration: '5 minutos',
    },
    {
      icon: '🌸',
      title: 'Encuentra algo bonito',
      description: 'Busca un detalle bonito cerca de ti que normalmente pasa desapercibido.',
      duration: '2 minutos',
    },
    {
      icon: '🧍‍♀️',
      title: 'Cambia de postura',
      description: 'Levántate, estira los hombros y acomoda tu cuerpo antes de continuar.',
      duration: '2 minutos',
    },
    {
      icon: '🎧',
      title: 'Escucha algo que te guste',
      description: 'Pon música o algún audio que te ayude a cambiar un poco el ánimo.',
      duration: '5 minutos',
    },
    {
      icon: '👀',
      title: 'Observa algo diferente',
      description: 'Mira alrededor y encuentra un detalle que normalmente pasa desapercibido.',
      duration: '1 minuto',
    },
    {
      icon: '🌈',
      title: 'Busca un color',
      description: 'Elige un color y encuentra cinco cosas a tu alrededor con ese tono.',
      duration: '2 minutos',
    },
    {
      icon: '📱',
      title: 'Mira una foto especial',
      description: 'Busca una foto que te recuerde un momento bonito.',
      duration: '2 minutos',
    },
    {
      icon: '✨',
      title: 'Recuerda algo que hiciste bien',
      description: 'Piensa en algo pequeño de lo que puedas sentirte orgullosa.',
      duration: '2 minutos',
    },
    {
      icon: '☁️',
      title: 'Mira hacia arriba',
      description: 'Descansa la vista y observa el techo, una ventana o el cielo si puedes.',
      duration: '1 minuto',
    },
    {
      icon: '🗒️',
      title: 'Escribe lo que piensas',
      description: 'Deja salir un pensamiento sin preocuparte por ordenarlo.',
      duration: '3 minutos',
    },
    {
      icon: '🎲',
      title: 'Haz un acertijo rápido',
      description: 'Busca algo que despierte tu curiosidad por unos minutos.',
      duration: '5 minutos',
    },
    {
      icon: '😊',
      title: 'Regala una sonrisa',
      description: 'Comparte un momento agradable con alguien o manda un mensaje bonito.',
      duration: '3 minutos',
    },
    {
      icon: '🌱',
      title: 'Haz algo pequeño por ti',
      description: 'Busca un detalle sencillo que te haga sentir mejor.',
      duration: '3 minutos',
    },
    {
      icon: '🧴',
      title: 'Haz una pausa personal',
      description: 'Acomoda tu cabello, usa crema o haz algo que te haga sentir renovada.',
      duration: '3 minutos',
    },
    {
      icon: '🚶‍♀️',
      title: 'Da una vuelta corta',
      description: 'Camina un poco y regresa cuando sientas la mente más despejada.',
      duration: '3 minutos',
    },
    {
      icon: '🎶',
      title: 'Canta una canción',
      description: 'Pon una canción que conozcas y disfrútala un momento.',
      duration: '4 minutos',
    },
    {
      icon: '💛',
      title: 'Piensa en algo que esperas',
      description: 'Imagina algo bonito que te gustaría vivir próximamente.',
      duration: '3 minutos',
    },
    {
      icon: '🪟',
      title: 'Cambia la vista',
      description: 'Mira algo diferente a la pantalla por unos momentos.',
      duration: '2 minutos',
    },
  ];

  private readonly missionCompleteMessages: string[] = [
    'Bien. Ya rompiste un poquito el ritmo del día.',
    'Listo. Aunque haya sido pequeño, ese momento fue diferente.',
    'Muy bien. Ahora puedes volver cuando quieras, no cuando tengas prisa.',
    'Eso cuenta como pausa también.',
    'Listo. Un pequeño cambio de ritmo nunca está de más.',
  ];

  missionCompleteMessage = signal('Bien. Ya rompiste un poquito el ritmo del día.');

  // =========================
  // DISTRÁEME UN MOMENTO
  // =========================

  currentDistraction = signal<DistractionItem | null>(null);
  distractionComplete = signal(false);
  private previousDistractionIndex: number | null = null;

  private readonly distractions: DistractionItem[] = [
    {
      icon: '☕',
      category: 'Pregunta random',
      title: 'Un café perfecto',
      text: 'Si pudieras crear tu café perfecto, ¿qué tendría y dónde te gustaría tomarlo?',
    },
    {
      icon: '🌎',
      category: 'Imagina',
      title: 'Un viaje inesperado',
      text: 'Te regalan un viaje mañana. ¿A qué lugar del mundo te irías sin pensarlo mucho?',
    },
    {
      icon: '🎬',
      category: 'Pregunta random',
      title: 'Una película sobre ti',
      text: 'Si hicieran una película sobre tu vida, ¿qué momento tendría que aparecer sí o sí?',
    },
    {
      icon: '🍕',
      category: 'Qué prefieres',
      title: 'Comida favorita',
      text: '¿Preferirías comer tu comida favorita todos los días durante un mes o probar algo nuevo todos los días?',
    },
    {
      icon: '🐶',
      category: 'Imagina',
      title: 'Una mascota especial',
      text: 'Si pudieras tener cualquier animal como mascota sin importar el tamaño, ¿cuál elegirías?',
    },
    {
      icon: '🎵',
      category: 'Recuerdo',
      title: 'Una canción especial',
      text: '¿Qué canción te transporta inmediatamente a un momento bonito?',
    },
    {
      icon: '🌙',
      category: 'Imagina',
      title: 'Una noche perfecta',
      text: '¿Cómo sería una noche tranquila perfecta para ti?',
    },
    {
      icon: '📷',
      category: 'Recuerdo',
      title: 'Una foto favorita',
      text: 'Si solo pudieras guardar una foto de tu celular para siempre, ¿cuál sería?',
    },
    {
      icon: '🎨',
      category: 'Pregunta random',
      title: 'Un nuevo talento',
      text: 'Si mañana despertaras sabiendo hacer algo increíble, ¿qué habilidad elegirías?',
    },
    {
      icon: '🍿',
      category: 'Qué prefieres',
      title: 'Maratón perfecto',
      text: '¿Preferirías ver una película nueva o volver a ver tu favorita?',
    },
    {
      icon: '☁️',
      category: 'Imagina',
      title: 'Un día sin pendientes',
      text: 'Si mañana no tuvieras ninguna obligación, ¿qué sería lo primero que harías?',
    },
    {
      icon: '✨',
      category: 'Pregunta random',
      title: 'Un pequeño lujo',
      text: '¿Qué pequeño detalle te hace sentir consentida?',
    },
    {
      icon: '🎁',
      category: 'Imagina',
      title: 'Una caja misteriosa',
      text: 'Encuentras una caja que contiene algo que necesitas justo ahora. ¿Qué habría dentro?',
    },
    {
      icon: '🦋',
      category: 'Recuerdo',
      title: 'Un momento feliz',
      text: 'Piensa en un momento donde hayas sentido mucha felicidad. ¿Cuál recuerdas primero?',
    },
    {
      icon: '🌮',
      category: 'Qué prefieres',
      title: 'Antojo eterno',
      text: '¿Preferirías nunca volver a comer tu comida favorita o nunca volver a comer postres?',
    },
    {
      icon: '🎮',
      category: 'Pregunta random',
      title: 'Un juego de tu infancia',
      text: '¿Qué juego o actividad de cuando eras pequeña todavía recuerdas con cariño?',
    },
    {
      icon: '🏡',
      category: 'Imagina',
      title: 'Tu lugar ideal',
      text: 'Describe cómo sería el lugar donde te sentirías completamente tranquila.',
    },
    {
      icon: '🌈',
      category: 'Pregunta random',
      title: 'Un color para tu día',
      text: 'Si tu día tuviera un color, ¿cuál sería y por qué?',
    },
    {
      icon: '📚',
      category: 'Imagina',
      title: 'Un libro sobre ti',
      text: 'Si escribieras un libro sobre tu vida, ¿cómo se llamaría?',
    },
    {
      icon: '🎤',
      category: 'Qué prefieres',
      title: 'Un escenario',
      text: '¿Preferirías cantar frente a mil personas o bailar frente a mil personas?',
    },
    {
      icon: '🌱',
      category: 'Pregunta random',
      title: 'Algo que quieres aprender',
      text: '¿Qué cosa siempre has querido aprender pero todavía no haces?',
    },
    {
      icon: '🧸',
      category: 'Recuerdo',
      title: 'Algo que te hacía feliz',
      text: '¿Qué cosa pequeña de tu infancia te hacía muy feliz?',
    },
    {
      icon: '🚗',
      category: 'Imagina',
      title: 'Un paseo perfecto',
      text: 'Si pudieras manejar sin destino durante horas, ¿a dónde terminarías llegando?',
    },
    {
      icon: '🍦',
      category: 'Qué prefieres',
      title: 'Día dulce',
      text: '¿Preferirías comer helado todos los días o nunca volver a comer chocolate?',
    },
    {
      icon: '💭',
      category: 'Pregunta random',
      title: 'Un consejo para ti',
      text: 'Si pudieras mandarle un mensaje a tu versión de hace cinco años, ¿qué le dirías?',
    },
    {
      icon: '🌟',
      category: 'Imagina',
      title: 'Un día especial',
      text: 'Si pudieras repetir un día de tu vida exactamente como fue, ¿cuál elegirías?',
    },
    {
      icon: '🎨',
      category: 'Pregunta random',
      title: 'Un nuevo hobby',
      text: 'Si tuvieras todo el tiempo del mundo, ¿qué hobby te gustaría probar?',
    },
    {
      icon: '🐱',
      category: 'Qué prefieres',
      title: 'Vida animal',
      text: '¿Preferirías poder hablar con animales o entender cualquier idioma del mundo?',
    },
    {
      icon: '🌊',
      category: 'Imagina',
      title: 'Un escape tranquilo',
      text: 'Te puedes desconectar por una semana sin preocupaciones. ¿Dónde estarías?',
    },
    {
      icon: '🎂',
      category: 'Recuerdo',
      title: 'Un cumpleaños especial',
      text: '¿Cuál ha sido un cumpleaños que recuerdas con mucho cariño?',
    },
    {
      icon: '🪄',
      category: 'Imagina',
      title: 'Un pequeño poder',
      text: 'Si pudieras tener un poder que solo funcionara para ayudarte en tu día a día, ¿cuál sería?',
    },
    {
      icon: '🌻',
      category: 'Pregunta random',
      title: 'Algo que admiras',
      text: '¿Qué cualidad de otra persona te parece realmente bonita?',
    },
    {
      icon: '🎧',
      category: 'Recuerdo',
      title: 'Una canción de otra época',
      text: '¿Qué canción te recuerda inmediatamente a una etapa diferente de tu vida?',
    },
    {
      icon: '🍿',
      category: 'Imagina',
      title: 'Una tarde perfecta',
      text: 'Si pudieras diseñar una tarde tranquila, ¿qué tendría esa tarde perfecta?',
    },
    {
      icon: '📦',
      category: 'Pregunta random',
      title: 'Una caja del pasado',
      text: 'Encuentras una caja con recuerdos de hace años. ¿Qué te gustaría encontrar dentro?',
    },
    {
      icon: '🌙',
      category: 'Qué prefieres',
      title: 'Noche o mañana',
      text: '¿Preferirías tener siempre energía por la noche o siempre energía por la mañana?',
    },
    {
      icon: '🧭',
      category: 'Imagina',
      title: 'Un lugar desconocido',
      text: 'Llegas a un lugar donde nunca has estado. ¿Qué sería lo primero que explorarías?',
    },
    {
      icon: '💐',
      category: 'Recuerdo',
      title: 'Un detalle bonito',
      text: '¿Cuál es un pequeño detalle que alguien tuvo contigo y nunca olvidaste?',
    },
    {
      icon: '🎭',
      category: 'Pregunta random',
      title: 'Un personaje',
      text: 'Si pudieras pasar un día con un personaje de una película o serie, ¿a quién elegirías?',
    },
    {
      icon: '🍃',
      category: 'Imagina',
      title: 'Un día lento',
      text: 'Imagina un día donde nadie te pide nada. ¿Cómo lo disfrutarías?',
    },
    {
      icon: '📍',
      category: 'Mini reto',
      title: 'Cinco detalles',
      text: 'Mira a tu alrededor y encuentra cinco cosas que normalmente no notas.',
    },
    {
      icon: '😊',
      category: 'Recuerdo',
      title: 'Una sonrisa inesperada',
      text: 'Recuerda la última vez que algo pequeño te hizo sonreír.',
    },
    {
      icon: '🚀',
      category: 'Imagina',
      title: 'Un año diferente',
      text: 'Si pudieras hacer que este año fuera inolvidable, ¿qué tendría que pasar?',
    },
    {
      icon: '🧩',
      category: 'Pregunta random',
      title: 'Algo curioso de ti',
      text: '¿Qué cosa pequeña sobre ti crees que pocas personas conocen?',
    },
    {
      icon: '✨',
      category: 'Cierre bonito',
      title: 'Algo que esperas',
      text: 'Piensa en algo bonito que todavía no ha pasado pero que te gustaría vivir algún día.',
    },
  ];

  private readonly distractionCompleteMessages: string[] = [
    'Listo. Por un momento estabas pensando en algo que no era trabajo.',
    'Eso era todo. Un pequeño cambio de canal.',
    'Bien. Tu cabeza también merece salirse del tema de vez en cuando.',
    'Misión cumplida: pensar en algo completamente diferente.',
    'Aunque hayan sido unos segundos, ya fue otra cosa.',
  ];

  distractionCompleteMessage = signal(
    'Listo. Por un momento estabas pensando en algo que no era trabajo.',
  );

  // =========================
  // ENSÉÑAME ALGO BONITO
  // =========================

  currentBeautiful = signal<BeautifulMoment | null>(null);
  beautifulSettled = signal(false);
  beautifulTextVisible = signal(true);
  beautifulScale = signal(1);
  beautifulTranslateX = signal(0);
  beautifulTranslateY = signal(0);
  beautifulDragging = signal(false);

  private previousBeautifulIndex: number | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragOriginX = 0;
  private dragOriginY = 0;

  beautifulTransform = computed(
    () =>
      `translate3d(${this.beautifulTranslateX()}px, ${this.beautifulTranslateY()}px, 0) scale(${this.beautifulScale()})`,
  );

  private readonly beautifulMoments: BeautifulMoment[] = [
    {
      image: 'landscapes/1.jpg',
      alt: 'Mar tranquilo bajo un cielo de atardecer en tonos suaves.',
      label: 'Un horizonte tranquilo',
      title: 'Mira dónde termina el mar.',
      message:
        'Sigue la línea del horizonte de un lado al otro. Después fíjate en cuántos tonos distintos caben entre el agua y el cielo.',
      closingMessage: 'No hace falta llegar a ningún sitio. Quédate un momento justo aquí.',
    },
    {
      image: 'landscapes/2.jpg',
      alt: 'Sol naranja poniéndose sobre un mar casi inmóvil.',
      label: 'Los últimos minutos de luz',
      title: 'Encuentra el reflejo del sol.',
      message:
        'Empieza por el sol y baja lentamente la mirada hasta el agua. Observa cómo una sola luz cambia todo lo que toca.',
      closingMessage: 'Deja que el día baje el ritmo contigo.',
    },
    {
      image: 'landscapes/3.jpg',
      alt: 'Lago entre montañas durante un atardecer rosado.',
      label: 'Entre agua y montañas',
      title: 'Mira primero lo más lejano.',
      message:
        'Busca las montañas del fondo. Luego vuelve poco a poco hacia el agua y las formas oscuras del frente. Recorre toda la distancia con los ojos.',
      closingMessage: 'Por unos segundos, tu única tarea puede ser mirar lejos.',
    },
    {
      image: 'landscapes/4.jpg',
      alt: 'Costa de agua turquesa, montaña y nubes blancas.',
      label: 'Un poco de azul',
      title: 'Cuenta cuántos azules encuentras.',
      message:
        'Mira el agua cerca de la costa, luego la parte profunda y después el cielo. No son el mismo azul, aunque lo parezcan al principio.',
      closingMessage: 'A veces mirar con atención cambia por completo algo que parecía simple.',
    },
    {
      image: 'landscapes/5.jpg',
      alt: 'Montañas reflejadas perfectamente en un lago sereno.',
      label: 'Un espejo natural',
      title: 'Busca dónde empieza el reflejo.',
      message:
        'Mira la montaña real y luego su copia en el agua. Intenta encontrar el punto exacto en el que una termina y la otra comienza.',
      closingMessage: 'No hay prisa. El lago tampoco parece tenerla.',
    },
    {
      image: 'landscapes/6.jpg',
      alt: 'Lago turquesa rodeado de bosque y montañas altas.',
      label: 'Agua entre montañas',
      title: 'Fíjate en todo lo que rodea al lago.',
      message:
        'Primero el agua. Después los árboles. Luego sube por las paredes de roca hasta llegar al cielo. Haz el recorrido despacio.',
      closingMessage: 'Quédate con la sensación de estar lejos de todo durante un ratito.',
    },
    {
      image: 'landscapes/7.jpg',
      alt: 'Bosque verde iluminado por una luz suave.',
      label: 'Verde por todas partes',
      title: 'Mira entre los árboles.',
      message:
        'No mires el bosque como una sola cosa. Elige un tronco, luego otro, después una rama. Fíjate en cómo cambia el verde según la luz.',
      closingMessage: 'Puedes perderte un poquito aquí sin ir a ninguna parte.',
    },
    {
      image: 'landscapes/8.jpg',
      alt: 'Lago oscuro frente a montañas cubiertas de nieve.',
      label: 'Silencio de invierno',
      title: 'Recorre la nieve con la mirada.',
      message:
        'Empieza por la orilla del lago y sube lentamente hasta las cumbres. Busca las líneas blancas que la nieve dibuja sobre la roca.',
      closingMessage: 'Todo parece quieto aquí. Puedes estarlo tú también un momento.',
    },
    {
      image: 'landscapes/9.jpg',
      alt: 'Valle dorado con un pequeño lago que refleja las montañas.',
      label: 'Un valle abierto',
      title: 'Busca el pequeño lago.',
      message:
        'Cuando lo encuentres, mira qué partes del paisaje caben dentro de su reflejo. Después observa los colores cálidos alrededor.',
      closingMessage: 'Hay detalles que solo aparecen cuando dejas de pasar rápido.',
    },
    {
      image: 'landscapes/10.jpg',
      alt: 'Lago de montaña entre laderas oscuras y cumbres lejanas.',
      label: 'Un camino hacia el fondo',
      title: 'Deja que el agua guíe tus ojos.',
      message:
        'Sigue la superficie del lago hacia las montañas del fondo. Mira cómo el paisaje parece abrir un camino justo en medio.',
      closingMessage: 'No necesitas saber qué hay después. Basta con mirar hacia allá.',
    },
    {
      image: 'landscapes/11.jpg',
      alt: 'Montañas bajo un cielo nocturno lleno de estrellas.',
      label: 'Una noche enorme',
      title: 'Busca la estrella que más te llame la atención.',
      message:
        'Elige una. Después mira alrededor de ella y descubre cuántas otras estaban ahí sin que las hubieras notado todavía.',
      closingMessage: 'Hay mucho más allá de lo que ocupa tu cabeza ahora mismo.',
    },
    {
      image: 'landscapes/12.jpg',
      alt: 'Luna llena sobre una cadena de montañas nevadas.',
      label: 'Luz en la montaña',
      title: 'Mira cómo la luna cambia la nieve.',
      message:
        'Fíjate primero en la luna y después en las partes de la montaña que parecen recibir su luz. Busca dónde termina la claridad y empieza la sombra.',
      closingMessage: 'Incluso de noche no hace falta iluminarlo todo para poder ver.',
    },
    {
      image: 'landscapes/13.jpg',
      alt: 'Vía Láctea sobre una silueta de montañas.',
      label: 'Un cielo lleno de cosas',
      title: 'Sigue la franja de estrellas.',
      message:
        'Recórrela despacio de un extremo al otro. Después baja a las montañas y nota lo pequeñas que parecen bajo todo ese cielo.',
      closingMessage:
        'Por un rato, deja que algo enorme haga que lo demás se sienta un poquito más pequeño.',
    },
    {
      image: 'landscapes/14.jpg',
      alt: 'Montañas oscuras junto a un lago durante un atardecer naranja.',
      label: 'La última luz',
      title: 'Busca el punto más brillante.',
      message:
        'Mira la luz entre las montañas. Después sigue su reflejo sobre el agua y fíjate en cómo todo alrededor se vuelve casi una silueta.',
      closingMessage: 'No todo tiene que verse con claridad para ser bonito.',
    },
    {
      image: 'landscapes/15.jpg',
      alt: 'Lago oscuro con montañas recortadas contra un cielo anaranjado.',
      label: 'Cuando queda poca luz',
      title: 'Mira las siluetas.',
      message:
        'Observa dónde termina cada montaña contra el cielo. Después mira cómo esas mismas formas se repiten, más suaves, sobre el agua.',
      closingMessage: 'Puedes quedarte en este momento intermedio todo lo que quieras.',
    },
    {
      image: 'landscapes/16.jpg',
      alt: 'Sol bajo en un paisaje con nubes dramáticas iluminadas.',
      label: 'Un cielo encendido',
      title: 'Mira las nubes, no el sol.',
      message:
        'Fíjate en sus bordes, en las zonas claras y en las que casi parecen grises. El sol está haciendo cosas distintas en cada una.',
      closingMessage: 'A veces lo bonito está alrededor de aquello que primero llama la atención.',
    },
    {
      image: 'landscapes/17.jpg',
      alt: 'Acantilados junto a un mar turquesa bajo un cielo pastel.',
      label: 'Una costa tranquila',
      title: 'Sigue el borde de los acantilados.',
      message:
        'Recorre con la vista dónde la tierra toca el agua. Después mira el color del mar cerca de la roca y compáralo con el del horizonte.',
      closingMessage: 'Solo mira cómo todo encuentra su lugar sin esforzarse.',
    },
    {
      image: 'landscapes/18.jpg',
      alt: 'Acantilados blancos alrededor de un mar azul profundo.',
      label: 'Tierra y mar',
      title: 'Mira las formas de la roca.',
      message:
        'Busca las curvas, los cortes y las pequeñas entradas de agua. Después levanta la vista hasta el horizonte, donde todo vuelve a verse simple.',
      closingMessage: 'De cerca hay mil detalles. De lejos, todo descansa.',
    },
    {
      image: 'landscapes/19.jpg',
      alt: 'Pequeño lago alpino con tronco, pinos y montañas iluminadas por el atardecer.',
      label: 'Un rincón entre montañas',
      title: 'Empieza por el tronco y ve hacia el fondo.',
      message:
        'Sigue su forma, luego cruza el agua, pasa por los árboles y termina en las montañas iluminadas. Como si caminaras la foto con los ojos.',
      closingMessage: 'Quédate un poquito en ese recorrido. Aquí no hay nada que terminar.',
    },
    {
      image: 'landscapes/20.jpg',
      alt: 'Lago circular visto desde una montaña con cumbres iluminadas alrededor.',
      label: 'Mirar desde arriba',
      title: 'Encuentra el lago en medio de todo.',
      message:
        'Mira primero la amplitud de las montañas y después vuelve al pequeño lago del centro. Cambia de lo enorme a lo pequeño un par de veces.',
      closingMessage: 'A veces cambiar la perspectiva también cambia el peso de las cosas.',
    },
    {
      image: 'landscapes/21.jpg',
      alt: 'Rayos de sol atravesando un bosque alto.',
      label: 'La luz encontró un camino',
      title: 'Busca por dónde entra la luz.',
      message:
        'Sigue uno de los rayos desde arriba hasta tocar el suelo. Después busca otro. Mira todo lo que aparece solo porque la luz pasó por ahí.',
      closingMessage: 'Siempre termina entrando un poquito de luz por algún lugar.',
    },
    {
      image: 'landscapes/22.jpg',
      alt: 'Sendero estrecho dentro de un bosque cubierto de niebla.',
      label: 'Un camino en la niebla',
      title: 'Mira hasta donde alcance el sendero.',
      message:
        'No intentes ver lo que hay después. Solo sigue el camino hasta el punto en que la niebla lo esconde.',
      closingMessage:
        'No siempre necesitas ver todo el camino. A veces basta con el siguiente pedacito.',
    },
    {
      image: 'landscapes/23.jpg',
      alt: 'Lago oscuro, bosque de pinos y montañas cubiertas por niebla.',
      label: 'Un lugar silencioso',
      title: 'Fíjate en la niebla sobre los árboles.',
      message:
        'Mira dónde el bosque se ve nítido y dónde empieza a desaparecer. Deja que tus ojos pasen despacio de una zona a la otra.',
      closingMessage: 'No todo necesita estar perfectamente claro ahora.',
    },
    {
      image: 'landscapes/24.jpg',
      alt: 'Primer plano de lilies rosas y blancas.',
      label: 'Un detalle de cerca',
      title: 'Mira una sola flor.',
      message:
        'Elige una y fíjate en sus manchas, en la curva de sus pétalos y en cómo cambia el rosa hacia el centro. Solo una, sin intentar mirar todas.',
      closingMessage: 'A veces algo pequeño merece toda tu atención durante un momento.',
    },
    {
      image: 'landscapes/25.jpg',
      alt: 'Campo lleno de lilies rosas iluminadas por un atardecer dorado.',
      label: 'Esta tenía que estar aquí',
      title: 'Mira cuántas hay.',
      message:
        'Empieza por las flores más cercanas y ve avanzando hacia el fondo, hasta llegar a la luz del atardecer. Entre tantas cosas bonitas, algunas simplemente merecen un lugar especial.',
      closingMessage:
        'Quédate aquí un poquito más. Esta foto tiene una razón para estar entre todas las demás.',
    },
    {
      image: 'landscapes/26.jpg',
      alt: 'Lilies blancas abiertas sobre un fondo verde suave.',
      label: 'Algo sencillo',
      title: 'Mira cómo se abre cada pétalo.',
      message:
        'Fíjate en las líneas suaves de la flor, en el centro y en la luz sobre el blanco. No necesitas buscar nada más.',
      closingMessage: 'Hay cosas que no necesitan hacer ruido para llamar la atención.',
    },
    {
      image: 'landscapes/27.jpg',
      alt: 'Aurora verde reflejada en pequeños lagos entre montañas.',
      label: 'Una noche diferente',
      title: 'Sigue la aurora.',
      message:
        'Empieza en la parte más brillante y sigue las curvas verdes por el cielo. Después búscalas otra vez reflejadas en el agua.',
      closingMessage: 'El mundo todavía guarda cosas que no has visto.',
    },
    {
      image: 'landscapes/28.jpg',
      alt: 'Aurora boreal verde sobre montañas oscuras y agua tranquila.',
      label: 'Luz en plena noche',
      title: 'Mira cómo cambia el verde.',
      message:
        'Busca el tono más intenso y luego las partes donde casi desaparece en el cielo. No hay dos zonas exactamente iguales.',
      closingMessage: 'Hay cosas que vale la pena detenerse a mirar, aunque duren poco.',
    },
    {
      image: 'landscapes/29.jpg',
      alt: 'Carretera vacía atravesando un bosque de otoño.',
      label: 'Un camino entre hojas',
      title: 'Sigue la carretera hasta perderla.',
      message:
        'Mira las hojas junto al camino, luego los árboles y finalmente el punto donde la carretera deja de distinguirse.',
      closingMessage: 'No tienes que saber exactamente a dónde va para poder disfrutar el camino.',
    },
    {
      image: 'landscapes/30.jpg',
      alt: 'Montañas de otoño reflejadas en un lago bajo un cielo azul.',
      label: 'Colores junto al agua',
      title: 'Busca el color más cálido.',
      message:
        'Encuéntralo en la montaña y después busca dónde vuelve a aparecer en el reflejo. Luego fíjate en los azules que lo rodean.',
      closingMessage: 'Quédate con el contraste. A veces cosas muy distintas se ven bien juntas.',
    },
    {
      image: 'landscapes/31.jpg',
      alt: 'Bosque de pinos parcialmente cubierto por nubes y niebla.',
      label: 'Entre nubes',
      title: 'Mira qué árboles alcanzas a distinguir.',
      message:
        'Algunos están completamente claros y otros apenas aparecen detrás de la niebla. Recorre esa transición sin intentar despejarla.',
      closingMessage: 'Hoy tampoco tienes que tenerlo todo despejado.',
    },
    {
      image: 'landscapes/32.jpg',
      alt: 'Valle de montaña oscuro durante la noche con pequeñas luces en el camino.',
      label: 'Pequeñas luces',
      title: 'Encuentra cada punto de luz.',
      message:
        'Sigue las luces pequeñas por el valle. Mira lo diminutas que son frente a las montañas y, aun así, cómo consiguen hacerse notar.',
      closingMessage: 'No hace falta ser enorme para hacer un poco de luz.',
    },
    {
      image: 'landscapes/33.jpg',
      alt: 'Cueva de roca con agua turquesa iluminada desde arriba.',
      label: 'Un lugar escondido',
      title: 'Mira dónde cae la luz.',
      message:
        'Sigue los rayos desde la abertura hasta el agua. Después fíjate en cómo cambia el color justo donde la luz la toca.',
      closingMessage: 'A veces lo más bonito aparece en lugares que no se ven desde afuera.',
    },
    {
      image: 'landscapes/34.jpg',
      alt: 'Gato descansando en un ambiente tranquilo.',
      label: 'Un momento de calma',
      title: 'Mira cómo descansa.',
      message:
        'Observa la posición del cuerpo, las patas y la expresión del gato. Fíjate en qué detalles transmiten tranquilidad.',
      closingMessage: 'A veces mirar algo tranquilo también ayuda a bajar el ritmo.',
    },
    {
      image: 'landscapes/35.jpg',
      alt: 'Gato observando con calma.',
      label: 'Una mirada curiosa',
      title: 'Sigue sus ojos.',
      message:
        'Mira hacia dónde está viendo el gato. Después observa sus orejas y su postura. Intenta imaginar qué llamó su atención.',
      closingMessage: 'Incluso los momentos más simples pueden esconder algo interesante.',
    },
    {
      image: 'landscapes/36.jpg',
      alt: 'Gato cómodo descansando.',
      label: 'Pequeños detalles',
      title: 'Observa las texturas.',
      message:
        'Fíjate en el pelaje, las sombras y la forma en que la luz toca al gato. Busca tres detalles que normalmente pasarías por alto.',
      closingMessage: 'Los detalles pequeños también merecen un momento de atención.',
    },
    {
      image: 'landscapes/37.jpg',
      alt: 'Gato mirando hacia afuera.',
      label: 'Un momento de curiosidad',
      title: 'Mira lo que está mirando.',
      message:
        'Observa la dirección de su mirada y el espacio alrededor. Imagina qué podría estar viendo o pensando.',
      closingMessage: 'A veces detenerse a imaginar también es una forma de descansar.',
    },
    {
      image: 'landscapes/38.jpg',
      alt: 'Gato dormido tranquilamente.',
      label: 'La tranquilidad de dormir',
      title: 'Observa su calma.',
      message:
        'Mira cómo está acomodado, la posición de sus patas y la expresión de su cara. Nota cómo un momento tan simple puede sentirse tranquilo.',
      closingMessage: 'No todo momento necesita movimiento para ser bonito.',
    },
    {
      image: 'landscapes/39.jpg',
      alt: 'Gato curioso explorando.',
      label: 'Un pequeño explorador',
      title: 'Busca qué lo hace curioso.',
      message:
        'Observa su postura, sus orejas y la dirección de su cuerpo. Fíjate en cómo los pequeños detalles muestran curiosidad.',
      closingMessage: 'Todavía hay cosas pequeñas capaces de sorprendernos.',
    },
    {
      image: 'landscapes/40.jpg',
      alt: 'Gatos compartiendo un momento tranquilo.',
      label: 'Una compañía tranquila',
      title: 'Observa cómo están juntos.',
      message:
        'Mira la distancia entre ellos, sus posiciones y cómo se acompañan sin necesidad de hacer nada.',
      closingMessage: 'A veces la compañía también está en compartir un momento tranquilo.',
    },
    {
      image: 'landscapes/41.jpg',
      alt: 'Gato tranquilo en un espacio cómodo.',
      label: 'Un lugar seguro',
      title: 'Mira su espacio.',
      message:
        'Observa dónde está el gato, qué elementos lo rodean y qué detalles hacen que ese lugar se sienta cómodo.',
      closingMessage: 'Los lugares tranquilos también se construyen con pequeños detalles.',
    },
    {
      image: 'landscapes/42.jpg',
      alt: 'Gato mirando con curiosidad.',
      label: 'Una expresión diferente',
      title: 'Observa su cara.',
      message:
        'Mira sus ojos, sus orejas y su expresión. Intenta notar qué emoción parece transmitir.',
      closingMessage: 'A veces una mirada dice mucho sin decir nada.',
    },
    {
      image: 'landscapes/43.jpg',
      alt: 'Gato tierno en un momento tranquilo.',
      label: 'Un detalle bonito',
      title: 'Encuentra algo que te guste.',
      message:
        'Elige un detalle de la imagen que te llame la atención: sus colores, su expresión o algún pequeño elemento alrededor.',
      closingMessage: 'Un momento pequeño también puede ser suficiente para cambiar el día.',
    },
  ];

  // =========================
  // NAVEGACIÓN
  // =========================

  openOneMinute(): void {
    this.stopTimer();
    this.resetOneMinute();
    this.resetMission();
    this.resetDistraction();
    this.resetBeautiful();
    this.mode.set('one-minute');
  }

  openMission(): void {
    this.stopTimer();
    this.resetOneMinute();
    this.resetDistraction();
    this.resetBeautiful();
    this.missionComplete.set(false);
    this.chooseMission();
    this.mode.set('mission');
  }

  openDistraction(): void {
    this.stopTimer();
    this.resetOneMinute();
    this.resetMission();
    this.resetBeautiful();
    this.distractionComplete.set(false);
    this.chooseDistraction();
    this.mode.set('distraction');
  }

  openBeautiful(): void {
    this.stopTimer();
    this.resetOneMinute();
    this.resetMission();
    this.resetDistraction();
    this.beautifulSettled.set(false);
    this.chooseBeautiful();
    this.mode.set('beautiful');
  }

  goBackToMenu(): void {
    this.stopTimer();
    this.resetOneMinute();
    this.resetMission();
    this.resetDistraction();
    this.resetBeautiful();
    this.mode.set('menu');
  }

  // =========================
  // PAUSA DE UN MINUTO
  // =========================

  startOneMinute(): void {
    if (this.isRunning() || this.isComplete()) return;
    this.isRunning.set(true);
    this.startTimer();
  }

  pauseOneMinute(): void {
    this.isRunning.set(false);
    this.stopTimer();
  }

  continueOneMinute(): void {
    if (this.isRunning() || this.isComplete() || this.secondsLeft() <= 0) return;
    this.isRunning.set(true);
    this.startTimer();
  }

  restartOneMinute(): void {
    this.stopTimer();
    this.secondsLeft.set(60);
    this.isComplete.set(false);
    this.isRunning.set(true);
    this.startTimer();
  }

  finishOneMinute(): void {
    this.stopTimer();
    this.secondsLeft.set(0);
    this.isRunning.set(false);
    this.isComplete.set(true);
  }

  private startTimer(): void {
    this.stopTimer();
    this.intervalId = setInterval(() => {
      const currentSeconds = this.secondsLeft();
      if (currentSeconds > 1) {
        this.secondsLeft.set(currentSeconds - 1);
        return;
      }

      this.secondsLeft.set(0);
      this.isRunning.set(false);
      this.isComplete.set(true);
      this.stopTimer();
    }, 1000);
  }

  private resetOneMinute(): void {
    this.stopTimer();
    this.secondsLeft.set(60);
    this.isRunning.set(false);
    this.isComplete.set(false);
  }

  private stopTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // =========================
  // HAZ ALGO DISTINTO
  // =========================

  chooseMission(): void {
    if (this.missions.length === 0) return;
    this.missionComplete.set(false);

    let randomIndex = Math.floor(Math.random() * this.missions.length);
    if (this.missions.length > 1 && randomIndex === this.previousMissionIndex) {
      randomIndex = (randomIndex + 1) % this.missions.length;
    }

    this.previousMissionIndex = randomIndex;
    this.currentMission.set(this.missions[randomIndex]);
  }

  completeMission(): void {
    const randomMessageIndex = Math.floor(Math.random() * this.missionCompleteMessages.length);
    this.missionCompleteMessage.set(this.missionCompleteMessages[randomMessageIndex]);
    this.missionComplete.set(true);
  }

  tryAnotherMission(): void {
    this.chooseMission();
  }

  private resetMission(): void {
    this.currentMission.set(null);
    this.missionComplete.set(false);
  }

  // =========================
  // DISTRÁEME UN MOMENTO
  // =========================

  chooseDistraction(): void {
    if (this.distractions.length === 0) return;
    this.distractionComplete.set(false);

    let randomIndex = Math.floor(Math.random() * this.distractions.length);
    if (this.distractions.length > 1 && randomIndex === this.previousDistractionIndex) {
      randomIndex = (randomIndex + 1) % this.distractions.length;
    }

    this.previousDistractionIndex = randomIndex;
    this.currentDistraction.set(this.distractions[randomIndex]);
  }

  tryAnotherDistraction(): void {
    this.chooseDistraction();
  }

  completeDistraction(): void {
    const randomMessageIndex = Math.floor(Math.random() * this.distractionCompleteMessages.length);
    this.distractionCompleteMessage.set(this.distractionCompleteMessages[randomMessageIndex]);
    this.distractionComplete.set(true);
  }

  private resetDistraction(): void {
    this.currentDistraction.set(null);
    this.distractionComplete.set(false);
  }

  // =========================
  // ENSÉÑAME ALGO BONITO
  // =========================

  chooseBeautiful(): void {
    if (this.beautifulMoments.length === 0) return;

    this.beautifulSettled.set(false);
    this.resetBeautifulView();

    let randomIndex = Math.floor(Math.random() * this.beautifulMoments.length);
    if (this.beautifulMoments.length > 1 && randomIndex === this.previousBeautifulIndex) {
      randomIndex = (randomIndex + 1) % this.beautifulMoments.length;
    }

    this.previousBeautifulIndex = randomIndex;
    this.currentBeautiful.set(this.beautifulMoments[randomIndex]);
    this.preloadNextBeautiful(randomIndex);
  }

  showAnotherBeautiful(): void {
    this.chooseBeautiful();
  }

  stayWithBeautiful(): void {
    this.resetBeautifulView();
    this.beautifulSettled.set(true);
  }

  leaveBeautifulSettled(): void {
    this.beautifulSettled.set(false);
    this.resetBeautifulView();
  }

  toggleBeautifulText(): void {
    this.beautifulTextVisible.update((value) => !value);
  }

  zoomBeautifulIn(): void {
    this.setBeautifulScale(this.beautifulScale() + 0.25);
  }

  zoomBeautifulOut(): void {
    this.setBeautifulScale(this.beautifulScale() - 0.25);
  }

  resetBeautifulZoom(): void {
    this.beautifulScale.set(1);
    this.beautifulTranslateX.set(0);
    this.beautifulTranslateY.set(0);
  }

  onBeautifulWheel(event: WheelEvent): void {
    if (!this.beautifulSettled()) return;
    event.preventDefault();
    const direction = event.deltaY < 0 ? 0.15 : -0.15;
    this.setBeautifulScale(this.beautifulScale() + direction);
  }

  onBeautifulPointerDown(event: PointerEvent): void {
    if (this.beautifulScale() <= 1) return;

    this.beautifulDragging.set(true);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragOriginX = this.beautifulTranslateX();
    this.dragOriginY = this.beautifulTranslateY();

    const element = event.currentTarget as HTMLElement | null;
    element?.setPointerCapture?.(event.pointerId);
  }

  onBeautifulPointerMove(event: PointerEvent): void {
    if (!this.beautifulDragging()) return;

    this.beautifulTranslateX.set(this.dragOriginX + (event.clientX - this.dragStartX));
    this.beautifulTranslateY.set(this.dragOriginY + (event.clientY - this.dragStartY));
  }

  onBeautifulPointerUp(event: PointerEvent): void {
    if (!this.beautifulDragging()) return;

    this.beautifulDragging.set(false);
    const element = event.currentTarget as HTMLElement | null;
    element?.releasePointerCapture?.(event.pointerId);
  }

  private setBeautifulScale(value: number): void {
    const clamped = Math.min(3, Math.max(1, Number(value.toFixed(2))));
    this.beautifulScale.set(clamped);

    if (clamped === 1) {
      this.beautifulTranslateX.set(0);
      this.beautifulTranslateY.set(0);
    }
  }

  private resetBeautifulView(): void {
    this.beautifulTextVisible.set(true);
    this.beautifulDragging.set(false);
    this.resetBeautifulZoom();
  }

  private preloadNextBeautiful(currentIndex: number): void {
    if (typeof Image === 'undefined' || this.beautifulMoments.length < 2) return;

    const nextIndex = (currentIndex + 1) % this.beautifulMoments.length;
    const image = new Image();
    image.src = this.beautifulMoments[nextIndex].image;
  }

  private resetBeautiful(): void {
    this.currentBeautiful.set(null);
    this.beautifulSettled.set(false);
    this.resetBeautifulView();
  }
}
