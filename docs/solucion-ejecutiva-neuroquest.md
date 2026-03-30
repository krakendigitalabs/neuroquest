# NeuroQuest

## Documento Ejecutivo

Resumen funcional y tecnico de alto nivel para presentacion a cliente, aliados o direccion.

## 1. Que es NeuroQuest

NeuroQuest es una plataforma web de apoyo y seguimiento en bienestar mental que organiza check-ins, modulos de trabajo personal, visualizacion de progreso, apoyo preventivo y monitoreo profesional.

La solucion no se limita a mostrar paginas. Convierte acciones reales del usuario en una lectura clara de avance, actividad semanal y siguiente paso recomendado.

## 2. Problema que resuelve

Antes de esta arquitectura, los modulos podian existir como piezas aisladas:

- un check-in por un lado
- ejercicios por otro
- progreso separado
- dashboard sin suficiente contexto operativo

El problema era de coherencia:

- no toda la actividad quedaba reflejada
- abrir un modulo podia confundirse con progreso real
- el dashboard no siempre orientaba el siguiente paso
- las metricas podian inflarse o quedar incompletas

NeuroQuest resuelve eso unificando la actividad transversal del usuario.

## 3. Resultado principal de la solucion

La plataforma ahora logra cuatro cosas a la vez:

1. Registrar acciones terapeuticas o de apoyo en tiempo real.
2. Separar progreso real de simple navegacion.
3. Mostrar un resumen semanal entendible.
4. Volver el dashboard accionable.

## 4. Componentes principales

### 4.1 Check-In Mental

Recoge respuestas, calcula score, clasifica severidad y actualiza el estado actual del usuario.

### 4.2 Observer

Permite registrar pensamientos y convertirlos en informacion util para seguimiento.

### 4.3 Exposure

Gestiona misiones y su estado de avance.

### 4.4 Grounding, Regulation y Reprogram

Registran acciones concretas de apoyo emocional, respiracion, reestructuracion y regulacion.

### 4.5 Medical Support y Wellness

Concentran orientacion preventiva y apoyo estructurado, sin contar solo la apertura del modulo como progreso.

### 4.6 Progress

Consolida actividad real, engagement, tendencias, historia reciente y resumen semanal.

### 4.7 Dashboard

Muestra estado actual, actividad reciente, resumen semanal y recomienda el siguiente paso mas util.

## 5. La idea central del sistema

La solucion gira sobre un principio:

```text
No toda interaccion es progreso real.
```

Por eso NeuroQuest separa dos cosas:

- `engagement`: el usuario entro o abrio un modulo
- `progreso real`: el usuario hizo una accion significativa

Ese cambio mejora calidad de metrica, lectura clinica y utilidad del dashboard.

## 6. Como funciona en terminos simples

### Paso 1

El usuario entra a un modulo y realiza una accion:

- guardar un check-in
- registrar un pensamiento
- completar una mision
- iniciar una practica
- revisar una rutina

### Paso 2

El sistema guarda la informacion principal en Firestore.

### Paso 3

El sistema registra un evento comun de actividad.

### Paso 4

Dashboard y Progress leen esos eventos y reflejan:

- actividad reciente
- modulos activos
- resumen semanal
- recomendacion de siguiente paso

## 7. Beneficios de negocio y producto

### 7.1 Lectura mas confiable

La metrica ya no se infla solo por abrir paginas.

### 7.2 Mejor experiencia del usuario

El dashboard ya no solo muestra datos; orienta.

### 7.3 Mejor seguimiento profesional

La actividad transversal y el historial dan mas contexto para revisar evolucion.

### 7.4 Escalabilidad funcional

Nuevos modulos pueden conectarse al feed comun de eventos sin rehacer toda la logica del dashboard.

## 8. Logica funcional resumida

### Check-In

- suma respuestas
- calcula score
- asigna severidad
- actualiza el estado actual del usuario

### Progress

- separa actividad significativa de aperturas
- calcula tendencia por bloques recientes
- cuenta actividad util por modulo
- resume ultimos 7 dias

### Dashboard

- revisa severidad actual
- revisa ultima actividad util
- define el siguiente paso recomendado

## 9. Flujograma ejecutivo

```text
[Usuario]
   |
   v
[Realiza accion en un modulo]
   |
   v
[Sistema guarda dato principal]
   |
   v
[Sistema registra evento comun]
   |
   +--> [Progress actualiza metricas]
   |
   +--> [Dashboard actualiza actividad y siguiente paso]
```

## 10. Que ya quedo resuelto en esta solucion

- conexion de progreso con los modulos relevantes
- separacion entre engagement y progreso real
- correccion de errores por permisos en writes no bloqueantes
- optimizacion de queries
- resumen semanal real en dashboard y progress
- dashboard con recomendacion accionable

## 11. Valor tecnico

La arquitectura es simple de explicar, facil de mantener y suficientemente robusta para crecer.

Puntos fuertes:

- logica auditable
- menos acoplamiento entre modulos
- mejor tolerancia a fallos secundarios
- rendimiento mas controlado
- base lista para futuras capacidades

## 12. Conclusion ejecutiva

NeuroQuest ya no funciona como un conjunto de pantallas separadas. Ahora opera como una plataforma coherente donde la actividad del usuario se transforma en estado, seguimiento, resumen semanal y orientacion accionable.

Ese cambio mejora tanto la experiencia de usuario como la capacidad de seguimiento del producto.
