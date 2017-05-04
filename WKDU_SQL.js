var express = require('express');
var session = require('client-sessions');
var mysql = require('mysql');
var bodyParser = require("body-parser");
var database = require('./database');
var bb = require('express-busboy');
var fs = require('fs');
var id3 = require('node-id3');
var path = require('path');

var app = new express();
var db = new database();

app.use(express.static('.'));
app.use(session({
	cookieName: 'session',
	secret: '123',
	duration: 30*60*1000,
	activeDuration: 5*60*1000,
}))
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

bb.extend(app, {
    upload: true,
    path: 'C:/Users/Ross/Documents/WKDUCS275/For Ross 3-20/files/',
    //allowedPath: /./
});

app.get("/add", function(req,res){
	var sql = "insert into catalog (albumName,artistName,label,submittedBy,submissionStatus,dateSubmitted,mediaType) values (";
	
	//add values
	sql = sql + "'" + req.query.album + "', '" + req.query.artist + "', '" + req.query.label + "', '" + req.session.userid +  "', 'Pending', '" + req.query.submitDate + "', '" + req.query.mediaType + "');";
	if(req.session.userid){		
		if(req.session.usertype != 'pending'){
			db.add(sql);
			res.send("album successfully submitted");
		}
		else{
			res.send("you don't have permission to submit albums");
		}
	}
	else{
		res.send("you don't have permission to submit albums");
	}
});

app.get('/loadindex', function (req, res){
	if(!req.session.userid){
		console.log("sending login form")
		html = 	"<a href=\"#\" onclick=\"register()\">Create an Account<\a><form method=post action='/login' class='login'><input type=\"text\" name=\"username\" placeholder=\"username\" class=\"login\" value=\"\"><input type=\"password\" name=\"password\" placeholder=\"password\" class=\"login\" value=\"\"><input type=\"submit\" value=\"Login\" class=\"login\" onclick=\"getmsg()\">"
		res.send(html);
	}
	else{
		console.log("logged in")
		html = "<a href=\"account\">"+ req.session.userid +"</a>	<a href=\"logout\">logout</a>"
		res.send(html);
	}
});

app.get('/logout',function(req,res){
	if(!req.session.userid){
		res.redirect('/');
	}
	else{
		req.session.reset();
		res.redirect('/');
	}
});

app.post('/login', function (req, res){
	db.once('loggedin', function(msg){
		if(msg==1){
			console.log("login successful");
			req.session.userid = req.body.username;
			//req.session.usertype = db.getpermission(req.body.username)
			db.getpermission(req.body.username);
		}
		else{
			console.log("login failed");
			return res.redirect('/');
		}
	});
	
	db.once('permission',function(msg){
		req.session.usertype = msg;
		console.log(req.session.usertype);
		return res.redirect('/');
	});
	
	db.login(req.body.username, req.body.password);
});

app.get('/getmsg', function (req, res){
	db.once('loggedin', function(msg){
		if(msg==0){
			res.send("incorrect username or password");
		}
		else{
			res.send("");
		}
	});
});

