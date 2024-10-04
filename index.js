var express  = require('express');
var router = express.Router();
var mssql = require('mssql');
var path = require('path');
var app = express();
var port = 8080;

// connection
var connection = require('./config');
const getAllItems = require('./queris');


app.use(express.urlencoded({ extended: true }));


app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');


// Маршрут для главной страницы
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/pages/index-2.html'));
});


// Маршрут для страницы signIn
app.get('/signIn', function(req, res) {
    res.sendFile(path.join(__dirname, '/pages/signIn.html'));
});


// Маршрут для страницы signUp
app.get('/signUp', function(req, res) {
    res.sendFile(path.join(__dirname, '/pages/signUp.html'));
});


// Обработка данных формы для авторизации
app.post('/serverSignIn', (req, res) => {
    const login = req.body.login;
    const password = req.body.password;

    console.log(`Login: ${login}, Password: ${password}`);

    connection.connect(function(err) {
        if (err) { console.error('Error connecting to the database:', err); }

        var ps = new mssql.PreparedStatement(connection);
        ps.input('login', mssql.NVarChar);
        ps.input('password', mssql.NVarChar);

        let query = `
            SELECT id, login, 'admin' AS userType
            FROM Admins 
            WHERE Admins.login = @login AND Admins.password = @password

            UNION

            SELECT id, login, 'user' AS userType
            FROM Users 
            WHERE Users.login = @login AND Users.password = @password
        `;

        ps.prepare(query, (err) => {
            if (err) { console.error('Error preparing statement:', err); }

            ps.execute({login, password}, (err, data) => {
                if (err) { console.error('Error executing prepared statement:', err); }

                console.log(data.recordset[0]);

                if (data.recordset.length != 0) {
                    const user = data.recordset[0];

                    if (user.userType == 'admin') {
                        getAllItems(req, res);
                    } else if (user.userType == 'user') {
                        res.sendFile(path.join(__dirname, '/pages/user.html'));
                    }
                } else {
                    res.status(401).json({ error: 'Invalid login or password' });
                }
                ps.unprepare();
            });
        });
    });
});


// Обработка данных формы для регистрации
app.post('/serverSignUp', (req, res) => {
    const name = req.body.name;
    const login = req.body.login;
    const password = req.body.password;

    console.log(`Name: ${name} Login: ${login}, Password: ${password}`);

    connection.connect(function(err) {
        if (err) { console.error('Error connecting to the database:', err); }

        // Проверка, существует ли уже пользователь с таким логином
        const checkQuery = `
            SELECT *
            FROM Users 
            WHERE Users.login = @login
        `;

        const psCheck = new mssql.PreparedStatement(connection);
        psCheck.input('login', mssql.NVarChar);

        psCheck.prepare(checkQuery, (err) => {
            if (err) { console.error('Error preparing statement:', err); }

            psCheck.execute({login}, (err, data) => {
                if (err) { console.error('Error executing prepared statement:', err); }

                console.log(data.recordset[0]);

                if (data.recordset.length != 0) {
                    console.log('User with this login already exists');
                    res.status(401).json({ error: 'User with this login already exists' });
                } else {
                    var ps = new mssql.PreparedStatement(connection);
                    ps.input('name', mssql.NVarChar);
                    ps.input('login', mssql.NVarChar);
                    ps.input('password', mssql.NVarChar);

                    let inserts = {name, login, password};

                    let query = `
                        INSERT INTO Users (name, login, password) VALUES (@name , @login, @password)
                    `;

                    ps.prepare(query, function(err) {
                        if (err) { console.log(err); }

                        ps.execute(inserts, function(err) {
                            if (err) { console.log(err); }

                            console.log('add user');
                            res.status(200).send('User registered successfully');

                            ps.unprepare();
                        });
                    });
                }
                
                psCheck.unprepare();
            });
        });
    });
});

app.listen(port, function() {
    console.log('app listening on port ' + port);
});