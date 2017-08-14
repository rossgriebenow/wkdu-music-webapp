var EventEmitter = require('events').EventEmitter;
var utils = require('util');
var mysql = require('mysql');
var fs = require('fs');
//var dbinfo = JSON.parse(fs.readFileSync('./databaseinfo.js', 'utf8'));
var con = mysql.createConnection({
	host: 'localhost',
	user: 'ross',
	password: 'Lifehou$3',
	database: 'wkdudev1'
});


con.connect(function(err) {
	if (err) {
		console.log('Error connecting to database');
	}
	else {
		console.log('Database successfully connected');
	}
});

function database(){
	EventEmitter.call(this);
}

utils.inherits(database,EventEmitter);

database.prototype.add=function(sql){
	console.log(sql);
	
	con.query(sql);
};

database.prototype.vote=function(sql){
	console.log(sql);
	
	con.query(sql);
};

database.prototype.isincatalog=function(sql){
	console.log(sql);
	var self = this;
	
	con.query(sql, function(err,rows,fields){
		console.log("fields: "+fields);
		console.log("rows: "+rows);
		console.log(JSON.stringify(rows));
		//console.log(JSON.parse(JSON.stringify(rows[0]["count(*)"])));
		//console.log(rows[0]["count(*)"]);
		
		if(rows[0]["count(*)"] > 0){
			self.emit('isincatalog', true);
		}
		else{
			self.emit('isincatalog', false);
		}
	});	
}

database.prototype.search=function(sql){
	var self = this;

	con.query(sql,function(err,rows,fields){
			if(err){
				console.log(err);
			}
			else{
				var html = "<table id=\"table\" border=\"1\"><tr>";
				for(var i=0; i < fields.length; i++){
					html += "<th>";
					html += fields[i].name;
					html += "</th>";
				}
				html += "</tr>";
				
				for (var i = 0; i < rows.length; i++){
					html+="<tr>";
					html+="<td>"
					html+=rows[i].albumName;
					html+="</td>"
					html+="<td>"
					html+=rows[i].artistName;
					html+="</td>"
					html+="<td>"
					html+=rows[i].label;
					html+="</td>"
					html+="<td>"
					html+=rows[i].spinsAllTime;
					html+="</td>"
					html+="<td>"
					html+=rows[i].spinsWeek;
					html+="</td>"
					html+="<td>"
					html+=rows[i].submissionStatus;
					html+="</td>"
					html+="<td>"
					html+=rows[i].dateSubmitted;
					html+="</td>"
					html+="<td>"
					html+=rows[i].mediaType;
					html+="</td>"
					html += "</tr>"
				}
				html+="</table>";
			}
			//console.log(html);
			self.emit('found',html);
	});
};

database.prototype.searchcat=function(sql){
	var self = this;

	con.query(sql,function(err,rows,fields){
			if(err){
				console.log(err);
			}
			else{
				var html = "<table id=\"table\" border=\"1\"><tr>";
				for(var i=0; i < fields.length; i++){
					html += "<th>";
					html += fields[i].name;
					html += "</th>";
				}
				html += "</tr>";
				
				for (var i = 0; i < rows.length; i++){
					html+="<tr>";
					html+="<td>"
					html+=rows[i].albumName;
					html+="</td>"
					html+="<td>"
					html+=rows[i].artistName;
					html+="</td>"
					html+="<td>"
					html+=rows[i].label;
					html+="</td>"
					html+="<td>"
					html+=rows[i].dateAdded;
					html+="</td>"
					html+="<td>"
					html+=rows[i].mediaType;
					html+="</td>"
					html+="<td>"
					html+="<a href='http://localhost:8080/getfiles?address="+rows[i].fileAddress+"' target=\"_blank\" id=\""+rows[i].albumName+"\" value=\""+rows[i].fileAddress+"\">download</a>"
					html+="</td>"
					html += "</tr>"
				}
				html+="</table>";
			}
			//console.log(html);
			self.emit('found',html);
	});
};

database.prototype.adds=function(sql){
	var self = this;

	con.query(sql,function(err,rows,fields){
			if(err){
				console.log(err);
			}
			else{
				var html = "<table id=\"table\" border=\"1\"><tr>";
				for(var i=0; i < fields.length; i++){
					html += "<th>";
					html += fields[i].name;
					html += "</th>";
				}
				html += "</tr>";
				
				for (var i = 0; i < rows.length; i++){
					html+="<tr>";
					html+="<td>"
					html+=rows[i].albumName;
					html+="</td>"
					html+="<td>"
					html+=rows[i].artistName;
					html+="</td>"
					html+="<td>"
					html+=rows[i].label;
					html+="</td>"
					html+="<td>"
					html+=rows[i].spinsAllTime;
					html+="</td>"
					html+="<td>"
					html+=rows[i].spinsWeek;
					html+="</td>"
					html+="<td>"
					html+=rows[i].dateSubmitted;
					html+="</td>"
					html+="<td>"
					html+=rows[i].mediaType;
					html+="</td>"
					html += "</tr>"
				}
				html+="</table>";
			}
			//console.log(html);
			self.emit('found',html);
	});
};

