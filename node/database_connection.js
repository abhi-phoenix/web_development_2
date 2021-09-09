// This file has all the code that can maintain connection to the database

// Import the modules that are installed for this module.
var mysql = require('mysql');
const fs = require('fs');
var current_version_number = 999;
// Export the function to other files that add these into it.
module.exports =
{
	create_connection,
	connect_database,
	populate_utterance_table,
	add_study,
	add_audio_version,
	add_completion_details,
	add_emphasis_data,
	current_version_number


};

function add_audio_version(number_audio_versions, study_id)
{
	return new Promise(function(resolve, reject) {
		number_audio_versions = Number(number_audio_versions);
		var sql = "select * from audio_version where study_id ='" + study_id + "'";

		connection.query(sql,function(error,resp)
		{
			if(error)
			{
				console.log(error);
				res.redirect('/');
			}
			else
			{
				if (resp.length <= 0){
					var sql_query = "insert into audio_version values(?,?)";
					connection.query(sql_query,[study_id, 0],function(error,rows,resp)
					{
						if(!!error)
						{
							return console.log(error);
						}
						else
						{
							console.log('successful insert query for audio_version!!');
							resolve(0);
						}
					});

				}
				else {
					current_version_number = Number(resp[0]['current_version_number']);
					if ((current_version_number+1) >= number_audio_versions){
						new_version_number = 0;
					}
					else{
							var new_version_number = current_version_number+1;
					}
					var sql_new_query = 'UPDATE audio_version SET current_version_number = ? WHERE study_id = ?';
					connection.query(sql_new_query,[new_version_number, study_id], function(error,resp)
					{
						if(!!error)
						{
							return console.log(error);
						}
						else
						{
							console.log('successful update query for audio_version!!');
							resolve(new_version_number);
						}
					});

					//console.log('type of '+ typeof(number_audio_versions));
				}

			}
		});
	});
}


function create_connection(host, user, password, database)
{
	// Create a mysql connection with all the credentials
	var connection = mysql.createConnection(
	{
		host: host,
		user: user,
		password: password,
		database: database
	});

	return connection;
}

function connect_database(connection)
{
	// Connect to the above database
	// Errors are handled and will be logged.
	connection.connect(function(error)
	{
		if(!!error)
		{
			console.log(error);
		}
		else
		{
			console.log('connected');
		}
	});

}

// Insert study into study table if not already exists
function add_study(study_id)
{
	var sql = "select * from study where study_id ='" + study_id + "'";

	connection.query(sql,function(error,resp)
	{
		if(error)
		{
			console.log(error);
			res.redirect('/');
		}

		if (resp.length <= 0)
		{
			insert_sql = "insert into study values(?,?,?)";

			created = new Date()

			connection.query(insert_sql,[study_id, created,null],function(error,rows,resp1)
			{
				if(!!error)
				{
					return console.log(error);
				}
				else
				{
					console.log('successful insert query for study!!');
				}
			});
		}

	});
}


// This is a function which returns whether the utterance_table is populated or not.
var flag = -1;
function populate_utterance_table()
{
	// flag indicates whether the utterance_table is populated or not.
	// If flag is 1, then the utterance_table is populated.
	// If flag is 0, then the utterance_table is not populated.

	var sql = "select * from utterance_table";

	connection.query(sql,function(error,resp)
	{
		if(error)
		{
			console.log(error);
			res.redirect('/');
		}

		// This is a check to see if the user is a returning user.
		if(resp.length > 0)
		{
			flag =  1;
		}
		else
		{
			flag =  0;

			// If the utterances are not present in the database, add it in.
			//flag_1 = insert_utterances(charismaric_data_path_text,"charismatic");
			//flag_2 = insert_utterances(non_charismaric_data_path_text,"noncharismatic");
			flag_1 = 1;
			flag_2 = 1;
			if (flag_1 && flag_2)
			{
				console.log('Successfully inserted the data into utterance table');
			}
		}
	});

	return flag;
}

function add_completion_details(req, res,turk_id_global, study_id,start_time,end_time)
{

	var code = utility.randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
	var message = '';
	var sql = "select * from completion where turk_id = '"+turk_id_global+"'";
	connection.query(sql,function(err,response)
	{
		if(err)
		{
			console.log("ERROR: "+err);
			res.redirect('/');
		}
		if(response.length > 0 )
		{
            console.log("running");
            console.log(response);
			message = response[0].completion_code;
			console.log(response[0].completion_code);
			res.render("completion_page.ejs", {message: message});
		}
		else
		{
            //console.log(study_id, user_id,code);
			var new_sql = "insert into completion values(?,?,?,?,?)";
			var new_completion_code = code;
      console.log(start_time, end_time);
			connection.query(new_sql,[study_id, turk_id_global,start_time, end_time, new_completion_code],function(error,rows,resp1)
			{
				if(!!error)
				{
					console.log('error inside completion code: '+error);
					res.redirect('/');
				}else
				{
					console.log('added completion code to database');
					res.render("completion_page.ejs", {message: new_completion_code});
				}

				message = code;
			});
		}
	});

}

function add_emphasis_data(req, res, turk_id_global, current_version_number, study_id, data_body){

	var time = new Date();
	var sql = "select * from emphasis_data where user_id = '"+turk_id_global+"'";
	connection.query(sql,function(err,response)
	{
		if(err)
		{
			console.log("ERROR: "+err);
			res.redirect('/');
		}
		if(response.length > 0 )
		{
			console.log("user_id already present");

		}
		else
		{
            //console.log(study_id, user_id,code);
			var new_sql = "insert into emphasis_data values(?,?,?,?,?)";
			connection.query(new_sql, [time, turk_id_global, current_version_number, study_id, JSON.stringify(data_body)],function(error,rows,resp1)
			{
				if(!!error)
				{
					console.log('error inside emphasis_data insertion: '+error);
					res.redirect('/');
				}
				else
				{
					console.log('added emphasis_data to database');
				}

			});
		}
	});


}


/*
var utterance_count = 1;
// This is a function to insert the data into the database from the local system.
function insert_utterances(file_path,utterance_type)
{
	// flag indicates whether the utterance is charismatic or not.
	// If flag is 1, then the utterance is charismatic.
	// If flag is 0, then the utterance is non charismatic

	var flag = 1;


	// Read the directory to list all the files.
	fs.readdir(file_path, (err, files) =>
	{
		// Iterate through each of the files in the directory
		files.forEach(file =>
		{
			if (file.startsWith('utterance'))
			{
				// Read the each file in the directory
				fs.readFile(file_path + file,'utf8',  function (err,data)
				{
					if (err)
					{
						return console.log(err);
					}

					// Insert the details.
					var sql = "insert into utterance_table values(?,?,?)";

					// Make this connection request
					var utt_id_new = "utterance_" + utterance_count

					utterance_count = utterance_count + 1;

					connection.query(sql,[utt_id_new, data,utterance_type],function(error,rows,resp1)
					{
						if(!!error)
						{
							flag = 0;
							return console.log(error);
						}
					});

				});

			}
		});
	});

	return flag;
}

*/
