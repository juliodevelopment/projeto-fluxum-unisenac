
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

module.exports = {
    autenticar,
    fechar
};
