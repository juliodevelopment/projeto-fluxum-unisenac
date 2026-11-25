function conferir(resposta) {
    if (!resposta.ok) {
        throw new Error(resposta.erro);
    }
    return resposta.dados;
}
function iniciarCadastro({ api, tituloNovo, nomeRegistro, camposTabela, carregarOpcoes }) {
    const formulario = document.getElementById('formulario');
    const campos = [...formulario.querySelectorAll('[name]')];
    const titulo = document.getElementById('tituloFormulario');
    const lista = document.getElementById('lista');
    const resumo = document.getElementById('resumo');
    const mensagem = document.getElementById('mensagem');
    const salvar = document.getElementById('salvar');
    const cancelar = document.getElementById('cancelar');

    let idEdicao = null;
    let ocupado = false;
    function avisar(texto, erro = false) {
        mensagem.textContent = texto;
        mensagem.classList.toggle('erro', erro);
    }
    function bloquearControles(bloqueados) {
        for (const controle of document.querySelectorAll('button, input, select, textarea')) {
            controle.disabled = bloqueados;
        }
    }

    async function executar(tarefa) {
        if (ocupado) {
            return;
        }
        ocupado = true;
        bloquearControles(true);
        try {
            await tarefa();
        } catch (erro) {
            avisar(erro.message || 'Não foi possível concluir a operação.', true);
        } finally {
            ocupado = false;
            bloquearControles(false);
        }
    }

    function limparFormulario() {
        idEdicao = null;
        formulario.reset();
        titulo.textContent = tituloNovo;
        salvar.textContent = 'Cadastrar';
        cancelar.hidden = true;
    }

    async function carregarLista(){
        const registros = conferir(await api.listar());
        lista.replaceChildren();

        resumo.textContent = registros.length
         ? `Total de registros: ${registros.length}`
         : 'Nenhum registro cadastrado.';

         for(const registro of registros){
            const linha = document.createElement('tr');

            for(const campo of camposTabela){
                const celula = document.createElement('td');
                celula.textContent = registro[campo] ?? '';
                linha.appendChild(celula);
            }
            lista.appendChild(linha);
         }
    }
    async function atualizarAposGravacao(texto){
        try {
            await carregarLista();
            avisar(texto);
        } catch (error) {
            avisar(`${texto} use "Atualizar lista" para consultar os dados. ${error.message}`, true);
        }
    }

    async function carregarCadastro(){
        if(carregarOpcoes){
            await carregarOpcoes();
        }
        await carregarLista();
    }
    formulario.addEventListener('submit', evento => {
        evento.preventDefault();
        if(ocupado) return;

        const dados = Object.fromEntries(new FormData(formulario));

        executar(async () => {
            conferir(await api.criar(dados));
            limparFormulario();
            await atualizarAposGravacao('Registro salvo.');
        });
    });

    document.getElementById('recarregar').addEventListener('click', () => {
        executar(async () => {
            await carregarCadastro();
            avisar('Lista atualizada.');
        });
    });
    document.getElementById('voltarMenu').addEventListener('click', () => window.menu.inicio());
    document.getElementById('sair').addEventListener('click', () => window.Auth.sair());

    executar(async () => {
        try {
            await carregarCadastro();
        } catch (error) {
            resumo.textContent = 'Não foi possível carregar a lista.';
            throw error;
        }
    });
}

