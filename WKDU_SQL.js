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
		html = 	"<div class=\"login\" id=\"login\"><a href=\"#\" onclick=\"register()\">Create an Account<\a><form method=post action='/login' class='login'><input type=\"text\" name=\"username\" placeholder=\"username\" class=\"login\" value=\"\"><input type=\"password\" name=\"password\" placeholder=\"password\" class=\"login\" value=\"\"><input type=\"submit\" value=\"Login\" class=\"login\" onclick=\"getmsg()\"></div>"
		res.send(html);
	}
	else{
		console.log("logged in")
		html = "<div class=\"login\" id=\"login\"><a href=\"#\" onclick=\"account()\">"+ req.session.userid +"</a>	<a href=\"logout\">logout</a></div>"
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
			
			db.once('permission',function(msg){
				req.session.usertype = msg;
				console.log(req.session.usertype);
				return res.redirect('/');
			});
		}
		else{
			console.log("login failed");
			return res.redirect('/');
		}
	});
	
	db.login(req.body.username, req.body.password);
});

app.post('/register', function(req,res){
	console.log(req.body);
	
	var first = req.body.first;
	var last = req.body.last;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var type = req.body.type;
	
	db.register(first,last,email,username,password);
	
	db.once('valid', function(msg){
		var valid = msg;
		if(valid){
			req.session.usertype = 'pending';
			req.session.userid = req.body.username;
			res.send("true");
			
		}
		else{
			res.send("false");
		}
	});
	
	//res.redirect('/');

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
			try{
				var mdata = id3.read(path);

				var artist = mdata.artist;
				var song = mdata.title;
				var album = mdata.album;
				var label = mdata.publisher;
				var newpath;
			}
			catch(err){
					var parser = mm(fs.createReadStream(path), function (err, metadata) {
					if (err) console.error(err);
						console.log(metadata);
					});
			}
			
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
		var html = "Your account must be white listed before you can submit to the catalog.";
		res.send(html);
		}
	}
	else{
		var html = "Log in or <a href=\"#\" onclick=\"register()\">request an account<\a> to submit music to WKDU";
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
			var sql = "select albumName, artistName, label, dateAdded, mediaType, fileAddress from catalog where submissionStatus='Approved'";
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
		db.pending(req.session.userid);
		db.once('found', function(msg){
			res.send(msg);
		});
	}
	else{
		var html = "<div id=\"content\" class=\"content\">you don't have permission to browse submissions.</div>";
		res.send(html);
	}
});

app.get('/getfiles', function(req, res){
	if(req.session.usertype == 'member' || req.session.usertype == 'admin' || req.session.usertype == 'superadmin'){
		var files = fs.readdirSync(req.query.address);
		var html="";
		console.log(files);
		for(var i = 0; i < files.length; i++){
			html+="<a href='http://localhost:8080/download?file="+req.query.address+"/"+files[i]+"'>"+files[i]+"</a><br>"
		}
		res.send(html);
	}
	else{
		res.redirect('http://localhost:8080');
	}
});

app.get('/download', function(req,res){
	if(req.session.usertype == 'member' || req.session.usertype == 'admin' || req.session.usertype == 'superadmin'){
		res.download(req.query.file);
	}
	else{
		res.redirect('http://localhost:8080');
	}
});

app.get('/vote', function(req,res){
	console.log(req.query.album);
	if(req.session.usertype == 'member' || req.session.usertype == 'admin' || req.session.usertype == 'superadmin'){
		var query = "insert into votes(username, albumID, vote) (select '"+req.session.userid+"',"+req.query.album+",'"+req.query.vote+"' from votes where not exists (select * from votes where username ='"+req.session.userid+"' and albumID='"+req.query.album+"') limit 1 );";
		
		db.vote(query);
		
		var html = "<body onload=window.close()>vote submitted, thank you!</body>";
		res.send(html);
	}
	else{
		var html = "<body onload=window.close()>you don't have permission to vote on submissions.</body>";
		res.send(html);
	}
});

