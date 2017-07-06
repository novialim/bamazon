// Running this application will:
// List a set of menu options:
// View Products for Sale
// View Low Inventory
// Add to Inventory
// Add New Product
// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
// If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.

var figlet = require('figlet');
var mysql = require('mysql');
var Table = require('cli-table2');
var inquirer = require("inquirer");
var colors = require('colors');

var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: 'bamazon_db'
});

	figlet('Bamazon Manager Console', function(err, data) {
	        if (err) {
	            console.log('Something went wrong...');
	            console.dir(err);
	            return;
	        }
	        console.log(data);

	        mainmgr();	

	    });

	con.connect(function(err) {
	    if (err) throw err;

	});

	function mainmgr(){
		inquirer.prompt([
		{
			type: 'list',
			name: 'mgrchoice',
			message: 'What would you like to do?',
			choices: [
				"View Products for Sale",
				"View Low Inventory Products",
				"Add to Inventory",
				"Add New Product",
				"Exit Program"
			]
		}
		]).then(function(selection){
			switch(selection.mgrchoice){
				case "View Products for Sale":
					//viewProduct();
				break;

				case "View Low Inventory Products":
					//viewLowProduct();
				break;		

				case "Add to Inventory":
					//addInventory();
				break;				

				case "Add New Product":
					//addNewProduct();
				break;		

				case "Exit Program":
                    console.log("Good Bye!".rainbow); 
                    process.exit(); 	
			}
		})
	}

