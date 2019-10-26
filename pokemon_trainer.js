// This server side application requires the download of inquirer, mysql, and all of their dependencies. 
const inquirer = require('inquirer');
const mysql = require('mysql');

// global variables for each table.
const pokemart = "shop_inventory_table";
const bag = "bag_inventory_table";
let totalMonies = Math.floor(Math.random() * 3000);
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

    connection.connect(function (err) {
        if (err) {
            console.log(err);
        } else {
            mainMenu();
        };
    });

    function mainMenu() {
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

    function menuShop() {
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
                    connection.query(`SELECT * FROM ${pokemart}`, function (err, res) {
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

    function menuSell() {
        console.log(`comming soon...`);
        connection.end();
    };

    function menuBag() {

        connection.query(`SELECT * FROM ${bag}`, function (err, res) {
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

    function menuExit() {
        console.log(`Goodbye.`);
        connection.end();
    };

    // after connection is made this function runs.
    function buyAnItem() {
        connection.query(`SELECT * FROM ${pokemart}`, function (err, res) {
            if (err) {
                console.log(err);
            } else {

                // take the returned value of res and grab all the item names.
                let itemNames = [];
                for (i = 0; i < res.length; i++) {
                    itemNames.push(res[i].item_name);

                };

                // using the list of items. User will select an item to buy.
                inquirer.prompt([
                    {
                        name: "selectedItem",
                        type: "list",
                        message: "What would you like to buy?",
                        choices: itemNames
                    }
                ]).then(returnedValue => {

                    //console.log(`You have selected ${returnedValue.selectedItem}.`);
                    // res[#] would be the item object you would need to change the SQL table.
                    // # = itemNames array .indexOf() the name selected. since the array and the SQL table have the same objects!
                    //console.table(res[itemNames.indexOf(returnedValue.selectedItem)]);
                    let selectedItemObject = res[itemNames.indexOf(returnedValue.selectedItem)];
                    updatePokemartInventory(returnedValue.selectedItem, selectedItemObject);

                });

            };
        });
    };

    function updatePokemartInventory(selectedItem, selectedItemObject) {

        // connect to pokemart table and find the section with the item name (treating item name like a primary key).
        connection.query(`SELECT * FROM ${pokemart} WHERE item_name = "${selectedItem}"`, function (err, res) {

            if (err) {
                console.log(err);
            } else {

                // if the inventory level is 0 then display that it is sold out and return to the shop menu.
                if (res[0].item_inventory_level <= 0) {
                    console.log(`SOLD OUT!`);
                    menuShop();

                } else {

                    // Check Inventory and update both the trainer inventory and the pokemart inventory;
                    // turn the number from a string into a whole number then retude the inventory by 1;
                    // newInventoryLevel is going to hold the new value. I could grab the primary key here but chose not to.
                    let newInventoryLevel = Number(res[0].item_inventory_level) - 1;
                    let itemID = res[0].item_id;

                    // call the table and ask to update that number inside the table.
                    // normally you will want to update the database using the items pirmary key.
                    connection.query(`UPDATE ${pokemart} SET item_inventory_level = ${newInventoryLevel} WHERE item_name = "${selectedItem}"`, function (err, res) {

                        if (err) {
                            console.log(err);
                        } else {

                            //now that the database has removed the item. Lets add it to the players bag!
                            updateTrainerInventory(itemID, selectedItemObject);

                        };
                    });
                };
            };
        });

    };

    function updateTrainerInventory(itemId, selectedItemObject) {
        // check to see if that item is already in the inventory.
        connection.query(`SELECT * FROM ${bag}`, function (err, res) {
            if (err) {

            } else {
                let doYouHaveIt = false;

                // check the res array for objects.
                for (i = 0; i < res.length; i++) {
                    // check the objects for keys
                   
                        //console.log(res[i].bag_id + " == " + itemId);
                        // check the keys for values compaired to itemId
                        if (res[i].bag_id == itemId){
                            doYouHaveIt = true;
                        } else {
                        };
                };

                if (doYouHaveIt === true){
                    // change back doYouHaveIt to false. You dont have to do this but it's good practice.
                    doYouHaveIt = false;

                    //console.log(`you already have that item!`);
                    updateItemInBagDB(selectedItemObject);

                } else if (doYouHaveIt === false){
                    //console.log('you do not have that item');
                    //console.log(selectedItemObject);
                    addItemToBagDB(selectedItemObject);
                };
            };
        });

        function addItemToBagDB(selectedItemObject){

            const mehVariable = selectedItemObject;

            let arrayThatObject = [];
            for(elements in mehVariable ){
                // console.log(elements);
                // console.log(mehVariable[elements]);
                if (isNaN(mehVariable[elements])){
                    arrayThatObject.push(`"${mehVariable[elements]}"`);
                } else {
                    arrayThatObject.push(mehVariable[elements]);
                };
                
            };

            mehVariable['item_inventory_level'] = 1;

            console.log(`INSERT INTO ${bag} (bag_id, item_name, item_description, item_type, item_cost, item_inventory_level) VALUES(${arrayThatObject})`);
            connection.query(`INSERT INTO ${bag} (bag_id, item_name, item_description, item_type, item_cost, item_inventory_level) VALUES(${arrayThatObject})`, function(err, res){
                if(err){
                    console.log(err)
                } else {
                    console.log(`You have purchased ${mehVariable['item_name']}`);
                    menuShop();
                };
            });

        };

        // comment this out. You are here.
        function updateItemInBagDB(item) {
           
            connection.query(`UPDATE ${bag} SET item_inventory_level = item_inventory_level + 1 WHERE bag_id = ${item.item_id}`, function(err, res){
                if (err){
                    console.log(err);
                } else {
                    console.log(`You have purchased ${item.item_name}`);
                    menuShop();
                };
            });
        };

    };

}); // server conneciton does not exist below this line.
