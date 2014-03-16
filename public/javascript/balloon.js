function Balloon(b, icon, focus){
	this.b = b;
	this.focus = focus;
	this.icon = icon;

	if (this.focus)
		this.icon_size = [20*0.75,53*0.75];
	else
		this.icon_size = [10,26];

	
	this.defaultBalloonColor = 'steelblue';
	this.defaultLineColor = "darkgray";

	if (b.location.latitude == null ||
		b.location.longitude == null) return;

	this.marker = this.addBalloon([b.location.latitude, b.location.longitude]);
	
	this.marker.bindPopup("<b>" + b.name + "</b><br>"
		+ b.message + "<br>"
		+"<br>started: " + $.format.toBrowserTimeZone(b.created, 'yyyy-M-dd HH:mm')
		+"<br>last updated: " + $.format.toBrowserTimeZone(b.location.timestamp, 'yyyy-M-dd HH:mm') + '<br>'
		+'<a href="javascript:balloons[\''+this.b.id+'\'].showFullHistory();">show path</a><br>'
		+'link to this balloon:<br><a href="'+window.location.protocol + "//" + window.location.host + "/#" + this.b.id + '">'+window.location.protocol + "//" + window.location.host + "/#" + this.b.id+'</a>');

	
}	

Balloon.prototype.highlight = function(){
	if (this.b.color)
		this.line.setStyle({color: this.b.color});
	else
		this.line.setStyle({color: 'red'});
		this.line.bringToFront();
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
	return this.addSvgBalloon(ll, color);
}

Balloon.prototype.addSvgBalloon = function(ll, color){
	var myIcon = L.divIcon({
		iconAnchor: [this.icon_size[0]/2,this.icon_size[1]],
		iconSize: this.icon_size,
		popupAnchor: [0, -this.icon_size[1]-2],
		className: 'div-icon',
		html: this.icon
	});

	var marker = L.marker(ll, {icon: myIcon});
	marker.addTo(this.map);

	var svg = $(marker._icon).find('svg')[0];
	$(svg).css('pointer-events','none');
	$(svg).find('#color_fill')[0].setAttribute('style', 'fill:'+color+';fill-opacity:1;stroke:none;pointer-events:all;');
	return marker;
}

Balloon.prototype.center = function(){
	this.map.panTo(this.marker.getLatLng());
}