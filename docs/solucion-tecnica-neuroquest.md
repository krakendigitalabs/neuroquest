# NeuroQuest

## Documento Tecnico

Arquitectura, logica, algoritmos, procesos y flujos operativos de la solucion.

## 1. Proposito del documento

Este documento explica el significado funcional, la logica interna, los algoritmos principales, los procesos operativos y los flujos de la solucion NeuroQuest. El enfoque es tecnico y de producto: que hace el sistema, como lo hace, por que se estructuro asi y como se conectan los modulos entre si.

No es un manual de usuario final. Es una explicacion de arquitectura, reglas de negocio y comportamiento del sistema.

## 2. Vision general de la solucion

NeuroQuest es una aplicacion web construida con Next.js, React, TypeScript y Firebase. Su objetivo es centralizar seguimiento de bienestar mental, registro de actividad terapeutica, apoyo preventivo, visualizacion de progreso y herramientas para seguimiento profesional.

La solucion combina cinco capas:

1. Capa de interfaz: pantallas, dashboard, progreso, modulos terapeuticos y soporte.
2. Capa de reglas de negocio: calculo de score, clasificacion de severidad, tendencias, resumen semanal y recomendacion del siguiente paso.
3. Capa de persistencia: Firestore por usuario y subcolecciones especializadas.
4. Capa de actividad transversal: eventos compartidos de progreso en tiempo real.
5. Capa de seguridad operativa: autenticacion, reglas de Firestore, writes no bloqueantes y degradacion segura.

## 3. Objetivos funcionales principales

- Registrar check-ins mentales y clasificar severidad.
- Guardar pensamientos, exposiciones y actividades de apoyo.
- Mostrar progreso real sin mezclarlo con simple navegacion.
- Reunir actividad transversal de varios modulos en una vista comun.
- Dar al dashboard una logica accionable y no solo informativa.
- Mantener seguridad operativa cuando alguna escritura secundaria falle.

## 4. Arquitectura de alto nivel

### 4.1 Stack principal

- Frontend: Next.js App Router + React 19.
- Lenguaje: TypeScript.
- UI: Tailwind + componentes UI internos.
- Persistencia: Firebase Firestore.
- Autenticacion: Firebase Authentication.
- IA: Genkit / flujos de apoyo cognitivo y misiones.
- Despliegue web: Vercel.
- Reglas de datos: Firebase CLI.

### 4.2 Estructura por capas

```text
Usuario
  |
  v
Next.js / React UI
  |
  +--> Hooks y librerias de dominio
  |       - mental-check-in
  |       - progress-checkups
  |       - progress-events
  |       - dashboard
  |
  +--> Firebase client
          |
          +--> Auth
          +--> Firestore
                    |
                    +--> users/{uid}
                    +--> mental_checkups
                    +--> thoughtRecords
                    +--> exposureMissions
                    +--> progressEvents
```

## 5. Modelo de datos principal

### 5.1 Documento base de usuario

Ruta:

```text
users/{uid}
```

Campos denormalizados relevantes:

- `latestCheckInScore`
- `latestCheckInLevel`
- `latestCheckInAt`
- `latestCheckInNote`
- `currentXp`
- `level`
- campos de ultimo pensamiento y ultimo estado

La logica usa denormalizacion para que el dashboard pueda responder rapido sin recalcular desde cero en cada vista.

### 5.2 Subcolecciones clave

```text
users/{uid}/mental_checkups
users/{uid}/thoughtRecords
users/{uid}/exposureMissions
users/{uid}/progressEvents
```

### 5.3 Evento transversal de progreso

Modelo:

- `userId`
- `module`
- `type`
- `detail`
- `createdAt`

Modulos:

- `check-in`
- `observer`
- `exposure`
- `medical-support`
- `grounding`
- `regulation`
- `reprogram`
- `wellness`

Tipos:

- `saved`
- `created`
- `completed`
- `opened`

