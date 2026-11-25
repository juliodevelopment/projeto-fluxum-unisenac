const destino = window.location.pathname.split('/').pop();
document.getElementById('destino').textContent = destino;
document.getElementById('voltarMenu').addEventListener('click', () => window.menu.inicio());