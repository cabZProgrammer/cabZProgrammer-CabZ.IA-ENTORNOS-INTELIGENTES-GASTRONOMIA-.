/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  ChefHat,
  Package,
  ShoppingBag,
  Wallet,
  Bot,
  AlertTriangle,
  Flame,
  Clock,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  X,
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  Scale,
  FileText,
  Sparkles,
  Check
} from 'lucide-react';

// --- Types ---
type DomainId = 'Gestión' | 'Producción' | 'Inventario' | 'Comercial' | 'Finanzas';

type BatchStatus = 'En horno' | 'Preparación' | 'Completado';

interface ProductionBatch {
  id: string;
  lote: string;
  producto: string;
  detalle: string;
  unidades: number;
  temperatura: string;
  responsable: string;
  estado: BatchStatus;
  tiempoRestanteSegundos: number;
  tiempoTotalSegundos: number;
  hidratacion?: string;
}

interface CriticalAlert {
  id: string;
  titulo: string;
  detalle: string;
  modulo: DomainId;
  hora: string;
  accionRecomendada: string;
  resuelta: boolean;
}

interface DomainMetric {
  etiqueta: string;
  valor: string;
  contexto: string;
}

// --- Initial Data ---
const INITIAL_BATCHES: ProductionBatch[] = [
  {
    id: 'batch-1',
    lote: 'LOTE-0841',
    producto: 'Pan de Masa Madre',
    detalle: 'Hogaza rústica 850g · Fermentación 24h',
    unidades: 36,
    temperatura: '235 °C · Vapor 40%',
    responsable: 'C. Mendoza',
    estado: 'En horno',
    tiempoRestanteSegundos: 1125, // 18:45
    tiempoTotalSegundos: 2400,
    hidratacion: '78%'
  },
  {
    id: 'batch-2',
    lote: 'LOTE-0842',
    producto: 'Galletas Chocochip',
    detalle: 'Chocolate 70% Tumaco & escamas de sal',
    unidades: 120,
    temperatura: 'Mesa fría · Boleado',
    responsable: 'L. Valdivia',
    estado: 'Preparación',
    tiempoRestanteSegundos: 2530, // 42:10
    tiempoTotalSegundos: 3600,
    hidratacion: 'N/A'
  },
  {
    id: 'batch-3',
    lote: 'LOTE-0843',
    producto: 'Focaccia de Romero y Aceituna',
    detalle: 'Bandeja alta hidratación · Aceite extra virgen',
    unidades: 18,
    temperatura: '220 °C · Piso 2',
    responsable: 'M. Restrepo',
    estado: 'En horno',
    tiempoRestanteSegundos: 680, // 11:20
    tiempoTotalSegundos: 1800,
    hidratacion: '85%'
  }
];

const INITIAL_ALERTS: CriticalAlert[] = [
  {
    id: 'alert-1',
    titulo: 'Stock crítico: Harina de Fuerza T80',
    detalle: 'Disponible: 4,5 kg en tolva principal (Mínimo operativo: 25,0 kg)',
    modulo: 'Inventario',
    hora: 'Hace 6 min',
    accionRecomendada: 'Emitir orden urgente a Molino Santa Marta o reasignar lote secundario.',
    resuelta: false
  },
  {
    id: 'alert-2',
    titulo: 'Desviación térmica: Horno de Piso #2',
    detalle: 'Cámara superior registra 249 °C (+14 °C sobre curva de Pan de Masa Madre)',
    modulo: 'Producción',
    hora: 'Hace 2 min',
    accionRecomendada: 'Abrir tiro de chimenea al 60% y reducir potencia de solera durante 8 minutos.',
    resuelta: false
  }
];

