	function getmsg(){
			$.ajax({
				type: "GET",
				url: "http://localhost:8080/getmsg",
				contentType: "application/json; charset=utf-8",
				data: {},
				dataType: "html",
				
				//fill div with response on success
				success: function(msg){
					if(msg.length!=""){
						alert(msg);
					}
				},
				
				error: function(xhr, ajaxOptions, thrownError){
					alert(thrownError);
				}
			});
	}
	
	function register(){
		var string = "<div class=\"content\" id=\"content\"><h2>Register</h2><hr><form action=\"javascript:void(0);\">please fill in all fields:<br><input type='text' name='firstname' placeholder='first name'><br><input type='text' name='lastname' placeholder='last name'><br><input type='text' name='email' placeholder='email address'><br><input type='text' name='username' placeholder='username'><br><input type='password' name='password' placeholder='password'><br><fieldset style='width:300px'><legend>User Type:</legend><input type='radio' name='type' value='submitter'>Artist/Label/Radio Promoter<br><input type='radio' name='type' value='member'>WKDU Member</fieldset><input type='submit' value='Request Account' onclick='registration()'></form></div>";
		var html = $.parseHTML(string);
		$("#content").replaceWith(html);
	}
	
	function registration(){
		//alert("Thank you! Your account has been created, an administrator will review it as soon as possible.")
		var data=$('form').serializeArray();
			
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			var validemail = regex.test(data[4].value);
			var notblank=true;
			
			for(var i = 2; i<data.length; i++){
				if(data[i].value.length==0){
					notblank = false;
				}
			}
			
			if(!validemail){
				alert("Please enter a valid email address.");
			}
			else if(!notblank){
				alert("All fields must be filled.");
			}
			else{
				var first = data[2].value;
				var last = data[3].value;
				var email = data[4].value;
				var username = data[5].value;
				var password = data[6].value;
				var type = data[7].value;
				
				var json = {"first":first, "last":last, "email":email, "username":username, "password": password, "type":type};
				
				$.ajax({
					type: "POST",
					url: "http://localhost:8080/register",
					//contentType: "application/json; charset=utf-8",
					data: json,
					//datatype: "html",
					
					success: function(msg){
						if(msg=="false"){
							alert("An account with the information you entered already exists. Please contact musicdirector@wkdu.org for assistance.");
						}
						else{
							alert("Thank you for registering! An administrator will validate your account as soon as possible.");
							window.location.reload();
						}
					},
					error: function(xhr, ajaxOptions, thrownError){
						alert(thrownError);
					}
				});
			}
	}
 
	function loadindex(){
		document.getElementById("viewcatalog").addEventListener("click", getqueries);
		document.getElementById("submit").addEventListener("click", getsubmitter);
		document.getElementById("viewsub").addEventListener("click", submissionbrowser);
		document.getElementById("makeplaylist").addEventListener("click", makeplaylist);
		document.getElementById("contact").addEventListener("click", contact);
		document.getElementById("viewplaylists").addEventListener("click",viewplaylist);
	
	
		var url = "http://localhost:8080/loadindex";
		
				$.ajax({
				type: "GET",
				url: url,
				contentType: "application/json; charset=utf-8",
				data: {},
				dataType: "html",
				
				//fill div with response on success
				success: function(msg){
					var html = $.parseHTML(msg);
					$("#login").replaceWith(html);
					//document.getElementById("login").innerHTML = html;
				},
				
				error: function(xhr, ajaxOptions, thrownError){
					alert(thrownError);
					document.getElementById("login").innerHTML = "login request failed"
				}
			});
			
		url = "http://localhost:8080/addschart";
		
			$.ajax({
				type:"GET",
				url: url,
				contentType: "application/json; charset=utf-8",
				data: {},
				dataType: "html",
				
				success: function(msg){
					var html = $.parseHTML(msg);
					$("#content").replaceWith(html);
				},
				error: function(xhr, ajaxOptions, thrownError){
					alert(thrownError);
				}
			});
			
		url = "http://localhost:8080/top30chart";
		
			$.ajax({
				type:"GET",
				url: url,
				contentType: "application/json; charset=utf-8",
				data: {},
				dataType: "html",
				
				success: function(msg){
					var html = $.parseHTML(msg);
					$("#content").append(html);
				},
				error: function(xhr, ajaxOptions, thrownError){
					alert(thrownError);
				}
			});
	}
	
	function logout(){
		var url = "http://localhost:8080/logout"
			$.ajax({
				type: "GET",
				url: url,
				contentType: "application/json; charset=utf-8",
				data: {},
				dataType: "html",
				
				//fill div with response on success
				success: function(msg){
					loadindex()
				},
				
				error: function(xhr, ajaxOptions, thrownError){
					alert(thrownError);
					document.getElementById("login").innerHTML = "logout request failed"
				}
			});
	}
	
	function getqueries(){
		var url = "http://localhost:8080/catalog"
		$.ajax({
			type: "GET",
			url: url,
			contentType: "application/json; charset=utf-8",
			data: {},
			datatype: "html",
			
			success: function(msg){
				document.getElementById("content").innerHTML = msg;
				if(msg.includes("history")){
					document.getElementById("history").addEventListener("click", gethistory);
				}
				if(msg.includes("newadds")){
					document.getElementById("newadds").addEventListener("click", getadds);
				}
				if(msg.includes("shelves")){
					document.getElementById("shelves").addEventListener("click", getshelves);
				}
				if(msg.includes("search")){
					document.getElementById("search").addEventListener("click", userquery);
				}
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
		
	}
	
	function getshelves(){
		var url = "http://localhost:8080/shelves";
		
		$.ajax({
			type: "GET",
			url: url,
			contentType: "application/json; charset=utf-8",
			data: {},
			datatype: "html",
			
			success: function(msg){
				document.getElementById("content").innerHTML = msg;
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
	
	function userquery(){
		var str ="<div id=\"content\" class=\"content\"><form action=\"javascript:void(0);\">leave fields blank to omit from search:<br><input type=\'text\' name=\'artist\' id=\'artistq\' placeholder=\'artist\'><br><input type=\'text\' name=\'album\' id=\'albumq\' placeholder=\'album\'><br><input type=\'text\' name=\'label\' id=\'labelq\' placeholder=\'label\'><br><input type=\'text\' name=\'year\' id=\'yearq\' placeholder=\'year\'><br><input type=\"submit\" value=\"Search\" onclick=\"makeuserquery()\"></form><div id=\"response\"></div></div>"
		var html = $.parseHTML(str);
		$("#content").replaceWith(html);
	}
	
	function removeonclick(table, ids, i){
		var row = ids[Math.floor(i/2)].id;
		table[i].addEventListener("click",function(){
			$("#"+row).remove();
		},false);
	}
	
	function submissionbrowser(){
		$.ajax({
			type: "GET",
			url: "http://localhost:8080/submissionbrowser",
			contentType: "application/json; charset=utf-8",
			data: {},
			datatype: "html",
			
			success: function(msg){
				var html = $.parseHTML(msg);
				$.when( $("#content").replaceWith(html) ).then(function(){
					var table = document.getElementsByClassName("vote");
					var ids = document.getElementsByClassName("rows");
						for(var i = 0; i < table.length; i++){
							removeonclick(table, ids, i);
						}					
				});
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
		
	function makeuserquery(){
		var artist = document.getElementById("artistq").value;
		var album = document.getElementById("albumq").value;
		var label = document.getElementById("labelq").value;
		var year = document.getElementById("yearq").value;
		
		//alert(artist+" "+album+" "+label+" "+year);
		var json = {"artist" : artist,"album" : album,"label" : label, "year" : year};
		$.ajax({
			type: "GET",
			url: "http://localhost:8080/search",
			contentType: "application/json; charset=utf-8",
			data: json,
			datatype: "html",
			
			success: function(msg){
				document.getElementById("response").innerHTML = msg;
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
	
	function getsubmitter(){
		var url = "http://localhost:8080/submitter";
		$.ajax({
			type: "GET",
			url: url,
			contentType: "application/json; charset=utf-8",
			data: {},
			datatype: "html",
			
			success: function(msg){
				document.getElementById("content").innerHTML = msg;
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
	
	function gethistory(){

		var url = "http://localhost:8080/history"
		
		$.ajax({
			type: "GET",
			url: url,
			contentType: "application/json; charset=utf-8",
			data: {},
			datatype: "html",
			
			success: function(msg){
				document.getElementById("content").innerHTML = msg;
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
	
	function getadds(){
		var url = "http://localhost:8080/adds"
		
		$.ajax({
			type: "GET",
			url: url,
			contentType: "application/json; charset=utf-8",
			data: {},
			datatype: "html",
			
			success: function(msg){
				document.getElementById("content").innerHTML = msg;
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
	
	function addToCatalog() {
		var formFilled = true;
		//use jQuery to make sure fields are filled out
		$(":text").each(function() {
			if($(this).val() == "" && $(this).attr('id') != 'riyl' && $(this).attr('id') != 'etc')
				formFilled = false;
		});
		
		if (formFilled) {
			if(document.getElementById("mediaType").value == 'Digital'){
				document.getElementById("subform").submit();
			}
			else{
				//generate URL from form
				var URL = "http://localhost:8080/add?";
				//URL = URL + "user=" + document.getElementById("user").value;
				
				var d = new Date();
				URL = URL + "&submitDate=";
				URL = URL + d.getFullYear() + "-";
				//we might have to add leading zeroes to month and day. that's annoying.
				var month = d.getMonth() + 1;
				var monthstr;
				if (month < 10) {
					monthstr = "0" + month.toString();
				}
				else {
					monthstr = month.toString();
				}
				
				URL = URL + monthstr + "-";
				
				var day = d.getDate();
				var daystr;
				if (day < 10) {
					daystr = "0" + day.toString();
				}
				else {
					daystr = day.toString();
				}
				
				URL = URL + daystr;
				
				URL = URL + "&album=" + document.getElementById("album").value;
				URL = URL + "&artist=" + document.getElementById("artist").value;
				URL = URL + "&label=" + document.getElementById("label").value;
				URL = URL + "&mediaType=" + document.getElementById("mediaType").value;
				
				//alert(URL);
				$.ajax({
					type: "GET",
					url: URL,
					success: function(msg) {
						alert(String(msg));
					},
					error: function(jgXHR, textStatus, errorThrown) {
						alert(URL + " not working");
					}
				});
			}
		}
		else {
			alert("One or more form elements not filled out.");
		}	
	}
	
		// add a row to playlist form
	function addRow() {
		var pt = document.getElementById("playlist");
		var index = document.getElementsByClassName("line").length;
		var str = "<p class=\"line\"><input type=\"text\" class=\"artist\" value=\"\" placeholder=\"Artist\" list=\"artistsuggest"+index+"\" oninput=\"suggestartist(this)\"><input type=\"text\" class=\"song\" value=\"\" placeholder=\"Title\"><input type=\"text\" class=\"album\" value=\"\" placeholder=\"Album\" list=\"albumsuggest"+index+"\" oninput=\"suggestalbum(this)\"><input type=\"text\" class=\"label\" value=\"\" placeholder=\"Label\"> New:<input type=\"checkbox\" class=\"new\" value=\"New\" name=\"New\"> Local:<input type=\"checkbox\" class=\"local\" value=\"Local\" name=\"Local\"><button onclick=\"deleteRow(this)\">Delete row</button><datalist class=\"artistsuggest\" id=\"artistsuggest"+index+"\"></datalist><datalist class=\"albumsuggest\"id=\"albumsuggest"+index+"\"></datalist></p>"
		var html = $.parseHTML(str);
		//alert("about to add row")
		$("#playlist").append(html);
		//alert("added row")
		return false;
	}

	// delete a row from playlist form
	function deleteRow(row) {
		/*
		var i = row.parentNode.rowIndex;
		document.getElementById("playlistTable").deleteRow(i);
		*/
		
		var p = row.parentNode;
		p.innerHTML = '';
	}

	// get JSON representation of playlist
	function submitplaylist() {
	
		var artists = document.getElementsByClassName("artist");
		var songs = document.getElementsByClassName("song");
		var albums = document.getElementsByClassName("album");
		var labels = document.getElementsByClassName("label");
		var newmusic = document.getElementsByClassName("new");
		var localmusic = document.getElementsByClassName("local");
		var out = document.getElementById("out");
		var length = artists.length;
		
		var d = new Date();
		var j = {
			"artists":[],
			"songs":[],
			"albums":[],
			"labels":[],
			"new":[],
			"local":[]
		}
		
		for (var i = 0; i < length; i++) {
			j.artists[i] = artists[i].value;
			j.songs[i] = songs[i].value;
			j.albums[i] = albums[i].value;
			j.labels[i] = labels[i].value;
			j.new[i] = newmusic[i].checked;
			j.local[i] = localmusic[i].checked;
		}
		
		var url =  "http://localhost:8080/submitplaylist";
		
		$.ajax({
			type: "POST",
			url: url,
			//contentType: "application/json; charset=utf-8",
			data: j,
			//datatype: "html",
			
			success: function(msg){
				alert(msg);
				$("#p").remove();
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
		
	}
 
	function makeplaylist() {
		var url = "http://localhost:8080/makeplaylist"
		$.ajax({
			type: "GET",
			url: url,
			contentType: "application/json; charset=utf-8",
			data: {},
			datatype: "html",
			
			success: function(msg){
					var html = $.parseHTML(msg);
					$("#content").replaceWith(html);					
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
	
	function suggestartist(input) {	
		var json = {"input":input.value};
		$.ajax({
			type: "POST",
			url: "http://localhost:8080/artistsuggest",
			//contentType: "application/json; charset=utf-8",
			data: json,
			datatype: "json",
			
			success: function(msg){
				var list = input.parentNode.getElementsByClassName("artistsuggest")[0];
				
				while(list.firstChild){
					list.removeChild(list.firstChild);
				}

				if(msg.length>0){
					
					for(var i = 0; i < msg.length; i++){
						var option = document.createElement('option');
						option.value=msg[i].artistName;
						list.appendChild(option);
					}
				}
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
	
	function suggestalbum(input) {
		var artist = input.parentNode.getElementsByClassName("artist")[0].value;
		var json = {"input":input.value, "artist":artist};
		$.ajax({
			type: "POST",
			url: "http://localhost:8080/albumsuggest",
			//contentType: "application/json; charset=utf-8",
			data: json,
			datatype: "json",
			
			success: function(msg){
				var list = input.parentNode.getElementsByClassName("albumsuggest")[0];
				while(list.firstChild){
					list.removeChild(list.firstChild);
				}
				
				if(msg.length>0){
					for(var i = 0; i < msg.length; i++){
						var option = document.createElement('option');
						option.value=msg[i].albumName;
						list.appendChild(option);
						
						if(input.value == msg[i].albumName){
							input.parentNode.getElementsByClassName("label")[0].value = msg[i].label;
						}
					}
				}
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});	
	}
	
	function account(){
		var url = "http://localhost:8080/account"
		
				$.ajax({
				type: "GET",
				url: url,
				contentType: "application/json; charset=utf-8",
				data: {},
				dataType: "html",
				
				//fill div with response on success
				success: function(msg){
					var html = $.parseHTML(msg);
					$("#content").replaceWith(html);
				},
				
				error: function(xhr, ajaxOptions, thrownError){
					alert(thrownError);
					document.getElementById("login").innerHTML = "request failed"
				}
			});
	}
 
	function contact(){
		var string = "<div class=\"content\" id=\"content\"><h3>Contact</h3><hr>email (preferable): <a href=\"mailto:musicdirector@wkdu.org\">musicdirector@wkdu.org<a><br>phone: (215)895-2082<br>Or go to <a href=\"http://wkdu.org/contact\">wkdu.org/contact</a></div>"
		var html = $.parseHTML(string);
		$("#content").replaceWith(html);
	}
 
	function makeaddschart(){
		var string = "<div id=\"top5\"><form><h3>Top 5 Adds</h3><hr><p class=\"line\">#1: <input type=\"text\" name=\"artist1\" id=\"artist1\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest1\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album1\" id=\"album1\" placeholder=\"Album\" class=\"album\" list=\"albumsuggest1\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label1\" id=\"label1\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest1\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest1\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#2: <input type=\"text\" name=\"artist2\" id=\"artist2\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest2\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album2\" id=\"album2\" placeholder=\"Album\" class=\"album\" list=\"albumsuggest2\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label2\" id=\"label2\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest2\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest2\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#3: <input type=\"text\" name=\"artist3\" id=\"artist3\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest3\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album3\" id=\"album3\" placeholder=\"Album\" class=\"album\" list=\"albumsuggest3\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label3\" id=\"label3\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest3\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest3\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#4: <input type=\"text\" name=\"artist4\" id=\"artist4\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest4\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album4\" id=\"album4\" placeholder=\"Album\" class=\"album\" list=\"albumsuggest4\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label4\" id=\"label4\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest4\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest4\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#5: <input type=\"text\" name=\"artist5\" id=\"artist5\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest5\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album5\" id=\"album5\" placeholder=\"Album\" class=\"album\" list=\"albumsuggest5\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label5\" id=\"label5\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest5\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest5\" class=\"albumsuggest\"></datalist></p><input type=\"button\" name=\"submit\" value=\"Submit Chart\" onclick=\"submittop5()\"></form></div>";
		var html = $.parseHTML(string);
		if($("#top30").length > 0){
			$("#top30").remove();
		}
		$("#content").append(html);
	}
	
	function maketop30chart(){
		var string = "<div id=\"top30\"><form><h3>Top 30 Heavy Rotation</h3><hr><p class=\"line\">#1: <input type=\"text\" name=\"artist1\" id=\"artist1\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest1\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album1\" id=\"album1\" placeholder=\"Album\" class=\"album\" list=\"album1\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label1\" id=\"label1\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest1\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest1\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#2: <input type=\"text\" name=\"artist2\" id=\"artist2\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest2\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album2\" id=\"album2\" placeholder=\"Album\" class=\"album\" list=\"album2\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label2\" id=\"label2\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest2\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest2\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#3: <input type=\"text\" name=\"artist3\" id=\"artist3\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest3\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album3\" id=\"album3\" placeholder=\"Album\" class=\"album\" list=\"album3\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label3\" id=\"label3\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest3\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest3\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#4: <input type=\"text\" name=\"artist4\" id=\"artist4\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest4\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album4\" id=\"album4\" placeholder=\"Album\" class=\"album\" list=\"album4\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label4\" id=\"label4\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest4\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest4\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#5: <input type=\"text\" name=\"artist5\" id=\"artist5\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest5\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album5\" id=\"album5\" placeholder=\"Album\" class=\"album\" list=\"album5\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label5\" id=\"label5\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest5\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest5\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#6: <input type=\"text\" name=\"artist6\" id=\"artist6\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest6\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album6\" id=\"album6\" placeholder=\"Album\" class=\"album\" list=\"album6\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label6\" id=\"label6\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest6\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest6\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#7: <input type=\"text\" name=\"artist7\" id=\"artist7\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest7\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album7\" id=\"album7\" placeholder=\"Album\" class=\"album\" list=\"album7\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label7\" id=\"label7\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest7\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest7\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#8: <input type=\"text\" name=\"artist8\" id=\"artist8\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest8\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album8\" id=\"album8\" placeholder=\"Album\" class=\"album\" list=\"album8\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label8\" id=\"label8\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest8\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest8\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#9: <input type=\"text\" name=\"artist9\" id=\"artist9\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest9\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album9\" id=\"album9\" placeholder=\"Album\" class=\"album\" list=\"album9\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label9\" id=\"label9\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest9\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest9\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#10: <input type=\"text\" name=\"artist10\" id=\"artist10\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest10\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album10\" id=\"album10\" placeholder=\"Album\" class=\"album\" list=\"album10\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label10\" id=\"label10\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest10\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest10\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#11: <input type=\"text\" name=\"artist11\" id=\"artist11\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest11\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album11\" id=\"album11\" placeholder=\"Album\" class=\"album\" list=\"album11\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label11\" id=\"label11\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest11\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest11\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#12: <input type=\"text\" name=\"artist12\" id=\"artist12\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest12\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album12\" id=\"album12\" placeholder=\"Album\" class=\"album\" list=\"album12\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label12\" id=\"label12\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest12\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest12\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#13: <input type=\"text\" name=\"artist13\" id=\"artist13\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest13\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album13\" id=\"album13\" placeholder=\"Album\" class=\"album\" list=\"album13\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label13\" id=\"label13\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest13\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest13\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#14: <input type=\"text\" name=\"artist14\" id=\"artist14\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest14\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album14\" id=\"album14\" placeholder=\"Album\" class=\"album\" list=\"album14\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label14\" id=\"label14\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest14\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest14\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#15: <input type=\"text\" name=\"artist15\" id=\"artist15\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest15\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album15\" id=\"album15\" placeholder=\"Album\" class=\"album\" list=\"album15\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label15\" id=\"label15\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest15\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest15\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#16: <input type=\"text\" name=\"artist16\" id=\"artist16\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest16\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album16\" id=\"album16\" placeholder=\"Album\" class=\"album\" list=\"album16\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label16\" id=\"label16\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest16\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest16\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#17: <input type=\"text\" name=\"artist17\" id=\"artist17\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest17\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album17\" id=\"album17\" placeholder=\"Album\" class=\"album\" list=\"album17\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label17\" id=\"label17\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest17\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest17\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#18: <input type=\"text\" name=\"artist18\" id=\"artist18\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest18\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album18\" id=\"album18\" placeholder=\"Album\" class=\"album\" list=\"album18\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label18\" id=\"label18\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest18\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest18\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#19: <input type=\"text\" name=\"artist19\" id=\"artist19\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest19\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album19\" id=\"album19\" placeholder=\"Album\" class=\"album\" list=\"album19\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label19\" id=\"label19\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest19\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest19\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#20: <input type=\"text\" name=\"artist20\" id=\"artist20\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest20\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album20\" id=\"album20\" placeholder=\"Album\" class=\"album\" list=\"album20\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label20\" id=\"label20\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest20\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest20\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#21: <input type=\"text\" name=\"artist21\" id=\"artist21\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest21\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album21\" id=\"album21\" placeholder=\"Album\" class=\"album\" list=\"album21\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label21\" id=\"label21\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest21\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest21\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#22: <input type=\"text\" name=\"artist22\" id=\"artist22\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest22\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album22\" id=\"album22\" placeholder=\"Album\" class=\"album\" list=\"album22\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label22\" id=\"label22\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest22\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest22\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#23: <input type=\"text\" name=\"artist23\" id=\"artist23\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest23\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album23\" id=\"album23\" placeholder=\"Album\" class=\"album\" list=\"album23\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label23\" id=\"label23\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest23\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest23\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#24: <input type=\"text\" name=\"artist24\" id=\"artist24\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest24\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album24\" id=\"album24\" placeholder=\"Album\" class=\"album\" list=\"album24\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label24\" id=\"label24\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest24\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest24\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#25: <input type=\"text\" name=\"artist25\" id=\"artist25\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest25\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album25\" id=\"album25\" placeholder=\"Album\" class=\"album\" list=\"album25\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label25\" id=\"label25\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest25\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest25\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#26: <input type=\"text\" name=\"artist26\" id=\"artist26\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest26\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album26\" id=\"album26\" placeholder=\"Album\" class=\"album\" list=\"album26\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label26\" id=\"label26\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest26\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest26\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#27: <input type=\"text\" name=\"artist27\" id=\"artist27\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest27\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album27\" id=\"album27\" placeholder=\"Album\" class=\"album\" list=\"album27\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label27\" id=\"label27\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest27\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest27\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#28: <input type=\"text\" name=\"artist28\" id=\"artist28\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest28\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album28\" id=\"album28\" placeholder=\"Album\" class=\"album\" list=\"album28\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label28\" id=\"label28\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest28\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest28\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#29: <input type=\"text\" name=\"artist29\" id=\"artist29\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest29\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album29\" id=\"album29\" placeholder=\"Album\" class=\"album\" list=\"album29\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label29\" id=\"label29\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest29\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest29\" class=\"albumsuggest\"></datalist></p><p class=\"line\">#30: <input type=\"text\" name=\"artist30\" id=\"artist30\" placeholder=\"Artist\" class=\"artist\" list=\"artistsuggest30\" oninput=\"suggestartist(this)\"><input type=\"text\" name=\"album30\" id=\"album30\" placeholder=\"Album\" class=\"album\" list=\"album30\" oninput=\"suggestalbum(this)\"><input type=\"text\" name=\"label30\" id=\"label30\" placeholder=\"Label\" class=\"label\"><datalist id=\"artistsuggest30\" class=\"artistsuggest\"></datalist><datalist id=\"albumsuggest30\" class=\"albumsuggest\"></datalist></p><input type=\"button\" name=\"submit\" value=\"Submit Chart\" onclick=\"submittop30()\"></form></div>"
		if($("#top5").length > 0){
			$("#top5").remove();
		}
		var html = $.parseHTML(string);
		$("#content").append(html);
	}
	
	function submittop5(){
		/*var j = {
		"artists":[],
		"albums":[],
		"labels":[]
		};*/
		
		var data = $('form').serializeArray();
		
		/*for(var i = 1; i <=5; i++){
			var artisti= "artist"+i;
			var albumi= "album"+i;
			var labeli= "label"+i;
			
			j.artists[i-1]= document.getElementById(artisti).value;
			j.albums[i-1]= document.getElementById(albumi).value;
			j.labels[i-1]= document.getElementById(labeli).value;
		}*/
		
		var url = "http://localhost:8080/submittop5";
		var string = JSON.stringify(data);
		
		
		
		$.ajax({
			type: "POST",
			url: url,
			//contentType: "application/json; charset=utf-8",
			data: data,
			//datatype: "html",
			
			success: function(msg){
				alert(msg);
				$("#top5").remove();
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
	
	function submittop30(){
		/*var j = {
		"artists":[],
		"albums":[],
		"labels":[]
		};
		
		for(var i = 1; i <=30; i++){
			var artisti= "artist"+i;
			var albumi= "album"+i;
			var labeli= "label"+i;
			
			j.artists[i-1]= document.getElementById(artisti).value;
			j.albums[i-1]= document.getElementById(albumi).value;
			j.labels[i-1]= document.getElementById(labeli).value;
		}*/
		
		var data = $('form').serializeArray();
		var string = JSON.stringify(data);
		
		var url = "http://localhost:8080/submittop30";
		
		$.ajax({
			type: "POST",
			url: url,
			//contentType: "application/json; charset=utf-8",
			data: data,
			//datatype: "html",
			
			success: function(msg){
				alert(msg);
				$("#top30").remove();
			},
			error: function(xhr, ajaxOptions, thrownError){
				alert(thrownError);
			}
		});
	}
	
 
	function viewplaylist(){
		var url = "http://localhost:8080/getplaylists";
		
			$.ajax({
				type: "GET",
				url: url,
				contentType: "application/json; charset=utf-8",
				data: {},
				dataType: "html",
				
				//fill div with response on success
				success: function(msg){
					var html = $.parseHTML(msg);
					$("#content").replaceWith(html);
					document.getElementById("viewdjplaylist").addEventListener("click",viewdjplaylist);
					
				},
				
				error: function(xhr, ajaxOptions, thrownError){
					alert(thrownError);
					document.getElementById("content").innerHTML = "playlist request failed"
				}
			});
	}
 
	function viewdjplaylist(){
			var url = "http://localhost:8080/getdjplaylists";
			var username = document.getElementById("djname").value;
			url += "?username=" + username;
				
			$.ajax({
				type: "GET",
				url: url,
				contentType: "application/json; charset=utf-8",
				data: {},
				dataType: "html",
				
				//fill div with response on success
				success: function(msg){
					var html = $.parseHTML(msg);
					$("#content").replaceWith(html);
					
				},
				
				error: function(xhr, ajaxOptions, thrownError){
					alert(thrownError);
					document.getElementById("content").innerHTML = "playlist request failed"
				}
			});
	}
 
	function myplaylists(){
			var url = "http://localhost:8080/myplaylists";
				
			$.ajax({
				type: "GET",
				url: url,
				contentType: "application/json; charset=utf-8",
				data: {},
				dataType: "html",
				
				//fill div with response on success
				success: function(msg){
					var html = $.parseHTML(msg);
					$("#content").replaceWith(html);
					
				},
				
				error: function(xhr, ajaxOptions, thrownError){
					alert(thrownError);
					document.getElementById("content").innerHTML = "playlist request failed"
				}
			});
	}