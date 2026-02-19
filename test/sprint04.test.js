const assert = require('assert');
const { PrismaClient } = require('../build/lib/prisma');
const { registerUser, loginUser, getUserFromSession, clearSessions } = require('../build/lib/auth');
const { createPatientWithPlans, getPatients, getPatientById, regenerateDiet } = require('../build/lib/patients');
const { generatePdf } = require('../build/api/pdf');

/*
  Testes da Sprint 04 – Persistência real, autenticação e multi‑tenant.

  Para garantir que os testes sejam executados em ordem e sem
  concorrência, usamos uma função assíncrona `run` que executa cada
  cenário sequencialmente usando `await`.  Isso evita que um reset
  concomitante do banco de dados afete outros testes.
*/

async function resetEnvironment(db) {
  await db.reset();
  clearSessions();
}

async function testAuthentication() {
  const db = new PrismaClient();
  await resetEnvironment(db);
  const user = await registerUser(db, { name: 'Nutri A', email: 'a@example.com', password: 'senha123' });
  assert(user.id);
  const session = await loginUser(db, { email: 'a@example.com', password: 'senha123' });
  assert(session.token);
  const me = await getUserFromSession(db, session.token);
  assert(me && me.email === 'a@example.com');
}

async function testMultiTenant() {
  const db = new PrismaClient();
  await resetEnvironment(db);
  const userA = await registerUser(db, { name: 'A', email: 'a@ex.com', password: 'pass' });
  const userB = await registerUser(db, { name: 'B', email: 'b@ex.com', password: 'pass' });
  const { patient: patA } = await createPatientWithPlans(db, userA.id, {
    name: 'Paciente A',
    sex: 'F',
    birthDate: new Date('1990-01-01'),
    weight: 60,
    height: 1.65,
    goal: 'Emagrecimento',
    nivelAtividade: 'Moderado',
    sport: 'Fitness',
  });
  const { patient: patB } = await createPatientWithPlans(db, userB.id, {
    name: 'Paciente B',
    sex: 'M',
    birthDate: new Date('1985-06-15'),
    weight: 80,
    height: 1.80,
    goal: 'Hipertrofia',
    nivelAtividade: 'Alto',
    sport: 'ForcaHipertrofia',
  });
  const listA = await getPatients(db, userA.id);
  assert.strictEqual(listA.length, 1);
  assert.strictEqual(listA[0].id, patA.id);
  const listB = await getPatients(db, userB.id);
  assert.strictEqual(listB.length, 1);
  assert.strictEqual(listB[0].id, patB.id);
}

async function testPersistence() {
  const db = new PrismaClient();
  await resetEnvironment(db);
  const user = await registerUser(db, { name: 'C', email: 'c@ex.com', password: 'pass' });
  const { patient, metabolic, diet } = await createPatientWithPlans(db, user.id, {
    name: 'Paciente Persist',
    sex: 'F',
    birthDate: new Date('1992-02-02'),
    weight: 55,
    height: 1.60,
    goal: 'Recomposicao',
    nivelAtividade: 'Moderado',
    sport: 'Fitness',
  });
  // Recarregar banco
  const db2 = new PrismaClient();
  const retrieved = await getPatientById(db2, user.id, patient.id, { includePlans: true });
  assert(retrieved, 'Paciente deve existir após reload');
  assert(retrieved.metabolicPlan, 'Plano metabólico deve ser salvo');
  assert(retrieved.dietPlan, 'Plano de dieta deve ser salvo');
  assert(Math.round(retrieved.metabolicPlan.data.kcalTarget) === Math.round(metabolic.kcalTarget));
  assert(retrieved.dietPlan.data.meals.length === diet.meals.length);
}

async function testPdfGeneration() {
  const db = new PrismaClient();
  await resetEnvironment(db);
  const user = await registerUser(db, { name: 'D', email: 'd@ex.com', password: 'pass' });
  const { patient, metabolic, diet } = await createPatientWithPlans(db, user.id, {
    name: 'Paciente PDF',
    sex: 'M',
    birthDate: new Date('1991-07-07'),
    weight: 70,
    height: 1.75,
    goal: 'Performance',
    nivelAtividade: 'Leve',
    sport: 'Endurance',
  });
  const pdfBuffer = await generatePdf({
    patient: {
      name: patient.name,
      date: new Date().toISOString().split('T')[0],
      pesoKg: patient.weight,
      alturaM: patient.height,
      bfPercent: undefined,
    },
    metabolic,
    dietPlan: diet,
  });
  assert(pdfBuffer instanceof Buffer);
  assert(pdfBuffer.length > 0);
}

async function run() {
  await testAuthentication();
  await testMultiTenant();
  await testPersistence();
  await testPdfGeneration();
  console.log('All Sprint04 tests passed');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});