const DOMAIN_SUMMARIES: Record<DomainId, { descripcion: string; metricas: DomainMetric[] }> = {
  Gestión: {
    descripcion: 'Vista consolidada de rendimiento diario, metas financieras y control de piso de producción.',
    metricas: [
      { etiqueta: 'Eficiencia de Obrador', valor: '94,2%', contexto: '3 lotes activos en tiempo nominal' },
      { etiqueta: 'Merma del Turno', valor: '1,1%', contexto: 'Por debajo del límite objetivo (2,5%)' },
      { etiqueta: 'Ticket Promedio', valor: '$24.550 COP', contexto: '116 órdenes facturadas hoy' }
    ]
  },
  Producción: {
    descripcion: 'Control directo de hornos, curvas de fermentación, asignación de maestros panaderos y tiempos de horneo.',
    metricas: [
      { etiqueta: 'Capacidad de Hornos', valor: '82,0%', contexto: 'Hornos de piso #1 y #2 activos' },
      { etiqueta: 'Cámara de Fermentación', valor: '4,2 °C · 79% HR', contexto: '140 piezas listas para mañana' },
      { etiqueta: 'Unidades en Curso', valor: '174 uds.', contexto: '3 lotes sincronizados en monitor' }
    ]
  },
  Inventario: {
    descripcion: 'Trazabilidad de harinas, mantequilla de pastoreo, chocolates de origen y empaques biodegradables.',
    metricas: [
      { etiqueta: 'Harina Trigo Orgánica T80', valor: '4,5 kg', contexto: 'Alerta de reposición inmediata' },
      { etiqueta: 'Mantequilla Extra Seca 84%', valor: '38,0 kg', contexto: 'Cobertura para 4 días de laminado' },
      { etiqueta: 'Chocolate 70% Origen', valor: '22,4 kg', contexto: 'Lote #CH-902 verificado' }
    ]
  },
  Comercial: {
    descripcion: 'Desempeño en punto de venta, pedidos corporativos B2B (cafés de especialidad y hoteles) y rotación.',
    metricas: [
      { etiqueta: 'Mostrador Principal', valor: '$1.920.000 COP', contexto: '67,4% del volumen del día' },
      { etiqueta: 'Cuentas B2B / Cafés', valor: '$927.500 COP', contexto: '8 entregas despachadas a las 06:30' },
      { etiqueta: 'Producto Líder', valor: 'Pan de Masa Madre', contexto: '64 hogazas vendidas hoy' }
    ]
  },
  Finanzas: {
    descripcion: 'Flujo de caja operativo, costo primo de materias primas (Food Cost) y margen bruto en tiempo real.',
    metricas: [
      { etiqueta: 'Food Cost Promedio', valor: '28,4%', contexto: 'Objetivo artesanal: ≤ 30,0%' },
      { etiqueta: 'Margen Operativo Día', valor: '$1.195.950 COP', contexto: '42,0% sobre ventas netas' },
      { etiqueta: 'Cuentas por Cobrar B2B', valor: '$1.450.000 COP', contexto: 'Vencimiento promedio: 7 días' }
    ]
  }
};

// --- Helper Functions ---
function formatCOP(amount: number): string {
  return '$' + Math.round(amount).toLocaleString('es-CO') + ' COP';
}

