#!/usr/bin/env node

require('dotenv').config();

const admin = require('firebase-admin');

const args = process.argv.slice(2);
const options = {
  prefix: 'localdemo',
  password: 'NeuroQuest123!',
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }

  if (arg === '--prefix') {
    options.prefix = args[index + 1] || options.prefix;
    index += 1;
    continue;
  }

  if (arg === '--password') {
    options.password = args[index + 1] || options.password;
    index += 1;
  }
}

main().catch((error) => {
  console.error('\nSeed failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing in .env');
  }

  initializeAdmin(projectId);

  const auth = admin.auth();
  const firestore = admin.firestore();

  const therapist = await ensureAuthUser(auth, {
    email: `${options.prefix}.therapist@example.com`,
    password: options.password,
    displayName: 'Dr. NeuroQuest',
  });

  const patientA = await ensureAuthUser(auth, {
    email: `${options.prefix}.patient.a@example.com`,
    password: options.password,
    displayName: 'Alicia Neuro',
  });

  const patientB = await ensureAuthUser(auth, {
    email: `${options.prefix}.patient.b@example.com`,
    password: options.password,
    displayName: 'Bruno Quest',
  });

  await seedTherapist(firestore, therapist.uid, [patientA.uid, patientB.uid]);
  await seedPatient(
    firestore,
    {
      uid: patientA.uid,
      email: patientA.email,
      displayName: patientA.displayName,
      latestCheckInScore: 11,
      latestCheckInLevel: 'severe',
      latestCheckInNote: 'Necesita seguimiento cercano por ansiedad intensa.',
      currentXp: 180,
      level: 3,
    },
    therapist.uid,
    [
      buildCheckup({
        id: `${options.prefix}-checkup-1`,
        daysAgo: 7,
        score: 8,
        level: 'moderate',
        note: 'Semana con compulsiones elevadas.',
      }),
      buildCheckup({
        id: `${options.prefix}-checkup-2`,
        daysAgo: 3,
        score: 10,
        level: 'severe',
        note: 'Insomnio y pensamientos intrusivos constantes.',
      }),
      buildCheckup({
        id: `${options.prefix}-checkup-3`,
        daysAgo: 0,
        score: 11,
        level: 'severe',
        note: 'Necesita seguimiento cercano por ansiedad intensa.',
      }),
    ],
    [
      buildThought({
        id: `${options.prefix}-thought-1`,
        daysAgo: 1,
        thoughtText: 'Si no reviso la puerta tres veces, algo malo va a pasar.',
        cognitiveLabel: 'Pensamiento TOC',
        associatedEmotion: 'Anxiety',
        intensity: 8,
      }),
      buildThought({
        id: `${options.prefix}-thought-2`,
        daysAgo: 0,
        thoughtText: 'No puedo dejar de pensar que contaminé todo.',
        cognitiveLabel: 'Catastrophizing',
        associatedEmotion: 'Fear',
        intensity: 9,
      }),
    ],
    [
      buildMission({
        id: `${options.prefix}-mission-1`,
        title: 'No revisar la cerradura',
        status: 'completed',
        daysAgo: 2,
        xpReward: 35,
      }),
      buildMission({
        id: `${options.prefix}-mission-2`,
        title: 'Tocar la mesa y esperar 10 minutos',
        status: 'active',
        daysAgo: 0,
        xpReward: 45,
      }),
    ]
  );

  await seedPatient(
    firestore,
    {
      uid: patientB.uid,
      email: patientB.email,
      displayName: patientB.displayName,
      latestCheckInScore: 3,
      latestCheckInLevel: 'mild',
      latestCheckInNote: 'Molestia leve y mejor tolerancia a la incertidumbre.',
      currentXp: 260,
      level: 4,
    },
    therapist.uid,
    [
      buildCheckup({
        id: `${options.prefix}-checkup-4`,
        daysAgo: 8,
        score: 5,
        level: 'moderate',
        note: 'Ansiedad al inicio de semana.',
      }),
      buildCheckup({
        id: `${options.prefix}-checkup-5`,
        daysAgo: 4,
        score: 4,
        level: 'mild',
        note: 'Buen progreso con exposición.',
      }),
      buildCheckup({
        id: `${options.prefix}-checkup-6`,
        daysAgo: 1,
        score: 3,
        level: 'mild',
        note: 'Molestia leve y mejor tolerancia a la incertidumbre.',
      }),
    ],
    [
      buildThought({
        id: `${options.prefix}-thought-3`,
        daysAgo: 2,
        thoughtText: 'Quizá dejé la estufa encendida.',
        cognitiveLabel: 'Rumination',
        associatedEmotion: 'Anxiety',
        intensity: 4,
      }),
    ],
    [
      buildMission({
        id: `${options.prefix}-mission-3`,
        title: 'Salir sin comprobar la estufa',
        status: 'completed',
        daysAgo: 1,
        xpReward: 40,
      }),
      buildMission({
        id: `${options.prefix}-mission-4`,
        title: 'Limitar el lavado de manos',
        status: 'pending',
        daysAgo: 0,
        xpReward: 30,
      }),
    ]
  );

  console.log('\nSeed completed.');
  console.log(`Project: ${projectId}`);
  console.log(`Therapist: ${therapist.email}`);
  console.log(`Patient A: ${patientA.email}`);
  console.log(`Patient B: ${patientB.email}`);
  console.log(`Password: ${options.password}`);
}

