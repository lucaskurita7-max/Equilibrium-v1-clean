"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const react_1 = __importDefault(require("react"));
const link_1 = __importDefault(require("next/link"));
// Recupera pacientes da lista mock no localStorage (ou sessionStorage) por
// simplicidade.  No V1, utilizamos um array armazenado no sessionStorage.
function getPatients() {
    if (typeof window === 'undefined')
        return [];
    const data = sessionStorage.getItem('patients');
    return data ? JSON.parse(data) : [];
}
function DashboardPage() {
    const patients = getPatients();
    return (<div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <p className="mb-4">Pacientes cadastrados: {patients.length}</p>
      <link_1.default href="/new-patient" className="bg-green-600 hover:bg-green-700 p-2 rounded">Novo Paciente</link_1.default>
      <h2 className="text-xl mt-6 mb-2">Pacientes recentes</h2>
      <ul>
        {patients.slice(-5).map(p => (<li key={p.id} className="border-b border-gray-700 py-2">
            <link_1.default href={`/patients/${p.id}`}>{p.name}</link_1.default>
          </li>))}
      </ul>
    </div>);
}