database.prototype.pending=function(userid){
	var self = this;
	var query = "select albumName, artistName, label, fileAddress, albumID from catalog where not exists(select null from votes where catalog.albumID=votes.albumID and votes.username='"+userid+"') and mediaType='Digital' and submissionStatus='Pending' and dateSubmitted > DATE_SUB(curdate(), INTERVAL 2 WEEK);";
	//console.log(query);
	con.query(query,function(err, rows, fields){
		if(err){
			console.log(err);
			var html = "<div id=\"content\" class=\"content\">"
			html += err;
			html += "</div>"
			self.emit('found',hmtl);
		}
		else{
			var html = "<div id=\"content\" class=\"content\"><table id=\"table\" border=\"1\"><tr>";
			for(var i=0; i < fields.length-1; i++){
				html += "<th>";
				html += fields[i].name;
				html += "</th>";
			}
			html += "<th>vote</th>";
			html += "</tr>";
			for (var i = 0; i < rows.length; i++){
				html+="<tr id='"+rows[i].albumID+"' class='rows'>";
				html+="<td>"
				html+=rows[i].albumName;
				html+="</td>"
				html+="<td>"
				html+=rows[i].artistName;
				html+="</td>"
				html+="<td>"
				html+=rows[i].label;
				html+="</td>"
				html+="<td>"
				html+="<a href='http://localhost:8080/getfiles?address="+rows[i].fileAddress+"' target=\"_blank\" id=\""+rows[i].albumName+"\" value=\""+rows[i].fileAddress+"\">download</a>"
				html+="</td>"
				html+="<td><a href='http://localhost:8080/vote?album="+rows[i].albumID+"&vote=like' class=\"vote\" target=\"_blank\">like</a> <a href='http://localhost:8080/vote?album="+rows[i].albumID+"&vote=dislike' class=\"vote\" target=\"_blank\">dislike</a></td>"
				html += "</tr>"
				}
			html+="</table></div>";
			
			self.emit('found',html);
		}
	});
};

database.prototype.login=function(username,password){
	var str = 'SELECT * FROM users WHERE username=\''+username+'\' AND password=PASSWORD(\''+ password+'\')';
	var self = this;
	con.query(str,
	function(err, rows, fields){
		if(err){
			 console.log('Error');
			return 0;
		}
		else{
		if(rows.length>0)
			self.emit('loggedin',1);
		else
			self.emit('loggedin',0);
		}
	});
};

database.prototype.getpermission=function(username){
	var str = 'SELECT type FROM users WHERE username=\''+username+'\'';
	var self = this;
		con.query(str,
	function(err, rows, fields){
		if(err){
			 console.log('Error getting user permissions');
			//return 0;
			self.emit('permission',"pending");
		}
		else{
			//console.log(rows[0].type);
			//return rows[0];
			self.emit('permission',rows[0].type);
		}
	}
	);
}

database.prototype.getUserTable=function(){
var str = 'SELECT username, type FROM users order by username';
var self = this;
con.query(str,
	function(err, rows, fields){
		if(err){
			console.log('Error');
			return 0;
		}
			else{
				self.emit('usertable',rows);
			}
		}
	);
};

database.prototype.register=function(first,last,email,username,password){
	var query = "select * from users where (firstname="+con.escape(first)+"and lastname="+con.escape(last)+") or username="+con.escape(username)+"or email="+con.escape(email)+";";
	var self = this;
	console.log(query);
	
	con.query(query,function(err,rows,fields){
		if(err){
			console.log(err);
		}
		else{
			if(rows.length>0){
				self.emit('valid',false);
			}
			else{
				self.emit('valid', true);
				adduser(first,last,email,username,password);

			}
		}
	});
};

database.prototype.getartistsuggestions=function(input){
	var self = this;
	var query = "select artistName from catalog where artistName like '"+input+"%' limit 10;";
	con.query(query, function(err,rows,fields){
		self.emit('suggested',rows);
	});
}

database.prototype.getalbumsuggestions=function(input, artist){
	var self = this;
	var query = "select albumName, label from catalog where ";
	
	if(input!=""){
		query += "albumName like '"+input+"%'";
		if(artist!=""){
			query+=" and"
		}
	}
	
	if(artist!=""){
		query += " artistName='"+artist+"'";
	}
	
	query += " limit 10;";
	con.query(query, function(err,rows,fields){
		self.emit('suggested',rows);
	});
}

