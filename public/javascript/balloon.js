function Balloon(b, iconSource, focus){
	this.b = b;
	this.focus = focus;
	this.iconSource = iconSource;
	
	var bigSize = [20*0.75,53*0.75];
	var smallSize = [10,26];

	this._smallIcon = this.icon = L.divIcon({
		iconAnchor: [smallSize[0]/2,smallSize[1]],
		iconSize: smallSize,
		popupAnchor: [0, -smallSize[1]-2],
		className: 'div-icon',
		html: this.iconSource
	});

	this._bigIcon = this.icon = L.divIcon({
		iconAnchor: [bigSize[0]/2,bigSize[1]],
		iconSize: bigSize,
		popupAnchor: [0, -bigSize[1]-2],
		className: 'div-icon',
		html: this.iconSource
	});



	if (this.focus)
		this.icon_size = [20*0.75,53*0.75];
	else
		this.icon_size = [10,26];

	
	this.defaultBalloonColor = 'steelblue';
	this.defaultLineColor = "darkgray";

	if (b.location.latitude == null ||
		b.location.longitude == null) return;

	this.addBalloon([b.location.latitude, b.location.longitude]);
	
	this.marker.bindPopup("<b>" + b.name + "</b><br>"
		+ b.message + "<br>"
		+"<br>started: " + $.format.toBrowserTimeZone(b.created, 'yyyy-M-dd HH:mm')
		+"<br>last updated: " + $.format.toBrowserTimeZone(b.location.timestamp, 'yyyy-M-dd HH:mm') + '<br>'
		+'<a href="javascript:balloons[\''+this.b.id+'\'].showFullHistory();">show path</a><br>'
		+'link to this balloon:<br><a href="'+window.location.protocol + "//" + window.location.host + "/#" + this.b.id + '">'+window.location.protocol + "//" + window.location.host + "/#" + this.b.id+'</a>');

	
}	

Balloon.prototype.highlight = function(){
	this.center();
	this.showFullHistory();
	this.marker.setIcon(this._bigIcon);

	var bColor = this.b.color || this.defaultBalloonColor;
	var svg = $(this.marker._icon).find('svg')[0];
	$(svg).css('pointer-events','none');
	$(svg).find('#color_fill')[0].setAttribute('style', 'fill:'+bColor+';fill-opacity:1;stroke:none;pointer-events:all;');
}

Balloon.prototype.unhighlight = function(){
	this.line.setStyle({color: this.defaultLineColor});
}

Balloon.prototype.showHistory = function(id, c){

	var c = c || "red";
	$.getJSON('balloon/'+id+'/history', function(data, status, code){
		list = $.map(data, function(el){
			return [[el.latitude, el.longitude]];
		});
		L.polyline(list, {color:c, weight:2}).addTo(this.map);
	});
}

Balloon.prototype.showFullHistory = function (){
	var lineColor = this.b.color || this.defaultBalloonColor;
	that = this;

	$.getJSON('balloon/'+this.b.id+'/full_history', function(data){
		list = $.map(data, function(el){
			return [[el.latitude, el.longitude]];
		});
		L.polyline(list, {color: lineColor, weight: 1.5, clickable:false}).addTo(that.map);
	});
}

Balloon.prototype.addBalloon = function(ll){
	var color = this.b.color || this.defaultBalloonColor;
	this.addSvgBalloon(ll, color);
}

Balloon.prototype.addSvgBalloon = function(ll, color){
	this.icon = this._smallIcon;
	this.marker = L.marker(ll, {icon: this.icon}).addTo(this.map);

	var svg = $(this.marker._icon).find('svg')[0];
	$(svg).css('pointer-events','none');
	$(svg).find('#color_fill')[0].setAttribute('style', 'fill:'+color+';fill-opacity:1;stroke:none;pointer-events:all;');
}

Balloon.prototype.center = function(){
	this.map.setView(this.marker.getLatLng(), 3);
}
