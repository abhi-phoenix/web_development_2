// This module has all utility functions that can be used across functionality

// Get the required modules from the built_in modules
modules = require('./built_in_modules');

// Export the function to other files that add these into it.
module.exports =
{
	send_email,
	randomString,
	read_from_json,
	create_directory_structure_for_uploads
};

// Create the database connection
// Credentials for logging into the database
// Read from the credentials file.
credentials_file_name = "./credentials.json";
creds = read_from_json(credentials_file_name);

// Read from the config file.
configs_file_name = "./config.json";
config = read_from_json(configs_file_name);

// Set the variables got from the file.
host = creds.host;
user = creds.user;
db_pswd = creds.password;
database = creds.database;
email = creds.email;
email_pswd = creds.pswd;

// Get the connection object given the credentials
connection = conn.create_connection(host, user, db_pswd, database);

// Connect to the database
conn.connect_database(connection)

// This is a function which takes the credentials of email of the administrator and the users email to send an email to them.
function send_email(your_email,your_password,to_email, subject, content)
{

	// Set up the connection to the administrator's email account
	var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
		user: your_email,
		pass: your_password
	  }
	});

	// Customize the email as required
	var mailOptions = {
	  from: your_email,
	  to: to_email,
	  subject: subject,
	  text: content
	};

	// Send an email
	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
		console.log(error);
	  } else {
		console.log('Email sent: ' + info.response);
	  }
	});
}

// This function is used to generate a random string from a set of characters of length
function randomString(length, chars)
{
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

// This function read a json file given its filename
function read_from_json(filename)
{
    return require(filename);
}

function create_directory_structure_for_uploads(study_id, turker_id)
{
	uploads_dir = __dirname + '/public/uploads';
	study_dir = uploads_dir + path.sep + 'study' + study_id;

	if(!fs.existsSync(study_dir))
	{
		fs.mkdirSync(study_dir, {recursive: true});
	}

///

////
	charismatic = study_dir + path.sep + 'charismatic';
	non_charismatic = study_dir + path.sep + 'non_charismatic';
	monotonic = study_dir + path.sep + 'monotonic';

	if(!fs.existsSync(charismatic))
	{
		fs.mkdirSync(charismatic, {recursive: true});
	}

	if(!fs.existsSync(non_charismatic))
	{
		fs.mkdirSync(non_charismatic, {recursive: true});
	}

	if(!fs.existsSync(monotonic))
	{
		fs.mkdirSync(monotonic, {recursive: true});
	}

	return [charismatic, non_charismatic, monotonic];
}
