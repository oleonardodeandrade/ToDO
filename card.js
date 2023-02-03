const Sequelize = require('sequelize');
const database = require('./db');

const Card = database.define('card', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    conteudo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lista: {
        type: Sequelize.STRING,
        allowNull: false
    },
})

module.exports = Card;