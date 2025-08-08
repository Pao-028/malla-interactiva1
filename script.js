// Script para manejar desbloqueos/aprobados y persistencia

document.addEventListener("DOMContentLoaded", () => {
  const ramos = Array.from(document.querySelectorAll(".ramo"));
  const resetBtn = document.getElementById("reset");

  // Construir mapa: nombre -> elemento
  const mapa = {};
  ramos.forEach(r => mapa[r.dataset.ramo.trim()] = r);

  // Construir mapa de prerequisitos: para cada ramo destino, lista de prereqs
  const prereqs = {}; // destino -> [prereq1, prereq2...]
  ramos.forEach(r => {
    const orig = r.dataset.ramo.trim();
    const dests = (r.dataset.desbloquea || "").split(",").map(s => s.trim()).filter(s => s);
    dests.forEach(d => {
      if (!prereqs[d]) prereqs[d] = [];
      prereqs[d].push(orig);
    });
  });

  // Leer estado desde localStorage (aprobados)
  const STORAGE_KEY = "malla_aprobados_v1";
  const aprobadosGuardados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const aprobados = new Set(aprobadosGuardados);

  // Inicial: marcar aprobados según storage
  aprobados.forEach(nombre => {
    if (mapa[nombre]) mapa[nombre].classList.add("aprobado");
  });

  // Función que decide si un ramo debe desbloquearse:
  // se desbloquea si no tiene prereqs o si al menos uno de sus prereqs está aprobado
  function estaDesbloqueado(nombre) {
    const lista = prereqs[nombre];
    if (!lista || lista.length === 0) return true; // sin prereqs -> disponible
    // disponible si al menos un prereq aprobado
    return lista.some(p => aprobados.has(p));
  }

  // Actualizar estado visual de todos los ramos (aprobado, bloqueado, disponible)
  function actualizarVisual() {
    ramos.forEach(r => {
      const nombre = r.dataset.ramo.trim();
      // si ya aprobado -> aprobado (independiente de desbloqueo)
      if (aprobados.has(nombre)) {
        r.classList.add("aprobado");
        r.classList.remove("bloqueado");
        r.removeAttribute("aria-disabled");
        addTag(r, "Aprobado");
      } else {
        // comprobar desbloqueo
        if (estaDesbloqueado(nombre)) {
          r.classList.remove("bloqueado");
          r.removeAttribute("aria-disabled");
          addTag(r, "Disponible");
        } else {
          r.classList.add("bloqueado");
          r.setAttribute("aria-disabled", "true");
          removeTag(r);
        }
        r.classList.remove("aprobado");
      }
    });
    persistir();
  }

  // Añade una pequeña etiqueta de estado dentro del elemento si no existe
  function addTag(elem, texto) {
    let tag = elem.querySelector(".tag");
    if (!tag) {
      tag = document.createElement("span");
      tag.className = "tag";
      elem.appendChild(tag);
    }
    tag.textContent = texto;
  }

  function removeTag(elem) {
    const tag = elem.querySelector(".tag");
    if (tag) tag.remove();
  }

  // Persistir aprobados en localStorage
  function persistir() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(aprobados)));
  }

  // Manejo de click
  ramos.forEach(r => {
    r.addEventListener("click", () => {
      const nombre = r.dataset.ramo.trim();
      // Si está bloqueado y no aprobado, no hacer nada
      if (r.classList.contains("bloqueado") && !aprobados.has(nombre)) return;

      // Alternar aprobado
      if (aprobados.has(nombre)) {
        aprobados.delete(nombre);
      } else {
        aprobados.add(nombre);
      }

      // Actualizar visual; esto automáticamente manejará desbloqueos dependientes
      actualizarVisual();
    });
  });

  // Reset botón
  resetBtn.addEventListener("click", () => {
    if (!confirm("¿Seguro quieres reiniciar la malla y borrar los aprobados?")) return;
    aprobados.clear();
    persistir();
    actualizarVisual();
  });

  // Primera actualización al cargar
  actualizarVisual();
});

