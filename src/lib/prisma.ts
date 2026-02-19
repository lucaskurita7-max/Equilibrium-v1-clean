/*
 * Simulação de um cliente Prisma para persistência local.
 *
 * Este módulo fornece uma classe `PrismaClient` que implementa
 * operações semelhantes às de um ORM (create, findUnique, findMany,
 * update) usando um arquivo JSON como banco de dados.  A escolha de
 * persistir em disco permite que dados criados durante os testes
 * sobrevivam a reinicializações da aplicação, atendendo aos requisitos
 * de persistência da Sprint 04 sem depender de serviços externos.
 *
 * Estrutura do arquivo de banco (`dbFile`):
 * {
 *   users: User[],
 *   patients: Patient[],
 *   metabolicPlans: MetabolicPlan[],
 *   dietPlans: DietPlan[]
 * }
 *
 * Cada entidade possui um `id` único (cuid), e relacionamentos são
 * representados pelos campos `userId` ou `patientId` conforme
 * necessário.
 */

import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';

// Caminho do arquivo que armazena o banco de dados.  O arquivo é
// armazenado no diretório raiz do projeto para simplicidade.  Se não
// existir, será criado automaticamente.
const dbFile = path.join(__dirname, '..', '..', '..', 'database.json');

// Tipos de dados usados nesta implementação.  Não são os tipos
// completos do Prisma, mas suficientes para os testes e lógica de
// persistência.
interface User {
  id: string;
  name?: string;
  email: string;
  password: string;
  createdAt: string;
}

interface Patient {
  id: string;
  name: string;
  sex: string;
  birthDate: string;
  weight: number;
  height: number;
  goal: string;
  createdAt: string;
  userId: string;
}

interface MetabolicPlanRecord {
  id: string;
  data: any;
  patientId: string;
}

interface DietPlanRecord {
  id: string;
  data: any;
  patientId: string;
}

// Leitura inicial do banco ou criação de um novo arquivo vazio
function loadDatabase() {
  if (fs.existsSync(dbFile)) {
    const raw = fs.readFileSync(dbFile, 'utf8');
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Erro ao parsear banco, criando novo arquivo.');
    }
  }
  const empty = { users: [], patients: [], metabolicPlans: [], dietPlans: [] };
  fs.writeFileSync(dbFile, JSON.stringify(empty, null, 2));
  return empty;
}

// Função auxiliar para salvar o banco de dados.  Usa escrita
// síncrona para simplificar o fluxo.
function saveDatabase(db: any) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

// Gera identificadores únicos usando cuid (componente randomBytes).
function cuid() {
  return randomBytes(10).toString('hex');
}

// Classe que simula o cliente Prisma.  Cada instância carrega o banco
// de um arquivo e mantém os dados em memória.  As operações
// modificadoras atualizam o arquivo imediatamente.
export class PrismaClient {
  private db: { users: User[]; patients: Patient[]; metabolicPlans: MetabolicPlanRecord[]; dietPlans: DietPlanRecord[] };

  constructor() {
    this.db = loadDatabase();
  }

  // Model User
  user = {
    create: async ({ data }: { data: Omit<User, 'id' | 'createdAt'> }) => {
      // Verificar e-mail único
      if (this.db.users.some(u => u.email === data.email)) {
        throw new Error('Email já cadastrado');
      }
      const newUser: User = {
        id: cuid(),
        name: data.name,
        email: data.email,
        password: data.password,
        createdAt: new Date().toISOString(),
      };
      this.db.users.push(newUser);
      saveDatabase(this.db);
      return newUser;
    },
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id) {
        return this.db.users.find(u => u.id === where.id) || null;
      }
      if (where.email) {
        return this.db.users.find(u => u.email === where.email) || null;
      }
      return null;
    },
  };

  // Model Patient
  patient = {
    create: async ({ data }: { data: Omit<Patient, 'id' | 'createdAt'> }) => {
      const newPatient: Patient = {
        id: cuid(),
        name: data.name,
        sex: data.sex,
        birthDate: data.birthDate,
        weight: data.weight,
        height: data.height,
        goal: data.goal,
        userId: data.userId,
        createdAt: new Date().toISOString(),
      };
      this.db.patients.push(newPatient);
      saveDatabase(this.db);
      return newPatient;
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: { metabolicPlan?: boolean; dietPlan?: boolean } }) => {
      const pat = this.db.patients.find(p => p.id === where.id) || null;
      if (!pat) return null;
      const result: any = { ...pat };
      if (include?.metabolicPlan) {
        result.metabolicPlan = this.db.metabolicPlans.find(mp => mp.patientId === pat.id) || null;
      }
      if (include?.dietPlan) {
        result.dietPlan = this.db.dietPlans.find(dp => dp.patientId === pat.id) || null;
      }
      return result;
    },
    findMany: async ({ where, include }: { where: { userId?: string }; include?: { metabolicPlan?: boolean; dietPlan?: boolean } }) => {
      const list = this.db.patients.filter(p => (where.userId ? p.userId === where.userId : true));
      return list.map(p => {
        const result: any = { ...p };
        if (include?.metabolicPlan) {
          result.metabolicPlan = this.db.metabolicPlans.find(mp => mp.patientId === p.id) || null;
        }
        if (include?.dietPlan) {
          result.dietPlan = this.db.dietPlans.find(dp => dp.patientId === p.id) || null;
        }
        return result;
      });
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Omit<Patient, 'id'>> }) => {
      const idx = this.db.patients.findIndex(p => p.id === where.id);
      if (idx < 0) throw new Error('Paciente não encontrado');
      this.db.patients[idx] = { ...this.db.patients[idx], ...data };
      saveDatabase(this.db);
      return this.db.patients[idx];
    },
  };

  // Model MetabolicPlan
  metabolicPlan = {
    create: async ({ data }: { data: Omit<MetabolicPlanRecord, 'id'> }) => {
      // Garante unicidade por patientId
      const existing = this.db.metabolicPlans.find(mp => mp.patientId === data.patientId);
      if (existing) {
        existing.data = data.data;
        saveDatabase(this.db);
        return existing;
      }
      const record: MetabolicPlanRecord = { id: cuid(), data: data.data, patientId: data.patientId };
      this.db.metabolicPlans.push(record);
      saveDatabase(this.db);
      return record;
    },
    findUnique: async ({ where }: { where: { patientId: string } }) => {
      return this.db.metabolicPlans.find(mp => mp.patientId === where.patientId) || null;
    },
  };

  // Model DietPlan
  dietPlan = {
    create: async ({ data }: { data: Omit<DietPlanRecord, 'id'> }) => {
      const existing = this.db.dietPlans.find(dp => dp.patientId === data.patientId);
      if (existing) {
        existing.data = data.data;
        saveDatabase(this.db);
        return existing;
      }
      const record: DietPlanRecord = { id: cuid(), data: data.data, patientId: data.patientId };
      this.db.dietPlans.push(record);
      saveDatabase(this.db);
      return record;
    },
    findUnique: async ({ where }: { where: { patientId: string } }) => {
      return this.db.dietPlans.find(dp => dp.patientId === where.patientId) || null;
    },
  };

  // Função para limpar banco (usada nos testes)
  async reset() {
    this.db = { users: [], patients: [], metabolicPlans: [], dietPlans: [] };
    saveDatabase(this.db);
  }
}