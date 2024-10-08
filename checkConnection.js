const mssql = require('mssql');
const config = require('./config');

async function checkDatabaseConnection() {
    try {
        const pool = await mssql.connect(config);
        console.log('Подключение к базе данных успешно установлено.');

        // Здесь можно выполнить тестовый запрос, например:
        const result = await pool.request().query('SELECT 1 AS test');
        console.log('Тестовый запрос выполнен:', result);

        await pool.close(); // Закрыть соединение
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err);
    }
}

checkDatabaseConnection();