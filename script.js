function toggle(element) {
  element.classList.toggle('active');
}
document.addEventListener("DOMContentLoaded", () => {
  const ramos = document.querySelectorAll(".ramo");

  // Inicialmente todos bloqueados menos los del primer semestre
  ramos.forEach(r => {
    const semestre = r.closest(".semestre").querySelector("h2").innerText;
    if (semestre !== "Primer Semestre") {
      r.classList.add("bloqueado");
    }
  });

  // Al hacer clic
  ramos.forEach(ramo => {
    ramo.addEventListener("click", () => {
      if (ramo.classList.contains("bloqueado")) return;

      ramo.classList.toggle("aprobado");

      // Desbloquear dependientes
      const desbloquea = ramo.getAttribute("data-desbloquea");
      if (desbloquea && ramo.classList.contains("aprobado")) {
        desbloquea.split(",").forEach(nombre => {
          const dep = Array.from(ramos).find(r => r.getAttribute("data-ramo") === nombre.trim());
          if (dep) dep.classList.remove("bloqueado");
        });
      }
    });
  });
});
