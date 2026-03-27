## Resumen

Esta rama deja NeuroQuest en un estado de MVP funcional para los flujos principales:

- Dashboard
- Mental Check-In
- Progress
- Therapist
- Observer

Además, las rutas que aún no están listas para producción (`Challenges` y `Medical Support`) quedaron marcadas explícitamente como `Próximamente` para no exponer placeholders como si fueran funcionalidad completa.

## Cambios principales

### Dashboard
- Muestra nivel, XP, último check-in, misión activa y resumen breve.
- Usa datos reales del usuario y resumen denormalizado del último check-in.

### Mental Check-In
- Guarda histórico real en Firestore en `users/{uid}/mental_checkups`.
- Guarda respuestas, score, severidad, nota y metadatos del resultado.
- Actualiza resumen denormalizado del usuario:
  - `latestCheckInScore`
  - `latestCheckInLevel`
  - `latestCheckInAt`
  - `latestCheckInNote`

### Progress
- Lee historial real desde Firestore:
  - `mental_checkups`
  - `thoughtRecords`
  - `exposureMissions`
- Calcula métricas y tendencia sin mocks.

### Therapist
- Lista pacientes reales desde `users` filtrando por `therapistIds`.
- Muestra último check-in, severidad y actividad reciente.
- Agrega detalle por paciente en `/therapist/patient/[id]`.

### Observer
- Guarda pensamientos en Firestore con:
  - emoción
  - intensidad
  - análisis IA
  - reframing
  - clasificación relacionada con TOC

### Producto / navegación
- `Challenges` y `Medical Support` pasan a estado `Coming Soon`.
- Sidebar actualizada para reflejar ese alcance.
- Correcciones menores de navegación, traducciones y estabilidad de build/typecheck.

## Validación

- `npm run build`
- `npm run typecheck`

## Notas

- Rama: `parcial-mvp`
- Commit principal: `834a349`
