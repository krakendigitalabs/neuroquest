import type { MedicationDisorderGroup } from '@/models/medication-prescription';

export type MedicationEducationEntry = {
  disorderGroup: MedicationDisorderGroup;
  title: string;
  summary: string;
  caution: string;
  classes: Array<{
    className: string;
    examples: string;
    intendedUse: string;
    expectedEffects: string;
    commonSideEffects: string;
    majorAlerts: string;
  }>;
};

export function getMedicationEducationCatalog(isSpanish: boolean): MedicationEducationEntry[] {
  if (isSpanish) {
    return [
      {
        disorderGroup: 'depression',
        title: 'Depresión',
        summary: 'Suelen usarse antidepresivos prescritos por profesionales cuando el cuadro y el contexto clínico lo justifican.',
        caution: 'La respuesta clínica suele tardar semanas. Cualquier ajuste o suspensión debe hacerse con supervisión profesional.',
        classes: [
          {
            className: 'ISRS',
            examples: 'sertralina, escitalopram, fluoxetina',
            intendedUse: 'Se usan con frecuencia en depresión y también en varios cuadros de ansiedad.',
            expectedEffects: 'Pueden ayudar con ánimo, rumiación, ansiedad asociada y funcionamiento diario.',
            commonSideEffects: 'náusea, somnolencia o insomnio, cefalea, molestias gastrointestinales, cambios sexuales',
            majorAlerts: 'vigilar activación, ideación suicida emergente, síndrome serotoninérgico e interacciones',
          },
          {
            className: 'IRSN',
            examples: 'venlafaxina, duloxetina',
            intendedUse: 'Se usan en depresión y algunos cuadros con dolor o ansiedad marcada.',
            expectedEffects: 'Pueden mejorar ánimo, energía y algunos síntomas físicos asociados.',
            commonSideEffects: 'náusea, sudoración, aumento de presión arterial, insomnio',
            majorAlerts: 'vigilar presión arterial, activación y síntomas de discontinuación',
          },
        ],
      },
      {
        disorderGroup: 'anxiety',
        title: 'Ansiedad y pánico',
        summary: 'La medicación puede incluir antidepresivos de mantenimiento y, en algunos casos, ansiolíticos bajo control profesional.',
        caution: 'Las benzodiacepinas no son equivalentes a tratamiento de base y requieren prudencia por sedación y dependencia.',
        classes: [
          {
            className: 'ISRS / IRSN',
            examples: 'sertralina, escitalopram, paroxetina, venlafaxina',
            intendedUse: 'Se usan con frecuencia como tratamiento de base en ansiedad y pánico.',
            expectedEffects: 'Pueden reducir anticipación ansiosa, crisis de pánico y evitación.',
            commonSideEffects: 'náusea, inquietud inicial, diarrea o estreñimiento, cambios del sueño',
            majorAlerts: 'al inicio puede haber activación; requieren seguimiento clínico y ajuste gradual',
          },
          {
            className: 'Benzodiacepinas',
            examples: 'clonazepam, lorazepam, alprazolam',
            intendedUse: 'Se usan en algunos casos para alivio corto y muy controlado.',
            expectedEffects: 'Pueden bajar la activación fisiológica y la ansiedad aguda.',
            commonSideEffects: 'somnolencia, lentitud, mareo, dificultades de memoria',
            majorAlerts: 'riesgo de dependencia, caídas, sedación y combinación peligrosa con alcohol u otros depresores',
          },
        ],
      },
      {
        disorderGroup: 'bipolar',
        title: 'Trastorno bipolar',
        summary: 'El manejo farmacológico suele apoyarse en estabilizadores del ánimo y, según el caso, antipsicóticos.',
        caution: 'No debe simplificarse como “solo depresión”. El riesgo de activación o viraje exige supervisión psiquiátrica.',
        classes: [
          {
            className: 'Estabilizadores del ánimo',
            examples: 'litio, valproato, lamotrigina',
            intendedUse: 'Se usan para estabilizar episodios y reducir recaídas en algunas fases del trastorno bipolar.',
            expectedEffects: 'Pueden ayudar con estabilidad del ánimo y prevención de episodios.',
            commonSideEffects: 'temblor, sed, mareo, cambios gastrointestinales, somnolencia',
            majorAlerts: 'requieren control de laboratorio y vigilancia clínica según el fármaco',
          },
          {
            className: 'Antipsicóticos atípicos',
            examples: 'quetiapina, olanzapina, aripiprazol',
            intendedUse: 'Pueden usarse en manía, depresión bipolar o mantenimiento, según la indicación médica.',
            expectedEffects: 'Pueden reducir agitación, síntomas afectivos intensos e inestabilidad.',
            commonSideEffects: 'somnolencia, aumento de apetito, rigidez, inquietud, cambios metabólicos',
            majorAlerts: 'vigilar peso, glucosa, lípidos, sedación y síntomas extrapiramidales',
          },
        ],
      },
      {
        disorderGroup: 'adhd',
        title: 'TDAH',
        summary: 'El tratamiento puede incluir estimulantes o alternativas no estimulantes, siempre con evaluación clínica.',
        caution: 'No deben usarse sin fórmula ni seguimiento; pueden afectar apetito, sueño y frecuencia cardiaca.',
        classes: [
          {
            className: 'Estimulantes',
            examples: 'metilfenidato, lisdexanfetamina',
            intendedUse: 'Se usan con frecuencia en TDAH para atención, impulsividad e hiperactividad.',
            expectedEffects: 'Pueden mejorar foco, control inhibitorio y organización.',
            commonSideEffects: 'disminución del apetito, insomnio, nerviosismo, taquicardia',
            majorAlerts: 'vigilar sueño, peso, presión arterial y uso inadecuado',
          },
          {
            className: 'No estimulantes',
            examples: 'atomoxetina, guanfacina',
            intendedUse: 'Se consideran en algunos perfiles clínicos o cuando los estimulantes no son la mejor opción.',
            expectedEffects: 'Pueden mejorar regulación atencional y control conductual.',
            commonSideEffects: 'somnolencia, mareo, náusea, boca seca',
            majorAlerts: 'requieren seguimiento de respuesta, tolerancia y seguridad cardiovascular',
          },
        ],
      },
      {
        disorderGroup: 'psychosis',
        title: 'Esquizofrenia y psicosis',
        summary: 'Los antipsicóticos son parte central del tratamiento cuando existe psicosis activa o antecedentes psicóticos.',
        caution: 'La elección del medicamento y el seguimiento de efectos adversos requieren manejo profesional cercano.',
        classes: [
          {
            className: 'Antipsicóticos',
            examples: 'risperidona, olanzapina, quetiapina, aripiprazol',
            intendedUse: 'Se usan para síntomas psicóticos, desorganización, agitación y prevención de recaídas.',
            expectedEffects: 'Pueden ayudar con ideas delirantes, alucinaciones y desorganización conductual.',
            commonSideEffects: 'somnolencia, rigidez, inquietud, aumento de peso, cambios metabólicos',
            majorAlerts: 'vigilar síntomas extrapiramidales, síndrome metabólico y adherencia',
          },
        ],
      },
      {
        disorderGroup: 'insomnia',
        title: 'Insomnio y burnout',
        summary: 'El manejo farmacológico puede incluir hipnóticos u otras opciones puntuales, pero no sustituye higiene del sueño ni abordaje clínico del estrés.',
        caution: 'Los sedantes pueden generar somnolencia residual, dependencia o caídas según el contexto.',
        classes: [
          {
            className: 'Hipnóticos y sedantes prescritos',
            examples: 'zolpidem, trazodona, algunas benzodiacepinas según indicación',
            intendedUse: 'Se usan en algunos cuadros de insomnio o desregulación intensa del sueño.',
            expectedEffects: 'Pueden facilitar conciliación o mantenimiento del sueño.',
            commonSideEffects: 'somnolencia diurna, mareo, lentitud, alteraciones de memoria',
            majorAlerts: 'riesgo de caídas, dependencia, conductas complejas del sueño y mezcla peligrosa con alcohol',
          },
        ],
      },
      {
        disorderGroup: 'eating-disorders',
        title: 'Trastornos de la conducta alimentaria',
        summary: 'La medicación no reemplaza la supervisión médica, psicológica y nutricional intensiva que estos cuadros suelen requerir.',
        caution: 'Si hay desmayo, purgas, restricción severa o inestabilidad física, debe priorizarse seguridad médica.',
        classes: [
          {
            className: 'Uso individualizado',
            examples: 'según criterio profesional y contexto clínico',
            intendedUse: 'En algunos casos se tratan síntomas asociados, no solo la conducta alimentaria en sí.',
            expectedEffects: 'Dependen del objetivo clínico específico y del equipo tratante.',
            commonSideEffects: 'varían según el medicamento formulado',
            majorAlerts: 'requiere seguimiento estrecho por riesgo médico y nutricional',
          },
        ],
      },
    ];
  }

  return [
    {
      disorderGroup: 'depression',
      title: 'Depression',
      summary: 'Clinicians may prescribe antidepressants when the presentation and overall clinical context justify them.',
      caution: 'Clinical response often takes weeks. Any adjustment or discontinuation should be supervised professionally.',
      classes: [
        {
          className: 'SSRIs',
          examples: 'sertraline, escitalopram, fluoxetine',
          intendedUse: 'Commonly used in depression and in several anxiety presentations as well.',
          expectedEffects: 'May help mood, rumination, associated anxiety, and day-to-day functioning.',
          commonSideEffects: 'nausea, sleepiness or insomnia, headache, GI discomfort, sexual side effects',
          majorAlerts: 'monitor activation, emerging suicidal ideation, serotonin toxicity, and interactions',
        },
        {
          className: 'SNRIs',
          examples: 'venlafaxine, duloxetine',
          intendedUse: 'Used in depression and in some presentations with pain or marked anxiety.',
          expectedEffects: 'May improve mood, energy, and some associated physical symptoms.',
          commonSideEffects: 'nausea, sweating, blood-pressure increase, insomnia',
          majorAlerts: 'monitor blood pressure, activation, and discontinuation symptoms',
        },
      ],
    },
    {
      disorderGroup: 'anxiety',
      title: 'Anxiety and panic',
      summary: 'Medication may include maintenance antidepressants and, in some cases, short-term anxiolytics under close supervision.',
      caution: 'Benzodiazepines are not the same as a core treatment plan and require caution because of sedation and dependence.',
      classes: [
        {
          className: 'SSRIs / SNRIs',
          examples: 'sertraline, escitalopram, paroxetine, venlafaxine',
          intendedUse: 'Often used as a core maintenance treatment in anxiety and panic.',
          expectedEffects: 'May reduce anticipatory anxiety, panic attacks, and avoidance.',
          commonSideEffects: 'nausea, initial restlessness, GI changes, sleep changes',
          majorAlerts: 'there can be early activation; requires clinical follow-up and gradual adjustment',
        },
        {
          className: 'Benzodiazepines',
          examples: 'clonazepam, lorazepam, alprazolam',
          intendedUse: 'Used in some cases for brief and tightly controlled acute relief.',
          expectedEffects: 'May reduce physiologic hyperarousal and acute anxiety.',
          commonSideEffects: 'sleepiness, slowed thinking, dizziness, memory issues',
          majorAlerts: 'dependence risk, falls, sedation, and dangerous mixing with alcohol or other depressants',
        },
      ],
    },
    {
      disorderGroup: 'bipolar',
      title: 'Bipolar disorder',
      summary: 'Medication management often relies on mood stabilizers and, depending on the case, antipsychotics.',
      caution: 'It should not be reduced to “depression only.” Risk of activation or switching requires psychiatric supervision.',
      classes: [
        {
          className: 'Mood stabilizers',
          examples: 'lithium, valproate, lamotrigine',
          intendedUse: 'Used to stabilize episodes and reduce relapse risk in some bipolar phases.',
          expectedEffects: 'May support mood stability and episode prevention.',
          commonSideEffects: 'tremor, thirst, dizziness, GI symptoms, sleepiness',
          majorAlerts: 'often requires lab monitoring and close clinical follow-up depending on the medication',
        },
        {
          className: 'Atypical antipsychotics',
          examples: 'quetiapine, olanzapine, aripiprazole',
          intendedUse: 'May be used in mania, bipolar depression, or maintenance based on the clinician plan.',
          expectedEffects: 'May reduce agitation, intense mood symptoms, and instability.',
          commonSideEffects: 'sleepiness, appetite increase, stiffness, restlessness, metabolic changes',
          majorAlerts: 'monitor weight, glucose, lipids, sedation, and extrapyramidal symptoms',
        },
      ],
    },
    {
      disorderGroup: 'adhd',
      title: 'ADHD',
      summary: 'Treatment may include stimulants or non-stimulant options, always after proper clinical evaluation.',
      caution: 'They should not be used without a prescription or follow-up; they can affect appetite, sleep, and heart rate.',
      classes: [
        {
          className: 'Stimulants',
          examples: 'methylphenidate, lisdexamfetamine',
          intendedUse: 'Often used in ADHD for attention, impulsivity, and hyperactivity.',
          expectedEffects: 'May improve focus, inhibitory control, and organization.',
          commonSideEffects: 'lower appetite, insomnia, nervousness, tachycardia',
          majorAlerts: 'monitor sleep, weight, blood pressure, and misuse risk',
        },
        {
          className: 'Non-stimulants',
          examples: 'atomoxetine, guanfacine',
          intendedUse: 'Considered in some profiles or when stimulants are not the best option.',
          expectedEffects: 'May improve attentional regulation and behavioral control.',
          commonSideEffects: 'sleepiness, dizziness, nausea, dry mouth',
          majorAlerts: 'requires follow-up for response, tolerability, and cardiovascular safety',
        },
      ],
    },
    {
      disorderGroup: 'psychosis',
      title: 'Schizophrenia and psychosis',
      summary: 'Antipsychotics are a central part of treatment when psychosis is active or when there is a psychotic history.',
      caution: 'Medication choice and adverse-effect monitoring require close professional management.',
      classes: [
        {
          className: 'Antipsychotics',
          examples: 'risperidone, olanzapine, quetiapine, aripiprazole',
          intendedUse: 'Used for psychotic symptoms, disorganization, agitation, and relapse prevention.',
          expectedEffects: 'May help delusions, hallucinations, and behavioral disorganization.',
          commonSideEffects: 'sleepiness, stiffness, restlessness, weight gain, metabolic changes',
          majorAlerts: 'monitor extrapyramidal symptoms, metabolic syndrome, and adherence',
        },
      ],
    },
    {
      disorderGroup: 'insomnia',
      title: 'Insomnia and burnout',
      summary: 'Medication may include hypnotics or other targeted options, but it does not replace sleep hygiene or clinical stress treatment.',
      caution: 'Sedating medications may cause next-day drowsiness, dependence, or falls depending on the context.',
      classes: [
        {
          className: 'Prescription hypnotics and sedatives',
          examples: 'zolpidem, trazodone, some benzodiazepines depending on indication',
          intendedUse: 'Used in some insomnia or severe sleep dysregulation cases.',
          expectedEffects: 'May support sleep onset or sleep maintenance.',
          commonSideEffects: 'daytime sleepiness, dizziness, slowing, memory issues',
          majorAlerts: 'falls, dependence, complex sleep behaviors, and dangerous mixing with alcohol',
        },
      ],
    },
    {
      disorderGroup: 'eating-disorders',
      title: 'Eating disorders',
      summary: 'Medication does not replace the intensive medical, psychological, and nutritional supervision these presentations often require.',
      caution: 'If there is fainting, purging, severe restriction, or physical instability, medical safety should take priority.',
      classes: [
        {
          className: 'Individualized use',
          examples: 'depends on clinician judgment and context',
          intendedUse: 'In some cases, associated symptoms are treated rather than the eating behavior alone.',
          expectedEffects: 'Depend on the specific clinical target and treatment team plan.',
          commonSideEffects: 'vary with the prescribed medication',
          majorAlerts: 'requires close follow-up because of medical and nutritional risk',
        },
      ],
    },
  ];
}
