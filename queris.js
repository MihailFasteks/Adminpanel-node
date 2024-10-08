const mssql = require('mssql');
const config = require('./config'); // Используем ваш config.js

async function getFaculties(req, res) {
    let pool;
    try {
        pool = await mssql.connect(config); // Подключаемся к базе данных

        const request = pool.request();
        const result = await request.query("SELECT * FROM Faculties");

        const tableRows = result.recordset.map(row => `
            <tr>
                <td>${row.Id}</td>
                <td>${row.Name}</td>
            </tr>
        `).join('');

        console.log('show_items');
        res.render('showFac', { data: tableRows });
    } catch (err) {
        console.error('Ошибка запроса:', err);
        res.status(500).send('Ошибка при получении данных факультетов');
    } finally {
        if (pool) {
            await pool.close(); // Закрываем соединение
        }
    }
}

async function getGroups(req, res) {
    let pool;
    try {
        pool = await mssql.connect(config); // Подключаемся к базе данных

        const request = pool.request();
        const result = await request.query("SELECT * FROM Groups");

        const tableRows = result.recordset.map(row => `
            <tr>
                <td>${row.Id}</td>
                <td>${row.Name}</td>
                <td>${row.Id_Faculty}</td>
            </tr>
        `).join('');

        console.log('show_items');
        res.render('showGroups', { data: tableRows });
    } catch (err) {
        console.error('Ошибка запроса:', err);
        res.status(500).send('Ошибка при получении данных групп');
    } finally {
        if (pool) {
            await pool.close(); // Закрываем соединение
        }
    }
}

async function getStudents(req, res) {
    let pool;
    try {
        pool = await mssql.connect(config); // Подключаемся к базе данных

        const request = pool.request();
        const result = await request.query("SELECT * FROM Students");

        const tableRows = result.recordset.map(row => `
            <tr>
                <td>${row.Id}</td>
                <td>${row.FirstName}</td>
                <td>${row.LastName}</td>
                <td>${row.Id_Group}</td>
                <td>${row.Term}</td>
            </tr>
        `).join('');

        console.log('show_items');
        res.render('showStud', { data: tableRows });
    } catch (err) {
        console.error('Ошибка запроса:', err);
        res.status(500).send('Ошибка при получении данных студентов');
    } finally {
        if (pool) {
            await pool.close(); // Закрываем соединение
        }
    }
}

module.exports = {
    getFaculties,
    getGroups,
    getStudents
};