function formatSeconds(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function App() {
  // Navigation & UI state
  const [activeDomain, setActiveDomain] = useState<DomainId>('Gestión');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // KPI State
  const [dailySales, setDailySales] = useState<number>(2847500);
  const [monthlyGoal] = useState<number>(12000000);
  const [monthlyCurrent, setMonthlyCurrent] = useState<number>(8460000); // 70.5% of 12,000,000

  // Alerts State
  const [alerts, setAlerts] = useState<CriticalAlert[]>(INITIAL_ALERTS);
  const [selectedAlertModal, setSelectedAlertModal] = useState<CriticalAlert | null>(null);

  // Production Monitor State
  const [batches, setBatches] = useState<ProductionBatch[]>(INITIAL_BATCHES);
  const [activeTab, setActiveTab] = useState<'Todos' | BatchStatus>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState<boolean>(false);

  // New Batch Form State
  const [newProduct, setNewProduct] = useState<string>('Croissant Mantequilla Laminado');
  const [newDetail, setNewDetail] = useState<string>('Laminado 27 capas · Fermentación controlada');
  const [newUnits, setNewUnits] = useState<number>(48);
  const [newStatus, setNewStatus] = useState<BatchStatus>('Preparación');
  const [newMinutes, setNewMinutes] = useState<number>(35);
  const [newBaker, setNewBaker] = useState<string>('C. Mendoza');

  // AI Assistant Drawer State
  const [isAiPanelOpen, setIsAiPanelOpen] = useState<boolean>(false);
  const [aiPromptSelected, setAiPromptSelected] = useState<string>('optimizacion-hornos');

  // Live countdown ticker for active batches
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setBatches((prev) =>
        prev.map((batch) => {
          if (batch.estado === 'Completado' || batch.tiempoRestanteSegundos <= 0) {
            return batch;
          }
          const nextSeconds = Math.max(0, batch.tiempoRestanteSegundos - 1);
          return {
            ...batch,
            tiempoRestanteSegundos: nextSeconds,
            estado: nextSeconds === 0 ? 'Completado' : batch.estado
          };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Derived metrics
  const monthlyProgressPct = useMemo(() => {
    return Math.min(100, Number(((monthlyCurrent / monthlyGoal) * 100).toFixed(1)));
  }, [monthlyCurrent, monthlyGoal]);

  const activeAlerts = useMemo(() => alerts.filter((a) => !a.resuelta), [alerts]);

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesTab = activeTab === 'Todos' ? true : batch.estado === activeTab;
      const matchesQuery =
        searchQuery.trim() === '' ||
        batch.producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.lote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.responsable.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [batches, activeTab, searchQuery]);

  // Handlers
  const handleRecordQuickSale = () => {
    const ticketAmount = 65000;
    setDailySales((prev) => prev + ticketAmount);
    setMonthlyCurrent((prev) => prev + ticketAmount);
  };

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resuelta: true } : a)));
    if (selectedAlertModal?.id === id) {
      setSelectedAlertModal(null);
    }
  };

  const handleRestoreAlerts = () => {
    setAlerts(INITIAL_ALERTS);
  };

  const handleCycleBatchStatus = (id: string) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id !== id) return batch;
        const nextOrder: Record<BatchStatus, BatchStatus> = {
          Preparación: 'En horno',
          'En horno': 'Completado',
          Completado: 'Preparación'
        };
        const nextState = nextOrder[batch.estado];
        return {
          ...batch,
          estado: nextState,
          temperatura:
            nextState === 'En horno'
              ? '230 °C · Vapor activo'
              : nextState === 'Completado'
              ? 'Reposo en rejilla · 28 °C'
              : 'Mesa de trabajo · 21 °C',
          tiempoRestanteSegundos:
            nextState === 'Completado'
              ? 0
              : batch.tiempoRestanteSegundos === 0
              ? 1200
              : batch.tiempoRestanteSegundos
        };
      })
    );
  };

  const handleAdjustBatchTime = (id: string, deltaSeconds: number) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id !== id) return batch;
        const updated = Math.max(0, batch.tiempoRestanteSegundos + deltaSeconds);
        return {
          ...batch,
          tiempoRestanteSegundos: updated,
          tiempoTotalSegundos: Math.max(batch.tiempoTotalSegundos, updated)
        };
      })
    );
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.trim()) return;
    const nextNumber = 841 + batches.length;
    const totalSecs = Math.max(1, newMinutes) * 60;
    const createdBatch: ProductionBatch = {
      id: `batch-${Date.now()}`,
      lote: `LOTE-0${nextNumber}`,
      producto: newProduct.trim(),
      detalle: newDetail.trim() || 'Lote estándar de obrador',
      unidades: Number(newUnits) || 24,
      temperatura: newStatus === 'En horno' ? '225 °C · Convección' : 'Mesa fría · 20 °C',
      responsable: newBaker.trim() || 'C. Mendoza',
      estado: newStatus,
      tiempoRestanteSegundos: totalSecs,
      tiempoTotalSegundos: totalSecs,
      hidratacion: '75%'
    };
    setBatches((prev) => [createdBatch, ...prev]);
    setIsNewBatchModalOpen(false);
  };

  const sidebarItems: { id: DomainId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'Gestión', label: 'Gestión', icon: LayoutGrid },
    { id: 'Producción', label: 'Producción', icon: ChefHat },
    { id: 'Inventario', label: 'Inventario', icon: Package },
    { id: 'Comercial', label: 'Comercial', icon: ShoppingBag },
    { id: 'Finanzas', label: 'Finanzas', icon: Wallet }
  ];

  return (
    <div className="min-h-screen flex bg-[#F6F2E9] text-[#1C2417] font-sans">
      {/* 1. Collapsible Left Sidebar */}
      <aside
        aria-label="Navegación de dominios operativos"
        className={`flex flex-col justify-between bg-[#FFFFFF] border-r border-[#E8E3D5] shrink-0 transition-all duration-200 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Brand identity header inside sidebar */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#E8E3D5]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-[#3D5A2A] text-white flex items-center justify-center font-bold text-sm tracking-tight shrink-0">
                CZ
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <span className="block text-sm font-bold tracking-tight text-[#1C2417] truncate">
                    CabZ.IA
                  </span>
                  <span className="block text-xs text-[#1C2417]/65 truncate">
                    Entornos Inteligentes
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-expanded={!sidebarCollapsed}
              aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1C2417]/70 hover:text-[#1C2417] hover:bg-[#F6F2E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3D5A2A] transition-colors shrink-0"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 5 Operational Domains */}
          <nav className="p-3 space-y-1.5" aria-label="Dominios del ecosistema">
            {!sidebarCollapsed && (
              <div className="px-3 py-1.5 text-xs font-medium text-[#1C2417]/60">
                Dominios Operativos
              </div>
            )}
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeDomain === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveDomain(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3D5A2A] ${
                    isActive
                      ? 'bg-[#3D5A2A] text-white'
                      : 'text-[#1C2417]/80 hover:bg-[#F6F2E9] hover:text-[#1C2417]'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#1C2417]/70'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  {!sidebarCollapsed && item.id === 'Inventario' && activeAlerts.length > 0 && (
                    <span
                      className={`ml-auto text-xs font-mono tabular-nums font-semibold ${
                        isActive ? 'text-white' : 'text-[#B91C1C]'
                      }`}
                    >
                      {activeAlerts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Turno Info */}
        <div className="p-3 border-t border-[#E8E3D5]">
          <div
            className={`flex items-center gap-3 px-2 py-2 rounded-lg bg-[#F6F2E9] ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#3D5A2A]/15 text-[#3D5A2A] flex items-center justify-center font-semibold text-xs shrink-0">
              CM
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#1C2417] truncate">Turno Mañana · Obrador</p>
                <p className="text-xs text-[#1C2417]/65 truncate font-mono tabular-nums">05:30 - 13:30</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Header following strict 3-zone Top Bar Contract */}
        <header className="h-16 bg-[#FFFFFF] border-b border-[#E8E3D5] px-6 flex items-center justify-between gap-8 shrink-0">
          {/* Zone 1: Single text element header title */}
          <h1 className="text-lg font-bold tracking-tight text-[#1C2417] whitespace-nowrap shrink-0">
            CabZ.IA - Monitor Operativo
          </h1>

          {/* Zone 2: Clean single-line domain context links */}
          <nav
            aria-label="Acceso rápido de dominios"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1C2417]/70"
          >
            {sidebarItems.map((domain) => (
              <button
                key={domain.id}
                type="button"
                onClick={() => setActiveDomain(domain.id)}
                className={`hover:text-[#1C2417] transition-colors whitespace-nowrap shrink-0 py-1 ${
                  activeDomain === domain.id
                    ? 'text-[#1C2417] font-semibold underline decoration-[#3D5A2A] decoration-2 underline-offset-8'
                    : ''
                }`}
              >
                {domain.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action with AI Assistant Icon */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsAiPanelOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3D5A2A] text-white text-xs font-semibold hover:bg-[#324B22] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3D5A2A]"
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>Asistente IA</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Container */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Active Domain Context Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E3D5]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#1C2417]/65">
                <span>Módulo Activo</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#3D5A2A]">{activeDomain}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">Planta Central Bogotá</span>
              </div>
              <p className="text-sm text-[#1C2417]/80 mt-0.5">
                {DOMAIN_SUMMARIES[activeDomain].descripcion}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#1C2417]/75 shrink-0">
              {DOMAIN_SUMMARIES[activeDomain].metricas.map((metrica, index) => (
                <React.Fragment key={metrica.etiqueta}>
                  {index > 0 && <span aria-hidden="true" className="text-[#E8E3D5]">|</span>}
                  <div className="whitespace-nowrap">
                    <span className="text-[#1C2417]/65">{metrica.etiqueta}: </span>
                    <span className="font-mono tabular-nums font-semibold text-[#1C2417]">
                      {metrica.valor}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 3. Top KPI Metric Cards in a Responsive Grid */}
          <section
            aria-label="Indicadores Clave de Rendimiento"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* KPI 1: Ventas del Día */}
            <article className="bg-[#FFFFFF] border border-[#E8E3D5] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-[#1C2417]/75">Ventas del Día</h2>
                  <span className="text-xs font-mono tabular-nums text-[#3D5A2A] font-semibold inline-flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +12,4% vs. ayer
                  </span>
                </div>

                <p className="mt-3 text-3xl font-bold tracking-tight text-[#1C2417] font-mono tabular-nums">
                  {formatCOP(dailySales)}
                </p>

                <div className="mt-2 flex items-center gap-2 text-xs text-[#1C2417]/65 font-mono tabular-nums">
                  <span>116 órdenes</span>
                  <span aria-hidden="true">·</span>
                  <span>Mostrador 67%</span>
                  <span aria-hidden="true">·</span>
                  <span>B2B 33%</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E8E3D5] flex items-center justify-between gap-2">
                <span className="text-xs text-[#1C2417]/65">Corte parcial de caja</span>
                <button
                  type="button"
                  onClick={handleRecordQuickSale}
                  className="px-3 py-1.5 rounded-lg bg-[#F6F2E9] hover:bg-[#E8E3D5]/70 text-[#1C2417] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#3D5A2A]"
                >
                  + Registrar Venta ($65.000)
                </button>
              </div>
            </article>

            {/* KPI 2: Progreso Meta Mensual */}
            <article className="bg-[#FFFFFF] border border-[#E8E3D5] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-[#1C2417]/75">Progreso Meta Mensual</h2>
                  <span className="text-xs font-mono tabular-nums font-bold text-[#1C2417]">
                    {monthlyProgressPct.toFixed(1)}%
                  </span>
                </div>

                <p className="mt-3 text-3xl font-bold tracking-tight text-[#1C2417] font-mono tabular-nums">
                  {formatCOP(monthlyGoal)}
                </p>

                <div className="mt-2 flex items-center justify-between text-xs text-[#1C2417]/65 font-mono tabular-nums">
                  <span>Acumulado: {formatCOP(monthlyCurrent)}</span>
                  <span>Restante: {formatCOP(Math.max(0, monthlyGoal - monthlyCurrent))}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E8E3D5]">
                <div
                  role="progressbar"
                  aria-label="Progreso de meta mensual de ventas"
                  aria-valuenow={monthlyProgressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="w-full h-2.5 bg-[#F6F2E9] border border-[#E8E3D5] rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-[#3D5A2A] transition-all duration-200"
                    style={{ width: `${monthlyProgressPct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#1C2417]/65 font-mono tabular-nums">
                  <span>Día 20 de 31</span>
                  <span>Ritmo proyectado: 104,2%</span>
                </div>
              </div>
            </article>

            {/* KPI 3: Alertas Críticas */}
            <article className="bg-[#FFFFFF] border border-[#E8E3D5] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <h2 className="text-sm font-semibold text-[#B91C1C]">Alertas Críticas</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#B91C1C] text-white text-xs font-mono tabular-nums font-semibold">
                    {activeAlerts.length} {activeAlerts.length === 1 ? 'activa' : 'activas'}
                  </span>
                </div>

                {activeAlerts.length > 0 ? (
                  <ul className="mt-3 space-y-2.5" aria-label="Lista de alertas críticas">
                    {activeAlerts.map((alerta) => (
                      <li
                        key={alerta.id}
                        className="p-2.5 rounded-lg bg-[#F6F2E9]/75 border border-[#E8E3D5] flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#B91C1C] truncate">
                            {alerta.titulo}
                          </p>
                          <p className="text-xs text-[#1C2417]/75 truncate mt-0.5 font-mono tabular-nums">
                            {alerta.detalle}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedAlertModal(alerta)}
                          className="px-2.5 py-1 rounded bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
                        >
                          Atender
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-4 py-4 text-center">
                    <p className="text-sm font-semibold text-[#3D5A2A]">
                      Sin alertas críticas pendientes
                    </p>
                    <p className="text-xs text-[#1C2417]/65 mt-1">
                      Todos los parámetros de horno e inventario están en rango nominal.
                    </p>
                    <button
                      type="button"
                      onClick={handleRestoreAlerts}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C2417]/70 hover:text-[#1C2417]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar alertas de prueba
                    </button>
                  </div>
                )}
              </div>
            </article>
          </section>

          {/* 4. Central Dashboard Panel: Monitor de Obrador (Kitchen Production Monitor) */}
          <section
            aria-label="Monitor de Obrador"
            className="bg-[#FFFFFF] border border-[#E8E3D5] rounded-xl overflow-hidden"
          >
            {/* Panel Header & Interactive Controls */}
            <div className="p-6 border-b border-[#E8E3D5] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#1C2417]">Monitor de Obrador</h2>
                  <span className="text-xs text-[#1C2417]/65 font-mono tabular-nums">
                    · {batches.length} lotes registrados hoy
                  </span>
                </div>
                <p className="text-xs text-[#1C2417]/70 mt-1">
                  Seguimiento en tiempo real de lotes en cocción, fermentación en bloque y formado artesanal.
                </p>
              </div>

              {/* Controls: Timer Toggle + Add New Batch Button */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTimerRunning((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E8E3D5] bg-[#F6F2E9] text-xs font-semibold text-[#1C2417] hover:bg-[#E8E3D5]/60 transition-colors whitespace-nowrap shrink-0"
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-[#3D5A2A]" />
                      <span>Pausar Reloj</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-[#B91C1C]" />
                      <span>Reanudar Reloj</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewBatchModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3D5A2A] text-white text-xs font-semibold hover:bg-[#324B22] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3D5A2A]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Programar Lote</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="px-6 py-3.5 bg-[#F6F2E9]/60 border-b border-[#E8E3D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Interactive Segmented Filter Tabs */}
              <div
                role="tablist"
                aria-label="Filtrar lotes por estado"
                className="flex items-center gap-1 p-1 bg-[#F6F2E9] border border-[#E8E3D5] rounded-lg self-start"
              >
                {(['Todos', 'En horno', 'Preparación', 'Completado'] as const).map((tab) => {
                  const isSelected = activeTab === tab;
                  const count =
                    tab === 'Todos'
                      ? batches.length
                      : batches.filter((b) => b.estado === tab).length;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-[#3D5A2A] text-white'
                          : 'text-[#1C2417]/75 hover:text-[#1C2417] hover:bg-[#FFFFFF]/60'
                      }`}
                    >
                      {tab} <span className="font-mono tabular-nums ml-1 opacity-85">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#1C2417]/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por lote, producto o panadero..."
                  aria-label="Buscar lote de producción"
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FFFFFF] border border-[#E8E3D5] rounded-lg text-[#1C2417] placeholder:text-[#1C2417]/45 focus:outline-none focus:border-[#3D5A2A]"
                />
              </div>
            </div>

            {/* Data-Dense Kitchen Production Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E3D5] text-xs font-semibold text-[#1C2417]/65 bg-[#FFFFFF]">
                    <th scope="col" className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                      Lote
                    </th>
                    <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                      Producto
                    </th>
                    <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                      Parámetros / Responsable
                    </th>
                    <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                      Estado
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-right whitespace-nowrap">
                      Tiempo Restante
                    </th>
                    <th scope="col" className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                      Acciones Operativas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3D5] text-sm">
                  {filteredBatches.length > 0 ? (
                    filteredBatches.map((batch) => {
                      const isOven = batch.estado === 'En horno';
                      const isDone = batch.estado === 'Completado';
                      const isUrgent = isOven && batch.tiempoRestanteSegundos > 0 && batch.tiempoRestanteSegundos <= 720;

                      return (
                        <tr
                          key={batch.id}
                          className="hover:bg-[#F6F2E9]/50 transition-colors group"
                        >
                          {/* Column 1: Lote */}
                          <td className="py-3.5 pl-6 pr-4 font-mono tabular-nums font-semibold text-xs text-[#1C2417] whitespace-nowrap">
                            {batch.lote}
                          </td>

                          {/* Column 2: Producto */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#1C2417]">{batch.producto}</div>
                            <div className="text-xs text-[#1C2417]/65 mt-0.5 flex items-center gap-1.5">
                              <span>{batch.detalle}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums font-medium text-[#1C2417]">
                                {batch.unidades} uds.
                              </span>
                            </div>
                          </td>

                          {/* Column 3: Parámetros */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="text-xs font-mono tabular-nums text-[#1C2417]">
                              {batch.temperatura}
                            </div>
                            <div className="text-xs text-[#1C2417]/65 mt-0.5">
                              Maestro: {batch.responsable}
                            </div>
                          </td>

                          {/* Column 4: Estado */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold">
                              {isOven && (
                                <>
                                  <Flame className="w-4 h-4 text-[#B91C1C] shrink-0" />
                                  <span className="text-[#B91C1C]">{batch.estado}</span>
                                </>
                              )}
                              {batch.estado === 'Preparación' && (
                                <>
                                  <ChefHat className="w-4 h-4 text-[#3D5A2A] shrink-0" />
                                  <span className="text-[#3D5A2A]">{batch.estado}</span>
                                </>
                              )}
                              {isDone && (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-[#3D5A2A] shrink-0" />
                                  <span className="text-[#1C2417]/70">{batch.estado}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Column 5: Tiempo Restante */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <Clock
                                className={`w-3.5 h-3.5 ${
                                  isUrgent
                                    ? 'text-[#B91C1C]'
                                    : isDone
                                    ? 'text-[#1C2417]/40'
                                    : 'text-[#1C2417]/65'
                                }`}
                              />
                              <span
                                className={`font-mono tabular-nums text-sm font-bold ${
                                  isUrgent
                                    ? 'text-[#B91C1C]'
                                    : isDone
                                    ? 'text-[#1C2417]/50'
                                    : 'text-[#1C2417]'
                                }`}
                              >
                                {isDone ? '00:00' : formatSeconds(batch.tiempoRestanteSegundos)}
                              </span>
                            </div>
                            <div className="text-xs text-[#1C2417]/60 font-mono tabular-nums">
                              Meta: {Math.round(batch.tiempoTotalSegundos / 60)} min
                            </div>
                          </td>

                          {/* Column 6: Interactive Actions */}
                          <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAdjustBatchTime(batch.id, -60)}
                                disabled={isDone}
                                title="Restar 1 minuto"
                                className="px-2 py-1 rounded border border-[#E8E3D5] text-xs font-mono tabular-nums text-[#1C2417]/80 hover:bg-[#F6F2E9] disabled:opacity-40 transition-colors"
                              >
                                -1m
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustBatchTime(batch.id, 300)}
                                disabled={isDone}
                                title="Añadir 5 minutos"
                                className="px-2 py-1 rounded border border-[#E8E3D5] text-xs font-mono tabular-nums text-[#1C2417]/80 hover:bg-[#F6F2E9] disabled:opacity-40 transition-colors"
                              >
                                +5m
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCycleBatchStatus(batch.id)}
                                className="px-2.5 py-1 rounded bg-[#F6F2E9] hover:bg-[#3D5A2A] hover:text-white text-[#1C2417] text-xs font-semibold transition-colors"
                              >
                                {batch.estado === 'Preparación'
                                  ? 'Pasar a Horno'
                                  : batch.estado === 'En horno'
                                  ? 'Finalizar'
                                  : 'Reiniciar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedBatch(batch)}
                                className="px-2.5 py-1 rounded border border-[#E8E3D5] hover:border-[#3D5A2A] text-xs font-semibold text-[#1C2417] transition-colors"
                              >
                                Ficha
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 px-6 text-center">
                        <p className="text-sm font-semibold text-[#1C2417]">
                          No se encontraron lotes para el filtro seleccionado
                        </p>
                        <p className="text-xs text-[#1C2417]/65 mt-1">
                          Prueba cambiando la pestaña de estado o limpiando el término de búsqueda.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('Todos');
                            setSearchQuery('');
                          }}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-[#3D5A2A] text-white text-xs font-semibold"
                        >
                          Mostrar todos los lotes
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="px-6 py-3.5 bg-[#F6F2E9]/40 border-t border-[#E8E3D5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#1C2417]/70">
              <div className="flex items-center gap-3 font-mono tabular-nums">
                <span>
                  En horno: {batches.filter((b) => b.estado === 'En horno').length}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  En preparación: {batches.filter((b) => b.estado === 'Preparación').length}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Total unidades del turno:{' '}
                  {batches.reduce((acc, item) => acc + item.unidades, 0)} uds.
                </span>
              </div>
              <div className="font-mono tabular-nums">
                Sincronización de sonda térmica: Activa
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Modal: Ficha Técnica de Lote */}
      {selectedBatch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-batch-title"
          className="fixed inset-0 z-50 bg-[#1C2417]/40 flex items-center justify-center p-4"
        >
          <div className="bg-[#FFFFFF] border border-[#E8E3D5] rounded-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[#E8E3D5] pb-4">
              <div>
                <span className="text-xs font-mono tabular-nums font-semibold text-[#3D5A2A]">
                  {selectedBatch.lote} · {selectedBatch.estado}
                </span>
                <h3 id="modal-batch-title" className="text-lg font-bold text-[#1C2417] mt-0.5">
                  {selectedBatch.producto}
                </h3>
                <p className="text-xs text-[#1C2417]/70 mt-0.5">{selectedBatch.detalle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                aria-label="Cerrar ficha técnica"
                className="p-1.5 rounded-lg text-[#1C2417]/60 hover:text-[#1C2417] hover:bg-[#F6F2E9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#F6F2E9] border border-[#E8E3D5]">
                <div className="flex items-center gap-1.5 text-[#1C2417]/65">
                  <Thermometer className="w-3.5 h-3.5 text-[#3D5A2A]" />
                  <span>Parámetro Térmico</span>
                </div>
                <p className="font-mono tabular-nums font-semibold text-[#1C2417] mt-1">
                  {selectedBatch.temperatura}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F6F2E9] border border-[#E8E3D5]">
                <div className="flex items-center gap-1.5 text-[#1C2417]/65">
                  <Scale className="w-3.5 h-3.5 text-[#3D5A2A]" />
                  <span>Tamaño de Lote e Hidratación</span>
                </div>
                <p className="font-mono tabular-nums font-semibold text-[#1C2417] mt-1">
                  {selectedBatch.unidades} uds. · Hidr. {selectedBatch.hidratacion || '75%'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-[#1C2417] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#3D5A2A]" />
                Protocolo de Calidad Calma Artesanal
              </h4>
              <p className="text-[#1C2417]/75 leading-relaxed">
                Verificar coloración de corteza a los 5 minutos antes del término. Temperatura
                interna de miga objetivo: <span className="font-mono tabular-nums font-semibold">96 °C</span>.
                Responsable asignado: <span className="font-semibold">{selectedBatch.responsable}</span>.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E3D5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 rounded-lg border border-[#E8E3D5] text-xs font-semibold text-[#1C2417] hover:bg-[#F6F2E9]"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCycleBatchStatus(selectedBatch.id);
                  setSelectedBatch(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#3D5A2A] text-white text-xs font-semibold hover:bg-[#324B22]"
              >
                Avanzar Estado del Lote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Atender Alerta Crítica */}
      {selectedAlertModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-alert-title"
          className="fixed inset-0 z-50 bg-[#1C2417]/40 flex items-center justify-center p-4"
        >
          <div className="bg-[#FFFFFF] border border-[#E8E3D5] rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-[#B91C1C]">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 id="modal-alert-title" className="text-base font-bold">
                  Protocolo de Alerta Crítica
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlertModal(null)}
                aria-label="Cerrar alerta"
                className="p-1 rounded-lg text-[#1C2417]/60 hover:text-[#1C2417]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F6F2E9] border border-[#E8E3D5] space-y-1.5">
              <p className="text-xs font-bold text-[#B91C1C]">{selectedAlertModal.titulo}</p>
              <p className="text-xs text-[#1C2417]/80 font-mono tabular-nums">
                {selectedAlertModal.detalle}
              </p>
              <p className="text-xs text-[#1C2417]/60">
                Módulo: {selectedAlertModal.modulo} · Reportado: {selectedAlertModal.hora}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#1C2417]">Acción Correctiva Sugerida:</p>
              <p className="text-xs text-[#1C2417]/75 leading-relaxed">
                {selectedAlertModal.accionRecomendada}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E8E3D5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedAlertModal(null)}
                className="px-4 py-2 rounded-lg border border-[#E8E3D5] text-xs font-semibold text-[#1C2417]"
              >
                Posponer
              </button>
              <button
                type="button"
                onClick={() => handleResolveAlert(selectedAlertModal.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Ejecutar y Marcar Resuelta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Programar Nuevo Lote */}
      {isNewBatchModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-new-batch-title"
          className="fixed inset-0 z-50 bg-[#1C2417]/40 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleAddBatch}
            className="bg-[#FFFFFF] border border-[#E8E3D5] rounded-xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E8E3D5] pb-3">
              <h3 id="modal-new-batch-title" className="text-base font-bold text-[#1C2417]">
                Programar Nuevo Lote en Obrador
              </h3>
              <button
                type="button"
                onClick={() => setIsNewBatchModalOpen(false)}
                aria-label="Cerrar formulario"
                className="p-1 rounded-lg text-[#1C2417]/60 hover:text-[#1C2417]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1C2417] mb-1">
                  Producto Artesanal
                </label>
                <input
                  type="text"
                  required
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E3D5] bg-[#F6F2E9]/50 text-[#1C2417] focus:outline-none focus:border-[#3D5A2A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2417] mb-1">
                  Especificación / Curva
                </label>
                <input
                  type="text"
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E3D5] bg-[#F6F2E9]/50 text-[#1C2417] focus:outline-none focus:border-[#3D5A2A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2417] mb-1">
                    Unidades del Lote
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={newUnits}
                    onChange={(e) => setNewUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3D5] bg-[#F6F2E9]/50 text-[#1C2417] font-mono tabular-nums focus:outline-none focus:border-[#3D5A2A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2417] mb-1">
                    Tiempo Estimado (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3D5] bg-[#F6F2E9]/50 text-[#1C2417] font-mono tabular-nums focus:outline-none focus:border-[#3D5A2A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2417] mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as BatchStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3D5] bg-[#F6F2E9]/50 text-[#1C2417] focus:outline-none focus:border-[#3D5A2A]"
                  >
                    <option value="Preparación">Preparación</option>
                    <option value="En horno">En horno</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2417] mb-1">
                    Maestro Responsable
                  </label>
                  <input
                    type="text"
                    value={newBaker}
                    onChange={(e) => setNewBaker(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E8E3D5] bg-[#F6F2E9]/50 text-[#1C2417] focus:outline-none focus:border-[#3D5A2A]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E3D5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsNewBatchModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E8E3D5] text-xs font-semibold text-[#1C2417]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#3D5A2A] text-white text-xs font-semibold hover:bg-[#324B22]"
              >
                Ingresar al Monitor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drawer: Asistente IA CabZ.IA */}
      {isAiPanelOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-ai-title"
          className="fixed inset-0 z-50 bg-[#1C2417]/40 flex justify-end"
        >
          <div className="bg-[#FFFFFF] border-l border-[#E8E3D5] w-full max-w-md h-full flex flex-col justify-between p-6">
            <div className="space-y-5 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E8E3D5] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#3D5A2A] text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 id="drawer-ai-title" className="text-sm font-bold text-[#1C2417]">
                      CabZ.IA · Copiloto de Obrador
                    </h3>
                    <p className="text-xs text-[#1C2417]/65">
                      Diagnóstico operativo y balance de hornos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiPanelOpen(false)}
                  aria-label="Cerrar asistente IA"
                  className="p-1.5 rounded-lg text-[#1C2417]/60 hover:text-[#1C2417] hover:bg-[#F6F2E9]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selector de análisis */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#1C2417]/75">
                  Selecciona una consulta operativa:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      id: 'optimizacion-hornos',
                      label: 'Secuencia térmica para LOTE-0841 y LOTE-0842'
                    },
                    {
                      id: 'alerta-harina',
                      label: 'Plan de contingencia: Stock Harina de Fuerza T80'
                    },
                    {
                      id: 'proyeccion-cierre',
                      label: 'Proyección de ventas al cierre y meta mensual'
                    }
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAiPromptSelected(option.id)}
                      className={`text-left px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                        aiPromptSelected === option.id
                          ? 'bg-[#3D5A2A] text-white border-[#3D5A2A]'
                          : 'bg-[#F6F2E9] text-[#1C2417] border-[#E8E3D5] hover:border-[#3D5A2A]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Respuesta contextual */}
              <div className="p-4 rounded-xl bg-[#F6F2E9] border border-[#E8E3D5] space-y-3 text-xs leading-relaxed">
                {aiPromptSelected === 'optimizacion-hornos' && (
                  <>
                    <p className="font-bold text-[#1C2417]">
                      Recomendación de Carga Térmica · Horno de Piso #2
                    </p>
                    <p className="text-[#1C2417]/80">
                      El <span className="font-mono tabular-nums font-semibold">LOTE-0841</span> (Pan
                      de Masa Madre) finalizará en{' '}
                      <span className="font-mono tabular-nums font-semibold">
                        {formatSeconds(batches[0]?.tiempoRestanteSegundos ?? 1125)}
                      </span>
                      . Al retirar las hogazas, la cámara descenderá a{' '}
                      <span className="font-mono tabular-nums font-semibold">195 °C</span> en 6
                      minutos, punto exacto para ingresar las 120 unidades de{' '}
                      <span className="font-semibold">Galletas Chocochip (LOTE-0842)</span> sin
                      consumo energético adicional.
                    </p>
                  </>
                )}
                {aiPromptSelected === 'alerta-harina' && (
                  <>
                    <p className="font-bold text-[#B91C1C]">
                      Mitigación de Rotura de Stock · Harina T80
                    </p>
                    <p className="text-[#1C2417]/80">
                      Con los <span className="font-mono tabular-nums font-semibold">4,5 kg</span>{' '}
                      actuales, se cubre el refresco de masa madre de las 14:00. Para el amasado de
                      mañana (requiere <span className="font-mono tabular-nums font-semibold">22,0 kg</span>),
                      puedes sustituir un 30% con Harina T65 en bodega secundaria reduciendo la
                      hidratación del lote del 78% al 74,5%.
                    </p>
                  </>
                )}
                {aiPromptSelected === 'proyeccion-cierre' && (
                  <>
                    <p className="font-bold text-[#3D5A2A]">
                      Proyección Financiera del Turno
                    </p>
                    <p className="text-[#1C2417]/80">
                      Con ventas actuales de{' '}
                      <span className="font-mono tabular-nums font-semibold">
                        {formatCOP(dailySales)}
                      </span>{' '}
                      y la salida del lote de Focaccia y Masa Madre antes de las 16:00, el cierre
                      estimado hoy se sitúa en{' '}
                      <span className="font-mono tabular-nums font-semibold">$3.420.000 COP</span>,
                      elevando el avance mensual al{' '}
                      <span className="font-mono tabular-nums font-semibold">75,3%</span>.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E3D5] flex items-center justify-between">
              <span className="text-xs text-[#1C2417]/60 font-mono tabular-nums">
                CabZ.IA Motor Gastronómico
              </span>
              <button
                type="button"
                onClick={() => setIsAiPanelOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#3D5A2A] text-white text-xs font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
