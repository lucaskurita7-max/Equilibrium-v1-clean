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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewPatientPage;
const react_1 = __importStar(require("react"));
const router_1 = require("next/router");
const metabolic_1 = require("../src/core/metabolic/metabolic");
function NewPatientPage() {
    const router = (0, router_1.useRouter)();
    const [form, setForm] = (0, react_1.useState)({
        name: '',
        birthDate: '',
        sexo: 'F',
        alturaM: '',
        pesoKg: '',
        objetivo: 'Emagrecimento',
        nivelAtividade: 'Sedentario',
        sport: 'Fitness',
        bfPercent: '',
        massaMagraKg: '',
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // Build metabolic input
        const input = {
            sexo: form.sexo,
            idade: form.birthDate ? Math.max(0, new Date().getFullYear() - new Date(form.birthDate).getFullYear()) : 0,
            pesoKg: parseFloat(form.pesoKg) || 0,
            alturaM: parseFloat(form.alturaM) || 0,
            sport: form.sport,
            nivelAtividade: form.nivelAtividade,
            objetivo: form.objetivo,
            bfPercent: form.bfPercent ? parseFloat(form.bfPercent) : undefined,
            massaMagraKg: form.massaMagraKg ? parseFloat(form.massaMagraKg) : undefined,
        };
        const metabolic = (0, metabolic_1.computeMetabolicPlan)(input);
        // Save patient in sessionStorage
        if (typeof window !== 'undefined') {
            const data = sessionStorage.getItem('patients');
            const patients = data ? JSON.parse(data) : [];
            const id = patients.length + 1;
            patients.push({ id, name: form.name, input, metabolic });
            sessionStorage.setItem('patients', JSON.stringify(patients));
            // Redirect to patient page
            router.push(`/patients/${id}`);
        }
    };
    return (<div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl mb-4">Novo Paciente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Nome:</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 bg-gray-700" required/>
        </div>
        <div>
          <label>Data de nascimento:</label>
          <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="w-full p-2 bg-gray-700"/>
        </div>
        <div>
          <label>Sexo:</label>
          <select name="sexo" value={form.sexo} onChange={handleChange} className="w-full p-2 bg-gray-700">
            <option value="F">Feminino</option>
            <option value="M">Masculino</option>
          </select>
        </div>
        <div>
          <label>Altura (m):</label>
          <input name="alturaM" value={form.alturaM} onChange={handleChange} className="w-full p-2 bg-gray-700" required/>
        </div>
        <div>
          <label>Peso (kg):</label>
          <input name="pesoKg" value={form.pesoKg} onChange={handleChange} className="w-full p-2 bg-gray-700" required/>
        </div>
        <div>
          <label>Objetivo:</label>
          <select name="objetivo" value={form.objetivo} onChange={handleChange} className="w-full p-2 bg-gray-700">
            <option value="Emagrecimento">Emagrecimento</option>
            <option value="Recomposicao">Recomposição</option>
            <option value="Hipertrofia">Hipertrofia</option>
            <option value="Performance">Performance</option>
          </select>
        </div>
        <div>
          <label>Nível de atividade:</label>
          <select name="nivelAtividade" value={form.nivelAtividade} onChange={handleChange} className="w-full p-2 bg-gray-700">
            <option value="Sedentario">Sedentário</option>
            <option value="Leve">Leve</option>
            <option value="Moderado">Moderado</option>
            <option value="Alto">Alto</option>
            <option value="MuitoAlto">Muito alto</option>
          </select>
        </div>
        <div>
          <label>Tipo de esporte:</label>
          <select name="sport" value={form.sport} onChange={handleChange} className="w-full p-2 bg-gray-700">
            <option value="Fitness">Fitness</option>
            <option value="Endurance">Endurance</option>
            <option value="Intermitente">Intermitente</option>
            <option value="ForcaHipertrofia">Força/hipertrofia</option>
            <option value="Clinico">Clínico</option>
          </select>
        </div>
        <div>
          <label>% Gordura (opcional):</label>
          <input name="bfPercent" value={form.bfPercent} onChange={handleChange} className="w-full p-2 bg-gray-700"/>
        </div>
        <div>
          <label>Massa magra (kg) (opcional):</label>
          <input name="massaMagraKg" value={form.massaMagraKg} onChange={handleChange} className="w-full p-2 bg-gray-700"/>
        </div>
        <button type="submit" className="bg-green-600 hover:bg-green-700 p-2 rounded">Gerar Planejamento</button>
      </form>
    </div>);
}
