require('./models/db');

const express = require('express');
const expenseController = require('./controllers/expenseController');
const path = require('path');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

var app = express();
/// Using body parser to set values from form to req
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts', handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set('view engine', 'hbs');
app.use("/style", express.static(__dirname + "/style/"));
/// Starting server
app.listen(3000, () => {
    console.log('Server started at port 3000');
});

/// Route for user controller
app.use('/expenses', expenseController);
app.use('/incomes', expenseController);
app.use('/login', expenseController);