El punto importante de diseño es que `opened` ya no se trata como progreso real. Solo cuenta como engagement.

## 6. Logica principal del sistema

### 6.1 Algoritmo de score del Mental Check-In

Archivo base:

```text
src/lib/mental-check-in.ts
```

Logica:

1. El usuario responde una lista de preguntas.
2. Cada respuesta tiene un valor numerico.
3. El score final es la suma de todos los valores.
4. El score se compara contra umbrales clinicos configurados.
5. El resultado se clasifica en:
   - healthy
   - mild
   - moderate
   - severe

Formula:

```text
score_total = suma(answer.value)
```

Clasificacion:

```text
si score <= maxScoreDelUmbral => usar ese nivel
si no coincide con ninguno => severe
```

Razon de diseño:

- Es deterministicamente auditable.
- Evita ambiguedad.
- Permite persistir score y severidad con consistencia.

### 6.2 Persistencia atomica del Check-In

Archivo base:

```text
src/lib/check-in-records.ts
```

Proceso:

1. Se crea un documento en `mental_checkups`.
2. En el mismo batch se agrega un `progressEvent`.
3. En el mismo batch se actualiza `users/{uid}` con campos denormalizados.
4. Se hace `batch.commit()`.

Ventaja:

- El estado del check-in, el feed de progreso y el resumen del usuario quedan sincronizados dentro de una sola operacion atomica.

Flujo:

```text
Usuario completa check-in
  -> calcular score
  -> calcular nivel
  -> crear payload del check-in
  -> batch.set(mental_checkups)
  -> batch.set(progressEvents, type=saved)
  -> batch.set(users/{uid}, merge=true)
  -> commit
```

### 6.3 Algoritmo de tendencia de progreso

Archivo base:

```text
src/lib/progress-checkups.ts
```

El sistema no usa una regresion compleja. Usa una heuristica simple, explicable y estable:

1. Toma los 5 check-ins mas recientes.
2. Calcula su promedio.
3. Toma los 5 anteriores.
4. Calcula su promedio.
5. Compara ambos bloques.

Formula:

```text
latestAverage = promedio(ultimos 5)
previousAverage = promedio(5 anteriores)
delta = latestAverage - previousAverage
```

Regla de tendencia:

```text
si delta >= 1     => up
si delta <= -1    => down
si -1 < delta < 1 => stable
```

Interpretacion:

- `up` significa mayor carga reciente.
- `down` significa mejora relativa.
- `stable` significa variacion menor a un punto.

Ventajas:

- Facil de explicar a usuarios y terapeutas.
- Evita sobreinterpretar pequeñas oscilaciones.
- No depende de grandes volumenes de datos.

### 6.4 Algoritmo de actividad significativa

Archivo base:

```text
src/app/(app)/progress/page.tsx
```

Problema que resolvio la solucion:

Antes, abrir un modulo podia inflar el progreso. Eso era conceptualmente incorrecto.

Solucion:

1. Se cargan eventos desde `progressEvents`.
2. Se separan eventos:
   - significativos: `saved`, `created`, `completed`
   - engagement: `opened`
3. Las metricas clinicas usan solo eventos significativos.
4. Las aperturas quedan en una seccion aparte.

Regla:

```text
meaningful = events where type != opened
engagement = events where type == opened
```

Esto corrige la inflacion artificial del progreso.

### 6.5 Algoritmo de resumen semanal real

Implementado en:

- `Dashboard`
- `Progress`

Logica:

1. Se toma la fecha actual.
2. Se calcula `now - 7 dias`.
3. Se filtran solo eventos significativos cuya fecha sea mayor o igual a ese umbral.
4. Se cuentan:
   - numero de eventos utiles
   - numero de modulos con actividad util

Formula:

```text
weeklyEvents = meaningfulEvents where createdAt >= now - 7 dias
weeklyModules = cantidad de modulos unicos en weeklyEvents
```

Esto crea una lectura semanal real, no una simple foto del ultimo evento.

