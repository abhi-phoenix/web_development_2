// This module contains functions supporting the functionality for routes

// Get the required modules from the built_in modules
modules = require('./built_in_modules');
utility = require("./utility");
const fs = require('fs');
const path = require('path');
const directoryPath = path.join(__dirname, 'public/all_texts/');


// Export the function to other files that add these into it.
module.exports =
{
	login_submit,
	allot_utterances,
};

config_file_name = "./config.json";
config = utility.read_from_json(config_file_name);
turk_id_global = ''
var number_of_utterances = config.no_of_utterances;

function login_submit(req, res)
{
    // Initialize variables
	//to_email = req.body.email;

	// This the turker is that is got as input from the user.
	let turkid = req.body.turkid;
	turk_id_global = req.body.turkid;

	// Get the name from the database
	var check_sql = "select name from turker where turk_id='"+turkid+"'";

	// The users email for further use
	//to_email = req.body.email;

	// Make the query on the database

	connection.query(check_sql,function(err,resp)
	{
		if(err)
		{
			console.log("hello there");
			console.log(err);
			res.redirect('/');
		}

		// This is a check to see if the user is a returning user.
		if(resp.length > 0)
		{


			var message = 'Welcome back '+JSON.stringify(resp[0].name);

			// Get the continution code for the turker.
			var sql = "select continuing_code, continuing_page from turker where turk_id = '"+turk_id_global+"'";

			connection.query(sql,function(error,resp1)
			{
				if(error)
				{
					console.log(error);
				}
				else
				{
                    // To send an email, use this code.
                    var subject = 'Welcome back to charisma study';
					var content = 'Your code to continue your study is: ' + resp1[0].continuing_code
					//console.log('inside email: '+email+" "+email_pswd);
					//utility.send_email(email,email_pswd,to_email,subject,content);

					console.log('length: '+resp1.length+' '+resp1.body);

					console.log(resp1[0].continuing_code);

					return_page = resp1[0].continuing_page;
					//return_page = 1;

					// Render the page after the submission is successful.
					res.render("welcome_back.ejs",{message:'User'});
				}
			});


		}
		else
		{
			// Insert the details through which the login submission was made.
			var inner_sql = "select name from turker where turk_id = '"+turkid+"'";

			// Make this connection request
			connection.query(inner_sql,function(error,resp1)
			{

				if(error)
				{
					console.log("error in same turk_id"+ error);
				}
				if(resp1.length > 0)
				{
					res.redirect("/login");
				}
				else
				{
					var sql = "insert into turker values(?,?,?,?,?,?)";
					//var uname = to_email;
					//var len = uname.length;
					var len =0;

					var append_code = utility.randomString(25-len, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

					//console.log(req.body.turkid, req.body.name, req.body.email);
					connection.query(sql,[req.body.turkid, '', '', append_code,1, ''],function(error,rows,resp1)
					{
						if(!!error)
						{
							console.log('error inside1'+ error);
							res.redirect('/');
						}
						else
						{
							console.log('successful query inside login!!');
						}
						res.redirect("/instructions");
					});



				}
			});
		}
	});

}


function allot_utterances(req,res,page,turk_id_global,study_id, directory_name, file_names )
{
	var sql_utterance = "select * from turker where turk_id ='"+turk_id_global+"'";
	var results = [];
	connection.query(sql_utterance,function(err,resp)
	{
		if(err)
		{
			console.log("error allotting values "+err);
		}
		else
		{
			var str = resp[0].utter_allotted;
			var str_arr = str.split(",");

			 for(let i = 1; i <= str_arr.length;i++)
			 {

				ind = str_arr[i-1];

				var sql_utt_vals = "select * from utterance_table where utterance = 'utterance_" + ind + "'";



			}

			setTimeout(() => {  console.log("Wait");

			var texts_info = [];
			var file_names_new = [];
			for(let j = 1; j <= file_names.length;j++){
				if(typeof(file_names[j]) !== 'undefined')
				{
				//console.log(file_names[j]);
				try{
					var temp = file_names[j].split('/');
					let data = fs.readFileSync(directoryPath+temp[temp.length-1].replace('.mp3', '.txt'), 'utf8');
					//let jason = JSON.parse(data);
					//console.log(data);
					data = data.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
					texts_info.push(data);
					file_names_new.push(file_names[j]);
				}
				catch(err){
					console.log(err);
				}

				}
			}
			//console.log('this'+texts_info);
			res.render(page,{message:'',utter: results,number_utter : file_names.length, directory_name_var: "",file_names_var: file_names_new, info: texts_info, user_id: turk_id_global, study_id: study_id});
			}, 500);
		}

	});
}



/*
let data = fs.readFileSync(directoryPath+file_names[j].replace('.mp3', '.txt'), 'utf8');
let jason = JSON.parse(data);

*/