function printHelp() {
  console.log(`
Usage:
  npm run seed:firestore -- [--prefix localdemo] [--password NeuroQuest123!]

Requirements:
  - Set GOOGLE_APPLICATION_CREDENTIALS to a Firebase service account JSON file,
    or set FIREBASE_SERVICE_ACCOUNT_JSON with the raw JSON string.
  - .env must contain NEXT_PUBLIC_FIREBASE_PROJECT_ID.

What it seeds:
  - 1 therapist auth user + /therapists/{uid} + /roles_admin/{uid}
  - 2 patient auth users + /users/{uid}
  - mental_checkups, thoughtRecords and exposureMissions for each patient
  - denormalized latestCheckIn* fields on each user profile
`);
}

function initializeAdmin(projectId) {
  if (admin.apps.length > 0) {
    return;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
      projectId,
    });
    return;
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Missing credentials. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON before running the seed.');
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
}

async function ensureAuthUser(auth, user) {
  try {
    return await auth.getUserByEmail(user.email);
  } catch (error) {
    if (error && error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  return auth.createUser({
    email: user.email,
    password: user.password,
    displayName: user.displayName,
    emailVerified: true,
  });
}

async function seedTherapist(firestore, therapistId, patientIds) {
  const batch = firestore.batch();
  const now = admin.firestore.FieldValue.serverTimestamp();

  batch.set(
    firestore.doc(`therapists/${therapistId}`),
    {
      id: therapistId,
      email: `${options.prefix}.therapist@example.com`,
      displayName: 'Dr. NeuroQuest',
      specialization: 'ERP for OCD',
      patientIds,
      createdAt: now,
    },
    { merge: true }
  );

  batch.set(
    firestore.doc(`roles_admin/${therapistId}`),
    {
      grantedAt: now,
      source: 'seed-firestore',
    },
    { merge: true }
  );

  await batch.commit();
}

async function seedPatient(firestore, patient, therapistId, checkups, thoughts, missions) {
  const batch = firestore.batch();
  const createdAt = admin.firestore.FieldValue.serverTimestamp();
  const latestCheckInAt = timestampFromDaysAgo(0);

  batch.set(
    firestore.doc(`users/${patient.uid}`),
    {
      id: patient.uid,
      email: patient.email,
      displayName: patient.displayName,
      photoURL: '',
      level: patient.level,
      currentXp: patient.currentXp,
      xpToNextLevel: 500,
      therapistIds: [therapistId],
      isAdmin: false,
      isAnonymous: false,
      createdAt,
      latestCheckInScore: patient.latestCheckInScore,
      latestCheckInLevel: patient.latestCheckInLevel,
      latestCheckInAt,
      latestCheckInNote: patient.latestCheckInNote,
    },
    { merge: true }
  );

  for (const checkup of checkups) {
    batch.set(firestore.doc(`users/${patient.uid}/mental_checkups/${checkup.id}`), {
      ...checkup,
      userId: patient.uid,
      patientName: patient.displayName,
    });
  }

  for (const thought of thoughts) {
    batch.set(firestore.doc(`users/${patient.uid}/thoughtRecords/${thought.id}`), {
      ...thought,
      userId: patient.uid,
    });
  }

  for (const mission of missions) {
    batch.set(firestore.doc(`users/${patient.uid}/exposureMissions/${mission.id}`), {
      ...mission,
      userId: patient.uid,
      therapistId,
    });
  }

  await batch.commit();
}

function buildCheckup({ id, daysAgo, score, level, note }) {
  return {
    id,
    createdAt: timestampFromDaysAgo(daysAgo),
    score,
    maxScore: 12,
    level,
    resultTitle: `${capitalize(level)} check-in`,
    mission: level === 'severe' ? 'Reduce reassurance rituals today.' : 'Keep practicing uncertainty tolerance.',
    summary: `Sample ${level} check-in generated for local validation.`,
    answers: [
      { questionId: 1, question: 'Mood', value: Math.max(1, 5 - Math.floor(score / 3)) },
      { questionId: 2, question: 'Anxiety', value: Math.min(5, Math.ceil(score / 2)) },
      { questionId: 3, question: 'Energy', value: Math.max(1, 5 - Math.floor(score / 4)) },
      { questionId: 4, question: 'Sleep', value: Math.max(1, 5 - Math.floor(score / 4)) },
    ],
    recommendations: {
      daily: ['Log one intrusive thought without responding to it.'],
      family: ['Explain one trigger to a trusted relative.'],
      partner: ['Share one exposure goal for the week.'],
      work: ['Take a short grounding break after a trigger.'],
      study: ['Use a timer to resume work after intrusive thoughts.'],
      exercise: ['Walk for 10 minutes.'],
      readings: ['Read your exposure reminder card once today.'],
    },
    activatedModules: level === 'severe' ? ['observer', 'exposure', 'regulation'] : ['observer', 'exposure'],
    riskFlags: {
      selfHarmRisk: false,
      needsProfessionalSupport: level === 'severe',
    },
    professionalNote: note,
  };
}

function buildThought({ id, daysAgo, thoughtText, cognitiveLabel, associatedEmotion, intensity }) {
  return {
    id,
    recordedAt: timestampFromDaysAgo(daysAgo),
    thoughtText,
    cognitiveLabel,
    isFactNotThought: true,
    associatedEmotion,
    intensity,
    isIntrusive: true,
  };
}

function buildMission({ id, title, status, daysAgo, xpReward }) {
  const completed = status === 'completed';

  return {
    id,
    title,
    description: `Sample mission: ${title}`,
    difficultyLevel: completed ? 2 : 3,
    status,
    xpReward,
    completionDate: completed ? timestampFromDaysAgo(daysAgo) : null,
    assignedBy: 'Therapist',
    targetBehavior: title,
    resistanceTarget: completed ? 'Completed once without reassurance.' : 'Hold the urge for 10 minutes.',
    isAiGenerated: false,
    missionType: 'ERP',
    createdAt: timestampFromDaysAgo(daysAgo + 1),
  };
}

function timestampFromDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return admin.firestore.Timestamp.fromDate(date);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
