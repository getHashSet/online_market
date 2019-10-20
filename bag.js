const inquirer = require('inquirer');
const mysql = require('mysql');

const bag = "bag_inventory_table";


console.log("Welcome to Pokemart Online!")
inquirer.prompt([
    {
        name: "hostName",
        message: "What is your mySQL host name?",
        type: "input"
    },
    {
        name: "password",
        message: "Please enter your localhost: 3306 password.",
        type: "password"
    }
]).then(response => {
    // collected data for username and password
    let localHostName = response.hostName;
    let passwordForHost = response.password;
    
    // check to see if passwords were left blank. If they were then set them to defaults.
    localHostName === "" ? localHostName = "root" : null;
    passwordForHost === "" ? passwordForHost = "password" : null;

    const connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: `${localHostName}`,
        password: `${passwordForHost}`,
        database: "pokemartdb"
    });

    connection.connect(function(err) {
        if (err) {
            console.log(err);
        } else {
            // connection is good and we can now speak to the database on your local system.
            inventory();
        };
    });

    // after connection is made this function runs.
    function inventory() {
        connection.query(`SELECT * FROM ${bag}`, function(err, res){
            if (err) {
                console.log(err);
            } else {
                console.table(res);
                connection.end();
            };
        });
    };

    // no server code past this point.
});