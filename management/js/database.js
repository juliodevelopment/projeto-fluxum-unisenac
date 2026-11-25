
const mysql = require('mysql2/promise');
const { createHash } = require('node:crypto');
require('dotenv').config();

// Conexão com o MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Validação de texto
function texto(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
}

// Erro de validação
function erroValidacao(mensagem) {
    const erro = new Error(mensagem);
    erro.code = 'VALIDACAO';
    throw erro;
}

function validarAluno(dados) {
    const nome = texto(dados?.nome);
    const email = texto(dados?.email);
    const telefone = texto(dados?.telefone);

    if (!nome || nome.length > 100) {
        erroValidacao('Informe um nome de até 100 caracteres.');
    }

    if (
        email.length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        erroValidacao('Informe um e-mail válido de até 150 caracteres.');
    }

    if (!telefone || telefone.length > 20) {
        erroValidacao('Informe um telefone de até 20 caracteres.');
    }

    return [nome, email, telefone];
}

function validarId(id) {
    const numero = Number(id);

    if (!Number.isSafeInteger(numero) || numero <= 0) {
        erroValidacao('Código do registro inválido.');
    }

    return numero;
}

function confirmarRegistro(resultado, id, mensagem) {
    if (resultado.affectedRows === 0) {
        erroValidacao(mensagem);
    }

    return { id };
}

// Autenticação
async function autenticar(dados) {
    const usuario = texto(dados?.usuario);
    const senha = dados?.senha;

    if (
        !usuario ||
        usuario.length > 100 ||
        typeof senha !== 'string' ||
        !senha ||
        senha.length > 128
    ) {
        erroValidacao('Informe usuário e senha válidos.');
    }

    const hash = createHash('md5')
        .update(senha, 'utf8')
        .digest('hex');

    const [usuarios] = await pool.execute(
        `SELECT id, usuario
         FROM usuarios
         WHERE usuario = ? AND senha = ?
         LIMIT 1`,
        [usuario, hash]
    );

    console.log('Usuários encontrados:', usuarios);
    if (usuarios.length === 0) {
        erroValidacao('Usuário ou senha inválidos.');
    }

    return usuarios[0];
}

// Encerrar conexão
async function fechar() {
    await pool.end();
}

const alunos = {
    async listar() {
        const [linhas] = await pool.execute(
            'SELECT id, nome, email, telefone FROM alunos ORDER BY id DESC'
        );

        return linhas;
    },

    async criar(dados) {
        const [resultado] = await pool.execute(
            'INSERT INTO alunos (nome, email, telefone) VALUES (?, ?, ?)',
            validarAluno(dados)
        );

        return { id: resultado.insertId };
    },

    async atualizar(dados) {
        const id = validarId(dados?.id);

        const [resultado] = await pool.execute(
            'UPDATE alunos SET nome = ?, email = ?, telefone = ? WHERE id = ?',
            [...validarAluno(dados), id]
        );

        return confirmarRegistro(
            resultado,
            id,
            'Aluno não encontrado. Atualize a lista.'
        );
    },

    async excluir(id) {
        const codigo = validarId(id);

        const [resultado] = await pool.execute(
            'DELETE FROM alunos WHERE id = ?',
            [codigo]
        );

        return confirmarRegistro(
            resultado,
            codigo,
            'Aluno não encontrado. Atualize a lista.'
        );
    }
};
module.exports = {
    autenticar,
    alunos,
    fechar: () => pool.end()
};
