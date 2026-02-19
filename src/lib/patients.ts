/*
 * Funções auxiliares para gerenciamento de pacientes, planos metabólicos
 * e dietas associadas a usuários.  Estas funções encapsulam a
 * lógica de persistência e integração com os motores de cálculo
 * metabólico e de dieta, garantindo que cada usuário acesse apenas
 * seus próprios registros.
 */

import { PrismaClient } from './prisma';
import { computeMetabolicPlan } from '../core/metabolic/metabolic';
import { generateDietPlan } from '../core/diet/dietEngine';
import { MetabolicInput } from '../core/metabolic/types';

// Tipo de dados necessários para criação de paciente via API
interface NewPatientData {
  name: string;
  sex: string;
  birthDate: Date;
  weight: number;
  height: number;
  goal: string;
  nivelAtividade: string;
  sport: string;
  bfPercent?: number;
  massaMagraKg?: number;
}

/**
 * Cria um paciente associado a um usuário, calcula o plano metabólico e
 * persiste tanto o paciente quanto o plano.  Retorna o paciente
 * armazenado, o resultado metabólico e o plano de dieta (opcional).
 */
export async function createPatientWithPlans(db: PrismaClient, userId: string, patient: NewPatientData) {
  // 1. Criar paciente
  const newPat = await db.patient.create({
    data: {
      name: patient.name,
      sex: patient.sex,
      birthDate: patient.birthDate.toISOString(),
      weight: patient.weight,
      height: patient.height,
      goal: patient.goal,
      userId,
    },
  });
  // 2. Construir entrada para cálculo metabólico
  const metabolicInput: MetabolicInput = {
    sexo: patient.sex as any,
    idade: calculateAge(patient.birthDate),
    pesoKg: patient.weight,
    alturaM: patient.height,
    objetivo: patient.goal as any,
    nivelAtividade: patient.nivelAtividade as any,
    sport: patient.sport as any,
    bfPercent: patient.bfPercent,
    massaMagraKg: patient.massaMagraKg,
  };
  const metabolic = computeMetabolicPlan(metabolicInput);
  // 3. Persistir plano metabólico
  await db.metabolicPlan.create({ data: { data: metabolic, patientId: newPat.id } });
  // 4. Gerar plano de dieta básico (pode ser chamado separadamente)
  const diet = generateDietPlan(metabolic);
  await db.dietPlan.create({ data: { data: diet, patientId: newPat.id } });
  return { patient: newPat, metabolic, diet };
}

// Calcula idade a partir da data de nascimento.
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Recupera todos os pacientes de um usuário.  Pode incluir planos
 * metabólicos e dietas se solicitado.
 */
export async function getPatients(db: PrismaClient, userId: string, opts?: { includePlans?: boolean }) {
  return db.patient.findMany({ where: { userId }, include: opts?.includePlans ? { metabolicPlan: true, dietPlan: true } : undefined });
}

/**
 * Recupera um paciente específico de um usuário.  Se o paciente não
 * pertencer ao usuário, retorna null.
 */
export async function getPatientById(db: PrismaClient, userId: string, patientId: string, opts?: { includePlans?: boolean }) {
  const pat = await db.patient.findUnique({ where: { id: patientId }, include: opts?.includePlans ? { metabolicPlan: true, dietPlan: true } : undefined });
  if (!pat || pat.userId !== userId) return null;
  return pat;
}

/**
 * Regenera a dieta de um paciente com base em seu plano metabólico
 * armazenado.  Atualiza o registro no banco.
 */
export async function regenerateDiet(db: PrismaClient, patientId: string) {
  const mp = await db.metabolicPlan.findUnique({ where: { patientId } });
  if (!mp) throw new Error('Plano metabólico não encontrado');
  const diet = generateDietPlan(mp.data);
  await db.dietPlan.create({ data: { data: diet, patientId } });
  return diet;
}