"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClient = void 0;
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Caminho do arquivo que armazena o banco de dados.  O arquivo é
// armazenado no diretório raiz do projeto para simplicidade.  Se não
// existir, será criado automaticamente.
const dbFile = path_1.default.join(__dirname, '..', '..', '..', 'database.json');
// Leitura inicial do banco ou criação de um novo arquivo vazio
function loadDatabase() {
    if (fs_1.default.existsSync(dbFile)) {
        const raw = fs_1.default.readFileSync(dbFile, 'utf8');
        try {
            return JSON.parse(raw);
        }
        catch (e) {
            console.warn('Erro ao parsear banco, criando novo arquivo.');
        }
    }
    const empty = { users: [], patients: [], metabolicPlans: [], dietPlans: [] };
    fs_1.default.writeFileSync(dbFile, JSON.stringify(empty, null, 2));
    return empty;
}
// Função auxiliar para salvar o banco de dados.  Usa escrita
// síncrona para simplificar o fluxo.
function saveDatabase(db) {
    fs_1.default.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}
// Gera identificadores únicos usando cuid (componente randomBytes).
function cuid() {
    return (0, crypto_1.randomBytes)(10).toString('hex');
}
// Classe que simula o cliente Prisma.  Cada instância carrega o banco
// de um arquivo e mantém os dados em memória.  As operações
// modificadoras atualizam o arquivo imediatamente.
class PrismaClient {
    constructor() {
        // Model User
        this.user = {
            create: async ({ data }) => {
                // Verificar e-mail único
                if (this.db.users.some(u => u.email === data.email)) {
                    throw new Error('Email já cadastrado');
                }
                const newUser = {
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
            findUnique: async ({ where }) => {
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
        this.patient = {
            create: async ({ data }) => {
                const newPatient = {
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
            findUnique: async ({ where, include }) => {
                const pat = this.db.patients.find(p => p.id === where.id) || null;
                if (!pat)
                    return null;
                const result = { ...pat };
                if (include === null || include === void 0 ? void 0 : include.metabolicPlan) {
                    result.metabolicPlan = this.db.metabolicPlans.find(mp => mp.patientId === pat.id) || null;
                }
                if (include === null || include === void 0 ? void 0 : include.dietPlan) {
                    result.dietPlan = this.db.dietPlans.find(dp => dp.patientId === pat.id) || null;
                }
                return result;
            },
            findMany: async ({ where, include }) => {
                const list = this.db.patients.filter(p => (where.userId ? p.userId === where.userId : true));
                return list.map(p => {
                    const result = { ...p };
                    if (include === null || include === void 0 ? void 0 : include.metabolicPlan) {
                        result.metabolicPlan = this.db.metabolicPlans.find(mp => mp.patientId === p.id) || null;
                    }
                    if (include === null || include === void 0 ? void 0 : include.dietPlan) {
                        result.dietPlan = this.db.dietPlans.find(dp => dp.patientId === p.id) || null;
                    }
                    return result;
                });
            },
            update: async ({ where, data }) => {
                const idx = this.db.patients.findIndex(p => p.id === where.id);
                if (idx < 0)
                    throw new Error('Paciente não encontrado');
                this.db.patients[idx] = { ...this.db.patients[idx], ...data };
                saveDatabase(this.db);
                return this.db.patients[idx];
            },
        };
        // Model MetabolicPlan
        this.metabolicPlan = {
            create: async ({ data }) => {
                // Garante unicidade por patientId
                const existing = this.db.metabolicPlans.find(mp => mp.patientId === data.patientId);
                if (existing) {
                    existing.data = data.data;
                    saveDatabase(this.db);
                    return existing;
                }
                const record = { id: cuid(), data: data.data, patientId: data.patientId };
                this.db.metabolicPlans.push(record);
                saveDatabase(this.db);
                return record;
            },
            findUnique: async ({ where }) => {
                return this.db.metabolicPlans.find(mp => mp.patientId === where.patientId) || null;
            },
        };
        // Model DietPlan
        this.dietPlan = {
            create: async ({ data }) => {
                const existing = this.db.dietPlans.find(dp => dp.patientId === data.patientId);
                if (existing) {
                    existing.data = data.data;
                    saveDatabase(this.db);
                    return existing;
                }
                const record = { id: cuid(), data: data.data, patientId: data.patientId };
                this.db.dietPlans.push(record);
                saveDatabase(this.db);
                return record;
            },
            findUnique: async ({ where }) => {
                return this.db.dietPlans.find(dp => dp.patientId === where.patientId) || null;
            },
        };
        this.db = loadDatabase();
    }
    // Função para limpar banco (usada nos testes)
    async reset() {
        this.db = { users: [], patients: [], metabolicPlans: [], dietPlans: [] };
        saveDatabase(this.db);
    }
}
exports.PrismaClient = PrismaClient;
