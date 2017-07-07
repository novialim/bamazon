// Running this application will:
// List a set of menu options:
// View Products for Sale
// View Low Inventory
// Add to Inventory
// Add New Product


var figlet = require('figlet');
var mysql = require('mysql');
var Table = require('cli-table2');
var inquirer = require("inquirer");
var colors = require('colors');

var idArr = [];

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
					viewProducts();
					setTimeout(function () {continuePrompt();}, 500);

				break;

				case "View Low Inventory Products":
					viewLowProducts();
				break;		

				case "Add to Inventory":
					addInventoryProduct();
				break;				

				case "Add New Product":
					addNewProductPrompt();
				break;		

				case "Exit Program":
                    console.log("Good Bye!".rainbow); 
                    process.exit(); 	
			}
		})
	}

	// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
	function viewProducts(){
		var table = new Table({
			head: ['ID', 'Product', 'Department', 'Price', 'Stock'], 
			colWidths: [8, 35, 25, 13, 13]

		});

		con.query('SELECT * FROM products;', function(err,res){

			if (err) throw err;

			for (var i=0; i<res.length; i++){
				table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);

				idArr.push(res[i].item_id);
			}

			console.log("\n"+table.toString());
		});
	}

	// If a manager selects View Low Inventory, then it should list all items with an inventory count lower than five.
	function viewLowProducts(){
		var table = new Table({
			head: ['ID', 'Product', 'Department', 'Price', 'Stock'], 
			colWidths: [8, 35, 25, 13, 13]

		});

		con.query('SELECT * FROM products WHERE stock_quantity < 5;', function(err,res){

			if (err) throw err;

			if(res.length>0){
				for (var i=0; i<res.length; i++){
					table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
				}

				console.log(table.toString());
			}
			else
				console.log("Inventory is well stocked and above 5 units!".green);
				continuePrompt();
		});
	}

	function continuePrompt(){
		inquirer.prompt([
		{
			type: 'list',
			message: 'Do you wish to continue?\n',
			choices: ['Yes','No\n'],
			name: "callMainScreen"
		}
		]).then(function(selection){
			if(selection.callMainScreen == 'Yes'){
				mainmgr();
			}
			else{
				console.log("Good Bye!".rainbow);
				process.exit();
			}

		})
	}

	// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
	function addInventoryProduct(){
		viewProducts();

		setTimeout(function () {
		
			inquirer.prompt([
			{
	          type: "input",
	          message: "\nEnter the ID of the product you would like to add stock.\n",
	          name: "productID"			
			}
			]).then(function(selection){

				if (selection.productID && !isNaN(selection.productID) && idArr.indexOf(parseInt(selection.productID)) > -1 ) {

				  con.query('SELECT `product_name` FROM `products` WHERE `item_id` = ?', [selection.productID], function(error, results, fields){

				  	if(error) throw error;

		              console.log("\nYour chosen product is: " + results[0].product_name);
		              addInventoryQuantity(results[0].product_name, selection.productID); 
	          	  });

	            }
	            else {
	              // if user enter non numeric or blank

	              console.log("Product ID does not exists. Please select a valid product ID.".red);
	              addInventoryProduct();
	            }
			});		  
		}, 500);
	}

	function addInventoryQuantity(productName, productID){
		inquirer.prompt([
            {
              type: "input",
              message: "How many units of "+productName+" would you like to add?\n",
              name: "quantity"
            }
          ])
          .then(function(inquirerResponse) {
            
            if (inquirerResponse.quantity && !isNaN(inquirerResponse.quantity)) {
              console.log("\nYou are adding: " + inquirerResponse.quantity +" units to "+productName+".");
              updateQuantity(productID, productName, inquirerResponse.quantity);
            }
            else {
              // if user enter non numeric or blank
              console.log("Please select a valid quantity.".red);
              addInventoryQuantity(productID);

            }
          });
	}

    function updateQuantity(productID, productName, quantity){

         con.query('UPDATE `products` SET `stock_quantity` = `stock_quantity`+? WHERE `item_id` = ?', [quantity, productID], function (error, results, fields) {
          if (error) throw error;
          
          console.log(colors.green("You have successfully added " +quantity+ " units for "+productName+"."));  
          continuePrompt();  
          
        });   
    }

	// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
	function addNewProductPrompt(){
		inquirer.prompt([
		{
			type: "input",
			message: "What Product Are You Adding? Enter Product Name.",
			name: "productName"
		},
		{
			type: "input",
			message: "Please Enter Product Department.",
			name: "department"
		},
		{
			type: "input",
			message: "Please Enter Product Price.",
			name: "price"
		},
		{
			type: "input",
			message: "Please Enter Product Quantity",
			name: "quantity"
		},
		{
			type: "confirm",
			message: "Please Confirm Adding New Product.",
			name: "confirm",
			default: true
		}
		]).then(function(selection){
			if(selection.confirm){

				if(selection.productName!=="" || selection.department!=="" || selection.price!=="" || selection.quantity!==""){
					insertProduct(selection.productName, selection.department, selection.price, selection.quantity);
				}
				else{
					console.log("Please enter valid values".red);
					addNewProductPrompt();
				}
			}
			else{
				console.log("\n That's okay, come back again when you are serious about adding products. :B ".yellow);
				continuePrompt();
			}
		});
	}

	function insertProduct(productName, department, price, quantity){
    
      
      con.query('INSERT INTO `products` SET ?',
      {
        product_name: productName,
        department_name: department,
        price: price,
        stock_quantity: quantity
      }
       , function (error, results, fields) {
        if (error) {
          return connection.rollback(function() {
            throw error;
          });
        }

        console.log(results.affectedRows +" new product added!\n");
        continuePrompt();

      });
    }
	
