export const BRAND_SYMBOL =
  'https://res.cloudinary.com/dr50ioh9h/image/upload/v1774648742/simbolo_nq_okc053.png';

export function getLandingCopy(locale: string) {
  if (locale === 'es') {
    return {
      nav: {
        howItWorks: 'Cómo funciona',
        modules: 'Módulos',
        science: 'Base clínica',
        therapist: 'Portal terapeuta',
        cta: 'Entrar a la app',
      },
      hero: {
        badge: 'Plataforma de seguimiento mental con enfoque clínico',
        title: 'Seguimiento clínico de la mente, en tiempo real.',
        description:
          'NeuroQuest convierte tu estado mental en datos estructurados, medibles y accionables para acompañarte en tu proceso. Integra evaluación clínica, seguimiento longitudinal, observación de pensamientos y lectura terapéutica en una sola experiencia.',
        primaryCta: 'Iniciar seguimiento',
        secondaryCta: 'Ver cómo funciona',
        trustPoints: [
          'Mental Check-In clínico con score 0-40 y severidad real.',
          'Observer con pensamientos guardados en Firestore y contexto clínico enriquecido.',
          'Progress con métricas, tendencia, gráfico y resumen clínico imprimible.',
        ],
        previewTabs: [
          {
            value: 'dashboard',
            label: 'Dashboard',
            badge: 'Dashboard real',
            title: 'Visibilidad inmediata del estado actual',
            body: 'El usuario ve último check-in, nivel, XP, misión activa y un resumen breve para decidir el siguiente paso.',
            chips: ['Último check-in', 'XP', 'Misión activa'],
            metrics: [
              { label: 'Estado actual', value: 'Moderate', tone: '67%' },
              { label: 'XP acumulado', value: '1,280', tone: '82%' },
              { label: 'Misión activa', value: 'ERP guiada', tone: '74%' },
            ],
          },
          {
            value: 'checkin',
            label: 'Check-In',
            badge: 'Check-In clínico',
            title: '10 preguntas, score real y cierre de flujo',
            body: 'Cada respuesta alimenta clasificación healthy, mild, moderate o severe y actualiza campos denormalizados del usuario.',
            chips: ['10 preguntas', '0-4', 'Severidad'],
            metrics: [
              { label: 'Puntaje total', value: '0-40', tone: '90%' },
              { label: 'Niveles clínicos', value: '4', tone: '68%' },
              { label: 'Persistencia', value: 'Firestore', tone: '88%' },
            ],
          },
          {
            value: 'therapist',
            label: 'Therapist',
            badge: 'Portal terapeuta',
            title: 'Paciente por paciente, con lectura útil',
            body: 'El terapeuta puede revisar check-ins, pensamientos, misiones e indicador básico de riesgo dentro del mismo flujo.',
            chips: ['Pacientes reales', 'Detalle clínico', 'Riesgo básico'],
            metrics: [
              { label: 'Lista real', value: 'users', tone: '70%' },
              { label: 'Pensamientos', value: 'Observer', tone: '83%' },
              { label: 'Seguimiento', value: 'Longitudinal', tone: '76%' },
            ],
          },
        ],
      },
      proof: {
        badge: 'Señales concretas del MVP',
        title: 'Visibilidad clínica, continuidad y cierre de flujo en un solo sistema.',
        stats: [
          ['10', 'preguntas clínicas por check-in', 'Mental Check-In real con respuestas 0-4 y score total 0-40.'],
          ['4', 'niveles de severidad', 'Healthy, mild, moderate y severe con lectura proporcional.'],
          ['6', 'módulos funcionales conectados', 'Dashboard, Check-In, Progress, Observer, Therapist y Medical Support.'],
        ],
        trustStrip: ['CBT', 'ERP', 'Firestore', 'Historial longitudinal', 'Resumen imprimible', 'Crisis Support Medellín'],
      },
      why: {
        badge: 'Qué es NeuroQuest',
        title: 'Una plataforma clínica digital para dar estructura, continuidad y contexto al proceso terapéutico.',
        description:
          'NeuroQuest no reemplaza la atención profesional. La complementa con seguimiento estructurado, trazabilidad del progreso y una lectura más clara de lo que ocurre entre sesiones.',
        cards: [
          {
            title: 'Seguimiento longitudinal',
            description:
              'No se queda en una medición aislada. Guarda historial real, tendencia, registros recientes y lectura evolutiva del caso.',
          },
          {
            title: 'Gamificación terapéutica',
            description:
              'XP, misiones y progresión apoyan la adherencia sin trivializar el malestar ni prometer resultados exagerados.',
          },
          {
            title: 'Puente entre paciente y terapeuta',
            description:
              'El sistema da visibilidad tanto al usuario como al profesional que necesita leer contexto, check-ins y actividad reciente.',
          },
        ],
      },
      journey: {
        badge: 'Cómo funciona',
        title: 'Un recorrido clínico y tecnológico que sí cierra el flujo.',
        steps: [
          {
            step: '01',
            title: 'El usuario se evalúa',
            description:
              'Mental Check-In registra 10 respuestas, score, severidad y nota clínica. Si el caso es severe, la ruta de apoyo cambia.',
          },
          {
            step: '02',
            title: 'El sistema observa patrones',
            description:
              'Observer guarda situación, trigger, intensidad y urgencia compulsiva para construir contexto clínico útil.',
          },
          {
            step: '03',
            title: 'Progress convierte datos en lectura',
            description:
              'La plataforma presenta promedio reciente, tendencia, gráfico, último nivel y resumen clínico imprimible.',
          },
          {
            step: '04',
            title: 'El terapeuta puede intervenir',
            description:
              'Therapist accede a pacientes reales, detalle por paciente, pensamientos, misiones e historial reciente.',
          },
        ],
      },
      modules: {
        badge: 'Módulos reales del MVP',
        title: 'Los módulos que hoy sostienen el seguimiento clínico real',
        description:
          'Cada bloque de esta landing se apoya en capacidades existentes del producto, no en features inventadas.',
        cards: [
          ['checkin', 'Mental Check-In', 'Cuestionario clínico de 10 preguntas con score total y clasificación healthy, mild, moderate y severe.'],
          ['progress', 'Progress', 'Historial real, métricas, tendencia, gráfico y resumen clínico imprimible.'],
          ['observer', 'Observer', 'Pensamientos reales en Firestore con contexto clínico enriquecido y seguimiento de patrones.'],
          ['therapist', 'Therapist', 'Lista de pacientes reales y detalle por paciente con check-ins, pensamientos, misiones y riesgo básico.'],
          ['support', 'Medical Support', 'Contenido dinámico según severidad real, sin dosis automáticas y con disclaimer médico visible.'],
          ['crisis', 'Crisis Support', 'Rutas de ayuda reales para Medellín cuando el caso es severo o requiere apoyo urgente.'],
        ],
      },
      therapistDemo: {
        badge: 'Demo terapéutica',
        title: 'El portal terapeuta resume lo importante sin perder contexto clínico.',
        description:
          'La lectura por paciente integra perfil básico, último check-in, historial reciente, pensamientos observados, misiones recientes e indicador básico de riesgo.',
        panelTitle: 'Vista del terapeuta',
        panelSummary:
          'Una sola lectura concentra continuidad clínica, señales recientes y elementos accionables entre sesiones.',
        timeline: [
          ['Último check-in', 'Score, severidad y fecha del registro más reciente.'],
          ['Observer reciente', 'Pensamientos, trigger, situación y urgencia compulsiva cuando existen.'],
          ['Actividad y riesgo', 'Misiones recientes y una señal básica para priorizar seguimiento.'],
        ],
      },
      audiences: {
        badge: 'Pacientes y terapeutas',
        title: 'Una misma plataforma, con vistas útiles para pacientes y profesionales.',
        patientTitle: 'Para pacientes',
        therapistTitle: 'Para terapeutas',
        patientIntro:
          'Una experiencia clara para entender el estado mental, sostener la adherencia y reducir la fricción del seguimiento.',
        therapistIntro:
          'Una lectura clínica más rápida de lo que ocurrió entre sesiones, sin depender de reconstrucciones manuales.',
        patientItems: [
          'Entender su estado actual con un check-in claro y medible.',
          'Registrar pensamientos, contexto y señales repetidas sin perder continuidad.',
          'Ver progreso, tendencias y tareas activas con menos ruido.',
          'Recibir apoyo contextual y rutas de crisis cuando el caso lo exige.',
        ],
        therapistItems: [
          'Revisar pacientes reales desde Firestore.',
          'Leer el último check-in, historial reciente y pensamientos del caso.',
          'Observar misiones recientes y una señal básica de riesgo clínico.',
          'Tener una lectura más rápida del proceso entre sesiones.',
        ],
      },
      science: {
        badge: 'Base científica y seguridad',
        title: 'Seguimiento estructurado con límites clínicos explícitos.',
        description:
          'La narrativa del producto se apoya en CBT, ERP, observación de pensamientos, seguimiento longitudinal y orientación clínica proporcional a la severidad reportada.',
        pillars: [
          ['CBT + ERP como columna vertebral', 'Las misiones, el observer y la reestructuración cognitiva siguen una lógica terapéutica reconocible.'],
          ['Campos denormalizados para continuidad', 'latestCheckInScore, latestCheckInLevel y latestCheckInAt sostienen una lectura consistente del estado del usuario.'],
          ['Seguridad explícita', 'NeuroQuest no reemplaza evaluación médica o psicológica, no automedica y no prescribe dosis.'],
        ],
        safetyTitle: 'Guardrails visibles',
        safetyItems: [
          'No reemplaza valoración médica, psiquiátrica o psicológica.',
          'No genera dosis automáticas ni promueve automedicación.',
          'Escala a Crisis Support cuando el último check-in es severe.',
          'Mantiene disclaimers clínicos visibles en módulos sensibles.',
        ],
      },
      finalCta: {
        badge: 'Seguimiento con claridad',
        title: 'Comienza con una interfaz diseñada para acompañar, medir y dar continuidad.',
        description:
          'NeuroQuest reúne check-in clínico, observer, progreso, soporte dinámico y lectura terapéutica en un sistema digital serio, sereno y accionable.',
        primaryCta: 'Iniciar seguimiento',
        secondaryCta: 'Explorar módulos',
      },
      footer: {
        productDescription:
          'Seguimiento mental con estructura clínica, gamificación terapéutica y soporte contextual para pacientes y terapeutas.',
        linksTitle: 'Secciones',
        links: ['Cómo funciona', 'Módulos reales', 'Base clínica', 'Portal terapeuta'],
        safetyTitle: 'Importante',
        safetyDescription:
          'NeuroQuest es una herramienta de apoyo y seguimiento. No sustituye tratamiento profesional ni indicación médica.',
        rightsPrefix: '© 2026 NeuroQuest. Todos los derechos reservados por',
        ownerName: 'Yessy Alejandro Lotero Hernandez',
        disclaimer: 'Sin automedicación. Sin prescripción de dosis. Con orientación proporcional al riesgo.',
      },
    };
  }

  return {
    nav: {
      howItWorks: 'How it works',
      modules: 'Modules',
      science: 'Clinical basis',
      therapist: 'Therapist portal',
      cta: 'Open the app',
    },
    hero: {
      badge: 'A mental-health tracking platform with clinical structure',
      title: 'Clinical mental follow-up, in real time.',
      description:
        'NeuroQuest turns mental state into structured, measurable, and actionable information to support the clinical process. It combines assessment, longitudinal tracking, thought observation, and therapist visibility in one system.',
      primaryCta: 'Start tracking',
      secondaryCta: 'See how it works',
      trustPoints: [
        'Clinical Mental Check-In with real 0-40 scoring and severity.',
        'Observer records saved in Firestore with enriched clinical context.',
        'Progress with metrics, trend lines, charting, and printable clinical summaries.',
      ],
      previewTabs: [
        {
          value: 'dashboard',
          label: 'Dashboard',
          badge: 'Real dashboard',
          title: 'Immediate visibility into current state',
          body: 'Users see their latest check-in, level, XP, active mission, and a short summary that clarifies the next step.',
          chips: ['Latest check-in', 'XP', 'Active mission'],
          metrics: [
            { label: 'Current state', value: 'Moderate', tone: '67%' },
            { label: 'Accumulated XP', value: '1,280', tone: '82%' },
            { label: 'Active mission', value: 'Guided ERP', tone: '74%' },
          ],
        },
        {
          value: 'checkin',
          label: 'Check-In',
          badge: 'Clinical check-in',
          title: '10 questions, real scoring, complete flow closure',
          body: 'Every answer feeds healthy, mild, moderate, or severe classification and updates denormalized user fields.',
          chips: ['10 questions', '0-4', 'Severity'],
          metrics: [
            { label: 'Total score', value: '0-40', tone: '90%' },
            { label: 'Clinical levels', value: '4', tone: '68%' },
            { label: 'Persistence', value: 'Firestore', tone: '88%' },
          ],
        },
        {
          value: 'therapist',
          label: 'Therapist',
          badge: 'Therapist portal',
          title: 'Per-patient review with useful context',
          body: 'Therapists can review check-ins, thoughts, missions, and a basic risk signal within the same workflow.',
          chips: ['Real patients', 'Clinical detail', 'Basic risk'],
          metrics: [
            { label: 'Real source', value: 'users', tone: '70%' },
            { label: 'Thoughts', value: 'Observer', tone: '83%' },
            { label: 'Follow-up', value: 'Longitudinal', tone: '76%' },
          ],
        },
      ],
    },
    proof: {
      badge: 'Concrete MVP signals',
      title: 'Clinical visibility, continuity, and flow closure inside one system.',
      stats: [
        ['10', 'clinical questions per check-in', 'Real Mental Check-In with 0-4 answers and total 0-40 scoring.'],
        ['4', 'severity levels', 'Healthy, mild, moderate, and severe with proportional reading.'],
        ['6', 'connected functional modules', 'Dashboard, Check-In, Progress, Observer, Therapist, and Medical Support.'],
      ],
      trustStrip: ['CBT', 'ERP', 'Firestore', 'Longitudinal history', 'Printable summary', 'Medellin Crisis Support'],
    },
    why: {
      badge: 'What NeuroQuest is',
      title: 'A clinical digital platform built to give structure, continuity, and context to mental follow-up.',
      description:
        'NeuroQuest does not replace professional care. It complements it with structured follow-up, progress traceability, and a clearer view of what happens between sessions.',
      cards: [
        ['Longitudinal follow-up', 'It does not stop at one measurement. It stores real history, trend, recent entries, and an evolving view of the case.'],
        ['Therapeutic gamification', 'XP, missions, and progression support adherence without trivializing distress or overstating outcomes.'],
        ['Patient-therapist bridge', 'The system gives visibility to users and to professionals who need context, check-ins, and recent activity.'],
      ],
    },
    journey: {
      badge: 'How it works',
      title: 'A clinical and technological journey that closes the loop.',
      steps: [
        ['01', 'The user assesses current state', 'Mental Check-In records 10 answers, score, severity, and note. If the case is severe, the support path changes.'],
        ['02', 'The system observes patterns', 'Observer stores situation, trigger, intensity, and compulsion urge to build useful context.'],
        ['03', 'Progress turns data into interpretation', 'The platform shows recent average, trend, chart, latest level, and printable clinical summary.'],
        ['04', 'The therapist can intervene faster', 'Therapist reads real patients, per-patient detail, missions, thoughts, and recent history.'],
      ],
    },
    modules: {
      badge: 'Real MVP modules',
      title: 'The modules that support real clinical follow-up today',
      description: 'Every block on this landing is anchored to existing product capabilities, not invented features.',
      cards: [
        ['checkin', 'Mental Check-In', 'A 10-question clinical flow with total score and healthy, mild, moderate, and severe classification.'],
        ['progress', 'Progress', 'Real history, metrics, trend, charting, and printable clinical summary.'],
        ['observer', 'Observer', 'Real thoughts in Firestore with enriched clinical context and reusable pattern tracking.'],
        ['therapist', 'Therapist', 'Real patient lists and per-patient detail including check-ins, thoughts, missions, and basic risk.'],
        ['support', 'Medical Support', 'Dynamic content according to real severity, without automatic dosing and with explicit disclaimer.'],
        ['crisis', 'Crisis Support', 'Real Medellin help routes when the case is severe or urgent support is needed.'],
      ],
    },
    therapistDemo: {
      badge: 'Therapist demo',
      title: 'The therapist portal surfaces what matters without losing clinical context.',
      description:
        'Per-patient review integrates basic profile, latest check-in, recent history, observed thoughts, recent missions, and a basic risk indicator.',
      panelTitle: 'Therapist view',
      panelSummary:
        'One reading concentrates clinical continuity, recent signals, and actionable elements between sessions.',
      timeline: [
        ['Latest check-in', 'Score, severity, and date of the most recent record.'],
        ['Recent observer data', 'Thoughts, trigger, situation, and compulsion urge when available.'],
        ['Activity and risk', 'Recent missions and a basic signal to prioritize follow-up.'],
      ],
    },
    audiences: {
      badge: 'Patients and therapists',
      title: 'One platform, with useful views for patients and professionals.',
      patientTitle: 'For patients',
      therapistTitle: 'For therapists',
      patientIntro: 'A clearer experience to understand mental state, sustain adherence, and lower follow-up friction.',
      therapistIntro: 'A faster clinical reading of what happened between sessions, without reconstructing everything manually.',
      patientItems: [
        'Understand current state with a check-in that is clear and measurable.',
        'Record thoughts, context, and repeated signals without losing continuity.',
        'See progress, trends, and active tasks with less noise.',
        'Receive contextual support and crisis routes when needed.',
      ],
      therapistItems: [
        'Review real patients directly from Firestore.',
        'Read the latest check-in, recent history, and case thoughts.',
        'Observe recent missions and a basic clinical risk signal.',
        'Get faster visibility into what happened between sessions.',
      ],
    },
    science: {
      badge: 'Clinical basis and safety',
      title: 'Structured follow-up with explicit clinical limits.',
      description:
        'The product narrative is grounded in CBT, ERP, thought observation, longitudinal tracking, and guidance proportional to the user-reported severity.',
      pillars: [
        ['CBT + ERP as core logic', 'Missions, observer workflows, and cognitive restructuring follow recognizable therapeutic logic.'],
        ['Denormalized continuity fields', 'latestCheckInScore, latestCheckInLevel, and latestCheckInAt support a consistent reading of user state.'],
        ['Explicit safety boundaries', 'NeuroQuest does not replace medical or psychological evaluation, does not self-medicate, and does not prescribe doses.'],
      ],
      safetyTitle: 'Visible guardrails',
      safetyItems: [
        'It does not replace medical, psychiatric, or psychological assessment.',
        'It does not generate automatic doses or encourage self-medication.',
        'It escalates to Crisis Support when the latest check-in is severe.',
        'It keeps clinical disclaimers visible in sensitive modules.',
      ],
    },
    finalCta: {
      badge: 'Tracking with clarity',
      title: 'Start with an interface designed to support, measure, and sustain continuity.',
      description:
        'NeuroQuest brings together clinical check-in, observer workflows, progress, dynamic support, and therapist visibility in a serious and calm digital system.',
      primaryCta: 'Start tracking',
      secondaryCta: 'Explore modules',
    },
    footer: {
      productDescription:
        'Mental-health follow-up with clinical structure, therapeutic gamification, and contextual support for patients and therapists.',
      linksTitle: 'Sections',
      links: ['How it works', 'Real modules', 'Clinical basis', 'Therapist portal'],
      safetyTitle: 'Important',
      safetyDescription:
        'NeuroQuest is a support and follow-up tool. It does not replace professional treatment or medical instruction.',
      rightsPrefix: '© 2026 NeuroQuest. All rights reserved by',
      ownerName: 'Yessy Alejandro Lotero Hernandez',
      disclaimer: 'No self-medication. No dose prescribing. Guidance proportional to risk.',
    },
  };
}
