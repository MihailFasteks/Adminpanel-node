var express  = require('express');
var router = express.Router();
var mssql = require('mssql');
var path = require('path');
var app = express();
const bodyParser = require('body-parser');
var port = 8080;

// connection
var dbConfig = require('./config');
const { getFaculties, getGroups, getStudents } = require('./queris.js');
const { connect } = require('http2');

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');


// Маршрут для главной страницы


app.get('/FacRed', function(req, res) {
    res.sendFile(path.join(__dirname, '/pages/addFac.html'));
});
app.get('/GroupRed', function(req, res) {
    res.sendFile(path.join(__dirname, '/pages/addGroup.html'));
});
app.get('/StudRed', function(req, res) {
    res.sendFile(path.join(__dirname, '/pages/addStud.html'));
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/pages/index-2.html'));
});

// Обработка добавления факультета
app.post('/serverAddFaculty', async (req, res) => {
    const name = req.body.name;
    console.log(`Имя: ${name}`);

    try {
        const connection = await mssql.connect(dbConfig);
        const transaction = new mssql.Transaction(connection);

        await transaction.begin();

        // Проверка существования факультета
        const checkQuery = `
            SELECT *
            FROM Faculties 
            WHERE Faculties.Name = @name
        `;
        const psCheck = new mssql.PreparedStatement(transaction);
        psCheck.input('name', mssql.NVarChar);

        await psCheck.prepare(checkQuery);
        const checkResult = await psCheck.execute({ name });

        if (checkResult.recordset.length !== 0) {
            console.log('Факультет с таким именем уже существует');
            await transaction.rollback();
            await psCheck.unprepare();
            return res.status(400).json({ error: 'Факультет с таким именем уже существует' });
        }

        await psCheck.unprepare();

        // Вставка нового факультета
        const insertQuery = `
            INSERT INTO Faculties (Name) VALUES (@name)
        `;
        const psInsert = new mssql.PreparedStatement(transaction);
        psInsert.input('name', mssql.NVarChar);

        await psInsert.prepare(insertQuery);
        await psInsert.execute({ name });

        await psInsert.unprepare();

        await transaction.commit();
        console.log('Факультет успешно зарегистрирован');
        res.status(200).send('Факультет успешно зарегистрирован');
    } catch (err) {
        console.error('Ошибка:', err);
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: 'Ошибка при работе с базой данных' });
    } finally {
        mssql.close();
    }
});




//обработка удаления факультета
app.post('/serverDelFaculty', async (req, res) => {
    const name = req.body.name;
    console.log(`Имя: ${name}`);

    try {
        const connection = await mssql.connect(dbConfig);
        const transaction = new mssql.Transaction(connection);

        await transaction.begin();

        // Проверка существования факультета
        const checkQuery = `
            SELECT *
            FROM Faculties 
            WHERE Faculties.Name = @name
        `;
        const psCheck = new mssql.PreparedStatement(transaction);
        psCheck.input('name', mssql.NVarChar);

        await psCheck.prepare(checkQuery);
        const checkResult = await psCheck.execute({ name });

        if (checkResult.recordset.length === 0) {
            console.log('Факультет с таким именем не существует');
            await transaction.rollback();
            await psCheck.unprepare();
            return res.status(401).json({ error: 'Факультет с таким именем не существует' });
        }

        await psCheck.unprepare();

        // Удаление факультета
        const delQuery = `
            DELETE FROM Faculties 
            WHERE Faculties.Name = @name
        `;
        const psDelete = new mssql.PreparedStatement(transaction);
        psDelete.input('name', mssql.NVarChar);

        await psDelete.prepare(delQuery);
        await psDelete.execute({ name });

        await psDelete.unprepare();

        // Подтверждение транзакции
        await transaction.commit();
        console.log('Факультет успешно удален');
        res.status(200).send('Факультет успешно удален');
    } catch (err) {
        console.error('Ошибка:', err);
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: 'Ошибка при работе с базой данных' });
    } finally {
        mssql.close();
    }
});

