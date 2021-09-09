
// Get the required modules from the built_in modules
modules = require('./built_in_modules');

// Get the modules from the database_connection module.
conn = require('./database_connection');

// Get the functions from utility module.
utility = require('./utility');

// Get the functions from the routes module.
routes = require('./routes');

//requiring path
const path = require('path');

//requiring fs
const fs = require('fs');

var cors = require('cors')

//const app = express();

app.use(express.json())

// We are using the below modules
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));
app.use('/static', express.static(path.join(__dirname, 'public')));

///
app.use(bodyParser.json('application/json'));
app.use(cors({credentials: true, origin: true}));
////


//joining path of directory
const directoryPath = path.join(__dirname, 'public/audios/');

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
				if(files[i] != '.DS_Store'){
					files_.push(files[i]);
			}
    }
    return files_;
}

var directories = getFiles(directoryPath);

/*
//passsing directoryPath and callback function
fs.readdir(directoryPath), function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
		file_names = files;
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file);
    });
});
*/

// Set global variables
var turk_id_global ='';
var turk_name_global = '';
var return_page = 1;
var study_id = config["study_id"];
var number_audio_versions = config["audio_versions"];
var start_time = '';
var completion_code = '';

track_file_name = "./version_file_list.json";
version_files = utility.read_from_json(track_file_name);


// Insert into study table if not yet done.
conn.add_study(study_id);

/*
let current_version_number = conn.add_audio_version(number_audio_versions, study_id).then(function(rows){
     // This function get called, when success
     console.log(rows);
     return rows;
    },function(error){
     // This function get called, when error
     console.log(error);

   });
*/
async function start() {

  let current_version_numb = await conn.add_audio_version(number_audio_versions, study_id);
  current_version_number = current_version_numb;
  console.log(current_version_numb);
  return current_version_numb;
}




//console.log(testing(number_audio_versions, study_id));
/*
conn.add_audio_version(number_audio_versions, study_id);
console.log('this one :' + conn.current_version_number);
*/
// Insert into the utterances table of the database.
//charismaric_data_path_text = config["charismaric_data_path_text"];
//non_charismaric_data_path_text = config["non_charismaric_data_path_text"];

//conn.populate_utterance_table();

app.get("/",function(req,res)
{
  current_version_number = start();
	// Make a select query for the turker details
	connection.query("Select * from turker", function(error,rows,fields)
	{
		if(!!error)
		{
			console.log('error');
		}
		else
		{
			console.log(rows);
			console.log('successful query!!');
			res.render("page.ejs");
		}

	});
});

/*
// This is an endpoint (landing page)
app.get("/page",function(req,res)
{
	res.render("instructions.ejs");
});
*/
app.post("/bet", function(req,res)
{
	turk_id_global = req.body.turkid;
	turk_name_global = req.body.name;
  start_time = new Date();
	routes.login_submit(req, res);
});

// This is the instruction page
app.get("/instructions",function(req,res)
{
	message = "Hello "+ turk_name_global;
	res.render("instructions.ejs",{message:message});
});

// This is the post call which takes care of the submit part in the landing page

app.post("/code_new",function(req,res)
{
	console.log(turk_id_global);
	let code = turk_id_global;
	console.log('the code'+JSON.stringify(req.body));
	var query = "select * from turker where turk_id= '"+code+"'";
	connection.query(query, function(error,resp)
	{

		console.log(JSON.stringify(resp)+" "+ turk_id_global);
		if(!!error)
		{
			console.log('error '+ error);
		}
		else if (resp.length > 0 && resp[0].turk_id == turk_id_global)
		{

			var message = "Continue your study from page: "+resp[0].continuing_page;
			return_page = resp[0].continuing_page;
			console.log('successful query code check !!'+ return_page);
			console.log(message);
			//console.log('this popo'+return_page);
			//var file_names = getFiles(directoryPath+directories[return_page-1]+'/charismatic/');
      var file_names = version_files[current_version_number];
			if(return_page == 1)
			{
				routes.allot_utterances(req,res,"first_page_try2.ejs",turk_id_global,study_id, directories[return_page-1],file_names);
				//res.send('fenrjfneknr');
			}
			else if(return_page == 2)
			{
				routes.allot_utterances(req,res,"second_page.ejs",directories[return_page-1], file_names);
			}
			else if(return_page == 3)
			{
				routes.allot_utterances(req,res,"third_page.ejs", directories[return_page-1],file_names);
			}
			else if(return_page == 4)
			{
				message = "You have completed your study."
				res.redirect("/finish");
			}

		}
		else
		{
			var message = "This is an invalid completion code";
			res.render("instructions.ejs",{message:message});
		}
	});
});

