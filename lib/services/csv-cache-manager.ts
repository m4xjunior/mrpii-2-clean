import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { format } from 'fast-csv';
import { Readable } from 'stream';

// Tipos para os dados consolidados
export interface MachineMetric {
  timestamp: string;
  machineCode: string;
  machineDescription: string;
  status: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  unitsOk: number;
  unitsNok: number;
  unitsRework: number;
  currentVelocity: number;
  nominalVelocity: number;
  downtimeSeconds: number;
  currentActivity: string;
  stopReason: string;
  currentOrder: string;
  currentProduct: string;
  shift: string;
  operator: string;
  source: string; // Identificador da API de origem
}

class CSVCacheManager {
  private static instance: CSVCacheManager;
  private cache: Map<string, MachineMetric> = new Map();
  private csvPath: string;
  private isInitialized: boolean = false;
  private updateListeners: Set<(data: MachineMetric[]) => void> = new Set();

  private constructor() {
    // Define o caminho do CSV na raiz do projeto
    this.csvPath = path.join(process.cwd(), 'data', 'dados_metricas.csv');
    this.ensureDataDirectory();
  }

  public static getInstance(): CSVCacheManager {
    if (!CSVCacheManager.instance) {
      CSVCacheManager.instance = new CSVCacheManager();
    }
    return CSVCacheManager.instance;
  }

  // Garante que o diretório de dados existe
  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.csvPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  // Inicializa o cache carregando dados do CSV (se existir)
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (fs.existsSync(this.csvPath)) {
      await this.loadFromCSV();
      console.log(`✅ Cache CSV inicializado com ${this.cache.size} registros`);
    } else {
      console.log('📝 Arquivo CSV não existe, criando novo...');
      await this.saveToCSV();
    }

    this.isInitialized = true;
  }

  // Carrega dados do CSV para a memória
  private async loadFromCSV(): Promise<void> {
    return new Promise((resolve, reject) => {
      const results: MachineMetric[] = [];

      fs.createReadStream(this.csvPath)
        .pipe(csv({ headers: true }))
        .on('data', (data: any) => {
          const metric: MachineMetric = {
            timestamp: data.timestamp,
            machineCode: data.machineCode,
            machineDescription: data.machineDescription,
            status: data.status,
            oee: parseFloat(data.oee) || 0,
            availability: parseFloat(data.availability) || 0,
            performance: parseFloat(data.performance) || 0,
            quality: parseFloat(data.quality) || 0,
            unitsOk: parseInt(data.unitsOk) || 0,
            unitsNok: parseInt(data.unitsNok) || 0,
            unitsRework: parseInt(data.unitsRework) || 0,
            currentVelocity: parseFloat(data.currentVelocity) || 0,
            nominalVelocity: parseFloat(data.nominalVelocity) || 0,
            downtimeSeconds: parseInt(data.downtimeSeconds) || 0,
            currentActivity: data.currentActivity || '',
            stopReason: data.stopReason || '',
            currentOrder: data.currentOrder || '',
            currentProduct: data.currentProduct || '',
            shift: data.shift || '',
            operator: data.operator || '',
            source: data.source || 'unknown',
          };
          results.push(metric);
        })
        .on('end', () => {
          // Atualiza o cache com os dados carregados
          results.forEach(metric => {
            const key = `${metric.machineCode}:${metric.source}`;
            this.cache.set(key, metric);
          });
          resolve();
        })
        .on('error', (error) => {
          console.error('Erro ao carregar CSV:', error);
          reject(error);
        });
    });
  }

  // Salva todos os dados do cache no CSV
  private async saveToCSV(): Promise<void> {
    return new Promise((resolve, reject) => {
      const dataArray = Array.from(this.cache.values());

      const ws = fs.createWriteStream(this.csvPath);
      const csvStream = format({ headers: true });

      csvStream.pipe(ws)
        .on('finish', () => {
          console.log(`💾 CSV salvo com ${dataArray.length} registros`);
          resolve();
        })
        .on('error', (error) => {
          console.error('Erro ao salvar CSV:', error);
          reject(error);
        });

      dataArray.forEach(metric => {
        csvStream.write(metric);
      });

      csvStream.end();
    });
  }

  // Atualiza ou adiciona uma métrica no cache
  public async updateMetric(metric: MachineMetric): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const key = `${metric.machineCode}:${metric.source}`;
    this.cache.set(key, {
      ...metric,
      timestamp: new Date().toISOString(),
    });

    // Salva no CSV de forma assíncrona
    await this.saveToCSV();

    // Notifica os listeners (WebSocket)
    this.notifyListeners();
  }

  // Atualiza múltiplas métricas de uma vez (mais eficiente)
  public async updateMetrics(metrics: MachineMetric[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const timestamp = new Date().toISOString();

    metrics.forEach(metric => {
      const key = `${metric.machineCode}:${metric.source}`;
      this.cache.set(key, {
        ...metric,
        timestamp,
      });
    });

    // Salva no CSV uma única vez
    await this.saveToCSV();

    // Notifica os listeners
    this.notifyListeners();
  }

  // Retorna todos os dados do cache
  public getAllMetrics(): MachineMetric[] {
    return Array.from(this.cache.values());
  }

  // Retorna métricas de uma máquina específica
  public getMetricsByMachine(machineCode: string): MachineMetric[] {
    return Array.from(this.cache.values())
      .filter(metric => metric.machineCode === machineCode);
  }

  // Retorna métricas de uma fonte específica
  public getMetricsBySource(source: string): MachineMetric[] {
    return Array.from(this.cache.values())
      .filter(metric => metric.source === source);
  }

  // Registra um listener para mudanças nos dados
  public addUpdateListener(listener: (data: MachineMetric[]) => void): void {
    this.updateListeners.add(listener);
  }

  // Remove um listener
  public removeUpdateListener(listener: (data: MachineMetric[]) => void): void {
    this.updateListeners.delete(listener);
  }

  // Notifica todos os listeners sobre mudanças
  private notifyListeners(): void {
    const data = this.getAllMetrics();
    this.updateListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  // Limpa o cache (útil para testes ou reset)
  public async clearCache(): Promise<void> {
    this.cache.clear();
    await this.saveToCSV();
    this.notifyListeners();
  }

  // Retorna estatísticas do cache
  public getStats(): {
    totalMachines: number;
    totalRecords: number;
    sources: string[];
    lastUpdate: string | null;
  } {
    const metrics = this.getAllMetrics();
    const uniqueMachines = new Set(metrics.map(m => m.machineCode));
    const sources = [...new Set(metrics.map(m => m.source))];
    const timestamps = metrics.map(m => new Date(m.timestamp).getTime());
    const lastUpdate = timestamps.length > 0
      ? new Date(Math.max(...timestamps)).toISOString()
      : null;

    return {
      totalMachines: uniqueMachines.size,
      totalRecords: metrics.length,
      sources,
      lastUpdate,
    };
  }
}

// Exporta a instância singleton
export const csvCacheManager = CSVCacheManager.getInstance();
