// Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.
// The app should then prompt users with two messages.
// The first should ask them the ID of the product they would like to buy.
// The second message should ask how many units of the product they would like to buy.
// Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
// If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
// However, if your store does have enough of the product, you should fulfill the customer's order.
// This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.

var figlet = require('figlet');
var mysql = require('mysql');
var Table = require('cli-table2');
var inquirer = require("inquirer");
var colors = require('colors');

var idArr = [];
var totalCost = 0;

var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: 'bamazon_db'
});

    figlet('Welcome to Bamazon!!', function(err, data) {
            if (err) {
                console.log('Something went wrong...');
                console.dir(err);
                return;
            }
            console.log(data);
        });

    con.connect(function(err) {
        if (err) throw err;

    });


 
    function main(){

        // instantiate table
        var table = new Table({
            head: ['ID', 'Product', 'Department', 'Price', 'Stock']
                , colWidths: [8, 35, 25, 13, 13]
        });

        con.query('SELECT * FROM products;',function(err,res){

            for(var i=0;i<res.length;i++){
                table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
                idArr.push(res[i].item_id);
            }

            // console.log(res);
            console.log(table.toString());
            productPrompt();
        });


    }

    function productPrompt(){

        inquirer.prompt([
            {
              type: "input",
              message: "Enter the ID of the product you would like to buy.\n",
              name: "product"
            }
          ])
          .then(function(inquirerResponse) {
            
            if (inquirerResponse.product && !isNaN(inquirerResponse.product) && idArr.indexOf(parseInt(inquirerResponse.product)) > -1 ) {
              console.log("\nYour chosen product ID is: " + inquirerResponse.product);
              quantityPrompt(inquirerResponse.product);
              
            }
            else {
              // if user enter non numeric or blank

              console.log("Product ID does not exists. Please select a valid product ID.".red);
              productPrompt();

            }
          });
    }

    function quantityPrompt(product){

        inquirer.prompt([
            {
              type: "input",
              message: "How many units of the product would you like to buy?\n",
              name: "quantity"
            }
          ])
          .then(function(inquirerResponse) {
            // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
            if (inquirerResponse.quantity && !isNaN(inquirerResponse.quantity)) {
              console.log("\nYour required quantity is: " + inquirerResponse.quantity);
              checkQuantity(product,inquirerResponse.quantity);
            }
            else {
              // if user enter non numeric or blank

              console.log("Please select a valid quantity.");
              quantityPrompt(product);

            }
          });
    }

    // Need to implement calback function to get product name???
    // function getProductName(productID){
    //     con.query('SELECT `product_name` FROM `products` WHERE `item_id` = ?',[productID], function (error, results, fields) {
    //           // error will be an Error if one occurred during the query
    //           if (error) throw error;
            
    //           return results[0].product_name;
              
    //     });      
    // }

    function checkQuantity(productID, quantity){

        con.query('SELECT `stock_quantity`, `product_name` FROM `products` WHERE `item_id` = ?',[productID], function (error, results, fields) {
              // error will be an Error if one occurred during the query
              if (error) throw error;
              // results will contain the results of the query
              
              // returns quantity of the selected item
              // console.log(results[0].stock_quantity);
              if(results[0].stock_quantity==0){
                console.log(results[0].product_name+" is currently out of stock. Please select another product");
                productPrompt();
              }
              else if(results[0].stock_quantity<quantity){
                console.log(colors.red("Insufficient quantity for "+results[0].product_name+" ! Please enter a valid quantity that is less than "+results[0].stock_quantity+"."));
                quantityPrompt(productID);
              }
              else{

                var updatedQuantity = results[0].stock_quantity - quantity;

                updateQuantity(productID, results[0].product_name, quantity, updatedQuantity);
            
              }
        });      
    }

    function updateQuantity(productID, productName, quantity, updatedQuantity){

         con.query('UPDATE `products` SET `stock_quantity` = ? WHERE `item_id` = ?', [updatedQuantity, productID], function (error, results, fields) {
          if (error) throw error;
          
          console.log(colors.green("You have successfully placed an order of " +quantity+" units for "+productName+"."));    

          calculateCost(productID, quantity);
          
        });   
    }

    function calculateCost(productID, quantity){

        con.query('SELECT `price` FROM `products` WHERE `item_id` = ?',[productID], function (error, results, fields) {
              // error will be an Error if one occurred during the query
              if (error) throw error;
              
              totalCost += results[0].price*quantity;

              console.log("\nYour total cost for this purchase is: $"+results[0].price*quantity+"."); 
              continuePrompt(); 
        });      

    }


    function continuePrompt(){
        inquirer.prompt([
            {
                type: "list",
                message: "Do you wish to continue shopping?\n",
                choices:["Yes","No"],
                name:"callMainScreen"
            }
            ]).then(function(selection){
                if(selection.callMainScreen == "Yes"){
                    main();
                }
                else{
                    console.log("Your total purchase for today is: "+colors.green('$%s'), totalCost);    
                    console.log("Good Bye!".rainbow);    

                    process.exit();
                }
            })
    }

main();    