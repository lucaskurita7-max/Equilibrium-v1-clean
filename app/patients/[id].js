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
exports.default = PatientDetailPage;
const react_1 = __importStar(require("react"));
const router_1 = require("next/router");
const dietEngine_1 = require("../../src/core/diet/dietEngine");
const pdf_1 = require("../../src/core/diet/pdf");
function PatientDetailPage() {
    const router = (0, router_1.useRouter)();
    const { id } = router.query;
    const [patient, setPatient] = (0, react_1.useState)(null);
    const [dietPlan, setDietPlan] = (0, react_1.useState)(null);
    const [pdfLink, setPdfLink] = (0, react_1.useState)(null);
    // Carrega dados do paciente do sessionStorage
    (0, react_1.useEffect)(() => {
        if (!id || typeof window === 'undefined')
            return;
        const data = sessionStorage.getItem('patients');
        if (data) {
            const list = JSON.parse(data);
            const found = list.find(p => p.id === Number(id));
            if (found) {
                setPatient(found);
                // se já tiver dieta salva, carrega
                if (found.diet) {
                    setDietPlan(found.diet);
                }
            }
        }
    }, [id]);
    // Gera dieta e salva no sessionStorage
    const handleGenerateDiet = () => {
        if (!patient)
            return;
        const plan = (0, dietEngine_1.generateDietPlan)(patient.metabolic);
        setDietPlan(plan);
        // Persiste no sessionStorage
        if (typeof window !== 'undefined') {
            const data = sessionStorage.getItem('patients');
            const list = data ? JSON.parse(data) : [];
            const idx = list.findIndex((p) => p.id === patient.id);
            if (idx >= 0) {
                list[idx].diet = plan;
                sessionStorage.setItem('patients', JSON.stringify(list));
            }
        }
    };
    // Exporta PDF usando a API interna
    const handleExportPdf = async () => {
        if (!patient || !dietPlan)
            return;
        // Construir dados do paciente para PDF
        const patientInfo = {
            name: patient.name,
            date: new Date().toISOString().split('T')[0],
            pesoKg: patient.input.pesoKg,
            alturaM: patient.input.alturaM,
            bfPercent: patient.input.bfPercent,
        };
        const buffer = await (0, pdf_1.exportDietPdf)(patientInfo, patient.metabolic, dietPlan);
        // Criar URL para download
        const blob = new Blob([buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfLink(url);
    };
    if (!patient) {
        return (<div className="min-h-screen bg-gray-900 text-white p-6">
        <p>Carregando paciente...</p>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl mb-4">Paciente: {patient.name}</h1>
      {/* Dados básicos */}
      <div className="mb-4">
        <h2 className="text-xl">Dados</h2>
        <p>ID: {patient.id}</p>
        <p>Peso: {patient.input.pesoKg} kg</p>
        <p>Altura: {patient.input.alturaM} m</p>
        <p>Objetivo: {patient.input.objetivo}</p>
        <p>Nível de atividade: {patient.input.nivelAtividade}</p>
        <p>Esporte: {patient.input.sport}</p>
      </div>
      {/* Resultado metabólico */}
      <div className="mb-4">
        <h2 className="text-xl">Resultado Metabólico</h2>
        <p>Metodologia: {patient.metabolic.bmrMethod}</p>
        <p>TMB: {patient.metabolic.bmr.toFixed(0)} kcal</p>
        <p>GET: {patient.metabolic.tdee.toFixed(0)} kcal</p>
        <p>Kcal alvo: {patient.metabolic.kcalTarget.toFixed(0)} kcal</p>
        <p>Proteína: {patient.metabolic.proteinG} g</p>
        <p>Gordura: {patient.metabolic.fatG} g</p>
        <p>Carboidrato: {patient.metabolic.carbG} g</p>
        {patient.metabolic.warnings.length > 0 && (<div className="mt-2 text-yellow-400">
            <h3>Avisos:</h3>
            <ul>
              {patient.metabolic.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
            </ul>
          </div>)}
      </div>
      {/* Botões de ação */}
      <div className="mb-4 space-x-4">
        <button onClick={handleGenerateDiet} className="bg-blue-600 hover:bg-blue-700 p-2 rounded">
          Gerar Dieta
        </button>
        <button onClick={handleExportPdf} className="bg-purple-600 hover:bg-purple-700 p-2 rounded" disabled={!dietPlan}>
          Exportar PDF
        </button>
        {pdfLink && (<a href={pdfLink} download={`plano_${patient.id}.pdf`} className="ml-2 text-blue-300 underline">
            Baixar PDF
          </a>)}
      </div>
      {/* Plano de dieta exibido */}
      {dietPlan && (<div>
          <h2 className="text-xl mb-2">Plano de Dieta</h2>
          {dietPlan.meals.map((meal, idx) => (<div key={idx} className="mb-3">
              <h3 className="font-semibold">{meal.name} — {meal.kcal.toFixed(0)} kcal</h3>
              <ul className="ml-4 list-disc">
                {meal.items.map((it, i) => (<li key={i}>{it.nome} — {it.quantity}{it.unit}</li>))}
              </ul>
            </div>))}
        </div>)}
    </div>);
}
