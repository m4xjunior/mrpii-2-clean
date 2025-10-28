"use client";

import React, { useEffect, useState, forwardRef, useCallback, useImperativeHandle, useMemo } from "react";
import type { CSSProperties, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MachineStatus } from "../../types/machine";
import MachineDetailModal from "../../components/MachineDetailModal";
import SimpleNavbar from "../../components/SimpleNavbar";
import ReactBitsSidebar from "../../components/ReactBitsSidebar";
import CountUp from "../../components/CountUp";
import DashboardOrderCard from "./components/DashboardOrderCard";
import GooeyNav from "./components/GooeyNav";
import UnifiedConfigModal from "./components/UnifiedConfigModal";
import { useWebhookAllMachines } from "../../hooks/useWebhookMachine";
import "./factory-floor.css";

const STATUS_ORDER: Record<MachineStatus['status'], number> = {
  PRODUCIENDO: 0,
  ACTIVA: 1,
  PARADA: 2,
  MANTENIMIENTO: 3,
  INACTIVA: 4,
};

// Componente RotatingText do ReactBits
function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

// Componente de configuração do título
interface TitleConfig {
  sistema: string;
  scada: string[];
}

const defaultConfig: TitleConfig = {
  sistema: 'Sistema',
  scada: ['SCADA', 'KH', '2024']
};

const DEFAULT_CARDS_PER_ROW = 4;

interface RotatingTextProps {
  texts: string[];
  transition?: { type: string; damping: number; stiffness: number };
  initial?: { y: string; opacity: number };
  animate?: { y: number; opacity: number };
  exit?: { y: string; opacity: number };
  animatePresenceMode?: 'wait' | 'sync' | 'popLayout';
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: 'characters' | 'words' | 'lines' | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  [key: string]: unknown;
}

interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>((props, ref) => {
  const {
    texts,
    transition = { type: 'spring', damping: 25, stiffness: 300 },
    initial = { y: '100%', opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: '-120%', opacity: 0 },
    animatePresenceMode = 'wait',
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'characters',
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const splitIntoCharacters = (text: string) => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), segment => segment.segment);
    }
    return Array.from(text);
  };

  const elements = useMemo(() => {
    // Validação para evitar crash se a lista de textos estiver vazia ou for inválida
    if (!texts || (texts as string[]).length === 0) {
      return [];
    }

    const currentText = (texts as string[])[currentTextIndex];
    
    // Validação adicional para garantir que currentText não seja undefined
    if (!currentText) {
      return [];
    }

    if (splitBy === 'characters') {
      const words: string[] = currentText.split(' ');
      return words.map((word: string, i: number) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1
      }));
    }
    if (splitBy === 'words') {
      return currentText.split(' ').map((word: string, i: number, arr: string[]) => ({
        characters: [word],
        needsSpace: i !== arr.length - 1
      }));
    }
    if (splitBy === 'lines') {
      return currentText.split('\n').map((line: string, i: number, arr: string[]) => ({
        characters: [line],
        needsSpace: i !== arr.length - 1
      }));
    }

    return currentText.split(splitBy as string).map((part: string, i: number, arr: string[]) => ({
      characters: [part],
      needsSpace: i !== arr.length - 1
    }));
  }, [texts, currentTextIndex, splitBy]);

  const getStaggerDelay = useCallback(
    (index: number, totalChars: number) => {
      const total = totalChars;
      const duration = staggerDuration as number;
      if (staggerFrom === 'first') return index * duration;
      if (staggerFrom === 'last') return (total - 1 - index) * duration;
      if (staggerFrom === 'center') {
        const center = Math.floor(total / 2);
        return Math.abs(center - index) * duration;
      }
      if (staggerFrom === 'random') {
        const randomIndex = Math.floor(Math.random() * total);
        return Math.abs(randomIndex - index) * duration;
      }
      return Math.abs((staggerFrom as number) - index) * duration;
    },
    [staggerFrom, staggerDuration]
  );

  const handleIndexChange = useCallback(
    (_newIndex: number) => {
      setCurrentTextIndex(_newIndex);
      if (onNext) (onNext as (index: number) => void)(_newIndex);
    },
    [onNext]
  );

  const next = useCallback(() => {
    const nextIndex = currentTextIndex === (texts as string[]).length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
    if (nextIndex !== currentTextIndex) {
      handleIndexChange(nextIndex);
    }
  }, [currentTextIndex, texts, loop, handleIndexChange]);

  const previous = useCallback(() => {
    const prevIndex = currentTextIndex === 0 ? (loop ? (texts as string[]).length - 1 : currentTextIndex) : currentTextIndex - 1;
    if (prevIndex !== currentTextIndex) {
      handleIndexChange(prevIndex);
    }
  }, [currentTextIndex, texts, loop, handleIndexChange]);

  const jumpTo = useCallback(
    (index: number) => {
      const validIndex = Math.max(0, Math.min(index, (texts as string[]).length - 1));
      if (validIndex !== currentTextIndex) {
        handleIndexChange(validIndex);
      }
    },
    [texts, currentTextIndex, handleIndexChange]
  );

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) {
      handleIndexChange(0);
    }
  }, [currentTextIndex, handleIndexChange]);

  useImperativeHandle(
    ref,
    () => ({
      next,
      previous,
      jumpTo,
      reset
    }),
    [next, previous, jumpTo, reset]
  );

  useEffect(() => {
    if (!auto) return;
    const intervalId = setInterval(next, rotationInterval);
    return () => clearInterval(intervalId);
  }, [next, rotationInterval, auto]);

  // Garante que o índice não fique fora dos limites se a lista de textos diminuir
  // Garante que o índice não fique fora dos limites se a lista de textos diminuir
  useEffect(() => {
    if (texts && currentTextIndex >= (texts as string[]).length) {
      setCurrentTextIndex(0);
    }
  }, [texts, currentTextIndex]);

  // Validação para evitar crash se a lista de textos estiver vazia ou for inválida
  if (!texts || (texts as string[]).length === 0) {
    return null; // Não renderiza nada se não houver textos
  }

  return (
    <motion.span className={cn('flex flex-wrap whitespace-pre-wrap relative', mainClassName as string)} {...rest} layout transition={transition as object}>
      <AnimatePresence mode={animatePresenceMode as 'wait' | 'sync' | 'popLayout'} initial={animatePresenceInitial as boolean}>
        <motion.span
          key={currentTextIndex}
          className={cn(splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate')}
          layout
          aria-hidden="true"
        >
          {elements.map((wordObj: { characters: string[]; needsSpace: boolean }, wordIndex: number, array: { characters: string[]; needsSpace: boolean }[]) => {
            const previousCharsCount = array.slice(0, wordIndex).reduce((sum: number, word) => sum + word.characters.length, 0);
            return (
              <span key={wordIndex} className={cn('text-rotate-word', splitLevelClassName as string)}>
                {wordObj.characters.map((char: string, charIndex: number) => (
                  <motion.span
                    key={charIndex}
                    initial={initial as React.ComponentProps<typeof motion.span>['initial']}
                    animate={animate as React.ComponentProps<typeof motion.span>['animate']}
                    exit={exit as React.ComponentProps<typeof motion.span>['exit']}
                    transition={{
                      ...(transition as object),
                      delay: getStaggerDelay(
                        previousCharsCount + charIndex,
                        array.reduce((sum: number, word) => sum + word.characters.length, 0)
                      )
                    }}
                    className={cn('text-rotate-element', elementLevelClassName as string)}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordObj.needsSpace && <span className="text-rotate-space"> </span>}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
});

RotatingText.displayName = 'RotatingText';

// Custom hook para manejar el tema
function useThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    // console.log("🎨 useThemeSwitcher: Inicializando...");

    // Cargar tema guardado en localStorage
    const savedTheme = localStorage.getItem("scada-theme") || "light";
    setCurrentTheme(savedTheme);

    // Event listener para cambios de tema desde el script global
    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail.theme;
      setCurrentTheme(newTheme);
      // console.log("🔄 useThemeSwitcher: Tema cambiado a:", newTheme);
    };

    document.addEventListener("themeChange", handleThemeChange as EventListener);

    return () => {
      document.removeEventListener("themeChange", handleThemeChange as EventListener);
    };
  }, []);

  return { currentTheme };
}

export default function Dashboard() {
  // 🔥 USAR WEBHOOK SCADA EN LUGAR DE LA API ANTIGUA
  const {
    data: machines,
    loading,
    error: webhookError,
    lastUpdate: webhookLastUpdate
  } = useWebhookAllMachines({
    refreshInterval: 5000, // Actualizar cada 5 segundos para animação CountUp em tempo real
    autoFetch: true,
  });

  const [selectedMachine, setSelectedMachine] = useState<MachineStatus | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [_searchCode, _setSearchCode] = useState("");
  const [filter, setFilter] = useState<"all" | "run" | "stop">("all");
  const [visibleCount, setVisibleCount] = useState<number>(DEFAULT_CARDS_PER_ROW);

  const router = useRouter();

  // Convertir error del webhook a string para compatibilidad
  const error = webhookError?.message || null;

  // Formatear lastUpdate
  const lastUpdate = webhookLastUpdate
    ? webhookLastUpdate.toLocaleTimeString("es-ES")
    : "";

  // Usar el hook del theme switcher
  const { currentTheme } = useThemeSwitcher();

  // Estado para controlar a configuração do título
  const [titleConfig, setTitleConfig] = useState<TitleConfig>(defaultConfig);
  const [showUnifiedConfig, setShowUnifiedConfig] = useState(false);

  // Estado para controlar máquinas ocultas
  const [hiddenMachines, setHiddenMachines] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('hiddenMachines');
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Salvar máquinas ocultas no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hiddenMachines', JSON.stringify([...hiddenMachines]));
      } catch (error) {
        // TODO: handle persistence error if needed
      }
    }
  }, [hiddenMachines]);

  // Função para alternar visibilidade de uma máquina
  const toggleMachineVisibility = (machineId: string) => {
    setHiddenMachines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(machineId)) {
        newSet.delete(machineId);
      } else {
        newSet.add(machineId);
      }
      return newSet;
    });
  };

  // Carrega a configuração do localStorage ao iniciar o componente
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('titleConfig');
      if (savedConfig) {
        const parsedConfig: TitleConfig = JSON.parse(savedConfig);
        if (parsedConfig && typeof parsedConfig.sistema === 'string' && Array.isArray(parsedConfig.scada)) {
          setTitleConfig(parsedConfig);
        }
      }
    } catch (_error) {
      // console.error("Falha ao carregar configuração do título do localStorage:", error);
    }
  }, []);

  // Função para salvar configuração
  const handleSaveConfig = (config: TitleConfig) => {
    setTitleConfig(config);
    try {
      localStorage.setItem('titleConfig', JSON.stringify(config));
    } catch (error) {
      // TODO: handle configuration persistence error if needed
    }
  };

  // Função para abrir configurações unificadas
  const openUnifiedConfig = () => {
    setShowUnifiedConfig(true);
  };



  // Mostrar información del tema actual en consola
  useEffect(() => {
    // console.log("🏠 Dashboard: Tema actual:", currentTheme);
    // console.log(
    //   "💡 Theme Customizer: Haz clic en el botón ⚙️ en la esquina inferior derecha para cambiar el tema",
    // );
  }, [currentTheme]);


  const [monthly, setMonthly] = useState<{
    ok: number;
    nok: number;
    rw: number;
    total: number;
    eficiencia: number;
    perdidas_eur: number;
  } | null>(null);

  const filterLabels = {
    all: "Todas",
    run: "Produciendo",
    stop: "Paradas",
  } as const;

  const filteredMachines = useMemo(() => {
    // Máquinas prioritárias para as primeiras filas
    const priorityMachines = [
      'SOLD6', // CELDA K0 TICE
      'SOLD1', // LARGOIKO
      'DOBL3', // TURBOBENDER
      'DOBL9', // R2105
      'DOBL13' // RAPIDFORM
    ];

    const ordered = [...machines].sort((a, b) => {
      // 🔥 PRIORIDADE ABSOLUTA: Máquinas ocultas sempre vão para o final
      const aIsHidden = hiddenMachines.has(a.machine.Cod_maquina);
      const bIsHidden = hiddenMachines.has(b.machine.Cod_maquina);

      if (aIsHidden && !bIsHidden) return 1;
      if (!aIsHidden && bIsHidden) return -1;

      // Função auxiliar para determinar se uma máquina tem OF
      const hasOF = (machine: MachineStatus) => {
        const ofCode = machine.currentOF ||
               machine.machine.Rt_Cod_of;

        // Verificar se tem OF válido (não vazio, não null, não '--')
        return ofCode &&
               ofCode.trim() !== '' &&
               ofCode !== '--' &&
               ofCode !== 'null' &&
               ofCode.toLowerCase() !== 'null';
      };

      const aHasOF = hasOF(a);
      const bHasOF = hasOF(b);

      // 🔥 PRIORIDADE MÁXIMA: Máquinas sem OF sempre vão para o final
      if (!aHasOF && bHasOF) return 1;
      if (aHasOF && !bHasOF) return -1;

      // Se ambas não têm OF, ordenar por status
      if (!aHasOF && !bHasOF) {
        const aScore = STATUS_ORDER[a.status] ?? 99;
        const bScore = STATUS_ORDER[b.status] ?? 99;
        if (aScore !== bScore) return aScore - bScore;
        return a.machine.Cod_maquina.localeCompare(b.machine.Cod_maquina, 'es');
      }

      // A partir daqui, ambas têm OF
      const aIsProducing = a.status === "PRODUCIENDO";
      const bIsProducing = b.status === "PRODUCIENDO";

      // Verificar se são máquinas prioritárias
      const aIsPriority = priorityMachines.includes(a.machine.Cod_maquina);
      const bIsPriority = priorityMachines.includes(b.machine.Cod_maquina);

      // 1. PRODUCIENDO com OF vem primeiro
      if (aIsProducing && !bIsProducing) return -1;
      if (!aIsProducing && bIsProducing) return 1;

      // 2. Entre máquinas PRODUCIENDO, prioritárias vêm primeiro
      if (aIsProducing && bIsProducing) {
        if (aIsPriority && !bIsPriority) return -1;
        if (!aIsPriority && bIsPriority) return 1;

        // Se ambas são prioritárias e produzindo, ordenar por lista de prioridade
        if (aIsPriority && bIsPriority) {
          const aPriorityIndex = priorityMachines.indexOf(a.machine.Cod_maquina);
          const bPriorityIndex = priorityMachines.indexOf(b.machine.Cod_maquina);
          return aPriorityIndex - bPriorityIndex;
        }
      }

      // 3. Máquinas com OF mas paradas (prioritárias primeiro)
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;

      // Se ambas são prioritárias, ordenar por lista de prioridade
      if (aIsPriority && bIsPriority) {
        const aPriorityIndex = priorityMachines.indexOf(a.machine.Cod_maquina);
        const bPriorityIndex = priorityMachines.indexOf(b.machine.Cod_maquina);
        return aPriorityIndex - bPriorityIndex;
      }

      // 4. Ordenar por status
      const aScore = STATUS_ORDER[a.status] ?? 99;
      const bScore = STATUS_ORDER[b.status] ?? 99;
      if (aScore !== bScore) {
        return aScore - bScore;
      }

      // Fallback: ordenação determinística por código da máquina
      return a.machine.Cod_maquina.localeCompare(b.machine.Cod_maquina, 'es');
    });

    if (filter === "all") {
      return ordered;
    }

    return ordered.filter((machineStatus) => {
      if (filter === "run") {
        return (
          machineStatus.status === "PRODUCIENDO" ||
          machineStatus.status === "ACTIVA"
        );
      }
      if (filter === "stop") {
        return machineStatus.status === "PARADA";
      }
      return true;
    });
  }, [machines, filter, hiddenMachines]);

  // Slider agora controla cards por linha (1-6), não total de cards visíveis
  const sliderMax = 6; // Máximo de cards por linha

  const cardsPerRow = useMemo(() => {
    return Math.max(1, Math.min(visibleCount, sliderMax));
  }, [visibleCount]);

  // Mostrar TODOS os cards filtrados, sem esconder nenhum
  const visibleMachines = useMemo(() => filteredMachines, [filteredMachines]);

  // Garantir que o valor inicial esteja correto
  useEffect(() => {
    if (visibleCount <= 0 || visibleCount > 6) {
      setVisibleCount(DEFAULT_CARDS_PER_ROW);
    }
  }, []);

  const handleVisibleCountChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    setVisibleCount(Number.isFinite(nextValue) ? nextValue : 4);
  }, []);

  const cardMinWidth = useMemo(() => {
    // Calcular largura baseado em cards por linha
    // 1 card = 100%, 2 = ~48%, 3 = ~31%, 4 = ~23%, 5 = ~18%, 6 = ~15%
    const percentageWidth = (100 / cardsPerRow) - 2; // -2% para gap
    return `${percentageWidth}%`;
  }, [cardsPerRow]);

  const gridStyle = useMemo(() => ({
    '--ff-card-min-width': cardMinWidth,
  }) as CSSProperties, [cardMinWidth]);

  // Memoized calculations for CountUp performance
  const machineStats = useMemo(() => {
    const produciendo = machines.filter((m) => m.status === "PRODUCIENDO").length;
    const activa = machines.filter((m) => m.status === "ACTIVA").length;
    const parada = machines.filter((m) => m.status === "PARADA").length;
    const total = machines.length;
    
    // Ensure all values are numbers
    const produciendoNum = Number(produciendo) || 0;
    const activaNum = Number(activa) || 0;
    const paradaNum = Number(parada) || 0;
    const totalNum = Number(total) || 0;
    
    return {
      produciendo: produciendoNum,
      activa: activaNum,
      parada: paradaNum,
      total: totalNum,
      produciendoPercent: totalNum > 0 ? Math.round((produciendoNum / totalNum) * 100) : 0,
      activaPercent: totalNum > 0 ? Math.round((activaNum / totalNum) * 100) : 0,
      paradaPercent: totalNum > 0 ? Math.round((paradaNum / totalNum) * 100) : 0,
    };
  }, [machines]);

  const navItems = useMemo(
    () => [
      { id: "all", label: "Todas", icon: "fas fa-list", onClick: () => setFilter("all") },
      { id: "run", label: "Produciendo", icon: "fas fa-play", onClick: () => setFilter("run") },
      { id: "stop", label: "Paradas", icon: "fas fa-pause", onClick: () => setFilter("stop") },
      { id: "history", label: "Histórico", icon: "fas fa-chart-bar", onClick: () => router.push("/historico") },
      { id: "config", label: "Configurações", icon: "fas fa-cog", onClick: openUnifiedConfig },
    ],
    [setFilter, openUnifiedConfig, router],
  );

  const filterLabel = filterLabels[filter];
  const _alerts = machines
    .map((m) => {
      if (m.status === "PARADA") {
        return {
          type: "PARADA",
          machine: `${m.machine.desc_maquina} -${m.machine.Cod_maquina}`,
          code: m.machine.Cod_maquina,
          message: m.downtime || "Parada detectada",
          time: new Date().toLocaleTimeString("es-ES"),
        };
      }
      if ((m.production?.nok || 0) > 0) {
        return {
          type: "CALIDAD",
          machine: `${m.machine.desc_maquina} -${m.machine.Cod_maquina}`,
          code: m.machine.Cod_maquina,
          message: `Piezas NOK: ${m.production.nok}`,
          time: new Date().toLocaleTimeString("es-ES"),
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{
    type: string;
    machine: string;
    code: string;
    message: string;
    time: string;
  }>;

  const _openMachineByCode = (_code: string) => {
    const found = machines.find((m) => m.machine.Cod_maquina === _code);
    if (found) {
      setSelectedMachine(found);
      setIsModalOpen(true);
    }
  };

  // 🔥 COMENTADO: Ya no necesitamos fetchMachines porque usamos el webhook
  /*
  const fetchMachines = async () => {
    try {
      const response = await fetch("/api/scada/machines");
      const data = await response.json();

      if (data.success) {
        setMachines(data.data);
        setLastUpdate(new Date().toLocaleTimeString("es-ES"));
        setError(null);
      } else {
        setError(data.message || "Error al cargar datos");
      }
    } catch (_err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };
  */

  // API DESATIVADA: /api/analytics/monthly substituída pela barra de progresso do turno
  // Cargar datos de analytics (DESATIVADO)
  /*
  useEffect(() => {
    fetch("/api/analytics/monthly")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success) setMonthly(res.data);
      })
      .catch(() => {});
    const interval = setInterval(() => {
      fetch("/api/analytics/monthly")
        .then((r) => r.json())
        .then((res) => {
          if (res?.success) setMonthly(res.data);
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  */

  const handleMachineClick = (machine: MachineStatus) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  // ✅ OPTIMIZACIÓN: Mostrar loading solo en primera carga
  // En actualizaciones, mantener contenido visible
  const isFirstLoad = machines.length === 0 && loading;

  if (isFirstLoad) {
    return (
      <div className="wrapper">
        <div className="page-content-wrapper">
          <div className="page-content">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "60vh" }}
            >
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <h5>Cargando datos de las máquinas...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrapper">
        <div className="page-content-wrapper">
          <div className="page-content">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "60vh" }}
            >
              <div className="text-center">
                <i
                  className="fas fa-exclamation-triangle text-danger mb-3"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h5 className="text-danger mb-3">{error}</h5>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  <i className="fas fa-redo me-2"></i>Intentar de Nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <SimpleNavbar />

      {/* Título principal com logo e texto rotativo (KH Visual Refresh) */}
      <div className="main-title-section kh-hero">
        <div className="title-with-logo">
          <img src="/images/logo_transparent.png" alt="KH Logo" className="main-logo" />
          <div className="title-text">
            <div className="title-sistema-container">
              <span className="title-sistema">{titleConfig.sistema}</span>
            </div>
            <RotatingText
              texts={titleConfig.scada.length > 0 ? titleConfig.scada : ['SCADA']}
              mainClassName="rotating-text-scada"
              staggerFrom={"center"}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              staggerDuration={0.025}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              rotationInterval={2500}
              auto={true}
              loop={true}
              splitBy="characters"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <ReactBitsSidebar
        currentPage="dashboard"
        items={[
          {
            icon: <i className="fas fa-tachometer-alt"></i>,
            label: "Dashboard",
            href: "/"
          },
          {
            icon: <i className="fas fa-history"></i>,
            label: "Histórico",
            href: "/historico"
          },
          {
            icon: <i className="fas fa-cog"></i>,
            label: "Configurações",
            href: "#",
            onClick: openUnifiedConfig
          }
        ]}
        baseItemSize={50}
        magnification={1.4}
        distance={100}
      />

      {/* Main Content */}
      <div className="pt-16 pl-0 transition-all duration-300">
        <div className="page-content-wrapper">
          <div className="page-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Machines Status Grid */}
            <section className="ff-section">
              <div className="ff-section__head">
                <div>
                  <h5 className="ff-section__title">Estado de máquinas en tiempo real</h5>
                  <span className="ff-section__subtitle">Filtro: {filterLabel}</span>
                </div>
                {machines.length > 0 ? <GooeyNav items={navItems} /> : null}
              </div>

              <div className="ff-grid-controls">
                <label className="ff-grid-controls__label" htmlFor="card-count-range">
                  Cards por línea
                  <span className="ff-grid-controls__value">{cardsPerRow}</span>
                </label>
                <input
                  id="card-count-range"
                  type="range"
                  min={1}
                  max={sliderMax}
                  value={cardsPerRow}
                  onChange={handleVisibleCountChange}
                  className="ff-grid-controls__slider"
                  aria-valuemin={1}
                  aria-valuemax={sliderMax}
                  aria-valuenow={cardsPerRow}
                />
              </div>

              <div className="ff-grid" style={gridStyle}>
                <AnimatePresence initial={false} mode="popLayout">
                  {visibleMachines.map((machineStatus, index) => {
                    const isHidden = hiddenMachines.has(machineStatus.machine.Cod_maquina);
                    const offset = ((index % 3) - 1) * 6;
                    const accent = index % 5 === 0;
                    const cardStyle = {
                      '--ff-card-offset': `${offset}px`,
                      '--ff-card-scale': accent ? '1.018' : '1',
                      '--ff-card-shadow': accent
                        ? '0 24px 48px -28px rgba(14, 122, 190, 0.45)'
                        : '0 18px 42px -28px rgba(15, 23, 42, 0.32)',
                      '--ff-card-saturation': accent ? '1.05' : '1',
                      opacity: isHidden ? 0.4 : 1,
                      filter: isHidden ? 'grayscale(0.5)' : 'none',
                    } as CSSProperties;

                    return (
                      <motion.div
                        layout
                        key={machineStatus.machine.Cod_maquina}
                        className="ff-grid__item"
                        style={cardStyle}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: isHidden ? 0.4 : 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <DashboardOrderCard
                          machineId={machineStatus.machine.Cod_maquina}
                          ofCode={machineStatus.currentOF ?? machineStatus.order?.code}
                          initialStatus={machineStatus}
                          onSelect={handleMachineClick}
                          isHidden={isHidden}
                          onToggleHidden={toggleMachineVisibility}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {visibleMachines.length === 0 ? (
                <div className="ff-section__empty">
                  <i className="fas fa-industry" aria-hidden="true"></i>
                  <p>
                    {machines.length === 0
                      ? "Ninguna máquina encontrada"
                      : "No hay máquinas para el filtro seleccionado"}
                  </p>
                </div>
              ) : null}
            </section>

          </div>
        </div>
      </div>

      {/* Machine Detail Modal */}
      <MachineDetailModal
        machine={selectedMachine}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Footer */}
      <div className="footer">
        <p className="mb-0">Sistema SCADA MRPII - © 2024 Grupo KH</p>
      </div>

      {/* Theme Customizer */}
      <div className="switcher-body">
        <button
          className="btn btn-primary btn-switcher shadow-sm"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasScrolling"
          aria-controls="offcanvasScrolling"
        >
          <i className="bx bx-cog bx-spin"></i>
        </button>
        <div
          className="offcanvas offcanvas-end shadow border-start-0 p-2"
          data-bs-scroll="true"
          data-bs-backdrop="false"
          tabIndex={-1}
          id="offcanvasScrolling"
        >
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title" id="offcanvasScrollingLabel">
              Personalizador de Tema
            </h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
            ></button>
          </div>
          <div className="offcanvas-body">
            <h6 className="mb-0">Variación de Tema</h6>
            <hr />
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="lightmode"
                value="option1"
                defaultChecked
              />
              <label className="form-check-label" htmlFor="lightmode">
                Claro
              </label>
            </div>
            <hr />
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="darkmode"
                value="option2"
              />
              <label className="form-check-label" htmlFor="darkmode">
                Oscuro
              </label>
            </div>
            <hr />
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="darksidebar"
                value="option3"
              />
              <label className="form-check-label" htmlFor="darksidebar">
                Barra Lateral Oscura
              </label>
            </div>
            <hr />
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="ColorLessIcons"
                value="option4"
              />
              <label className="form-check-label" htmlFor="ColorLessIcons">
                Iconos sin Color
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configurações Unificadas */}
      <UnifiedConfigModal
        isOpen={showUnifiedConfig}
        onClose={() => setShowUnifiedConfig(false)}
        titleConfig={titleConfig}
        onSave={handleSaveConfig}
      />


      <style jsx>{`
        .main-title-section {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .title-with-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .main-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          animation: logo-pulse 3s ease-in-out infinite;
        }

        .title-text {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .title-with-logo {
          position: relative;
        }

        .title-sistema-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .title-sistema {
          font-size: 2.5rem;
          font-weight: 800;
          color: #000000;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 2px;
          line-height: 1;
        }


        /* CSS do RotatingText do ReactBits */
        .text-rotate {
          display: flex;
          flex-wrap: wrap;
          white-space: pre-wrap;
          position: relative;
        }

        .text-rotate-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .text-rotate-word {
          display: inline-flex;
        }

        .text-rotate-lines {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .text-rotate-element {
          display: inline-block;
          position: relative;
        }

        .text-rotate-space {
          white-space: pre;
        }

        /* Classe para acessibilidade - Oculta o texto duplicado */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Correção para garantir que a classe sr-only do componente seja aplicada */
        .rotating-text-scada > .sr-only,
        .preview-scada > .sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border-width: 0 !important;
        }

        /* Evitar duplicação de caracteres */
        .rotating-text-scada .text-rotate-element {
          font-family: inherit;
          font-size: inherit;
          color: inherit;
          text-shadow: inherit;
          letter-spacing: inherit;
        }

        /* Estilos específicos para o título SCADA */
        .rotating-text-scada {
          font-size: 2rem;
          font-weight: 700;
          color: #dc3545;
          text-shadow: 2px 2px 4px rgba(220, 53, 69, 0.3);
          letter-spacing: 4px;
          line-height: 1;
          margin-top: 0.5rem;
          min-height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes scada-glow {
          from {
            text-shadow: 2px 2px 4px rgba(220, 53, 69, 0.3);
          }
          to {
            text-shadow: 2px 2px 8px rgba(220, 53, 69, 0.6), 0 0 12px rgba(220, 53, 69, 0.4);
          }
        }

        @media (max-width: 768px) {
          .main-title-section {
            padding: 1.5rem 0;
            margin-bottom: 1.5rem;
          }

          .title-with-logo {
            gap: 1rem;
          }

          .main-logo {
            width: 60px;
            height: 60px;
          }

          .title-sistema {
            font-size: 2rem;
          }

          .rotating-text-scada {
            font-size: 1.8rem;
          }
        }

        @media (max-width: 480px) {
          .main-title-section {
            padding: 1rem 0;
          }

          .title-with-logo {
            flex-direction: column;
            gap: 0.5rem;
          }

          .title-sistema {
            font-size: 1.8rem;
          }

        .rotating-text-scada {
          font-size: 1.5rem;
          }
        }

        /* Configuração do Título - Diálogo */
        .config-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .config-dialog {
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          animation: dialog-appear 0.3s ease-out;
        }

        @keyframes dialog-appear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .config-dialog-header {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .config-dialog-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .config-dialog-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.2s ease;
        }

        .config-dialog-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .config-dialog-body {
          padding: 2rem;
          max-height: 60vh;
          overflow-y: auto;
        }

        .config-section {
          margin-bottom: 2rem;
        }

        .config-label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #333;
          font-size: 1rem;
        }

        .config-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .config-input:focus {
          outline: none;
          border-color: #dc3545;
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }

        .scada-texts-list {
          margin-bottom: 1rem;
        }

        .scada-text-item {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          align-items: center;
        }

        .scada-input {
          flex: 1;
        }

        .remove-scada-btn {
          background: #dc3545;
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .remove-scada-btn:hover {
          background: #c82333;
        }

        .add-scada-btn {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .add-scada-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }

        .config-preview {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 1.5rem;
          margin-top: 1.5rem;
          border: 2px solid #e9ecef;
        }

        .config-preview h4 {
          margin: 0 0 1rem 0;
          color: #495057;
          font-size: 1.1rem;
        }

        .preview-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .preview-logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .preview-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: center;
        }

        .preview-sistema {
          font-size: 1.5rem;
          font-weight: 800;
          color: #000000;
        }

        .preview-scada {
          font-size: 1.5rem;
          font-weight: 700;
          color: #dc3545;
          text-shadow: 1px 1px 2px rgba(220, 53, 69, 0.3);
          letter-spacing: 2px;
          min-height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .config-dialog-footer {
          padding: 1.5rem;
          background: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #e9ecef;
        }

        .config-btn-group {
          display: flex;
          gap: 0.75rem;
        }

        .config-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
        }

        .config-btn-primary {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
        }

        .config-btn-primary:hover {
          background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }

        .config-btn-secondary {
          background: #6c757d;
          color: white;
        }

        .config-btn-secondary:hover {
          background: #5a6268;
          transform: translateY(-1px);
        }

        /* Spotlight effect for top KPI cards */
        .kpi-spotlight {
          position: relative;
          isolation: isolate;
          background-image:
            radial-gradient(220px 180px at var(--kx, 50%) var(--ky, 50%), rgba(255,255,255,.25), transparent 60%);
          transition: background-image 120ms ease;
        }
        .kpi-spotlight::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 15px;
          pointer-events: none;
          background: radial-gradient(200px 160px at var(--kx, 50%) var(--ky, 50%), rgba(0,0,0,.08), transparent 65%);
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  );
}
