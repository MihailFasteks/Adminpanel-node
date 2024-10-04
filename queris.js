var mssql = require('mssql');

// connection
var connection = require('./config');

function getAllItems(req, res) {
    let self = this;
    self.tableRows = ``;

    let request = new mssql.Request(connection);
    request.stream = true;
    request.query("SELECT * FROM Users");

    request.on('row', function(row) {
        self.tableRows += ` 
        <tr>
            <td>${row.id} </td>
            <td>${row.name} </td>
            <td>${row.login}</td>
            <td>${row.password}</td>
        </tr>`
    });

    request.on('done', function(affected) {
        console.log('show_items');
        res.render('admin', { data: self.tableRows });
    });
}

module.exports = getAllItems;



