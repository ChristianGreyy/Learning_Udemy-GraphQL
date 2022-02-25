const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const fileStorage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(multer({
        storage: fileStorage, 
        fileFilter: fileFilter
    }).single('image')
);

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/graphql', graphqlHTTP ({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
}))

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.status || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message,
        data,
    })
})

mongoose.connect('mongodb+srv://ChristianGrey:hungtruong2k2@cluster0.2oakb.mongodb.net/messages?retryWrites=true&w=majority')
.then(result => {
    app.listen(8080);
})
.catch(err => {
    console.log(err);
})