### 6.6 Algoritmo del dashboard accionable

Archivo base:

```text
src/app/(app)/dashboard/page.tsx
```

El dashboard decide el siguiente paso en orden de prioridad:

1. Si la severidad actual es `severe`, prioriza crisis y soporte medico.
2. Si no existe check-in reciente, empuja a `/check-in`.
3. Si la ultima actividad fue `observer`, empuja a `reprogram`.
4. Si la ultima actividad fue `exposure`, empuja a `progress` o vuelve a exposure.
5. Si la ultima actividad fue `grounding` o `regulation`, empuja a observar y consolidar progreso.
6. Si no aplica nada especial, usa una ruta por defecto hacia `progress`.

Pseudocodigo:

```text
if latestCheckInLevel == severe:
    return crisis flow
elif no latest check-in:
    return check-in flow
elif latestActivity.module == observer:
    return reprogram
elif latestActivity.module == exposure:
    return progress/exposure
elif latestActivity.module in [grounding, regulation]:
    return progress/observer
else:
    return default progress flow
```

La logica es deliberadamente simple, auditable y mantenible.

### 6.7 Writes no bloqueantes

Archivo base:

```text
src/firebase/non-blocking-updates.tsx
```

Problema previo:

Si una escritura secundaria fallaba por permisos o conectividad, el listener global podia terminar rompiendo la app del lado cliente.

Solucion:

- Las operaciones secundarias se ejecutan sin bloquear la interfaz.
- Si fallan, se registran con `console.warn`.
- No se relanza una excepcion fatal.

Patron:

```text
operacion async
  .catch(error => console.warn(...))
```

Resultado:

- La app sigue operativa.
- El fallo queda visible para debugging.
- El usuario no pierde la pantalla por un write accesorio.

## 7. Procesos principales del producto

### 7.1 Proceso A: Check-In y reflejo inmediato en progreso

```text
Usuario entra a Check-In
  -> responde preguntas
  -> sistema calcula score y severidad
  -> sistema guarda mental_checkup
  -> sistema actualiza user profile
  -> sistema registra progressEvent
  -> Dashboard y Progress pueden reflejarlo en tiempo real
```

### 7.2 Proceso B: Observer y reprogramacion

```text
Usuario registra pensamiento
  -> sistema guarda thoughtRecord
  -> sistema registra progressEvent tipo saved
  -> Observer muestra seguimiento
  -> Dashboard identifica actividad reciente
  -> Progress actualiza actividad util y cobertura por modulo
```

### 7.3 Proceso C: Modulos de apoyo y engagement

```text
Usuario abre modulo
  -> useTrackModuleActivity registra opened una vez por sesion y por dia
  -> ese evento aparece como engagement
  -> no altera metricas de progreso real
```

### 7.4 Proceso D: Modulos con acciones reales

```text
Usuario ejecuta una accion significativa
  -> ejemplo: iniciar respiracion, marcar grounding, completar reprogramacion
  -> sistema registra saved/created/completed
  -> Progress lo cuenta como actividad util
  -> Dashboard lo usa para actividad reciente y siguiente paso
```

### 7.5 Proceso E: Resumen semanal

```text
Sistema consulta progressEvents ordenados por fecha
  -> filtra solo eventos significativos
  -> filtra ultimos 7 dias
  -> cuenta eventos
  -> cuenta modulos unicos
  -> renderiza resumen semanal en Dashboard y Progress
```

## 8. Flujogramas

### 8.1 Flujograma general del sistema

```text
[Usuario]
   |
   v
[Modulo UI]
   |
   +--> [Reglas de negocio]
   |         |
   |         +--> score / severidad / tendencia / siguiente paso
   |
   +--> [Persistencia Firestore]
             |
             +--> users/{uid}
             +--> mental_checkups
             +--> thoughtRecords
             +--> exposureMissions
             +--> progressEvents
                         |
                         v
                  [Dashboard + Progress]
```

