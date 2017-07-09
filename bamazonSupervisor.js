// Running this application will list a set of menu options:
// View Product Sales by Department
// Create New Department
// When a supervisor selects View Product Sales by Department, the app should display a summarized table in their terminal/bash window. Use the table below as a guide.
// department_id	department_name	over_head_costs	product_sales	total_profit
// 01	Electronics	10000	20000	10000
// 02	Clothing	60000	100000	40000
// The total_profit column should be calculated on the fly using the difference between over_head_costs and product_sales. total_profit should not be stored in any database. You should use a custom alias.
// If you can't get the table to display properly after a few hours, then feel free to go back and just add total_profit to the departments table.
// Hint: You may need to look into aliases in MySQL.
// Hint: You may need to look into GROUP BYs.
// Hint: You may need to look into JOINS.

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

	figlet('Bamazon Supervisor Console', function(err, data) {
	        if (err) {
	            console.log('Something went wrong...');
	            console.dir(err);
	            return;
	        }
	        console.log(data);
	        mainsuper();	

	    });

	con.connect(function(err) {
	    if (err) throw err;

	});

	// View Product Sales by Department
	// Create New Department

	function mainsuper(){
		inquirer.prompt([
		{
			type: 'list',
			name: 'superchoice',
			message: 'What would you like to do?',
			choices: [
				"View Product Sales by Department",
				"Create New Department",
				"Exit Program"
			]
		}
		]).then(function(selection){
			switch(selection.superchoice){
				case "View Product Sales by Department":
					viewProductsSales();
					setTimeout(function () {continuePrompt();}, 500);

				break;

				case "Create New Department":
					createNewDeptPrompt();
				break;		

				case "Exit Program":
                    console.log("Good Bye!".rainbow); 
                    process.exit(); 	
			}
		})
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
				mainsuper();
			}
			else{
				console.log("Good Bye!".rainbow);
				process.exit();
			}

		})
	}

	function viewProductsSales(){

		var table = new Table({
			head: ['Department ID', 'Department Name', 'Over Head Costs', 'Product Sales', 'Total Profit/Loss'], 
			colWidths: [15, 35, 25, 20, 20]

		});

		con.query('SELECT department_id, departments.department_name, over_head_costs, product_sales, (product_sales - over_head_costs) AS total_profit FROM departments, products WHERE departments.department_name=products.department_name GROUP BY products.department_name ORDER BY departments.department_id;', function(err,res){

			if (err) throw err;

			if(res.length>0){
				for (var i=0; i<res.length; i++){
					table.push([res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, res[i].total_profit]);
				}

				console.log(table.toString());
			}
			else
				continuePrompt();
		});

	}

	function createNewDeptPrompt(){
		inquirer.prompt([
		{
			type: "input",
			message: "Please Enter The New Department.",
			name: "department_name",
		    validate: function(value) {
	            if ((value=="") === false) {
	              return true;
	            }
	            return false;
            }			
		},
		{
			type: "input",
			message: "Please Enter Over Head Costs of The New Department.",
			name: "overhead",
		    validate: function(value) {
	            if ((value=="") === false && isNaN(value) === false) {
	              return true;
	            }
	            return false;
            }			
		},
		{
			type: "confirm",
			message: "Please Confirm Adding New Department.",
			name: "confirm",
			default: true
		}
		]).then(function(selection){
			if(selection.confirm){

				if(selection.department_name!=="" || selection.overhead!==""){
					insertDept(selection.department_name, selection.overhead);
				}
				else{
					console.log("Please enter valid values".red);
					createNewDeptPrompt();
				}
			}
			else{
				console.log("\n That's okay, come back again when you are serious about adding new departments. :B ".yellow);
				continuePrompt();
			}
		});
	}

	function insertDept(department_name, overhead){
          
      con.query('INSERT INTO `departments` SET ?',
      {
        department_name: department_name,
        over_head_costs: overhead
      }
       , function (error, results, fields) {
        if (error) {
          return connection.rollback(function() {
            throw error;
          });
        }

        console.log(results.affectedRows +" new department, "+department_name+" added!\n");
        continuePrompt();

      });
    }