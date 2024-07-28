require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const usersRouter = require('./routes/api');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

mongoose.connect(process.env.MONGO_DB_URL)
        .then(() => {
            console.log('DB connected Successfully');
        })
        .catch((error) => {
            console.log(`Database connection unsuccessful error occured: ${error}`)
        });

app.use('/api', usersRouter);// Not that This  line must be place on top of "res.sendFile(__dirname + '/views/index.html" which is below

app.use('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})




const listener = app.listen(process.env.PORT || 5000, () => {
    console.log(`App is listening on Port: ${listener.address().port}`)
})