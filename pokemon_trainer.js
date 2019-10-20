// This server side application requires the download of inquirer, mysql, and all of their dependencies. 
const inquirer = require('inquirer');
const mysql = require('mysql');

// global variables for each table.
const pokemart = "shop_inventory_table";
const bag = "bag_inventory_table";
let totalMonies = Math.floor(Math.random() *3000);
console.log(totalMonies + "$");

/*
----------- Pokemart -----------
* Buy
    * list of items for sale and total ammmount.
    * are you sure you want to buy this? y / n
    * select an item. if ineventory is 0 then say we are currently out of stock on that.
* Sell
    * chose an item in your inventory to sell and make back half what you may purchase it for.
    * if you have an inventory of 0 then remove from database all together.
* Backpack
    *table your current inventory
*/
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
            goOnline();
        };
    });

    // after connection is made this function runs.
    function goOnline() {
        connection.query(`SELECT * FROM ${pokemart}`, function(err, res){
            if (err) {
                console.log(err);
            } else {
                // console.table(res);
                // here we have the full inventory.

                // take the returned value of res and grab all the item names.
                // we are going to use them in our next inquirer question.
                let itemNames = [];
                for (i = 0; i < res.length; i++){
                    itemNames.push(res[i].item_name);
                };
                
                inquirer.prompt([
                    {
                        name: "selectedItem",
                        type: "list",
                        message: "What would you like to buy?",
                        choices: itemNames
                    }
                ]).then(returnedValue => {
                    console.log(`You have selected ${returnedValue.selectedItem}.`);
                    // res[#] would be the item object you would need to change the SQL table.
                    // # = itemNames array .indexOf() the name selected. since the array and the SQL table have the same objects!
                    console.table(res[itemNames.indexOf(returnedValue.selectedItem)]);
                    connection.end();
                });
            };
        });
    };

    // no server code past this point.
});