function Balloon(b, map){
	this.b = b;
	this.map = map;
	
	this.defaultBalloonColor = 'steelblue';
	this.defaultLineColor = "darkgray";

	if (b.location.latitude == null ||
		b.location.longitude == null) return;

	this.marker = this.addBalloon([b.location.latitude, b.location.longitude]);
	
	this.marker.bindPopup(b.name + "<br>started: " + $.format.toBrowserTimeZone(b.created, 'yyyy-M-dd HH:mm')
		+"<br>last updated: " + $.format.toBrowserTimeZone(b.location.timestamp, 'yyyy-M-dd HH:mm') + '<br>'
		);

	this.showFullHistory(b.id, this.addLine.bind(this));

}	

Balloon.prototype.highlight = function(){
	if (this.b.color)
		this.line.setStyle({color: this.b.color});
	else
		this.line.setStyle({color: 'red'});
}

Balloon.prototype.unhighlight = function(){
	this.line.setStyle({color: this.defaultLineColor});
}

Balloon.prototype.addLine = function(line){
	this.line = line;
	
	line.on('mouseover', this.highlight.bind(this));
	line.on('mouseout', this.unhighlight.bind(this));
	this.marker.on('mouseover', this.highlight.bind(this));
	this.marker.on('mouseout', this.unhighlight.bind(this));
}

Balloon.prototype.showHistory = function(id, c){
	var c = c || "red";
	$.getJSON('balloon/'+id+'/history', function(data, status, code){
		list = $.map(data, function(el){
			return [[el.latitude, el.longitude]];
		});
		L.polyline(list, {color:c, weight:2}).addTo(map);
	});
}

Balloon.prototype.showFullHistory = function (id, cb){
	var lineColor = this.defaultLineColor;
	$.getJSON('balloon/'+id+'/full_history', function(data){
		list = $.map(data, function(el){
			return [[el.latitude, el.longitude]];
		});
		var line = L.polyline(list, {color: lineColor, weight: 2});
		line.addTo(map);
		cb(line);
	});
}

Balloon.prototype.addBalloon = function(ll){
	var color = this.b.color || this.defaultBalloonColor;
	return this.addSvgBalloon(ll, color);
}

Balloon.prototype.addSvgBalloon = function(ll, color){
	var myIcon = L.divIcon({
		iconAnchor: [10, 53],
		className: 'div-icon'
	});

	var marker = L.marker(ll, {icon: myIcon});
	marker.addTo(this.map);
	marker.bindPopup("<b>Hello world!</b><br>I am a popup.");
	$(marker._icon).load('images/balloon_color.svg', function(a,b,c){
		var svg = $(marker._icon).find('svg')[0];
		$(svg).css('pointer-events','none');
		svg.setAttribute('height', '53');
		svg.setAttribute('width', '20');
		$(svg).find('#color_fill')[0].setAttribute('style', 'fill:'+color+';fill-opacity:1;stroke:none;pointer-events:all;');
	});
	return marker;
}