function arrayupload(json){
	for(var i in json){
			var path = json[i].file;
			var type = json[i].mimetype;
			var mdata = id3.read(path);
			console.log(mdata);
				
			var artist = mdata.artist;
			var song = mdata.title;
			var album = mdata.album;
			var label = mdata.publisher;
			var newpath;
			
			if(artist.length > 40){
				artist = artist.slice(0,40);
			}
			if(album.length > 40){
				album = album.slice(0,40);
			}
			
			artist = artist.replace(/[&\/\\#,^+()~%.'":*<>{}\[\]]/g, '');
			album = album.replace(/[&\/\\#,^+()~%.'":*<>{}\[\]]/g, '');
			song = song.replace(/[&\/\\#,^+()~%.'":*<>{}\[\]]/g, '');
			
			if(i==0){
				newpath = "./files/"+artist + "-"+album+"/"+artist+"-"+song+".mp3";
			}
			
			fs.renameSync(path, newpath);
			
			var filepath = path.substring(0,path.lastIndexOf("\\"));
			fs.rmdirSync(filepath);
			filepath = filepath.substring(0,filepath.lastIndexOf("\\"));
			fs.rmdirSync(filepath);
	}
}

app.post('/upload', function (req, res){
	var valid = true;
	
	if(req.files.file instanceof Array){
		//for(var i in req.files.file){
			var path = req.files.file[0].file;
			var type = req.files.file[0].mimetype;
			
			console.log(path);
			console.log(type);
			
			if(type != "audio/mp3"){
				fs.unlinkSync(path);
				res.send("only mp3 files can be uploaded.");
			}
			
			var mdata = id3.read(path);

			var artist = mdata.artist;
			var song = mdata.title;
			var album = mdata.album;
			var label = mdata.publisher;
			var newpath;
			
			if(artist.length > 40){
				artist = artist.slice(0,40);
			}
			if(album.length > 40){
				album = album.slice(0,40);
			}
				
			artist = artist.replace(/[&\/\\#,^+()~%.'":*<>{}\[\]]/g, '');
			album = album.replace(/[&\/\\#,^+()~%.'":*<>{}\[\]]/g, '');
			song = song.replace(/[&\/\\#,^+()~%.'":*<>{}\[\]]/g, '');
			
			//if(i == 0){
				var sql = "select count(*) from catalog where artistName="+mysql.escape(artist)+" && albumName = "+mysql.escape(album)+";";
				var isincatalog;
				db.isincatalog(sql);
				db.once('isincatalog',function(msg){
					isincatalog = msg;
					if(isincatalog){
						fs.unlinkSync(path);
				
						var filepath = path.substring(0,path.lastIndexOf("\\"));
						fs.rmdirSync(filepath);
						filepath = filepath.substring(0,filepath.lastIndexOf("\\"));
						fs.rmdirSync(filepath);
					
						res.send("submission is already in catalog");
					}
					else{
						var newdir = "./files/"+artist+"-"+album;
						fs.mkdirSync(newdir);
			
						sql = "insert into catalog (albumName,artistName,label,submittedBy,submissionStatus,dateSubmitted,mediaType, fileAddress) values (";
						sql += mysql.escape(album)+", "+mysql.escape(artist)+", "+mysql.escape(label)+", "+mysql.escape(req.session.userid)+", 'Pending', now(), 'Digital', '"+newdir+"');"
				
						db.add(sql);
						
						arrayupload(req.files.file);
						
						res.send("files submitted successfully. Thank you!");
					}
				});
			//}
		//}
	}
	
	else{
		var path = req.files.file.file;
		var type = req.files.file.mimetype;
		
		console.log(path);
		console.log(type);
		
		if(type != "audio/mp3"){
			fs.unlinkSync(path);
			var filepath = path.substring(0,path.lastIndexOf("\\"));
			fs.rmdirSync(filepath);
			filepath = filepath.substring(0,filepath.lastIndexOf("\\"));
			fs.rmdirSync(filepath);
			
			res.send("Only mp3 files can be uploaded.");
		}
		else{
			var mdata = id3.read(path);
			console.log(mdata);
			
			var artist = mdata.artist;
			var song = mdata.title;
			var album = mdata.album;
			var label = mdata.publisher;
			
			if(artist.length > 40){
				artist = artist.slice(0,40);
			}
			if(album.length > 40){
				album = album.slice(0,40);
			}
			
			artist = artist.replace(/[&\/\\#,^+()~%.'":*<>{}\[\]]/g, '');
			album = album.replace(/[&\/\\#,^+()~%.'":*<>{}\[\]]/g, '');
			song = song.replace(/[&\/\\#,^+()~%.'":*<>{}\[\]]/g, '');
			
			var sql = "select count(*) from catalog where artistName="+mysql.escape(artist)+" && albumName = "+mysql.escape(album)+";";
			db.isincatalog(sql);
			var isincatalog;
			db.once('isincatalog',function(msg){
				isincatalog = msg;
				console.log("isintcatalog: "+isincatalog);
				if(isincatalog == false){
					fs.mkdirSync("./files/"+artist+"-"+album);
					var newpath = "./files/"+artist + "-"+album+"/"+artist+"-"+song+".mp3";
					fs.renameSync(path, newpath);
			
					sql = "insert into catalog (albumName,artistName,label,submittedBy,submissionStatus,dateSubmitted,mediaType, fileAddress) values (";
					sql += mysql.escape(album)+", "+mysql.escape(artist)+", "+mysql.escape(label)+", "+mysql.escape(req.session.userid)+", 'Pending', now(), 'Digital', '"+"./files/"+artist + "-"+album+"');"
				
					db.add(sql);
				
					var filepath = path.substring(0,path.lastIndexOf("\\"));
					fs.rmdirSync(filepath);
					filepath = filepath.substring(0,filepath.lastIndexOf("\\"));
					fs.rmdirSync(filepath);
				
					res.send("file(s) successfully submitted. Thank you!");
				}
				else{
					fs.unlinkSync(path);
					
					var filepath = path.substring(0,path.lastIndexOf("\\"));
					fs.rmdirSync(filepath);
					filepath = filepath.substring(0,path.lastIndexOf("\\"));
					fs.rmdirSync(filepath);
					
					res.send("submission is already in catalog");
				}
			});
		}
	}
});

app.get('/catalog', function (req,res){
	if(req.session.userid){
		if(req.session.usertype == 'submitter'){
			var html = "<a href=\"#\" id=\"history\">View my past submissions</a><br><br>";
			html += "<a href=\"#\" id=\"newadds\">View new adds for this week</a><br><br>";
			
			res.send(html);
		}
		else if(req.session.usertype == 'pending'){
		var html = "you don't have permission to view the catalog.";
		res.send(html);
		}
		else{
			var html = "<a href=\"#\" id=\"history\">View my past submissions</a><br><br>";
			html += "<a href=\"#\" id=\"newadds\">View new adds for this week</a><br><br>";
			html += "<a href=\"#\" id=\"shelves\">View new music shelves</a><br><br>";
			html += "<a href=\"#\" id=\"search\">Search entire catalog</a><br><br>";
			
			res.send(html);
		}
	}
	else{
		var html = "you don't have permission to view the catalog.";
		res.send(html);
	}
});

app.get('/submitter', function(req,res){
		if(req.session.userid){
		if(req.session.usertype != 'pending'){
			var html = "<h1>Add to catalog</h1><hr><p>Please provide all information below if mailing physical media:</p><form name=\"pendingSubmission\"><p>Album name: <input type=\"text\" name=\"album\" id=\"album\"></p><p>Artist: <input type=\"text\" name=\"artist\" id=\"artist\"></p><p>Record label: <input type=\"text\" name=\"label\" id=\"label\"></p><p>Media type:<select id=\"mediaType\"><option value=\"CD\">CD</option><option value=\"12in\">12in</option><option value=\"10in\">10in</option><option value=\"7in\">7in</option></select></p><p><button type=\"button\" onclick=\"addToCatalog()\">Submit!</button></p></form><p>Or upload mp3 file(s):</p><form name=\"fileUpload\" action=\"/upload\" method=\"post\" enctype=\"multipart/form-data\"><p><input name=\"file\" type=\"file\" id=\"file\" multiple></p><p><input type=\"submit\" value=\"Submit File\"></p></form>"
			
			res.send(html);
		}
		else{
		var html = "you don't have permission to submit to the catalog.";
		res.send(html);
		}
	}
	else{
		var html = "you don't have permission to submit to the catalog.";
		res.send(html);
	}
});

app.get('/history', function (req,res){
	if(req.session.userid){
		if(req.session.usertype != 'pending'){
			var sql = "select albumName, artistName, label, spinsAllTime, spinsWeek, submissionStatus, dateSubmitted, mediaType from catalog where submittedBy='"+req.session.userid+"' order by dateSubmitted desc;";
			db.search(sql);
			db.once('found',function(msg){
				//console.log(msg);
				res.send(msg);
			});
		}
		else{
		var html = "you don't have permission to view the catalog.";
		res.send(html);
		}
	}
	else{
		var html = "you don't have permission to view the catalog.";
		res.send(html);
	}
});

app.get('/shelves', function(req,res){
		if(req.session.userid){
		if(req.session.usertype != 'pending'){
			var date;
			var sql = "select albumName, artistName, label, spinsAllTime, spinsWeek, dateSubmitted, mediaType from catalog where dateAdded > DATE_SUB(curdate(), INTERVAL 12 WEEK) and submissionStatus='Approved' order by dateSubmitted desc;";
			db.adds(sql);
			db.once('found',function(msg){
				//console.log(msg);
				res.send(msg);
			});
		}
		else{
		var html = "you don't have permission to view the catalog.";
		res.send(html);
		}
	}
	else{
		var html = "you don't have permission to view the catalog.";
		res.send(html);
	}
});

app.get('/userquery', function (req,res){
	if(req.session.userid){
		if(req.session.usertype != 'pending'){
			var sql = "select albumName, artistName, label, spinsAllTime, spinsWeek, submissionStatus, dateSubmitted, mediaType from catalog where submittedBy='"+req.session.userid+"' order by dateSubmitted desc;";
			db.search(sql);
			db.once('found',function(msg){
				//console.log(msg);
				res.send(msg);
			});
		}
		else{
		var html = "you don't have permission to view the catalog.";
		res.send(html);
		}
	}
	else{
		var html = "you don't have permission to view the catalog.";
		res.send(html);
	}
});

app.get('/adds', function(req,res){
		if(req.session.userid){
		if(req.session.usertype != 'pending'){
			var date;
			var sql = "select albumName, artistName, label, spinsAllTime, spinsWeek, dateSubmitted, mediaType from catalog where dateAdded > DATE_SUB(curdate(), INTERVAL 1 WEEK) and submissionStatus='Approved' order by dateSubmitted desc;";
			db.adds(sql);
			db.once('found',function(msg){
				//console.log(msg);
				res.send(msg);
			});
		}
		else{
		var html = "you don't have permission to view the catalog.";
		res.send(html);
		}
	}
	else{
		var html = "you don't have permission to view the catalog.";
		res.send(html);
	}
});

app.get('/search', function(req,res){
	if(req.session.userid){
		if(req.session.usertype != 'pending' && req.session.usertype != 'submitter'){
			var sql = "select albumName, artistName, label, dateAdded, mediaType from catalog where submissionStatus='Approved'";
				if(req.query.artist.length > 0){
					sql += "and artistName='";
					sql += req.query.artist;
					sql += "'";
				}
				if(req.query.album.length > 0){
					sql += "and albumName='";
					sql += req.query.album;
					sql += "'";
				}
				if(req.query.label.length > 0){
					sql += "and label='";
					sql += req.query.label;
					sql += "'";
				}
				if(req.query.year.length > 0){
					var year = parseInt(req.query.year);
					if(year > 1900 && year < 2100){
						sql += "and dateAdded >= '";
						sql += req.query.year;
						sql += "-01-01' and dateAdded <= '";
						sql += req.query.year;
						sql += "-12-31'";
					}
				}

			sql+=" order by artistName desc;";
			console.log(sql);
			db.searchcat(sql);
			db.once('found',function(msg){
				res.send(msg);
			});
		}
		else{
		var html = "you don't have permission to search the catalog.";
		res.send(html);
		}
	}
	else{
		var html = "you don't have permission to search the catalog.";
		res.send(html);
	}
});

app.get('/submissionbrowser', function(req,res){
	console.log(req.session.usertype);
	if(req.session.usertype == 'member' || req.session.usertype == 'admin' || req.session.usertype == 'superadmin'){
		db.pending();
		db.once('found', function(msg){
			res.send(msg);
		});
	}
	else{
		var html = "<div id=\"content\" class=\"content\">you don't have permission to browse submissions.</div>";
		res.send(html);
	}
});

app.listen(8080);