// //обработка изменения факультета
app.post('/serverChangeFaculty', async (req, res) => {
    const name = req.body.name;
    const changeN = req.body.ChName;

    console.log(`Имя: ${name}, Новое имя: ${changeN}`);

    try {
        const connection = await mssql.connect(dbConfig);
        const transaction = new mssql.Transaction(connection);

        await transaction.begin();

        // Проверка, существует ли факультет с указанным именем
        const checkQuery = `
            SELECT *
            FROM Faculties 
            WHERE Faculties.Name = @name
        `;
        const psCheck = new mssql.PreparedStatement(transaction);
        psCheck.input('name', mssql.NVarChar);

        await psCheck.prepare(checkQuery);
        const checkResult = await psCheck.execute({ name });

        if (checkResult.recordset.length === 0) {
            console.log('Факультет с таким именем не существует');
            await transaction.rollback();
            await psCheck.unprepare();
            return res.status(401).json({ error: 'Факультет с таким именем не существует' });
        }

        await psCheck.unprepare();

        // Обновление имени факультета
        const updateQuery = `
            UPDATE Faculties
            SET Name = @changeN
            WHERE Name = @name
        `;
        const psUpdate = new mssql.PreparedStatement(transaction);
        psUpdate.input('name', mssql.NVarChar);
        psUpdate.input('changeN', mssql.NVarChar);

        await psUpdate.prepare(updateQuery);
        await psUpdate.execute({ name, changeN });

        await psUpdate.unprepare();

        // Подтверждение транзакции
        await transaction.commit();
        console.log('Факультет успешно изменен');
        res.status(200).send('Факультет успешно изменен');
    } catch (err) {
        console.error('Ошибка:', err);
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: 'Ошибка при работе с базой данных' });
    } finally {
        mssql.close();
    }
});


// //обработка добавления группы
app.post('/serverAddGroup', async (req, res) => {
    const name = req.body.name;
    const facN = req.body.FacName;

    console.log(`Имя: ${name}, FacName: ${facN}`);

    let transaction; // Делаем transaction доступной во всей функции

    try {
        const connection = await mssql.connect(dbConfig);
        transaction = new mssql.Transaction(connection);

        await transaction.begin();

        // Проверка, существует ли факультет с указанным именем
        const findFacQuery = `
            SELECT Id
            FROM Faculties
            WHERE Faculties.Name = @facN
        `;
        const psFindFac = new mssql.PreparedStatement(transaction);
        psFindFac.input('facN', mssql.NVarChar);

        await psFindFac.prepare(findFacQuery);
        const facultyResult = await psFindFac.execute({ facN });

        if (facultyResult.recordset.length === 0) {
            console.log('Факультет с таким именем не существует');
            await transaction.rollback();
            await psFindFac.unprepare();
            return res.status(401).json({ error: 'Факультет с таким именем не существует' });
        }

        const facultyId = facultyResult.recordset[0].Id;
        await psFindFac.unprepare();

        // Проверка, существует ли группа с таким именем
        const checkGroupQuery = `
            SELECT *
            FROM Groups 
            WHERE Groups.Name = @name
        `;
        const psCheckGroup = new mssql.PreparedStatement(transaction);
        psCheckGroup.input('name', mssql.NVarChar);

        await psCheckGroup.prepare(checkGroupQuery);
        const groupResult = await psCheckGroup.execute({ name });

        if (groupResult.recordset.length !== 0) {
            console.log('Группа с таким именем уже существует');
            await transaction.rollback();
            await psCheckGroup.unprepare();
            return res.status(401).json({ error: 'Группа с таким именем уже существует' });
        }

        await psCheckGroup.unprepare();

        // Вставка новой группы с использованием ID факультета
        const insertGroupQuery = `
            INSERT INTO Groups (Name, Id_Faculty) 
            VALUES (@name, @facultyId)
        `;
        const psInsertGroup = new mssql.PreparedStatement(transaction);
        psInsertGroup.input('name', mssql.NVarChar);
        psInsertGroup.input('facultyId', mssql.Int);

        await psInsertGroup.prepare(insertGroupQuery);
        await psInsertGroup.execute({ name, facultyId });

        await psInsertGroup.unprepare();

        // Подтверждение транзакции
        await transaction.commit();
        console.log('Группа успешно зарегистрирована');
        res.status(200).send('Группа успешно зарегистрирована');
    } catch (err) {
        console.error('Ошибка:', err);
        if (transaction) await transaction.rollback(); // Откатываем транзакцию при ошибке
        res.status(500).json({ error: 'Ошибка при работе с базой данных' });
    } finally {
        mssql.close(); // Закрываем соединение с базой
    }
});