app.get('/makeplaylist', function(req, res){
	if(req.session.usertype == 'member' || req.session.usertype == 'admin' || req.session.usertype == 'superadmin'){
		var html = "<div id=\"content\" class=\"content\"><form><h3>Add a Playlist</h3><hr><div id=\"playlist\"><p class=\"line\"><input type=\"text\" class=\"artist\" value=\"\" placeholder=\"Artist\" list=\"artistsuggest0\" oninput=\"suggestartist(this)\"><input type=\"text\" class=\"song\" value=\"\" placeholder=\"Title\"><input type=\"text\" class=\"album\" value=\"\" placeholder=\"Album\" list=\"albumsuggest0\" oninput=\"suggestalbum(this)\"><input type=\"text\" class=\"label\" value=\"\" placeholder=\"Label\"> New:<input type=\"checkbox\" class=\"new\" value=\"New\" name=\"New\"> Local:<input type=\"checkbox\" class=\"local\" value=\"Local\" name=\"Local\"><button onclick=\"deleteRow(this)\">Delete row</button><datalist class=\"artistsuggest\" id=\"artistsuggest0\"></datalist><datalist class=\"albumsuggest\" id=\"albumsuggest0\"><option value=\"yo\"></datalist></p></div><br></br><button type=\"button\" onclick=\"addRow()\">Add row</button><br></br><button onclick=\"submitplaylist()\">Submit</button><div id=\"out\"></div></form></div>"
		res.send(html);
	}
	else{
		var html = "<div id=\"content\" class=\"content\">You don't have permission to make playlists.</div>";
		res.send(html);
	}
});

app.post('/artistsuggest',function(req,res){
	if(req.session.usertype == 'member' || req.session.usertype == 'admin' || req.session.usertype == 'superadmin'){
		db.getartistsuggestions(req.body.input);
		db.once('suggested', function(msg){
			//console.log(msg);
			res.send(msg);
		});
	}
	else{
		res.send("");
	}
});

app.post('/albumsuggest',function(req,res){
	if(req.session.usertype == 'member' || req.session.usertype == 'admin' || req.session.usertype == 'superadmin'){
		db.getalbumsuggestions(req.body.input, req.body.artist);
		db.once('suggested', function(msg){
			//console.log(msg);
			res.send(msg);
		});
	}
	else{
		res.send("");
	}
});

app.get('/account', function(req,res){
	var html = "<div id=\"content\" class=\"content\"><h3>My Account</h3><hr>"
	
	if(req.session.usertype == 'member'){
		html += "Account type: WKDU Member";
		html += "<br><a href='#' onclick=\"myplaylists()\">View my past playlists</a>";
		html += "<br><a href='#' onclick=\"gethistory()\">View my past submissions</a>";
	}
	if(req.session.usertype == 'pending'){
		html += "Account type: Pending. Please wait for an administrator to approve your account or contact WKDU for assistance.";
	}
	if(req.session.usertype == 'admin'){
		html += "Account type: Administrator";
		html += "<br><a href='#' onclick=\"viewusers()\">View pending user accounts</a>";
		html += "<br><a href='#' onclick=\"viewpending()\">View pending adds</a>";
		html += "<br><a href='#' onclick=\"makeaddschart()\">Create a new Top 5 Adds chart</a>";
		html += "<br><a href='#' onclick=\"maketop30chart()\">Create a new Top 30 Heavy Rotation chart</a>";
		html += "<br><a href='#' onclick=\"myplaylists()\">View my past playlists</a>";
		html += "<br><a href='#' onclick=\"gethistory()\">View my past submissions</a>";
	}
	if(req.session.usertype == 'superadmin'){
		html += "Account type: Superadmin";
		html += "<br><a href='#' onclick=\"viewusers()\">View pending user accounts</a>";
		html += "<br><a href='#' onclick=\"viewpending()\">View pending adds</a>";
		html += "<br><a href='#' onclick=\"makeaddschart()\">Create a new Top 5 Adds chart</a>";
		html += "<br><a href='#' onclick=\"maketop30chart()\">Create a new Top 30 Heavy Rotation chart</a>";
		html += "<br><a href='#' onclick=\"myplaylists()\">View my past playlists</a>";
		html += "<br><a href='#' onclick=\"gethistory()\">View my past submissions</a>";
	}
	if(req.session.usertype == 'submitter'){
		html += "Account type: Artist/Label/Promoter";
		html += "<br><a href='#' onclick=\"gethistory()\">View my past submissions</a>";
	}
	
	html+="</div>"
	res.send(html);
});

