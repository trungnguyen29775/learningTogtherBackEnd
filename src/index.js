const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { log } = require('console');
const db = require('./model');

const httpServer = createServer(app);

const port = 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

db.sequelize.sync({ alter: true });

httpServer.listen(port, () => {
    console.log('Listen on port ', port);
});
