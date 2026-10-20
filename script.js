/* =========================================
   Portafolio Digital de Iann
   Lógica de la página
   ========================================= */

(function () {
    'use strict';

    const MESES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    /* ---------- Tema claro / oscuro ---------- */

    const TEMA_KEY = 'iann-tema';

    function aplicarTema(tema) {
        document.documentElement.setAttribute('data-theme', tema);
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            const esOscuro = tema === 'dark';
            btn.innerHTML = esOscuro
                ? '<i class="bi bi-sun-fill"></i>'
                : '<i class="bi bi-moon-stars-fill"></i>';
            btn.setAttribute('aria-label', esOscuro ? 'Activar modo claro' : 'Activar modo oscuro');
            btn.setAttribute('title', esOscuro ? 'Modo claro' : 'Modo oscuro');
        }
    }

    function initTema() {
        let guardado = null;
        try {
            guardado = localStorage.getItem(TEMA_KEY);
        } catch (e) {
            guardado = null;
        }
        const preferido = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light'
            : 'dark';
        const tema = guardado || preferido;
        aplicarTema(tema);

        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                const actual = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
                const nuevo = actual === 'light' ? 'dark' : 'light';
                aplicarTema(nuevo);
                try {
                    localStorage.setItem(TEMA_KEY, nuevo);
                } catch (e) {
                    /* almacenamiento no disponible: se mantiene solo en esta sesión */
                }
            });
        }
    }

    /* ---------- Pestañas ---------- */

    function initPestanas() {
        const links = document.querySelectorAll('.tab-link');
        const contenidos = document.querySelectorAll('.tab-content');

        if (!links.length) return;

        function mostrar(id, actualizarHash) {
            const destino = document.getElementById(id);
            if (!destino) return;

            links.forEach(l => l.classList.toggle('active', l.getAttribute('data-tab') === id));
            contenidos.forEach(c => c.classList.toggle('active', c === destino));
            ocultarMenuMovil();
            reiniciarRevelado(destino);

            if (actualizarHash !== false) {
                try {
                    history.replaceState(null, '', '#' + id);
                } catch (e) {
                    window.location.hash = id;
                }
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        links.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                mostrar(link.getAttribute('data-tab'));
            });
        });

        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById(hash)) {
            mostrar(hash, false);
        }
    }

    /* ---------- Menú móvil ---------- */

    function ocultarMenuMovil() {
        const menu = document.getElementById('menu-toggle');
        const links = document.getElementById('nav-links');
        if (menu) menu.classList.remove('abierto');
        if (links) links.classList.remove('abierto');
    }

    function initMenuMovil() {
        const btn = document.getElementById('menu-toggle');
        const links = document.getElementById('nav-links');
        if (!btn || !links) return;

        btn.addEventListener('click', function () {
            const abierto = links.classList.toggle('abierto');
            btn.classList.toggle('abierto', abierto);
            btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
        });

        document.addEventListener('click', function (e) {
            if (!links.contains(e.target) && !btn.contains(e.target)) {
                ocultarMenuMovil();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) ocultarMenuMovil();
        });
    }

    /* ---------- Animación al hacer scroll ---------- */

    let observador = null;

    function reiniciarRevelado(contenedor) {
        const elementos = contenedor.querySelectorAll('.reveal:not(.visible)');
        if (observador) {
            elementos.forEach(el => observador.observe(el));
        }
    }

    function initRevelado() {
        const elementos = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            elementos.forEach(el => el.classList.add('visible'));
            return;
        }

        // Escalonado sutil dentro de cada grupo (rejillas)
        elementos.forEach(function (el) {
            const hermanos = el.parentElement ? Array.from(el.parentElement.children) : [];
            const indice = hermanos.indexOf(el);
            if (indice > 0) {
                el.style.setProperty('--delay', (indice % 4) * 90 + 'ms');
            }
        });

        observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('visible');
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        elementos.forEach(el => observador.observe(el));
    }

    /* ---------- Línea de tiempo / progreso del año ---------- */

    function initTimeline() {
        const ahora = new Date();
        const mesActual = ahora.getFullYear() === 2026 ? ahora.getMonth() : -1;

        const tarjetas = document.querySelectorAll('.mes-card');
        tarjetas.forEach(function (tarjeta, indice) {
            const titulo = tarjeta.querySelector('.mes-titulo');
            if (!titulo) return;

            const badge = document.createElement('span');
            badge.className = 'badge-mes';

            if (mesActual === -1) {
                badge.classList.add('futuro');
                badge.textContent = '2026';
            } else if (indice < mesActual) {
                tarjeta.classList.add('completado');
                badge.textContent = 'Completado';
            } else if (indice === mesActual) {
                tarjeta.classList.add('actual');
                badge.classList.add('en-progreso');
                badge.textContent = 'Mes actual';
            } else {
                tarjeta.classList.add('futuro');
                badge.classList.add('futuro');
                badge.textContent = 'Planificado';
            }
            titulo.appendChild(badge);
        });

        const relleno = document.getElementById('progreso-fill');
        const texto = document.getElementById('progreso-texto');
        if (!relleno || !texto) return;

        const porcentaje = mesActual === -1
            ? 0
            : Math.round(((mesActual + 1) / 12) * 100);

        setTimeout(function () {
            relleno.style.width = porcentaje + '%';
        }, 250);

        const nombreMes = mesActual === -1 ? 'enero' : MESES[mesActual].toLowerCase();
        texto.textContent = porcentaje + '% · ' + nombreMes;
    }

    /* ----------.year en el footer ---------- */

    function initAnio() {
        const el = document.getElementById('anio-actual');
        if (el) el.textContent = new Date().getFullYear();
    }

    /* ---------- Init ---------- */

    document.addEventListener('DOMContentLoaded', function () {
        initTema();
        initPestanas();
        initMenuMovil();
        initRevelado();
        initTimeline();
        initAnio();
    });
})();