app.post('/submittop5', function(req,res){
	console.log(req.body);
	
	if(req.session.usertype == 'admin' || req.session.usertype == 'superadmin'){
		db.submittop5(req.body, req.session.userid);
		res.send("Chart submitted!");
	}
	else{
		res.send("you don't have permission to submit charts.");
	}
});

app.post('/submittop30', function(req,res){
	console.log(req.body);
	
	if(req.session.usertype == 'admin' || req.session.usertype == 'superadmin'){
		db.submittop30(req.body, req.session.userid);
		res.send("Chart submitted!");
	}
	else{
		res.send("you don't have permission to submit charts.");
	}
});

app.get('/addschart',function(req,res){
	db.getlatestadds();
	db.once('addschart',function(msg){
		var json = JSON.parse(msg);
		//console.log(json);
		
		var html = "<div id=\"content\" class=\"content\"><h2>Top 5 Adds This Week</h2><table id=\"table\" border=\"1\"><tr><th>#</th><th>Artist</th><th>Album</th><th>Label</th></tr>";
		for(var i = 1; i <= 5; i++){
			switch (i){
				case 1:
					var artist = json.artist1;
					var album = json.album1;
					var label = json.label1;
					break;
				case 2:
					var artist = json.artist2;
					var album = json.album2;
					var label = json.label2;
					break;
				case 3:
					var artist = json.artist3;
					var album = json.album3;
					var label = json.label3;
					break;
				case 4:
					var artist = json.artist4;
					var album = json.album4;
					var label = json.label4;
					break;
				case 5:
					var artist = json.artist5;
					var album = json.album5;
					var label = json.label5;
					break;
			}
			if (artist == ""){
				break;
			}
				html +="<tr><td>";
				html += i;
				html += "</td><td>";
				html += artist;
				html += "</td><td>";
				html += album;
				html += "</td><td>";
				html += label;
				html += "</td></tr>";
		}
		html += "</table></div>";
		
		res.send(html);
	});
})