### 8.2 Flujograma de progreso real vs engagement

```text
[Evento nuevo]
   |
   v
{type == opened?}
   | yes                       | no
   v                           v
[Engagement]            [Actividad significativa]
   |                           |
   v                           v
[No cambia score]       [Se muestra en progreso real]
   |                           |
   +---------> [Feed de actividad] <---------+
```

### 8.3 Flujograma del dashboard accionable

```text
[Carga Dashboard]
   |
   v
[Lee user profile + missions + progressEvents]
   |
   v
{latestCheckInLevel == severe?}
   | yes                              | no
   v                                  v
[Mostrar crisis/support]      {hay check-in?}
                                      | no
                                      v
                               [Enviar a Check-In]
                                      |
                                      | yes
                                      v
                             [Revisar ultima actividad]
                                      |
             +------------------------+-----------------------+
             |                        |                       |
             v                        v                       v
        observer                 exposure              grounding/regulation
             |                        |                       |
             v                        v                       v
      [Ir a reprogram]        [Ir a progress]        [Ir a observer/progress]
```

## 9. Decisiones de diseño relevantes

### 9.1 Por que usar denormalizacion

Porque el dashboard necesita velocidad y simplicidad. Leer solo `users/{uid}` evita recalcular todo para cada carga.

### 9.2 Por que separar progreso real de engagement

Porque abrir una pantalla no equivale a una accion terapeutica. La separacion protege la calidad de la metrica.

### 9.3 Por que usar un feed transversal de eventos

Porque varios modulos generan actividad distinta, y el sistema necesitaba una vista comun sin acoplar el dashboard a cada coleccion individual.

### 9.4 Por que usar heuristicas simples

Porque en este contexto:

- son mas auditables
- son mas faciles de explicar
- reducen ambiguedad
- no dependen de modelos opacos

## 10. Rendimiento y robustez

Mejoras aplicadas:

- Queries con `orderBy` + `limit`.
- Feed de actividad con corte acotado.
- Filtrado semanal en cliente sobre un conjunto ya limitado.
- Writes no bloqueantes con degradacion segura.
- Reglas de Firestore ajustadas para `progressEvents`.

Resultado:

- menos lecturas innecesarias
- menor riesgo de caida por errores secundarios
- mejor experiencia en tiempo real

## 11. Cobertura funcional ya integrada

La solucion ya conecta con progreso real a:

- Check-In
- Observer
- Exposure
- Grounding
- Regulation
- Reprogram
- Medical Support
- Wellness

Ademas:

- Dashboard consume actividad real reciente.
- Progress separa metricas reales de engagement.
- Ambos muestran resumen semanal util.

## 12. Limitaciones actuales

- El sistema usa reglas heuristicas, no inferencia clinica avanzada.
- El resumen semanal depende de eventos ya persistidos; si un modulo no registra eventos utiles, no aparecera correctamente.
- El modelo actual privilegia explicabilidad sobre sofisticacion estadistica.

## 13. Archivos tecnicos clave

```text
src/lib/mental-check-in.ts
src/lib/check-in-records.ts
src/lib/progress-checkups.ts
src/lib/progress-events.ts
src/lib/thought-records.ts
src/hooks/use-track-module-activity.ts
src/firebase/non-blocking-updates.tsx
src/app/(app)/dashboard/page.tsx
src/app/(app)/progress/page.tsx
src/models/progress-event.ts
firestore.rules
```

## 14. Conclusion

NeuroQuest evoluciono desde un conjunto de modulos independientes hacia una arquitectura unificada de progreso transversal. La clave de la solucion es la combinacion de:

- persistencia atomica en operaciones importantes
- feed comun de actividad
- separacion entre engagement y progreso real
- dashboard accionable
- resumen semanal consistente
- degradacion segura ante errores secundarios

Eso hace que la plataforma sea mas coherente, mas medible, mas estable y mas util para usuarios y seguimiento profesional.