// //обработка удаления группы
app.post('/serverDelGroup', async (req, res) => {
    const name = req.body.name;

    console.log(`Имя: ${name}`);

    let transaction;

    try {
        const connection = await mssql.connect(dbConfig);
        transaction = new mssql.Transaction(connection);

        await transaction.begin();

        // Проверка, существует ли группа с указанным именем
        const checkGroupQuery = `
            SELECT *
            FROM Groups 
            WHERE Name = @name
        `;
        const psCheckGroup = new mssql.PreparedStatement(transaction);
        psCheckGroup.input('name', mssql.NVarChar);

        await psCheckGroup.prepare(checkGroupQuery);
        const groupResult = await psCheckGroup.execute({ name });

        if (groupResult.recordset.length === 0) {
            console.log('Группа с таким именем не существует');
            await transaction.rollback();
            await psCheckGroup.unprepare();
            return res.status(404).json({ error: 'Группа с таким именем не существует' });
        }

        await psCheckGroup.unprepare();

        // Удаление группы
        const delGroupQuery = `
            DELETE FROM Groups 
            WHERE Name = @name
        `;
        const psDeleteGroup = new mssql.PreparedStatement(transaction);
        psDeleteGroup.input('name', mssql.NVarChar);

        await psDeleteGroup.prepare(delGroupQuery);
        await psDeleteGroup.execute({ name });

        await psDeleteGroup.unprepare();

        // Подтверждение транзакции
        await transaction.commit();
        console.log('Группа успешно удалена');
        res.status(200).send('Группа успешно удалена');
    } catch (err) {
        console.error('Ошибка:', err);
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: 'Ошибка при удалении группы' });
    } finally {
        mssql.close();
    }
});


// //обработка изменения группы
app.post('/serverChangeGroup', async (req, res) => {
    const name = req.body.name;
    const changeN = req.body.ChName;

    console.log(`Имя: ${name}, Новое имя: ${changeN}`);

    let transaction;

    try {
        const connection = await mssql.connect(dbConfig);
        transaction = new mssql.Transaction(connection);

        await transaction.begin();

        // Проверка, существует ли группа с указанным именем
        const checkGroupQuery = `
            SELECT *
            FROM Groups 
            WHERE Name = @name
        `;
        const psCheckGroup = new mssql.PreparedStatement(transaction);
        psCheckGroup.input('name', mssql.NVarChar);

        await psCheckGroup.prepare(checkGroupQuery);
        const groupResult = await psCheckGroup.execute({ name });

        if (groupResult.recordset.length === 0) {
            console.log('Группа с таким именем не существует');
            await transaction.rollback();
            await psCheckGroup.unprepare();
            return res.status(404).json({ error: 'Группа с таким именем не существует' });
        }

        await psCheckGroup.unprepare();

        // Обновление названия группы
        const updateGroupQuery = `
            UPDATE Groups
            SET Name = @changeN
            WHERE Name = @name
        `;
        const psUpdateGroup = new mssql.PreparedStatement(transaction);
        psUpdateGroup.input('name', mssql.NVarChar);
        psUpdateGroup.input('changeN', mssql.NVarChar);

        await psUpdateGroup.prepare(updateGroupQuery);
        await psUpdateGroup.execute({ name, changeN });

        await psUpdateGroup.unprepare();

        // Подтверждение транзакции
        await transaction.commit();
        console.log('Группа успешно изменена');
        res.status(200).send('Группа успешно изменена');
    } catch (err) {
        console.error('Ошибка:', err);
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: 'Ошибка при изменении группы' });
    } finally {
        mssql.close();
    }
});


