'use client';

import { AlertTriangle, Apple, Dumbbell, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/context/language-provider';
import { useFirebase } from '@/firebase';
import { useTrackModuleActivity } from '@/hooks/use-track-module-activity';

type WellnessSection = {
  id: string;
  label: string;
  objective: string;
  exercise: string[];
  nutrition: string[];
  precautions: string[];
};

type WellnessCopy = {
  title: string;
  description: string;
  introTitle: string;
  introBody: string;
  baseRuleTitle: string;
  baseRuleBody: string;
  baseRuleItems: string[];
  urgentTitle: string;
  urgentBody: string;
  objectiveLabel: string;
  exerciseLabel: string;
  nutritionLabel: string;
  precautionsLabel: string;
  closing: string;
  sections: WellnessSection[];
};

const WELLNESS_COPY: Record<'es' | 'en', WellnessCopy> = {
  es: {
    title: 'Bienestar Preventivo',
    description:
      'Planes semanales de ejercicio y alimentación con enfoque educativo y preventivo. No reemplazan evaluación médica, psiquiátrica, psicológica ni nutricional.',
    introTitle: 'Introducción breve',
    introBody:
      'No existe una rutina universal que sirva igual para todas las personas o para todos los cuadros de salud mental. Este módulo organiza una base segura y luego la ajusta según necesidades frecuentes, sin diagnosticar ni prometer resultados clínicos.',
    baseRuleTitle: 'Regla base general',
    baseRuleBody:
      'Como punto de partida, una rutina prudente suele combinar movimiento aeróbico moderado, fuerza, movilidad, horarios estables de comida y sueño, y una alimentación equilibrada y regular.',
    baseRuleItems: [
      'Actividad aeróbica moderada varias veces por semana.',
      'Entrenamiento de fuerza 2 o más veces por semana.',
      'Movilidad, estiramiento o respiración casi a diario.',
      'Comidas regulares con proteína, fibra, carbohidratos y grasas saludables.',
      'Horarios consistentes para proteger energía, apetito y sueño.',
    ],
    urgentTitle: 'Advertencia de seguridad',
    urgentBody:
      'Si hay ideación suicida, psicosis aguda, manía activa, desmayo, purgas, restricción alimentaria severa o incapacidad para mantenerse seguro, se necesita atención profesional inmediata y no solo una rutina de bienestar.',
    objectiveLabel: 'Objetivo',
    exerciseLabel: 'Rutina deportiva',
    nutritionLabel: 'Rutina alimenticia',
    precautionsLabel: 'Precauciones',
    closing:
      'Esta orientación es general y preventiva. Debe adaptarse con profesionales cuando hay tratamiento activo, medicación, lesiones, embarazo, cambios marcados de peso, trastornos alimentarios o síntomas graves.',
    sections: [
      {
        id: 'depression',
        label: 'Depresión',
        objective: 'Favorecer activación conductual gradual, constancia y recuperación de energía sin imponer metas excesivas.',
        exercise: [
          'Lunes, miércoles y viernes: caminata de 20 a 30 minutos a ritmo moderado.',
          'Martes y sábado: fuerza básica de cuerpo completo de 20 a 25 minutos con 5 o 6 ejercicios simples.',
          'Diario: 5 a 10 minutos de movilidad o respiración para facilitar el inicio de la rutina.',
          'Progresión: empezar pequeño y subir tiempo o dificultad solo cuando haya constancia.',
        ],
        nutrition: [
          'Mantener 3 comidas principales y 1 o 2 meriendas si pasan muchas horas entre comidas.',
          'Incluir proteína en cada comida para sostener saciedad y energía.',
          'Usar combinaciones simples y repetibles cuando cocinar sea difícil.',
          'Evitar saltarse comidas por falta de ánimo; priorizar regularidad antes que perfección.',
        ],
        precautions: [
          'No usar ejercicio extenuante como única estrategia si hay fatiga intensa o empeoramiento marcado.',
          'Si el malestar impide levantarse, comer o cuidarse, se requiere apoyo profesional más cercano.',
          'Si aparecen ideas de muerte o desesperanza intensa, buscar ayuda inmediata.',
        ],
      },
      {
        id: 'anxiety',
        label: 'Ansiedad / pánico',
        objective: 'Regular activación fisiológica, mejorar tolerancia corporal y evitar empezar con estímulos excesivos.',
        exercise: [
          'Lunes, miércoles, viernes y sábado: 20 a 35 minutos de caminata, bicicleta suave o elíptica moderada.',
          'Martes y jueves: fuerza ligera a moderada, con descansos amplios y respiración controlada.',
          'Diario: 5 a 10 minutos de respiración diafragmática o movilidad suave.',
          'Evitar comenzar con HIIT si el aumento de frecuencia cardíaca dispara miedo o síntomas de pánico.',
        ],
        nutrition: [
          'Mantener horarios estables para reducir picos de hambre, irritabilidad y síntomas físicos confusos.',
          'Reducir exceso de cafeína, bebidas energéticas y ayunos prolongados.',
          'Priorizar desayunos y meriendas con proteína y fibra para mayor estabilidad.',
          'Mantener hidratación regular, especialmente si la ansiedad causa tensión o mareo.',
        ],
        precautions: [
          'No forzar ejercicio muy intenso si aumenta la sensación de ahogo, mareo o miedo corporal.',
          'Si hay ataques de pánico muy frecuentes, síncope o evitación extensa, complementar con atención profesional.',
          'Si los síntomas aparecen junto con riesgo de daño o confusión severa, buscar ayuda urgente.',
        ],
      },
      {
        id: 'bipolar',
        label: 'Trastorno bipolar',
        objective: 'Proteger ritmos biológicos, regular energía y sostener estructura estable sin sobreestimulación.',
        exercise: [
          'Lunes, miércoles y viernes: aeróbico moderado 25 a 35 minutos, preferiblemente en la mañana o tarde temprana.',
          'Martes y sábado: fuerza moderada, evitando sesiones muy largas o muy estimulantes en la noche.',
          'Domingo: caminata suave, movilidad o descanso activo.',
          'Mantener horarios fijos de entrenamiento para apoyar regularidad del sueño.',
        ],
        nutrition: [
          'Comidas a horas consistentes todos los días, incluyendo fines de semana.',
          'Evitar grandes cambios de apetito o periodos de ayuno que alteren energía y sueño.',
          'Priorizar cenas moderadas y no muy tardías para proteger el descanso.',
          'Mantener consumo prudente de cafeína y evitar usarla para compensar cansancio crónico.',
        ],
        precautions: [
          'Evitar ejercicio intenso nocturno si altera el sueño o aumenta activación.',
          'Si hay señales de manía activa, gran disminución de sueño o impulsividad marcada, buscar atención profesional inmediata.',
          'No hacer cambios bruscos de rutina durante periodos de inestabilidad.',
        ],
      },
      {
        id: 'adhd',
        label: 'TDAH',
        objective: 'Aprovechar rutinas breves, dinámicas y repetibles que reduzcan fricción y faciliten adherencia.',
        exercise: [
          'Cinco o seis días por semana: bloques de 10 a 20 minutos de movimiento dinámico.',
          'Alternar caminata rápida, bicicleta, circuitos cortos, saltos suaves o fuerza por estaciones.',
          'Usar estructura visible: mismo horario, ropa lista y secuencia fija de inicio.',
          'Si ayuda, dividir una sesión larga en dos bloques cortos durante el día.',
        ],
        nutrition: [
          'No depender solo del hambre para comer; usar horarios, recordatorios o preparaciones anticipadas.',
          'Incluir proteína y carbohidrato en desayuno y almuerzo para sostener atención y energía.',
          'Tener meriendas fáciles disponibles para evitar largas pausas sin comer.',
          'Reducir consumo caótico de azúcar o cafeína como reemplazo de organización básica.',
        ],
        precautions: [
          'Evitar planes demasiado complejos o rígidos que se abandonen en pocos días.',
          'Si hay pérdida importante de apetito, cambios de peso o insomnio, revisar con profesional.',
          'No convertir la rutina en una meta de perfección; la clave es repetición realista.',
        ],
      },
      {
        id: 'psychosis',
        label: 'Esquizofrenia u otros trastornos psicóticos',
        objective: 'Mejorar salud física general, estructura diaria y tolerancia al esfuerzo con progresión lenta y predecible.',
        exercise: [
          'Tres a cinco días por semana: caminata de 15 a 30 minutos o bicicleta estática suave.',
          'Dos días por semana: fuerza muy básica, guiada o supervisada si hace falta.',
          'Añadir movilidad suave o respiración simple al inicio o final de la sesión.',
          'Mantener la rutina sencilla, repetible y preferiblemente en horarios regulares.',
        ],
        nutrition: [
          'Comidas regulares para sostener energía y salud metabólica general.',
          'Priorizar platos simples con proteína, vegetales o fruta, carbohidrato y grasas saludables.',
          'Reducir dependencia de ultraprocesados cuando sea posible, sin volver la pauta rígida.',
          'Apoyarse en compras y preparaciones simples si la organización diaria es difícil.',
        ],
        precautions: [
          'La progresión debe ser lenta, especialmente si hay sedación, fatiga o baja motivación.',
          'Si hay psicosis aguda, desorganización marcada o incapacidad para mantenerse seguro, se necesita atención inmediata.',
          'Puede ser útil supervisión adicional al iniciar la rutina.',
        ],
      },
      {
        id: 'eating-disorders',
        label: 'Trastornos de la conducta alimentaria',
        objective: 'Priorizar seguridad, regularidad y relación más estable con comida y movimiento, sin compensación ni restricción.',
        exercise: [
          'Solo considerar ejercicio si el equipo tratante lo permite y la condición médica lo hace seguro.',
          'Priorizar movimiento suave, funcional y no compensatorio, como caminata corta o movilidad guiada.',
          'Evitar usar ejercicio para “ganarse” la comida o corregir una ingesta.',
          'Detener ejercicio si hay mareo, desmayo, debilidad marcada o reglas compulsivas alrededor del movimiento.',
        ],
        nutrition: [
          'No recomendar dietas restrictivas ni eliminación rígida de grupos de alimentos.',
          'La pauta debe centrarse en regularidad, suficiencia y acompañamiento profesional.',
          'Si hay miedo intenso a comer, culpa, atracones, purgas o restricción, la alimentación debe ser supervisada.',
          'La prioridad no es bajar peso ni “compensar”, sino sostener seguridad física y psicológica.',
        ],
        precautions: [
          'Este grupo requiere supervisión profesional específica con medicina, psicología y nutrición.',
          'Si hay purgas, restricción severa, desmayo o deterioro físico, buscar atención inmediata.',
          'No usar este módulo como sustituto de tratamiento especializado.',
        ],
      },
      {
        id: 'insomnia-burnout',
        label: 'Insomnio, estrés crónico o burnout',
        objective: 'Regular energía, mejorar sueño y reducir carga fisiológica sin agotar más el sistema.',
        exercise: [
          'Tres a cinco días por semana: ejercicio moderado de 20 a 35 minutos, preferiblemente en mañana o tarde.',
          'Dos días por semana: fuerza de intensidad moderada, sin terminar muy cerca de la hora de dormir.',
          'Diario: 5 a 10 minutos de movilidad, respiración o caminata breve de descarga.',
          'Evitar entrenamiento intenso nocturno cuando empeora el sueño o la activación.',
        ],
        nutrition: [
          'Mantener horarios estables para evitar largos periodos sin comer durante jornadas exigentes.',
          'No reemplazar descanso con cafeína excesiva ni saltarse comidas por trabajo.',
          'Incluir cenas suficientes pero ligeras, y limitar estimulantes al final del día.',
          'Priorizar hidratación y comidas simples que no añadan más carga mental.',
        ],
        precautions: [
          'Si el agotamiento es extremo, ajustar volumen e intensidad antes de intentar “ponerse al día”.',
          'Si hay insomnio persistente, ataques de ansiedad o incapacidad funcional, buscar evaluación profesional.',
          'La meta es regular, no exprimir más rendimiento.',
        ],
      },
    ],
  },
  en: {
    title: 'Preventive Wellness',
    description:
      'Weekly exercise and nutrition plans with a preventive, educational focus. They do not replace medical, psychiatric, psychological, or nutrition care.',
    introTitle: 'Brief introduction',
    introBody:
      'There is no single routine that fits every person or every mental-health presentation. This module starts from a safer baseline and then adjusts it for common patterns, without diagnosing or promising clinical outcomes.',
    baseRuleTitle: 'General baseline rule',
    baseRuleBody:
      'As a general starting point, a prudent routine usually combines moderate aerobic movement, strength work, mobility, stable meal timing, sleep protection, and balanced regular eating.',
    baseRuleItems: [
      'Moderate aerobic activity several times per week.',
      'Strength training 2 or more times per week.',
      'Mobility, stretching, or breathing most days.',
      'Regular meals with protein, fiber, carbohydrates, and healthy fats.',
      'Consistent timing to protect energy, appetite, and sleep.',
    ],
    urgentTitle: 'Safety warning',
    urgentBody:
      'If there is suicidal thinking, acute psychosis, active mania, fainting, purging, severe dietary restriction, or inability to stay safe, immediate professional care is needed and a wellness routine is not enough.',
    objectiveLabel: 'Objective',
    exerciseLabel: 'Exercise routine',
    nutritionLabel: 'Nutrition routine',
    precautionsLabel: 'Precautions',
    closing:
      'This is general preventive guidance. It should be adapted with professionals when there is active treatment, medication, injuries, pregnancy, major weight changes, eating disorders, or severe symptoms.',
    sections: [
      {
        id: 'depression',
        label: 'Depression',
        objective: 'Support gradual behavioral activation, consistency, and energy recovery without oversized goals.',
        exercise: [
          'Monday, Wednesday, Friday: 20 to 30 minutes of moderate walking.',
          'Tuesday and Saturday: 20 to 25 minutes of basic full-body strength work with 5 or 6 simple exercises.',
          'Daily: 5 to 10 minutes of mobility or breathing to make starting easier.',
          'Progression: start small and increase only after consistency is established.',
        ],
        nutrition: [
          'Keep 3 main meals and 1 or 2 snacks if many hours pass between meals.',
          'Include protein in each meal to support satiety and energy.',
          'Use simple, repeatable meal combinations when cooking feels difficult.',
          'Avoid skipping meals because of low motivation; regularity matters more than perfection.',
        ],
        precautions: [
          'Do not rely on exhaustive exercise as the only strategy if fatigue is intense or worsening.',
          'If distress makes it hard to get out of bed, eat, or care for yourself, closer professional support is needed.',
          'If thoughts of death or intense hopelessness appear, seek urgent help.',
        ],
      },
      {
        id: 'anxiety',
        label: 'Anxiety / panic',
        objective: 'Regulate physiological activation, improve body tolerance, and avoid starting with excessive stimulation.',
        exercise: [
          'Monday, Wednesday, Friday, Saturday: 20 to 35 minutes of walking, easy cycling, or moderate cardio.',
          'Tuesday and Thursday: light to moderate strength work with wider rest and controlled breathing.',
          'Daily: 5 to 10 minutes of diaphragmatic breathing or gentle mobility.',
          'Avoid starting with HIIT if increased heart rate triggers fear or panic symptoms.',
        ],
        nutrition: [
          'Use stable meal timing to reduce hunger swings, irritability, and confusing physical sensations.',
          'Reduce excess caffeine, energy drinks, and prolonged fasting.',
          'Prioritize breakfasts and snacks with protein and fiber for steadier energy.',
          'Stay hydrated, especially if anxiety comes with tension or dizziness.',
        ],
        precautions: [
          'Do not force very intense exercise if it increases breathlessness, dizziness, or body fear.',
          'If panic attacks are frequent, fainting occurs, or avoidance becomes broad, professional care should be added.',
          'If symptoms come with severe confusion or safety risk, seek urgent help.',
        ],
      },
      {
        id: 'bipolar',
        label: 'Bipolar disorder',
        objective: 'Protect biological rhythms, regulate energy, and keep structure stable without overstimulation.',
        exercise: [
          'Monday, Wednesday, Friday: 25 to 35 minutes of moderate aerobic exercise, preferably in the morning or early afternoon.',
          'Tuesday and Saturday: moderate strength work, avoiding very long or stimulating late-night sessions.',
          'Sunday: gentle walking, mobility, or active rest.',
          'Keep training times regular to support sleep stability.',
        ],
        nutrition: [
          'Eat at consistent times every day, including weekends.',
          'Avoid large appetite swings or long fasting periods that affect energy and sleep.',
          'Prefer moderate dinners that are not too late.',
          'Use caffeine cautiously and do not use it to compensate for chronic sleep loss.',
        ],
        precautions: [
          'Avoid intense late-night exercise if it disrupts sleep or increases activation.',
          'If there are signs of active mania, very reduced sleep, or marked impulsivity, seek urgent professional care.',
          'Do not make abrupt routine changes during unstable periods.',
        ],
      },
      {
        id: 'adhd',
        label: 'ADHD',
        objective: 'Use short, dynamic, repeatable routines that reduce friction and improve adherence.',
        exercise: [
          'Five or six days per week: 10 to 20 minute blocks of dynamic movement.',
          'Alternate brisk walking, cycling, short circuits, light jumps, or station-based strength work.',
          'Use visible structure: same time, clothes ready, and a fixed starting sequence.',
          'If useful, split one long session into two shorter blocks during the day.',
        ],
        nutrition: [
          'Do not rely only on hunger cues; use schedules, reminders, or prep in advance.',
          'Include protein and carbohydrates in breakfast and lunch to support focus and steadier energy.',
          'Keep easy snacks available to avoid very long gaps without eating.',
          'Reduce chaotic sugar or caffeine use as a substitute for basic structure.',
        ],
        precautions: [
          'Avoid overly complex or rigid plans that are likely to be dropped quickly.',
          'If there is major appetite loss, weight change, or insomnia, review with a professional.',
          'Do not turn the routine into a perfection task; repetition matters more.',
        ],
      },
      {
        id: 'psychosis',
        label: 'Schizophrenia or other psychotic disorders',
        objective: 'Improve general physical health, daily structure, and exercise tolerance with slow predictable progression.',
        exercise: [
          'Three to five days per week: 15 to 30 minutes of walking or gentle stationary cycling.',
          'Two days per week: very basic strength work, with supervision if needed.',
          'Add gentle mobility or simple breathing at the beginning or end of sessions.',
          'Keep the routine simple, repeatable, and preferably done at regular times.',
        ],
        nutrition: [
          'Use regular meals to support energy and overall metabolic health.',
          'Prioritize simple plates with protein, fruit or vegetables, carbohydrates, and healthy fats.',
          'Reduce dependence on ultra-processed food when possible, without making the plan rigid.',
          'Use simple shopping and meal-prep systems if daily organization is hard.',
        ],
        precautions: [
          'Progress slowly, especially if there is sedation, fatigue, or low drive.',
          'If there is acute psychosis, major disorganization, or inability to stay safe, urgent care is needed.',
          'Extra supervision may help when starting.',
        ],
      },
      {
        id: 'eating-disorders',
        label: 'Eating disorders',
        objective: 'Prioritize safety, regularity, and a steadier relationship with food and movement, without compensation or restriction.',
        exercise: [
          'Only consider exercise if the treating team agrees and medical safety is clear.',
          'Prioritize gentle, functional, non-compensatory movement such as short walks or guided mobility.',
          'Avoid using exercise to “earn” food or make up for eating.',
          'Stop exercise if there is dizziness, fainting, marked weakness, or compulsive exercise rules.',
        ],
        nutrition: [
          'Do not recommend restrictive diets or rigid removal of food groups.',
          'The plan should focus on regularity, adequacy, and professional support.',
          'If there is intense food fear, guilt, bingeing, purging, or restriction, eating support should be supervised.',
          'The priority is not weight loss or compensation, but physical and psychological safety.',
        ],
        precautions: [
          'This group requires specific supervision from medicine, psychology, and nutrition professionals.',
          'If there is purging, severe restriction, fainting, or physical deterioration, seek immediate care.',
          'Do not use this module as a substitute for specialized treatment.',
        ],
      },
      {
        id: 'insomnia-burnout',
        label: 'Insomnia, chronic stress, or burnout',
        objective: 'Regulate energy, improve sleep, and reduce physiological load without draining the system further.',
        exercise: [
          'Three to five days per week: 20 to 35 minutes of moderate exercise, preferably in the morning or afternoon.',
          'Two days per week: moderate strength work, not too close to bedtime.',
          'Daily: 5 to 10 minutes of mobility, breathing, or a short decompression walk.',
          'Avoid late intense exercise when it worsens sleep or activation.',
        ],
        nutrition: [
          'Keep meal timing stable to avoid long gaps during demanding workdays.',
          'Do not replace rest with excess caffeine or skip meals because of workload.',
          'Include adequate but lighter dinners, and limit stimulants later in the day.',
          'Prioritize hydration and simple meals that do not add more cognitive load.',
        ],
        precautions: [
          'If exhaustion is extreme, reduce volume and intensity before trying to “catch up.”',
          'If insomnia persists, panic symptoms rise, or functioning drops sharply, seek professional evaluation.',
          'The goal is regulation, not squeezing out more output.',
        ],
      },
    ],
  },
};

export default function WellnessPage() {
  const { locale } = useTranslation();
  const { firestore, user } = useFirebase();
  const copy = WELLNESS_COPY[locale === 'es' ? 'es' : 'en'];

  useTrackModuleActivity({ firestore, userId: user?.uid, module: 'wellness' });

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit">
          {copy.title}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{copy.title}</h1>
        <p className="max-w-4xl text-muted-foreground">{copy.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{copy.introTitle}</CardTitle>
          <CardDescription>{copy.introBody}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <CardTitle>{copy.baseRuleTitle}</CardTitle>
            </div>
            <CardDescription>{copy.baseRuleBody}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {copy.baseRuleItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <CardTitle>{copy.urgentTitle}</CardTitle>
            </div>
            <CardDescription>{copy.urgentBody}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue={copy.sections[0].id} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {copy.sections.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="rounded-full border px-4 py-2">
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {copy.sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-0">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{section.label}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-semibold">{copy.objectiveLabel}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{section.objective}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <p className="text-sm font-semibold">{copy.precautionsLabel}</p>
                    </div>
                    <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                      {section.precautions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      <CardTitle>{copy.exerciseLabel}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {section.exercise.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Apple className="h-5 w-5 text-primary" />
                      <CardTitle>{copy.nutritionLabel}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {section.nutrition.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardDescription>{copy.closing}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