database.prototype.submittop5=function(json, user){
	json_ = JSON.stringify(json);
	var query = "insert into charts (creatorid, date, type, playlist) values ( (select userid from users where username='"+user+"'), now(), 'adds', '"+json_+"');";
	
	con.query(query);
}

database.prototype.submitplaylist=function(json, user){
	var json_ = JSON.stringify(json);
	
	for(var i in json_.artists){
		var query = "update catalog set spinsAllTIme = spinsAllTime + 1, spinsWeek = spinsWeek + 1 where artistName='"+json_.artists[i]+"' AND albumName = '"+json_.albums[i]+"';";
		con.query(query);
	}
	
	var query = "insert into playlists (creatorid, date, playlist) values ( (select userid from users where username ='"+user+"'), now(), '"+json_+"');";
	con.query(query);
}

database.prototype.submittop30=function(json, user){
	json_ = JSON.stringify(json);
	var query = "insert into charts (creatorid, date, type, playlist) values ( (select userid from users where username='"+user+"'), now(), 'top30', '"+json_+"');";
	
	con.query(query);
	
}

database.prototype.getlatestadds=function(){
	var query = "select playlist, MAX(date) AS current_chart from charts where type='adds';";
	var self = this;
	con.query(query, function(err, rows, fields){
		if(err){
			console.log(err);
		}
		else{
			//console.log(rows[0].playlist);
			self.emit('addschart',rows[0].playlist);
		}
	});
}

database.prototype.getlatesttop30=function(){
	var query = "select playlist, MAX(date) AS current_chart from charts where type='top30';";
	var self = this;
	con.query(query, function(err, rows, fields){
		if(err){
			console.log(err);
		}
		else{
			//console.log(rows[0].playlist);
			self.emit('top30chart',rows[0].playlist);
		}
	});
}

database.prototype.getplaylists=function(){
	var self = this;
	var html = "<div id=\"content\" class=\"content\"><h3>Playlists</h3><hr><input type=\"text\" id=\"djname\" placeholder=\"Search by username\" value=\"\"><input type=\"submit\" id=\"viewdjplaylist\" value=\"Search\"><br>";
	//var query = "select * from playlists order by date desc limit 20;"
	var query = "select DATE_FORMAT(playlists.date,\"%a %M %D\") as date, playlists.chartid, users.username from playlists, users where playlists.creatorid=users.userid order by playlists.date desc limit 20;"
	con.query(query, function(err,rows,fields){
		if(err){
			console.log(err);
		}
		else{
			for (var i in rows){
				html+="<a target=\"_blank\" href=\"getplaylist?id="
				html+=rows[i].chartid;
				html+="\">";
				html+= rows[i].username;
				html+= " on "
				html+= rows[i].date;
				html+="</a><br>";
			}
			html += "</div>"
			
			self.emit('playlists',html);
		}
	});
}

database.prototype.getplaylist=function(id){
	var self = this;
	var query = "select DATE_FORMAT(playlists.date,\"%a %M %D\") as date, playlists.playlist, users.username from playlists, users where playlists.creatorid=users.userid and playlists.chartid="+id+";";
	
	con.query(query, function(err,rows,fields){
		if(err){
			console.log(err);
		}
		else{
			self.emit('playlist',rows[0]);
		}
	});


}

database.prototype.getdjplaylists=function(username){
	var self = this;
	var html = "<div id=\"content\" class=\"content\"><h3>Playlists</h3><hr>";
	var query = "select DATE_FORMAT(playlists.date,\"%a %M %D\") as date, playlists.chartid, users.username from playlists, users where playlists.creatorid=users.userid and users.username='"+username+"' order by playlists.date desc;"
	con.query(query, function(err,rows,fields){
		if(err){
			console.log(err);
		}
		else{
			for (var i in rows){
				html+="<a target=\"_blank\" href=\"getplaylist?id="
				html+=rows[i].chartid;
				html+="\">";
				html+= rows[i].username;
				html+= " on "
				html+= rows[i].date;
				html+="</a><br>";
			}
			html += "</div>"
			
			self.emit('djplaylists',html);
		}
	});
}

function adduser(first,last,email,username,password){
	var query = "insert into users (username, password, type, firstname, lastname, email) values (+"+con.escape(username)+", PASSWORD("+con.escape(password)+"), 'pending', "+con.escape(first)+", "+con.escape(last)+", "+con.escape(email)+");";
	console.log(query);
	con.query(query);
};



module.exports = database;