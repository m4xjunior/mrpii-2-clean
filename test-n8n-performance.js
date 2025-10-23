/**
 * Script de teste de performance do N8N
 *
 * Executa múltiplos testes para medir:
 * - Latência do N8N
 * - Tempo de resposta
 * - Comparação com/sem proxy
 *
 * Uso: node test-n8n-performance.js
 */

const TESTS = 5;
const N8N_URL = 'https://n8n.lexusfx.com/webhook/maquinas';
const PROXY_URL = 'http://localhost:3000/api/webhook-maquinas-proxy';

async function testDirectN8N() {
  const results = [];

  console.log('\n🔵 Testando acesso DIRETO ao N8N...\n');

  for (let i = 1; i <= TESTS; i++) {
    const startTime = Date.now();

    try {
      const response = await fetch(N8N_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          includeMetrics: { turno: true, of: true }
        }),
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;

      results.push(elapsed);
      console.log(`  Teste ${i}/${TESTS}: ${elapsed}ms (${response.ok ? '✅' : '❌'})`);

      if (i === 1) {
        console.log(`  → Máquinas retornadas: ${Array.isArray(data) ? data.length : 'N/A'}`);
      }
    } catch (error) {
      console.error(`  Teste ${i}/${TESTS}: ❌ ERRO - ${error.message}`);
      results.push(null);
    }

    // Delay entre testes
    if (i < TESTS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

async function testProxy() {
  const results = [];

  console.log('\n🟢 Testando acesso via PROXY Next.js...\n');

  for (let i = 1; i <= TESTS; i++) {
    const startTime = Date.now();

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          includeMetrics: { turno: true, of: true }
        }),
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;

      results.push(elapsed);
      console.log(`  Teste ${i}/${TESTS}: ${elapsed}ms (${response.ok ? '✅' : '❌'})`);

      if (i === 1 && response.headers.has('x-response-time')) {
        console.log(`  → Tempo reportado pelo servidor: ${response.headers.get('x-response-time')}`);
      }
    } catch (error) {
      console.error(`  Teste ${i}/${TESTS}: ❌ ERRO - ${error.message}`);
      results.push(null);
    }

    // Delay entre testes
    if (i < TESTS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

function calculateStats(results) {
  const validResults = results.filter(r => r !== null);

  if (validResults.length === 0) {
    return { avg: 0, min: 0, max: 0, median: 0 };
  }

  const sorted = [...validResults].sort((a, b) => a - b);
  const avg = validResults.reduce((sum, v) => sum + v, 0) / validResults.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];

  return { avg, min, max, median };
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('   TESTE DE PERFORMANCE N8N');
  console.log('═══════════════════════════════════════════════');

  // Teste direto ao N8N
  const directResults = await testDirectN8N();
  const directStats = calculateStats(directResults);

  console.log('\n📊 Estatísticas N8N Direto:');
  console.log(`   • Média:   ${directStats.avg.toFixed(0)}ms`);
  console.log(`   • Mínimo:  ${directStats.min}ms`);
  console.log(`   • Máximo:  ${directStats.max}ms`);
  console.log(`   • Mediana: ${directStats.median}ms`);

  // Teste via proxy (só se Next.js estiver rodando)
  console.log('\n⏳ Aguardando 2 segundos...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const proxyResults = await testProxy();
    const proxyStats = calculateStats(proxyResults);

    console.log('\n📊 Estatísticas via Proxy:');
    console.log(`   • Média:   ${proxyStats.avg.toFixed(0)}ms`);
    console.log(`   • Mínimo:  ${proxyStats.min}ms`);
    console.log(`   • Máximo:  ${proxyStats.max}ms`);
    console.log(`   • Mediana: ${proxyStats.median}ms`);

    console.log('\n📈 Comparação:');
    console.log(`   • Overhead do proxy: ${(proxyStats.avg - directStats.avg).toFixed(0)}ms`);
    console.log(`   • Percentual:        ${((proxyStats.avg / directStats.avg - 1) * 100).toFixed(1)}%`);
  } catch (error) {
    console.log('\n⚠️  Proxy não disponível (Next.js não está rodando?)');
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('🔍 DIAGNÓSTICO:');

  if (directStats.avg < 1000) {
    console.log('✅ N8N está rápido (< 1s)');
  } else if (directStats.avg < 3000) {
    console.log('⚠️  N8N está moderado (1-3s)');
  } else {
    console.log('❌ N8N está LENTO (> 3s) - Investigar workflow!');
  }

  console.log('\n💡 RECOMENDAÇÕES:');
  if (directStats.avg > 3000) {
    console.log('   1. Verificar workflow N8N (consultas SQL lentas?)');
    console.log('   2. Adicionar cache no N8N');
    console.log('   3. Otimizar queries do banco de dados');
    console.log('   4. Aumentar timeout: WEBHOOK_PROXY_TIMEOUT_MS=' + (directStats.max + 2000));
  } else if (directStats.avg > 1000) {
    console.log('   1. Considerar cache no N8N ou Next.js');
    console.log('   2. Timeout recomendado: WEBHOOK_PROXY_TIMEOUT_MS=' + (directStats.max + 1000));
  } else {
    console.log('   1. Performance está ótima!');
    console.log('   2. Timeout recomendado: WEBHOOK_PROXY_TIMEOUT_MS=3000');
  }

  console.log('═══════════════════════════════════════════════\n');
}

main().catch(console.error);