// //обработка добавления студента
app.post('/serverAddStud', async (req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const groupN = req.body.GrName;
    const term = req.body.term;

    console.log(`Имя: ${fname}, Фамилия: ${lname}, Название группы: ${groupN}, Семестр: ${term}`);

    let transaction;

    try {
        const connection = await mssql.connect(dbConfig);
        transaction = new mssql.Transaction(connection);

        await transaction.begin();

        // Проверка существования группы
        const findGroupQuery = `
            SELECT Id
            FROM Groups
            WHERE Name = @groupN
        `;
        const psFindGroup = new mssql.PreparedStatement(transaction);
        psFindGroup.input('groupN', mssql.NVarChar);

        await psFindGroup.prepare(findGroupQuery);
        const groupResult = await psFindGroup.execute({ groupN });

        if (groupResult.recordset.length === 0) {
            console.log('Группа с таким именем не существует');
            await transaction.rollback();
            await psFindGroup.unprepare();
            return res.status(401).json({ error: 'Группа с таким именем не существует' });
        }

        const groupId = groupResult.recordset[0].Id;
        await psFindGroup.unprepare();

        // Проверка, существует ли студент с таким именем
        const checkStudentQuery = `
            SELECT *
            FROM Students 
            WHERE FirstName = @fname AND LastName = @lname
        `;
        const psCheckStudent = new mssql.PreparedStatement(transaction);
        psCheckStudent.input('fname', mssql.NVarChar);
        psCheckStudent.input('lname', mssql.NVarChar);

        await psCheckStudent.prepare(checkStudentQuery);
        const studentResult = await psCheckStudent.execute({ fname, lname });

        if (studentResult.recordset.length !== 0) {
            console.log('Студент с таким именем уже существует');
            await transaction.rollback();
            await psCheckStudent.unprepare();
            return res.status(401).json({ error: 'Студент с таким именем уже существует' });
        }

        await psCheckStudent.unprepare();

        // Вставка нового студента с использованием ID группы
        const insertStudentQuery = `
            INSERT INTO Students (FirstName, LastName, Id_Group, Term) 
            VALUES (@fname, @lname, @groupId, @term)
        `;
        const psInsertStudent = new mssql.PreparedStatement(transaction);
        psInsertStudent.input('fname', mssql.NVarChar);
        psInsertStudent.input('lname', mssql.NVarChar);
        psInsertStudent.input('groupId', mssql.Int);
        psInsertStudent.input('term', mssql.Int);

        await psInsertStudent.prepare(insertStudentQuery);
        await psInsertStudent.execute({ fname, lname, groupId, term });

        await psInsertStudent.unprepare();

        // Подтверждение транзакции
        await transaction.commit();
        console.log('Студент успешно зарегистрирован');
        res.status(200).send('Студент успешно зарегистрирован');
    } catch (err) {
        console.error('Ошибка:', err);
        if (transaction) await transaction.rollback(); // Откат транзакции при ошибке
        res.status(500).json({ error: 'Ошибка при регистрации студента' });
    } finally {
        mssql.close(); // Закрываем соединение с базой
    }
});

