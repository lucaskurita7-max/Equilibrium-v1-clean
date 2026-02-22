"use strict";
/*
 * Funções auxiliares para gerenciamento de pacientes, planos metabólicos
 * e dietas associadas a usuários.  Estas funções encapsulam a
 * lógica de persistência e integração com os motores de cálculo
 * metabólico e de dieta, garantindo que cada usuário acesse apenas
 * seus próprios registros.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPatientWithPlans = createPatientWithPlans;
exports.getPatients = getPatients;
exports.getPatientById = getPatientById;
exports.regenerateDiet = regenerateDiet;
const metabolic_1 = require("../core/metabolic/metabolic");
const dietEngine_1 = require("../core/diet/dietEngine");
/**
 * Cria um paciente associado a um usuário, calcula o plano metabólico e
 * persiste tanto o paciente quanto o plano.  Retorna o paciente
 * armazenado, o resultado metabólico e o plano de dieta (opcional).
 */
async function createPatientWithPlans(db, userId, patient) {
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
    const metabolicInput = {
        sexo: patient.sex,
        idade: calculateAge(patient.birthDate),
        pesoKg: patient.weight,
        alturaM: patient.height,
        objetivo: patient.goal,
        nivelAtividade: patient.nivelAtividade,
        sport: patient.sport,
        bfPercent: patient.bfPercent,
        massaMagraKg: patient.massaMagraKg,
    };
    const metabolic = (0, metabolic_1.computeMetabolicPlan)(metabolicInput);
    // 3. Persistir plano metabólico
    await db.metabolicPlan.create({ data: { data: metabolic, patientId: newPat.id } });
    // 4. Gerar plano de dieta básico (pode ser chamado separadamente)
    const diet = (0, dietEngine_1.generateDietPlan)(metabolic);
    await db.dietPlan.create({ data: { data: diet, patientId: newPat.id } });
    return { patient: newPat, metabolic, diet };
}
// Calcula idade a partir da data de nascimento.
function calculateAge(birthDate) {
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
async function getPatients(db, userId, opts) {
    return db.patient.findMany({ where: { userId }, include: (opts === null || opts === void 0 ? void 0 : opts.includePlans) ? { metabolicPlan: true, dietPlan: true } : undefined });
}
/**
 * Recupera um paciente específico de um usuário.  Se o paciente não
 * pertencer ao usuário, retorna null.
 */
async function getPatientById(db, userId, patientId, opts) {
    const pat = await db.patient.findUnique({ where: { id: patientId }, include: (opts === null || opts === void 0 ? void 0 : opts.includePlans) ? { metabolicPlan: true, dietPlan: true } : undefined });
    if (!pat || pat.userId !== userId)
        return null;
    return pat;
}
/**
 * Regenera a dieta de um paciente com base em seu plano metabólico
 * armazenado.  Atualiza o registro no banco.
 */
async function regenerateDiet(db, patientId) {
    const mp = await db.metabolicPlan.findUnique({ where: { patientId } });
    if (!mp)
        throw new Error('Plano metabólico não encontrado');
    const diet = (0, dietEngine_1.generateDietPlan)(mp.data);
    await db.dietPlan.create({ data: { data: diet, patientId } });
    return diet;
}
