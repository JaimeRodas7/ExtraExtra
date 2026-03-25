function abrirPeriodico() {
    let carta = document.getElementById('pantalla-carta');
    if(carta) carta.style.display = 'none';
    
    let periodico = document.getElementById('periodico-contenido');
    if(periodico) periodico.style.display = 'block';
}

// ============================================
// LÓGICA DE LA SOPA DE LETRAS ALEATORIA
// ============================================
const palabrasOcultas = ["FELIZ", "VEINTE", "CUMPLEAÑOS", "POLLITO", "GRANJITA"];
const tamanoSopa = 11; 
let celdasSeleccionadas = [];
let palabrasEncontradas = [];
let gridSopaGlobal = []; 

function crearGridAleatorio() {
    const grid = Array(tamanoSopa).fill(null).map(() => Array(tamanoSopa).fill(''));
    
    let palabrasAcomodar = [...palabrasOcultas].sort((a, b) => b.length - a.length);

    palabrasAcomodar.forEach(palabra => {
        let colocada = false;
        let intentos = 0;

        while (!colocada && intentos < 200) { 
            intentos++;
            const dir = Math.random() < 0.5 ? 'H' : 'V'; 
            const fila = Math.floor(Math.random() * tamanoSopa);
            const col = Math.floor(Math.random() * tamanoSopa);

            if (dir === 'H' && col + palabra.length > tamanoSopa) continue;
            if (dir === 'V' && fila + palabra.length > tamanoSopa) continue;

            let colision = false;
            for (let i = 0; i < palabra.length; i++) {
                let f = dir === 'H' ? fila : fila + i;
                let c = dir === 'H' ? col + i : col;
                
                if (grid[f][c] !== '') {
                    colision = true;
                    break;
                }
            }

            if (!colision) {
                for (let i = 0; i < palabra.length; i++) {
                    let f = dir === 'H' ? fila : fila + i;
                    let c = dir === 'H' ? col + i : col;
                    grid[f][c] = palabra[i];
                }
                colocada = true;
            }
        }
    });

    const letrasAleatorias = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    for (let f = 0; f < tamanoSopa; f++) {
        for (let c = 0; c < tamanoSopa; c++) {
            if (grid[f][c] === '') {
                grid[f][c] = letrasAleatorias.charAt(Math.floor(Math.random() * letrasAleatorias.length));
            }
        }
    }
    
    gridSopaGlobal = grid;
}

function generarHTMLSopa(esInteractiva) {
    let html = '';
    for (let f = 0; f < tamanoSopa; f++) {
        for (let c = 0; c < tamanoSopa; c++) {
            if (esInteractiva) {
                html += `<span class="letra-sopa" onclick="seleccionarLetra(this)">${gridSopaGlobal[f][c]}</span>`;
            } else {
                html += `<span>${gridSopaGlobal[f][c]}</span>`;
            }
        }
    }
    return html;
}

// Cargamos una sopa inicial al abrir la página por primera vez
document.addEventListener("DOMContentLoaded", function() {
    crearGridAleatorio(); 
    const contenedorSopa = document.getElementById('mini-sopa');
    if(contenedorSopa) {
        contenedorSopa.innerHTML = generarHTMLSopa(false); 
    }
});

// Función que se ejecuta CADA VEZ que se hace clic en la sopa
function jugarSopa() {
    crearGridAleatorio();

    const contenedorSopa = document.getElementById('mini-sopa');
    if(contenedorSopa) {
        contenedorSopa.innerHTML = generarHTMLSopa(false); 
    }

    celdasSeleccionadas = [];
    palabrasEncontradas = [];

    let listaPalabrasHTML = '<div class="lista-palabras">';
    palabrasOcultas.forEach(p => {
        listaPalabrasHTML += `<span id="palabra-${p}">${p}</span>`;
    });
    listaPalabrasHTML += '</div>';

    Swal.fire({
        title: 'Sopa de Letras',
        html: `
            <p style="margin-bottom:10px; font-style: italic; font-size: 14px;">(Toca las letras una por una para formar las palabras)</p>
            ${listaPalabrasHTML}
            <div class="sopa-grid-popup">${generarHTMLSopa(true)}</div>
            <button class="btn-limpiar" onclick="limpiarSeleccion()">Soltar letras</button>
        `,
        showConfirmButton: false, 
        showCloseButton: true,
        background: '#fdf6e3 url(https://www.transparenttextures.com/patterns/parchment.png)',
        customClass: { popup: 'swal-sopa-container' }
    });
}

