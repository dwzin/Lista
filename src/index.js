const knex = require("knex");
const knexfile = require("../knexfile")

const db = knex(knexfile);


async function AddUser(username, password) {
    try {
        const insertedUser = await db('users').insert({ username, password });
        console.log('Usuário inserido com sucesso:', insertedUser);
    } catch (error) {
        console.error('Erro ao inserir usuário:', error);
    } finally {
        await db.destroy();  
    }
}







// tests


//AddUser("admin", "admin")