app.get("/first_page_study", function(req,res)
{
	console.log("turk_id_global: "+turk_id_global);
	routes.allot_utterances(req,res,"first_page_try2.ejs", directories[return_page-1],file_names);

});


app.post('/first_page_study', (req, res, next) => {

    end_time = new Date();
    console.log(req.header('Content-Type'));
    console.log('data packet read: '+ turk_id_global, study_id, req.body);
    //console.log(turk_id_global, study_id,start_time,end_time);
    conn.add_emphasis_data(req, res, turk_id_global, current_version_number, study_id, req.body);

});

app.get('/completion_page', (req, res, next) => {
  conn.add_completion_details(req, res,turk_id_global, study_id,start_time,end_time);

  });

/*
folders = utility.create_directory_structure_for_uploads(study_id,turk_id_global);

folder_charismatic = folders[0];

folder_non_charismatic = folders[1];

folder_monotonic = folders[2];

console.log(folder_charismatic);
var storage_page1 = multer.diskStorage(
	{

		destination: function (req, file, cb)
		{
			cb(null,   folder_monotonic + '/');
		},
		filename: function (req, file, cb)
		{
			cb(null, turk_id_global + '-' + Date.now());
		}
	});

var upload = multer({storage:storage_page1});

var monotonous_page = upload.single('upl');

var storage_page2 = multer.diskStorage(
	{

		destination: function (req, file, cb)
		{
			cb(null,  folder_charismatic);
		},
		filename: function (req, file, cb)
		{
			cb(null, turk_id_global + '-' + Date.now());
		}
	});

var upload = multer({storage:storage_page2});

var charismatic_page = upload.single('upl');

var storage_page3 = multer.diskStorage(
	{

		destination: function (req, file, cb)
		{
			cb(null, folder_non_charismatic);
		},
		filename: function (req, file, cb)
		{
			cb(null, turk_id_global + '-' + Date.now());
		}
	});

var upload = multer({storage:storage_page3});

var non_charismatic_page = upload.single('upl');

app.get("/first_page_study", function(req,res)
{
	console.log("turk_id_global: "+turk_id_global);
	routes.allot_utterances(req,res,"first_page_try2.ejs");

});

app.post("/first_page_study", monotonous_page,function(req,res)
{
	console.log("Inside post first page");
	console.log(req.body);
	console.log(req.file);
	res.status(204).send();
});

app.get("/second_page_study", function(req,res)
{
	console.log("Inside second page");
	var sql = "update turker set continuing_page = 2 where turk_id = '"+turk_id_global+"'";
	connection.query(sql,function(err,resp)
	{
		if(err)
		{
			console.log(err);
		}
	});
	routes.allot_utterances(req,res,"second_page.ejs");
	//res.render("second_page.ejs",{message:''});
});

app.post("/second_page_study", charismatic_page,function(req,res)
{
	console.log("Inside post first page");
	console.log(req.body);
	console.log(req.file);
	res.status(204).send();
});

app.get("/third_page_study", function(req,res)
{
	var sql = "update turker set continuing_page = 3 where turk_id = '"+turk_id_global+"'";
	connection.query(sql,function(err,resp)
	{
		if(err)
		{
			console.log(err);
		}
	});
	routes.allot_utterances(req,res,"third_page.ejs");
	//res.render("third_page.ejs",{message:''});
});

app.post("/third_page_study", non_charismatic_page,function(req,res)
{

	console.log("Inside post first page");
	console.log(req.body);
	console.log(req.file);
	res.status(204).send();
});

app.get("/finish", function(req,res)
{
	var sql = "update turker set continuing_page = 4 where turk_id = '"+turk_id_global+"'";
	connection.query(sql,function(err,resp)
	{
		if(err)
		{
			console.log(err);
		}
	});

	var rString = utility.randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
	var message = '';
	var sql = "select * from completion where turk_id = '"+turk_id_global+"'";

	connection.query(sql,function(err,resp)
	{
		if(err)
		{
			console.log("ERROR: "+err);
			res.redirect('/');
		}
		if(resp.length > 0 )
		{
			console.log("running");
			message = resp[0].completion_code;
			console.log(resp[0].completion_code);
			res.render("completion_page.ejs", {message: message});
		}
		else
		{

			var new_sql = "insert into completion values(?,?,?)";
			var new_completion_code = rString;
			connection.query(new_sql,['1', turk_id_global,new_completion_code],function(error,rows,resp1)
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

				message = rString;
			});
		}
	});

});

app.get("/output", function(req,res)
{
	var query = connection.query('select * from turker' ,function(err, rows)
	{
		res.render('display.ejs',{page_title:"Test Table",l:rows});
	});

});
*/

app.listen(1337, function()
{
	console.log("server has started at port 1337!!");
});
