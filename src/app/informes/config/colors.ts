// Configurações de cores para a página de informes
// Baseado no arquivo configuracao_cores.tsx fornecido

export const configVariables = {
  vFechaFinCarga: '01/07/2014', // Data estática de referência
  vFechaMax: 'Max(Cal.Fecha)', // Data máxima do campo Cal.Fecha
  vPeriodoInicio: 'Date(Max(Cal.Fecha)-7)', // Início do período (7 dias antes da data máxima)
  vPeriodoFin: 'Max(Cal.Fecha)', // Fim do período (mesma que a data máxima)
  vInd: 40, // Valor numérico estático
  vAñoActual: 'Max(Cal.Año)', // Ano atual máximo
  vMostraMenu: 0, // Indicador de exibição de menu
  vMenu: 'MenuP01', // Menu padrão
  vVariableMenu: 'vMenuP01', // Variável de menu
  vMenuP01: 1, // Opção de menu P01
  vMenuP02: 1, // Opção de menu P02
  vMenuP03: 1, // Opção de menu P03
  vMenuP04: 1, // Opção de menu P04
  vMenuP05: 1, // Opção de menu P05
};

export const colorPalette = {
  // Cores de fundo e tema
  vColorFondo: 'rgb(190,200,235)', // Cor de fundo
  vColorTitulo: 'rgb(255,255,255)', // Cor do título
  vColorTituloFondo: 'rgb(30,55,100)', // Cor de fundo do título
  vColorFondoObjeto: 'rgb(30,55,100)', // Cor de fundo do objeto
  vColorFondoObjeto2: 'rgba(30,55,100,0.75)', // Cor de fundo do objeto 2 com transparência
  vColorBorde: 'rgb(255,0,0)', // Cor da borda
  vColorEjes: 'rgb(255,255,255)', // Cor dos eixos
  vColorLeyenda: 'rgb(255,255,255)', // Cor da legenda
  vColorBordeTexto: 'rgb(255,255,255)', // Cor do texto da borda

  // Cores adicionais para métricas
  primary: 'rgb(30,55,100)', // Azul principal
  secondary: 'rgb(190,200,235)', // Azul claro
  success: 'rgb(34, 197, 94)', // Verde sucesso
  warning: 'rgb(251, 191, 36)', // Amarelo aviso
  danger: 'rgb(239, 68, 68)', // Vermelho erro
  info: 'rgb(59, 130, 246)', // Azul informação

  // Gradientes para Aurora
  aurora: ['#5227FF', '#7cff67', '#5227FF'],

  // Cores para cards de métricas
  metricCards: {
    total: 'rgb(30,55,100)',
    active: 'rgb(34, 197, 94)',
    oee: 'rgb(251, 191, 36)',
    production: 'rgb(59, 130, 246)'
  }
};

// Utilitários para aplicar cores
export const applyColor = (colorKey: keyof typeof colorPalette) => {
  return colorPalette[colorKey];
};

// Classes CSS para componentes
export const colorClasses = {
  primaryBg: `bg-[${colorPalette.primary}]`,
  secondaryBg: `bg-[${colorPalette.secondary}]`,
  primaryText: `text-[${colorPalette.primary}]`,
  secondaryText: `text-[${colorPalette.secondary}]`,
  cardBg: `bg-[${colorPalette.vColorFondoObjeto}]`,
  cardBorder: `border-[${colorPalette.vColorBorde}]`,
  titleBg: `bg-[${colorPalette.vColorTituloFondo}]`,
  titleText: `text-[${colorPalette.vColorTitulo}]`
};