//обработка удаления студента
app.post('/serverDelStud', async (req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;

    console.log(`Имя: ${fname}, Фамилия: ${lname}`);

    let transaction;

    try {
        const connection = await mssql.connect(dbConfig);
        transaction = new mssql.Transaction(connection);

        await transaction.begin();

        // Проверка существования студента
        const checkQuery = `
            SELECT *
            FROM Students 
            WHERE FirstName = @fname AND LastName = @lname
        `;
        const psCheck = new mssql.PreparedStatement(transaction);
        psCheck.input('fname', mssql.NVarChar);
        psCheck.input('lname', mssql.NVarChar);

        await psCheck.prepare(checkQuery);
        const studentResult = await psCheck.execute({ fname, lname });

        if (studentResult.recordset.length === 0) {
            console.log('Студент с таким именем не существует');
            await transaction.rollback();
            await psCheck.unprepare();
            return res.status(401).json({ error: 'Студент с таким именем не существует' });
        }

        await psCheck.unprepare();

        // Удаление студента
        const delQuery = `
            DELETE FROM Students 
            WHERE FirstName = @fname AND LastName = @lname
        `;
        const psDelete = new mssql.PreparedStatement(transaction);
        psDelete.input('fname', mssql.NVarChar);
        psDelete.input('lname', mssql.NVarChar);

        await psDelete.prepare(delQuery);
        await psDelete.execute({ fname, lname });

        await psDelete.unprepare();

        // Подтверждение транзакции
        await transaction.commit();
        console.log('Студент успешно удален');
        res.status(200).send('Студент успешно удален');
    } catch (err) {
        console.error('Ошибка:', err);
        if (transaction) await transaction.rollback(); // Откат транзакции при ошибке
        res.status(500).json({ error: 'Ошибка при удалении студента' });
    } finally {
        mssql.close(); // Закрываем соединение с базой
    }
});


//обработка изменения студента
app.post('/serverChangeStud', async (req, res) => {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const chFName = req.body.chFName;
    const chLName = req.body.chLName;

    console.log(`Имя: ${fname}, Фамилия: ${lname}, Новое имя: ${chFName}, Новая фамилия: ${chLName}`);

    let transaction;

    try {
        const connection = await mssql.connect(dbConfig);
        transaction = new mssql.Transaction(connection);

        await transaction.begin();

        // Проверка существования студента
        const checkQuery = `
            SELECT *
            FROM Students 
            WHERE FirstName = @fname AND LastName = @lname
        `;
        const psCheck = new mssql.PreparedStatement(transaction);
        psCheck.input('fname', mssql.NVarChar);
        psCheck.input('lname', mssql.NVarChar);

        await psCheck.prepare(checkQuery);
        const studentResult = await psCheck.execute({ fname, lname });

        if (studentResult.recordset.length === 0) {
            console.log('Студент с таким именем не существует');
            await transaction.rollback();
            await psCheck.unprepare();
            return res.status(401).json({ error: 'Студент с таким именем не существует' });
        }

        await psCheck.unprepare();

        // Обновление данных студента
        const updateQuery = `
            UPDATE Students
            SET FirstName = @chFName, LastName = @chLName
            WHERE FirstName = @fname AND LastName = @lname
        `;
        const psUpdate = new mssql.PreparedStatement(transaction);
        psUpdate.input('fname', mssql.NVarChar);
        psUpdate.input('lname', mssql.NVarChar);
        psUpdate.input('chFName', mssql.NVarChar);
        psUpdate.input('chLName', mssql.NVarChar);

        await psUpdate.prepare(updateQuery);
        await psUpdate.execute({ fname, lname, chFName, chLName });

        await psUpdate.unprepare();

        // Подтверждение транзакции
        await transaction.commit();
        console.log('Студент успешно изменен');
        res.status(200).send('Студент успешно изменен');
    } catch (err) {
        console.error('Ошибка:', err);
        if (transaction) await transaction.rollback(); // Откат транзакции при ошибке
        res.status(500).json({ error: 'Ошибка при изменении данных студента' });
    } finally {
        mssql.close(); // Закрываем соединение с базой
    }
});


//вывод факультетов
app.get('/showFac', getFaculties);
app.get('/showGr', getGroups);
app.get('/showStud', getStudents);

app.listen(port, function() {
    console.log('app listening on port ' + port);
});