function seleccionarLetra(elemento) {
    if (elemento.classList.contains('encontrada')) return;

    if (elemento.classList.contains('seleccionada')) {
        elemento.classList.remove('seleccionada');
        celdasSeleccionadas = celdasSeleccionadas.filter(e => e !== elemento);
    } else {
        elemento.classList.add('seleccionada');
        celdasSeleccionadas.push(elemento);
    }
    verificarPalabra();
}

function limpiarSeleccion() {
    celdasSeleccionadas.forEach(e => e.classList.remove('seleccionada'));
    celdasSeleccionadas = [];
}

function verificarPalabra() {
    if (celdasSeleccionadas.length === 0) return;
    
    let palabraFormada = celdasSeleccionadas.map(e => e.innerText).join('');
    let palabraReversa = celdasSeleccionadas.map(e => e.innerText).reverse().join('');

    let coincidencia = palabrasOcultas.find(p => p === palabraFormada || p === palabraReversa);

    if (coincidencia && !palabrasEncontradas.includes(coincidencia)) {
        palabrasEncontradas.push(coincidencia); 
        
        celdasSeleccionadas.forEach(e => {
            e.classList.remove('seleccionada');
            e.classList.add('encontrada');
        });
        celdasSeleccionadas = []; 
        
        let listaItem = document.getElementById(`palabra-${coincidencia}`);
        if (listaItem) {
            listaItem.style.textDecoration = "line-through";
            listaItem.style.backgroundColor = "#8b0000";
            listaItem.style.color = "#fff";
        }

        if (palabrasEncontradas.length === palabrasOcultas.length) {
            setTimeout(() => {
                Swal.fire({
                    title: '¡Reto Completado!',
                    text: '¡Encontraste todas las palabras!',
                    icon: 'success',
                    confirmButtonColor: '#8b0000',
                    background: '#fdf6e3 url(https://www.transparenttextures.com/patterns/parchment.png)'
                });
            }, 500);
        }
    }
}

// ============================================
// ALERTAS Y CARTA EXTRA
// ============================================
function mostrarAlerta() {
    Swal.fire({
        title: '¡FIESTA URGENTE!',
        text: "¿Aceptas pasar el mejor cumpleaños de tu vida hoy?",
        icon: 'star',
        iconColor: '#8b0000',
        showCancelButton: true,
        confirmButtonText: '¡Sí, claro que sí!',
        cancelButtonText: '¡Obvio!',
        background: '#fdf6e3 url(https://www.transparenttextures.com/patterns/parchment.png)',
        backdrop: `rgba(139, 0, 0, 0.3)`
    });
}

function respuestaCumple(tipo) {
    let msg = tipo === 'pastel' ? '¡Que no falten las velitas!' : tipo === 'fiesta' ? '¡Preparen la música y los globos!' : '¡A empacar las maletas!';
    Swal.fire({ title: '🎉', text: msg, confirmButtonColor: '#8b0000', background: '#fdf6e3 url(https://www.transparenttextures.com/patterns/parchment.png)' });
}

function mostrarCartaMano() {
    Swal.fire({
        title: 'Correspondencia Inédita',
        text: 'Escrita con puño, letra.',
        // AQUÍ ESTÁ EL CAMBIO CON EL NOMBRE EXACTO DE TU IMAGEN
        imageUrl: 'cartaamano.jpeg', 
        imageWidth: 600,
        imageAlt: 'Carta escrita a mano',
        confirmButtonText: 'Guardar en el corazón',
        confirmButtonColor: '#8b0000',
        background: '#fdf6e3 url(https://www.transparenttextures.com/patterns/parchment.png)',
        customClass: {
            image: 'swal-carta-img'
        }
    });
}
