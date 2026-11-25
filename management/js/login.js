const formLogin = document.getElementById('formLogin');
const usuario = document.getElementById('usuario');
const senha = document.getElementById('senha');
const entrar = document.getElementById('entrar');
const mensagemLogin = document.getElementById('mensagemLogin');
const botao = document.getElementById('btnMostrar');
botao.addEventListener('click', () => {
    // Verifica o tipo atual e alterna entre 'text' e 'password'
    if (inputSenha.type === 'password') {
      inputSenha.type = 'text';
      botao.textContent = 'Ocultar senha';
    } else {
      inputSenha.type = 'password';
      botao.textContent = 'Mostrar';
    }
});

formLogin.addEventListener('submit', async evento => {
    evento.preventDefault();

    if(entrar.disabled){
        return;
    }

    entrar.disabled = true;
    mensagemLogin.textContent = 'Verificando acesso...';

    try {
        const resposta = await window.auth.login({
            usuario: usuario.value.trim(),
            senha: senha.value
        });

        senha.value = '';
        if(resposta.ok){
            window.auth.abrirPrincipal();
            return;
        }

        mensagemLogin.textContent = resposta.erro;
    } catch (error) {
        mensagemLogin.textContent = `Não foi possível entrar. Tente novamente\n${error}`;
        senha.value = '';
        entrar.disabled = false;
        
    }
    entrar.disabled = false;
    senha.focus();
});