app.get('/top30chart',function(req,res){
	db.getlatesttop30();
	db.once('top30chart',function(msg){
		var json = JSON.parse(msg);
		//console.log(json);
		
		var html = "<h2>Top 30 Heavy Rotation This Week</h2><table id=\"table\" border=\"1\"><tr><th>#</th><th>Artist</th><th>Album</th><th>Label</th></tr>";
		for(var i = 1; i <= 30; i++){
			switch (i){
				case 1:
					var artist = json.artist1;
					var album = json.album1;
					var label = json.label1;
					break;
				case 2:
					var artist = json.artist2;
					var album = json.album2;
					var label = json.label2;
					break;
				case 3:
					var artist = json.artist3;
					var album = json.album3;
					var label = json.label3;
					break;
				case 4:
					var artist = json.artist4;
					var album = json.album4;
					var label = json.label4;
					break;
				case 5:
					var artist = json.artist5;
					var album = json.album5;
					var label = json.label5;
					break;
				case 6:
					var artist = json.artist6;
					var album = json.album6;
					var label = json.label6;
					break;
				case 7:
					var artist = json.artist7;
					var album = json.album7;
					var label = json.label7;
					break;
				case 8:
					var artist = json.artist8;
					var album = json.album8;
					var label = json.label8;
					break;
				case 9:
					var artist = json.artist9;
					var album = json.album9;
					var label = json.label9;
					break;
				case 10:
					var artist = json.artist10;
					var album = json.album10;
					var label = json.label10;
					break;
				case 11:
					var artist = json.artist11;
					var album = json.album11;
					var label = json.label11;
					break;
				case 12:
					var artist = json.artist12;
					var album = json.album12;
					var label = json.label12;
					break;
				case 13:
					var artist = json.artist13;
					var album = json.album13;
					var label = json.label13;
					break;
				case 14:
					var artist = json.artist14;
					var album = json.album14;
					var label = json.label14;
					break;
				case 15:
					var artist = json.artist15;
					var album = json.album15;
					var label = json.label15;
					break;
				case 16:
					var artist = json.artist16;
					var album = json.album16;
					var label = json.label16;
					break;
				case 17:
					var artist = json.artist17;
					var album = json.album17;
					var label = json.label17;
					break;
				case 18:
					var artist = json.artist18;
					var album = json.album18;
					var label = json.label18;
					break;
				case 19:
					var artist = json.artist19;
					var album = json.album19;
					var label = json.label19;
					break;
				case 20:
					var artist = json.artist20;
					var album = json.album20;
					var label = json.label20;
					break;
								case 21:
					var artist = json.artist21;
					var album = json.album21;
					var label = json.label21;
					break;
				case 22:
					var artist = json.artist22;
					var album = json.album22;
					var label = json.label22;
					break;
				case 23:
					var artist = json.artist23;
					var album = json.album23;
					var label = json.label23;
					break;
				case 24:
					var artist = json.artist24;
					var album = json.album24;
					var label = json.label24;
					break;
				case 25:
					var artist = json.artist25;
					var album = json.album25;
					var label = json.label25;
					break;
				case 26:
					var artist = json.artist26;
					var album = json.album26;
					var label = json.label26;
					break;
				case 27:
					var artist = json.artist27;
					var album = json.album27;
					var label = json.label27;
					break;
				case 28:
					var artist = json.artist28;
					var album = json.album28;
					var label = json.label28;
					break;
				case 29:
					var artist = json.artist29;
					var album = json.album29;
					var label = json.label29;
					break;
				case 30:
					var artist = json.artist30;
					var album = json.album30;
					var label = json.label30;
					break;
			}
				if (artist == ""){
					break;
				}
				html +="<tr><td>";
				html += i;
				html += "</td><td>";
				html += artist;
				html += "</td><td>";
				html += album;
				html += "</td><td>";
				html += label;
				html += "</td></tr>";
		}
		html += "</table>";
		
		res.send(html);
	});
})

app.post('/submitplaylist',function(req,res){
	console.log(req.body);
	
	if(req.session.usertype == 'admin' || req.session.usertype == 'superadmin' || req.session.usertype == 'member'){
		db.submitplaylist(req.body, req.session.userid);
		res.send("Playlist submitted!");
	}
	else{
		res.send("you don't have permission to submit charts.");
	}
});

app.get('/getplaylists',function(req,res){
	db.getplaylists();
	
	db.once('playlists',function(msg){
		res.send(msg);
	});
});

app.get('/getdjplaylists',function(req,res){
	db.getdjplaylists(req.query.username);
	
	db.once('djplaylists',function(msg){
		res.send(msg);
	});
});

app.get('/myplaylists',function(req,res){
	db.getdjplaylists(req.session.userid);
	
	db.once('djplaylists',function(msg){
		res.send(msg);
	});
});

app.get('/getplaylist',function(req,res){
	db.getplaylist(req.query.id);
	
	db.once('playlist',function(msg){
		var json = JSON.parse(msg.playlist);
		var html = "<head><link rel = \"stylesheet\" type = \"text/css\" href = \"style.css\" /></head><body><h3>"+msg.username+"'s playlist on "+msg.date+"</h3><hr><table border=\"1\"><tr><th>Artist</th><th>Title</th><th>Album</th><th>New</th><th>Local</th></tr>";
		
		for (var i in json.artists){
			html+= "<tr><td>"+json.artists[i]+"</td><td>"+json.songs[i]+"</td><td>"+json.albums[i]+"</td><td>";
			
			if(json.new[i] == 'true'){
				html += "&#10004;</td><td>";
			}
			else{
				html += " </td><td>";
			}
			if(json.local[i] == 'true'){
				html += "&#10004;</td></tr>";
			}
			else{
				html += " </td></tr>";
			}
			
		}
		html += "</table></body>";
		res.send(html);
	});
});

app.listen(8080);