var express = require('express');
var moment = require('moment');
var cors = require('cors')
var jwt = require('jsonwebtoken');
require('dotenv').config();

var app = express()
app.use(cors())
//index.js
const bodyParser = require('body-parser')

app.use(bodyParser.json())

authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).send({
            mensagem: 'Não autorizado!'
        })
    }
    const parts = authorization.split(" ");

    if (parts.length !== 2) {
        return res.status(401).send({
            mensagem: 'Não autorizado!'
        })
    }

    const [schema, token] = parts;
    if (schema !== "Bearer") {
        return res.status(401).send({
            mensagem: 'Não autorizado!'
        })
    }
    jwt.verify(
        token, process.env.JWT_KEY, (error, decoded) => {
            if (error) {
                return res.status(401).send({
                    mensagem: 'Não autorizado!'
                })
            }
        }
    );
    next();
};

app.post('/login', (req, res, next) => {

    if (req.body.login == process.env.LOGIN && req.body.senha == process.env.PASSWORD) {
        let token = jwt.sign({
            login: req.body.login,
        }, process.env.JWT_KEY, {
            expiresIn: "40m",
        });
        res.status(200).send({
            token: token
        })
    } else {
        res.status(401).send({
            mensagem: "Credenciais incorretas"
        })
    }
})

app.get('/cards', authMiddleware, function (req, res) {
    (async () => {
        const database = require('./db');
        const Card = require('./card');

        try {
            const resultado = await database.sync();
            const Cards = await Card.findAll();
            res.status(200).send(Cards);
        } catch (error) {
            res.status(400);
        }
    })();

});


app.post('/cards', authMiddleware, function (req, res) {

    (async () => {
        const database = require('./db');
        const Card = require('./card');
        try {
            const resultadoCreate = await Card.create({
                titulo: req.body.titulo,
                conteudo: req.body.conteudo,
                lista: req.body.lista,
            })
            res.status(200).send({
                id: resultadoCreate.dataValues.id,
                titulo: resultadoCreate.dataValues.titulo,
                conteudo: resultadoCreate.dataValues.conteudo,
                lista: resultadoCreate.dataValues.lista
            })
        } catch (error) {
            res.status(400);
        }
    })();

});


app.put('/cards/:id', authMiddleware, function (req, res) {
    (async () => {
        const database = require('./db');
        const Card = require('./card');

        try {

            const card = await Card.findByPk(req.params.id);
            if (card === null) {
                res.status(404).send();
            }
            card.titulo = req.body.titulo;
            card.conteudo = req.body.conteudo;
            card.lista = req.body.lista;

            const resultadoSave = await card.save();
            let databrasilminutos = moment().format("DD/MM/YYYY hh:mm:ss");
            console.log(databrasilminutos + " - " + resultadoSave.dataValues.titulo + " - " + resultadoSave.dataValues.conteudo + " - Alterado");
            res.status(200).send({
                id: resultadoSave.dataValues.id,
                titulo: resultadoSave.dataValues.titulo,
                conteudo: resultadoSave.dataValues.conteudo,
                lista: resultadoSave.dataValues.lista
            })
        } catch (error) {
            res.status(400);
        }
    })();
});


app.delete('/cards/:id', authMiddleware, function (req, res) {
    (async () => {
        const database = require('./db');
        const Card = require('./card');

        try {
            const card = await Card.findByPk(req.params.id);

            if (card == null) {
                res.status(404).send();
            }
            card.destroy();
            let databrasilminutos = moment().format("DD/MM/YYYY hh:mm:ss");
            console.log(databrasilminutos + " - " + card.titulo + " - " + card.conteudo + " - Removido");
            const Cards = await Card.findAll();
            res.status(200).send(Cards);
        } catch (error) {
            res.status(400);
        }
    })();
});

app.listen(5000, function () {
    console.log("Ok")
})
