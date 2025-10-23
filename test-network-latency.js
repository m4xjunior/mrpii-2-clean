/**
 * Teste de latência de rede detalhado
 * Mede: DNS lookup, TCP connect, TLS handshake, First Byte
 */

const https = require('https');
const dns = require('dns').promises;

const HOSTNAME = 'n8n.lexusfx.com';
const PORT = 443;
const PATH = '/webhook/maquinas';

async function testDNS() {
  console.log('\n🔍 Testando resolução DNS...');
  const start = Date.now();

  try {
    const addresses = await dns.resolve4(HOSTNAME);
    const elapsed = Date.now() - start;
    console.log(`   ✅ DNS resolvido em ${elapsed}ms`);
    console.log(`   → IP: ${addresses[0]}`);
    return { success: true, elapsed, ip: addresses[0] };
  } catch (error) {
    console.error(`   ❌ Erro DNS: ${error.message}`);
    return { success: false, elapsed: Date.now() - start };
  }
}

async function testHTTPSConnection() {
  console.log('\n🔌 Testando conexão HTTPS completa...');

  return new Promise((resolve) => {
    const timings = {
      start: Date.now(),
      dnsLookup: null,
      tcpConnection: null,
      tlsHandshake: null,
      firstByte: null,
      end: null,
    };

    const req = https.request(
      {
        hostname: HOSTNAME,
        port: PORT,
        path: PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      },
      (res) => {
        timings.firstByte = Date.now();

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          timings.end = Date.now();

          const total = timings.end - timings.start;
          const dnsTime = timings.dnsLookup ? timings.dnsLookup - timings.start : 0;
          const tcpTime = timings.tcpConnection ? timings.tcpConnection - (timings.dnsLookup || timings.start) : 0;
          const tlsTime = timings.tlsHandshake ? timings.tlsHandshake - (timings.tcpConnection || timings.start) : 0;
          const firstByteTime = timings.firstByte - timings.start;
          const downloadTime = timings.end - timings.firstByte;

          console.log(`   📊 Breakdown de latência:`);
          console.log(`      • DNS Lookup:    ${dnsTime}ms`);
          console.log(`      • TCP Connect:   ${tcpTime}ms`);
          console.log(`      • TLS Handshake: ${tlsTime}ms`);
          console.log(`      • Wait (TTFB):   ${firstByteTime}ms  ← TEMPO DO N8N`);
          console.log(`      • Download:      ${downloadTime}ms`);
          console.log(`      ─────────────────────────────`);
          console.log(`      • TOTAL:         ${total}ms`);

          try {
            const parsed = JSON.parse(data);
            console.log(`   ✅ Resposta válida (${Array.isArray(parsed) ? parsed.length : 'N/A'} máquinas)`);
          } catch {
            console.log(`   ⚠️  Resposta não-JSON`);
          }

          resolve({ success: true, timings, total });
        });
      }
    );

    req.on('socket', (socket) => {
      socket.on('lookup', () => {
        timings.dnsLookup = Date.now();
      });

      socket.on('connect', () => {
        timings.tcpConnection = Date.now();
      });

      socket.on('secureConnect', () => {
        timings.tlsHandshake = Date.now();
      });
    });

    req.on('error', (error) => {
      console.error(`   ❌ Erro: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`   ⏱️  Timeout!`);
      resolve({ success: false, error: 'Timeout' });
    });

    req.setTimeout(30000); // 30 segundos

    // Enviar body
    req.write(JSON.stringify({
      includeMetrics: { turno: true, of: true }
    }));
    req.end();
  });
}

async function testMultipleCalls() {
  console.log('\n🔁 Testando múltiplas chamadas (warm connection)...');

  const results = [];
  for (let i = 1; i <= 3; i++) {
    const start = Date.now();

    try {
      const response = await fetch(`https://${HOSTNAME}${PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          includeMetrics: { turno: true, of: true }
        }),
      });

      await response.json();
      const elapsed = Date.now() - start;
      results.push(elapsed);
      console.log(`   Chamada ${i}/3: ${elapsed}ms`);
    } catch (error) {
      console.error(`   Chamada ${i}/3: ❌ ${error.message}`);
    }

    // Pequeno delay entre chamadas
    if (i < 3) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const avg = results.reduce((sum, v) => sum + v, 0) / results.length;
  console.log(`   📊 Média: ${avg.toFixed(0)}ms`);
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('   DIAGNÓSTICO DE LATÊNCIA DE REDE');
  console.log('═══════════════════════════════════════════════');
  console.log(`   Testando: https://${HOSTNAME}${PATH}`);

  // 1. Teste DNS
  await testDNS();

  // 2. Teste HTTPS detalhado
  await testHTTPSConnection();

  // 3. Teste múltiplas chamadas
  await testMultipleCalls();

  console.log('\n═══════════════════════════════════════════════');
  console.log('🔍 DIAGNÓSTICO:');
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(console.error);
