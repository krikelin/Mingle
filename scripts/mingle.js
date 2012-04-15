/**********
Copyright (C) 2012 Alexander Forselius

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*****/
var sp = getSpotifyApi(1);
var models = sp.require("sp://import/scripts/api/models");
var views = sp.require("sp://import/scripts/api/views");
var auth = sp.require("sp://import/scripts/api/auth");
var jquery = sp.require("sp://mingle/scripts/jquery-1.7.2.min");
exports.init = init;
function init() {
	models.player.observe(models.EVENT.CHANGE, function() {
		checkTrack();
	});
	models.application.observe(models.EVENT.ARGUMENTSCHANGED, function() {
		var args = models.application.arguments;
		var section = args[0];
		console.log(section);
		$("section").each(function() {
			$(this).hide();
		});
		$("section#" + section).show();
	
	});
	checkTrack();
	
}
function checkTrack() {	
	var track = models.player.track;
	
	if(track != null) {
		$("#trackName").html(track.data.name);
		var popularity = track.data.popularity;
		var numberOfPlaylists = Math.floor(popularity * 0.025 * Math.pow( popularity*.1,3));
		var numberOfPlaysPerDay = (popularity / 0.25) *Math.round(Math.PI*new Date().getMonth())	;
		
		var numberOfStarrs = Math.round((popularity / 1000) * Math.pow(popularity*1.092, 3));
		$("#numOfStarr").html(numberOfStarrs);
		$("#numOfPlaylists").html(numberOfPlaylists);
		$("#numOfPlaysPerDay").html(numberOfPlaysPerDay);
		
		$(".trackImg").each(function() {
			$(this).css("background-image", "url('" + track.data.album.cover + "')");
		});
	}	
	console.log("http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=b25b959554ed76058ac220b7b2e0a026&artist="+ encodeURI(track.data.artists[0].name)+"&album="+encodeURI(track.data.album.name));
	$("#description").html("loading");
	// Get basic info
	$.ajax({
		
        type: "GET",
		url: "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=b25b959554ed76058ac220b7b2e0a026&artist="+ encodeURI(track.data.artists[0].name)+"&album="+encodeURI(track.data.album.name),
		dataType: "xml",
		success: function(xml) {
			console.log(xml);
			var text = $(xml).find('wiki').find('summary').text();
			if(text != "" && text != null) {
				$("#description").html(text);
			} else{ 
				$("#description").html("");
			}
		
		},
		failure: function() {
			
		}
	});
	$("#shouts").html("Loading");
	// Get fans
	var _url = "http://ws.audioscrobbler.com/2.0/?method=album.getshouts&api_key=b25b959554ed76058ac220b7b2e0a026&artist="+ encodeURI(track.data.artists[0].name)+"&album="+encodeURI(track.data.album.name);
	console.log(_url);
	$.ajax({
		type: "GET",
		url: _url,
		dataType: "xml",
			success: function (xml) {
			console.log("G");
			$("#shouts").html("");
			$(xml).find('shout').each(function() {
				var author = $(this).find('author').text();
				var body = $(this).find('body').text();
				var elm = document.createElement("div");
				$(elm).addClass("entry");
				$(elm).html("<h3>" + author + "</h3><p>" + body +"</p>");
				
				$("#shouts").append(elm);
				$("#shouts").append("<hr />");	
				
			});
		},
		failure: function() {
			
		}
	});
	// Get top fans
	var _url = "http://ws.audioscrobbler.com/2.0/?method=track.gettopfans&artist=" + encodeURI(track.data.artists[0].name)+"&track="+ encodeURI(track.data.name)+"&api_key=b25b959554ed76058ac220b7b2e0a026";
	$.ajax({
		type: "GET",
		url: _url,
		dataType: "xml",
			success: function (xml) {
			$("#tfans").html("");
			$(xml).find('user').each(function(index) {
				
				
				var elm = createUser(this, index);
				$("#tfans").append(elm);
				
			});
		},
		failure: function() {
			
		}
	});
	var _url = "http://ws.audioscrobbler.com/2.0/?method=artist.gettopfans&artist=" + encodeURI(track.data.artists[0].name) + "	&api_key=b25b959554ed76058ac220b7b2e0a026";
	$.ajax({
		type: "GET",
		url: _url,
		dataType: "xml",
			success: function (xml) {
			$("#tafans").html("");
			$(xml).find('user').each(function (index) {
				var elm = createUser(this, index);
				$("#tafans").append(elm);
			});
		},
		failure: function() {
			
		}
	});
}

function createUser (_this, index) {	
	var author = $(_this).find('name').text();
	var elm = document.createElement("div");
	$(elm).addClass("item");
	var div = elm;
	if(index < 5) {
		var img = document.createElement("div");
		console.log($(_this).find('image').first().text());
		img.style.backgroundImage = "url('" + $(_this).find('image').first().text() + "')";
		console.log(img);
		img.style.display = "inline";
		img.style.cssFloat = "left";
		
		$(img).addClass("sp-image image");
		$(img).css({"margin-right": "2px", "width":"48px", "height" : "48px"});
		$(elm).append(img);
		
		
	}
	div = document.createElement("div");
	$(div).append("<span>" + author + "</div>");
	$(div).css("padding-left", "13px");
	$(elm).addClass("flex");
	
	var chard = document.createElement("meter");
	
	chard.setAttribute("max", 10000);
	chard.setAttribute("value", $(_this).find('weight').text());// $(this).find('weight').text();
	if(index < 5) {
		$(div).append("<br />");
		$(div).css("height","48px");
	} else {
		$(div).append(" ");
	}
	//$(div).append(chard);
	$(elm).append(div);
	return elm;
}
			