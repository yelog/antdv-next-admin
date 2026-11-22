import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

test('the production login entry does not load charting code', async (context) => {
  const result = await build({
    mode: 'production',
    logLevel: 'error',
    build: { write: false, reportCompressedSize: false },
  });
  const chunks = [result]
    .flat()
    .flatMap((output) => output.output)
    .filter((item) => item.type === 'chunk');
  const byFilename = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
  const findPage = (path) => chunks.find((chunk) => chunk.facadeModuleId?.endsWith(path));
  const entry = chunks.find((chunk) => chunk.isEntry);
  const login = findPage('/src/views/login/index.vue');
  const chart = findPage('/src/components/Pro/ProChart/index.vue');
  assert.ok(entry && login && chart, 'Expected the entry, login, and chart chunks');

  function staticImports(...roots) {
    const visited = new Set();
    function visit(chunk) {
      if (visited.has(chunk)) return;
      visited.add(chunk);
      for (const filename of chunk.imports) {
        const dependency = byFilename.get(filename);
        if (dependency) visit(dependency);
      }
    }
    roots.forEach(visit);
    return [...visited];
  }

  function chartChunks(imports) {
    return imports.filter((chunk) =>
      Object.keys(chunk.modules).some((id) =>
        /\/node_modules\/(?:echarts|vue-echarts)\//.test(id.replaceAll('\\', '/')),
      ),
    );
  }

  const loginGraph = staticImports(entry, login);
  const chartGraph = staticImports(chart);
  const compressedBytes = loginGraph.reduce(
    (bytes, chunk) => bytes + gzipSync(chunk.code).length,
    0,
  );
  context.diagnostic(`Login JS: ${(compressedBytes / 1000).toFixed(1)} kB gzip`);

  assert.deepEqual(
    chartChunks(loginGraph).map((chunk) => chunk.fileName),
    [],
  );
  assert.ok(chartChunks(chartGraph).length > 0, 'Expected charting code on the chart page');
});
