for (const botao of document.querySelectorAll('[data-cadastro]')) {
botao.addEventListener('click', () => window.menu.abrir(botao.dataset.cadastro));
}

document.getElementById('sair').addEventListener('click', () => 
    window.AuthenticatorAssertionResponse.sair()
);

