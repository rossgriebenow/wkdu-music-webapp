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

database.prototype.isincatalog=function(sql){
	console.log(sql);
	var self = this;
	
	con.query(sql, function(err,rows,fields){
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
	}
	);
};

database.prototype.getpermission=function(username){
	var str = 'SELECT type FROM users WHERE username=\''+username+'\'';
	var self = this;
		con.query(str,
	function(err, rows, fields){
		if(err){
			 console.log('Error getting user permissions');
			return 0;
		}
		else{
			console.log(rows[0].type);
			return rows[0];
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

module.exports = database;