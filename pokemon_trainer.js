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
            mainMenu();
        };
    });

    function mainMenu(){
            // connection is good and we can now speak to the database on your local system.
            inquirer.prompt([
                {
                    type: "list",
                    name: "mainMenu",
                    message: "What would you like to do?",
                    choices: ["Shop", "Sell", "Bag", "Exit"]
                }
            ]).then(response => {
                let selectedMainMenuItem = response.mainMenu;
                switch (selectedMainMenuItem) {
                    case "Shop":
                        menuShop();
                    break;
                    case "Sell":
                        menuSell();
                    break;
                    case "Bag":
                        menuBag();
                    break;
                    case "Exit":
                        menuExit();
                    break;
                    default:
                        console.log(`Somethings gone wrong.`);
                        connection.end();
                    break;
                };
            });
    };

    function menuShop(){
        inquirer.prompt([
            {
                type: "list",
                name: "shopMenuSelection",
                message: "What can I do for you?",
                choices: ["Buy", "Look Around", "Main Menu"]
            }
        ]).then(shopMenu => {
            
            switch (shopMenu.shopMenuSelection) {
                case "Buy":
                        buyAnItem();
                    break;
                case "Look Around":
                    connection.query(`SELECT * FROM ${pokemart}`, function(err, res){
                        console.table(res);
                        mainMenu();
                    });
                    break;
                case "Main Menu":
                    mainMenu();
                    break;
                default:
                    break;
            };
            
        });
    };

    function menuSell(){
        console.log(`comming soon...`);
        connection.end();
    };

    function menuBag(){

        connection.query(`SELECT * FROM ${bag}`, function(err, res){
            if (err) {
                console.log(err);
            } else {
                console.log(``);
                console.log(`-----------------`);
                console.table(res);
                console.log(`-----------------`);
                mainMenu();
            };
        });

    };

    function menuExit(){
        console.log(`Goodbye.`);
        connection.end();
    };

    // after connection is made this function runs.
    function buyAnItem() {
        connection.query(`SELECT * FROM ${pokemart}`, function(err, res){
            if (err) {
                console.log(err);
            } else {

                // take the returned value of res and grab all the item names.
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