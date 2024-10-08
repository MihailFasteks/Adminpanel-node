var mssql = require('mssql');

// Параметры соединения с БД
var config = {
    user: 'Michael',                      // пользователь базы данных
    password: 'MyPassword123',                  // пароль пользователя 
    server: 'localhost',          // хост (или IP-адрес вашего сервера)
    database: 'Library',               // имя БД
    port: 1433,                         // порт, на котором запущен SQL Server
    options: {
        encrypt: false,                  // Использование SSL/TLS
        trustServerCertificate: true    // Отключение проверки самоподписанного сертификата
    },
};

module.exports = config;