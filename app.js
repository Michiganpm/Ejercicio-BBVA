const BASE = "https://pokeapi.co/api/v2/pokemon/";
let actual = null;          // Pokemon mostrado en la ficha
let equipo = [];            // Máximo 6 sin duplicar (por id)

function mostrarMensaje(texto) {
  const m = document.getElementById("mensaje");
  m.textContent = texto;
  m.classList.remove("d-none");
}
function ocultarMensaje() { document.getElementById("mensaje").classList.add("d-none"); }

async function buscar(param) {
  ocultarMensaje();
  document.getElementById("ficha").innerHTML = '<p class="text-muted">Buscando…</p>';
  try {
    const r = await fetch(BASE + encodeURIComponent(String(param).toLowerCase().trim()));
    if (!r.ok) throw new Error("No encontrado");
    actual = await r.json();
    mostrarFicha(actual);
  } catch (e) {
    actual = null;
    document.getElementById("ficha").innerHTML = "";
    mostrarMensaje("No se encontró ese Pokemon. Revisa el nombre o el id (1 al 150 en aleatorio). Ejemplo: ditto o 132.");
  }
}

function mostrarFicha(p) {
  const tipos = p.types.map(t => t.type.name).join(", ");
  const habilidades = p.abilities.map(a => a.ability.name).join(", ");
  const img = (p.sprites.other && p.sprites.other["official-artwork"] && p.sprites.other["official-artwork"].front_default)
    || p.sprites.front_default || "";
  document.getElementById("ficha").innerHTML = `
  <div class="card"><div class="card-body d-flex flex-wrap gap-4 align-items-center">
    ${img ? `<img src="${img}" class="poke-img" alt="${p.name}">` : ""}
    <div>
      <h3 class="text-capitalize mb-1">#${p.id} — ${p.name}</h3>
      <p class="mb-1"><strong>Tipo:</strong> <span class="tipo">${tipos}</span></p>
      <p class="mb-1"><strong>Altura:</strong> ${p.height / 10} m &nbsp; <strong>Peso:</strong> ${p.weight / 10} kg</p>
      <p class="mb-1"><strong>Experiencia base:</strong> ${p.base_experience ?? "—"}</p>
      <p class="mb-3"><strong>Habilidades:</strong> <span class="tipo">${habilidades}</span></p>
      <button class="btn btn-outline-primary me-2" onclick="verDetalle()">Más información</button>
      <button class="btn btn-primary" onclick="agregarATabla()">Añadir a la tabla</button>
    </div>
  </div></div>`;
}

function verDetalle() {
  if (!actual) return;
  const stats = actual.stats.map(s => `<li><strong>${s.stat.name}:</strong> ${s.base_stat}</li>`).join("");
  const movimientos = actual.moves.slice(0, 10).map(m => m.move.name).join(", ");
  document.getElementById("modal-titulo").textContent = "#" + actual.id + " — " + actual.name;
  document.getElementById("modal-cuerpo").innerHTML = `
    <p><strong>Tipos:</strong> <span class="tipo">${actual.types.map(t => t.type.name).join(", ")}</span></p>
    <p><strong>Altura:</strong> ${actual.height / 10} m · <strong>Peso:</strong> ${actual.weight / 10} kg</p>
    <p><strong>Experiencia base:</strong> ${actual.base_experience ?? "—"}</p>
    <p><strong>Habilidades:</strong> <span class="tipo">${actual.abilities.map(a => a.ability.name + (a.is_hidden ? " (oculta)" : "")).join(", ")}</span></p>
    <p><strong>Estadísticas:</strong></p><ul>${stats}</ul>
    <p><strong>Algunos movimientos:</strong> <span class="tipo">${movimientos}</span></p>
    <p><strong>Especie:</strong> <a href="${actual.species.url}" target="_blank" rel="noopener">${actual.species.name}</a></p>`;
  new bootstrap.Modal(document.getElementById("modal-detalle")).show();
}

function agregarATabla() {
  if (!actual) return;
  if (equipo.some(p => p.id === actual.id)) { mostrarMensaje(actual.name + " ya está en la tabla, no se insertó de nuevo."); return; }
  if (equipo.length >= 6) { mostrarMensaje("La tabla ya tiene 6 Pokemon, que es el máximo. Quita uno para agregar otro."); return; }
  equipo.push(actual);
  ocultarMensaje();
  pintarTabla();
}

function quitarDeTabla(id) {
  equipo = equipo.filter(p => p.id !== id);
  pintarTabla();
}

function pintarTabla() {
  const tbody = document.getElementById("tabla-equipo");
  document.getElementById("contador-equipo").textContent = equipo.length + " / 6 Pokemon";
  if (!equipo.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-muted">Aún no agregas Pokemon. Busca uno y pulsa "Añadir a la tabla".</td></tr>';
    return;
  }
  tbody.innerHTML = equipo.map(p => `
    <tr>
      <td>${p.id}</td>
      <td><img src="${p.sprites.front_default || ""}" alt="${p.name}" width="56"></td>
      <td class="text-capitalize">${p.name}</td>
      <td class="tipo">${p.types.map(t => t.type.name).join(", ")}</td>
      <td>${p.height / 10} m</td>
      <td>${p.weight / 10} kg</td>
      <td><button class="btn btn-sm btn-outline-danger" onclick="quitarDeTabla(${p.id})">Quitar</button></td>
    </tr>`).join("");
}

document.getElementById("btn-nombre").addEventListener("click", () => {
  const v = document.getElementById("nombre").value.trim();
  if (!v) { mostrarMensaje("Escribe un nombre, por ejemplo: ditto."); return; }
  buscar(v);
});
document.getElementById("nombre").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("btn-nombre").click();
});
document.getElementById("btn-aleatorio").addEventListener("click", () => {
  const id = Math.floor(Math.random() * 150) + 1; // 1 al 150
  buscar(id);
});