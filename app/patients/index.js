"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientsPage;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
function getPatients() {
    if (typeof window === 'undefined')
        return [];
    const data = sessionStorage.getItem('patients');
    return data ? JSON.parse(data).map((p) => ({ id: p.id, name: p.name })) : [];
}
function PatientsPage() {
    const [patients, setPatients] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        setPatients(getPatients());
    }, []);
    return (<div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl mb-4">Pacientes</h1>
      <link_1.default href="/new-patient" className="bg-green-600 hover:bg-green-700 p-2 rounded">Novo Paciente</link_1.default>
      <ul className="mt-4">
        {patients.map(p => (<li key={p.id} className="border-b border-gray-700 py-2">
            <link_1.default href={`/patients/${p.id}`}>{p.name}</link_1.default>
          </li>))}
      </ul>
    </div>);
}
