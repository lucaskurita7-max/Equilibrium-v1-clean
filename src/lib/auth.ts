/*
 * Módulo de autenticação simplificado para a Sprint 04.
 *
 * Fornece funções para registro de usuários, login com
 * verificação de senha e gerenciamento de sessões.  Em vez de usar
 * NextAuth, esta implementação mínima escreve os dados em um
 * arquivo JSON para garantir persistência.  As senhas são
 * armazenadas como hash SHA256 para segurança básica.
 */

import { createHash, randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from './prisma';

// Caminho para armazenamento de sessões.  Cada sessão associa um token a
// um ID de usuário e um timestamp de criação.
const sessionsFile = path.join(__dirname, '..', '..', '..', 'sessions.json');

interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
}

// Carrega sessões salvas do disco
function loadSessions(): SessionRecord[] {
  if (fs.existsSync(sessionsFile)) {
    const raw = fs.readFileSync(sessionsFile, 'utf8');
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Erro ao carregar sessões; criando novo arquivo.');
    }
  }
  fs.writeFileSync(sessionsFile, JSON.stringify([], null, 2));
  return [];
}

// Persiste a lista de sessões em disco
function saveSessions(sessions: SessionRecord[]) {
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
}

// Cria um hash SHA256 da senha.  No futuro, usar bcrypt.
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Gera um token aleatório
function generateToken(): string {
  return randomBytes(16).toString('hex');
}

// Registro de usuário.  Verifica se e-mail já existe e cria um
// usuário com senha hash.
export async function registerUser(db: PrismaClient, { name, email, password }: { name?: string; email: string; password: string }) {
  const hashed = hashPassword(password);
  const user = await db.user.create({ data: { name, email, password: hashed } });
  return user;
}

// Login de usuário.  Retorna token de sessão se credenciais corretas.
export async function loginUser(db: PrismaClient, { email, password }: { email: string; password: string }) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error('Usuário não encontrado');
  const hashed = hashPassword(password);
  if (user.password !== hashed) throw new Error('Senha incorreta');
  // Criar sessão
  const sessions = loadSessions();
  // Verificar se já existe uma sessão para este usuário (pode manter várias)
  const token = generateToken();
  sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  saveSessions(sessions);
  return { token, userId: user.id };
}

// Obtém usuário associado a um token de sessão.  Retorna null se
// token inválido ou expirado.  Sessões são válidas indefinidamente
// nesta implementação.
export async function getUserFromSession(db: PrismaClient, token: string) {
  const sessions = loadSessions();
  const session = sessions.find(s => s.token === token);
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return user;
}

// Remove todas as sessões (usado nos testes)
export function clearSessions() {
  saveSessions([]);
}