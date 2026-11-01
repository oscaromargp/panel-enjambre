// Valida el panel ejecutando su JS real contra el JSON real, con un DOM mínimo.
import fs from 'node:fs';

const html = fs.readFileSync('/tmp/index-asusgo.html', 'utf8');
const estado = JSON.parse(fs.readFileSync('/root/panel-oscaromargp/estado-enjambre.json', 'utf8'));
const eventos = JSON.parse(fs.readFileSync('/root/panel-oscaromargp/eventos.json', 'utf8'));

const store = {};
function nodo(id) {
  if (!store[id]) {
    store[id] = {
      id, innerHTML: '', textContent: '', value: '',
      style: {}, dataset: {}, classList: { add(){}, remove(){}, toggle(){}, contains(){return false} },
      children: [], addEventListener(){}, appendChild(){}, setAttribute(){}, removeAttribute(){},
      querySelectorAll(){ return []; }, querySelector(){ return null; },
      focus(){}, click(){}, closest(){ return null; }
    };
  }
  return store[id];
}

globalThis.document = {
  getElementById: (id) => nodo(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => nodo('__tmp' + Math.random()),
  addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') fn(); },
  body: nodo('__body'), documentElement: nodo('__html'),
  title: 'Panel'
};
globalThis.window = { addEventListener(){}, matchMedia: () => ({matches:false, addEventListener(){}}) };
globalThis.location = { search: '', hash: '' };
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.fetch = async (url) => {
  const u = String(url);
  let data = null;
  if (u.includes('estado-enjambre')) data = estado;
  else if (u.includes('eventos')) data = eventos;
  else if (u.includes('progreso') || u.includes('trabajos')) data = {};
  return { ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) };
};

const guion = html.match(/<script>([\s\S]*?)<\/script>/)[1];
try {
  await new Function(guion)();
  await new Promise(r => setTimeout(r, 900));
} catch (e) {
  console.log('❌ EL SCRIPT REVIENTA:', e.message);
  process.exit(1);
}

const limpia = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const areas = Object.keys(store).filter(k => /equipo|resumen|lista|resumen-/.test(k));
let salida = '';
for (const k of areas) salida += ' ' + store[k].innerHTML;

console.log('— Tarjetas detectadas:', (salida.match(/class="card/g) || []).length);
console.log('— Texto:', limpia(salida).slice(0, 620));

// Comprobaciones
const equipos = ['F16', 'Vivobook', 'Centenario', 'Taller'];
let fallos = [];
for (const n of equipos) {
  // aislar el bloque de la tarjeta de ese equipo
  const i = salida.indexOf('>' + n + '<');
  if (i < 0) { fallos.push('no encontré tarjeta de ' + n); continue; }
  const bloque = limpia(salida.slice(i, i + 1400));
  const faltan = ['CPU', 'RAM', 'Disco'].filter(c => new RegExp(c + '\\s+sin dato').test(bloque));
  if (faltan.length) fallos.push(`${n}: ${faltan.join('/')} sin dato`);
  console.log('  · ' + n + ': ' + bloque.slice(0, 200));
}
const iaRepetida = (salida.match(/IA hoy/g) || []).length;
if (iaRepetida === 0) fallos.push('ninguna tarjeta muestra IA hoy');
// el costo puede ser 0.0000 en todas si trabajan con modelo gratuito: lo que NO debe
// repetirse es el número de tokens (eso probaría copia del total global en cada tarjeta)
const toks = [...salida.matchAll(/([\d,]+) tokens/g)].map(m => m[1]);
if (toks.length >= 4 && new Set(toks).size === 1) fallos.push('el mismo número de tokens se repite en todas las tarjetas: ' + toks[0]);
console.log('— Tokens por tarjeta:', [...new Set(toks)].slice(0, 6).join(' · '));
console.log(fallos.length ? '❌ FALLOS: ' + fallos.join(' | ') : '✅ Sin «sin dato» en los cuatro equipos y sin valores repetidos');
process.exit(fallos.length ? 2 : 0);
