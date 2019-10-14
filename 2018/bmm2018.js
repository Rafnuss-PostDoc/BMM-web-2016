/*
let dens=[]
var oReq = new XMLHttpRequest();
oReq.open("GET", "/2018/density.bin", true);
oReq.responseType = "arraybuffer";
oReq.onprogress = function(oEvent) {
	if (oEvent.lengthComputable) {
      var percentComplete = Math.round((oEvent.loaded / oEvent.total) * 100);
      jQuery('#progressbar').css('width',percentComplete+'%')
  } 
};

oReq.onload = function (oEvent) {

	console.log('Density loaded')
	const arrayBuffer = oReq.response; // Note: not oReq.responseText
	if (arrayBuffer) {
		const byteArray = new Uint16Array(arrayBuffer);
		const chunk = 2207;
		for (let i=0; i<byteArray.length; i+=chunk) { 
			dens = [...dens, byteArray.slice(i,i+chunk)];
		} 
	}
};
oReq.send(null);

let flight=[]
var oReq2 = new XMLHttpRequest();
oReq2.open("GET", "/2018/flight.bin", true);
oReq2.responseType = "arraybuffer";
oReq2.onprogress = function(oEvent) {
	if (oEvent.lengthComputable) {
      var percentComplete = Math.round((oEvent.loaded / oEvent.total) * 100);
      jQuery('#progressbar2').css('width',percentComplete+'%')
  } 
};
oReq2.onload = function (oEvent) {
	console.log('Flight loaded')
	jQuery('#modal-loading').hide()
	const arrayBuffer = oReq2.response; // Note: not oReq2.responseText
	if (arrayBuffer) {
		const byteArray = new Uint16Array(arrayBuffer);
		const chunk = 2207;
		for (let i=0; i<byteArray.length; i+=chunk) { 
			flight = [...flight, byteArray.slice(i,i+chunk)];
		} 
		animate();
	}
};
oReq2.send(null);
*/

let data;
jQuery.getJSON('/2018/date.json', function(data){
	date=data;
})

mapboxgl.accessToken = 'pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g';
const map = new mapboxgl.Map({
	container: 'map', // container id
	style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
	center: [4.5, 49], // starting position [lng, lat]
	zoom: 4,
});

let grid_geojson, quiver_geojson, timer, speed, logscale, color, gauge;
map.on('load', function() {

	color = jQuery('input[name="radio-bar"]:checked').val();
	jQuery.getJSON('/2018/grid.geojson', function(geojson){

		grid_geojson = geojson;
		map.addSource('grid_source', { 
			type: 'geojson', 
			data: grid_geojson
		});

		map.addLayer({
			id: 'grid_layer',
			type: 'fill',
			source: 'grid_source',
			paint: {
				"fill-color": getFillColor(color),
				"fill-opacity": parseFloat(jQuery('#opacity').val()),
			},
			"filter": ["!=", "value", 0]
		})
	})

	jQuery.getJSON('/2018/quiver.geojson', function(geojson){

		map.loadImage('/2018/right-arrow.png', function(error, image) {
			map.addImage('arrow', image);

			quiver_geojson = geojson;
			map.addSource('quiver_source', { 
				type: 'geojson', 
				data: quiver_geojson,
				/*"cluster": true,
				"clusterRadius": 80,
				"clusterProperties": {
					//"angle": ["get", "angle"],//["/", ["+", ["get", "angle"]] , ["+", ["accumulated"], 1] ],
					//"size": [["+", ["accumulated"], ["get", "size"]], ["get", "size"]]
					//["+", ["case", [">",["get", "size"],0], 1, 0]],
					"size": "point_count_abbreviated"//["+", ["get", "size"]]
				}*/
			});

			map.addLayer({
				id: 'quiver_layer',
				type: 'symbol',
				source: 'quiver_source',
				"layout": {
					"icon-image": "arrow",
					"icon-rotate": ['get', 'angle'],
					"icon-size": ['get', 'size'],
				},
				"filter":  ["all", ["!=", "angle", 0], ["!=", "size", 0]]
			})

			jQuery('#modal-loading').hide()
			animate()
		})
		
	})

	jQuery('input[name="radio-bar"]').each( function(i, e){
		jQuery(e).after("<div class='h18 bar' style='background: linear-gradient(to right, "+colorbrewer[jQuery(e).attr('value')][9].join(',')+"'></div>")
	})
	jQuery('.bar').hover( ()=> {jQuery('.bar').show()} , ()=> {jQuery('.bar').hide()} )
	jQuery('.bar').on('click', function(e){
		jQuery('.bar').hide()
		color = this.previousElementSibling.value;
		map.setPaintProperty('grid_layer','fill-color',getFillColor(color))
	})

	speed=parseInt(jQuery('#speed').val());

	jQuery('#speed-div').hover(
		() => { jQuery('#speed').animate({width: 'toggle'});},
		() => { jQuery('#speed').animate({width: 'toggle'});}
		); 

	logscale=jQuery('#logscale').prop("checked");
	jQuery('#logscale').on('change', function() {
		logscale=jQuery('#logscale').prop("checked");
		map.setPaintProperty('grid_layer','fill-color',getFillColor(color))
	});

	jQuery('#ppeButton').on('click', function() {
		if (jQuery('#ppeButton-i').hasClass('fa-play')) {
			animate();
		} else {
			clearTimeout(timer)
		}
		jQuery('#ppeButton-i').toggleClass('fa-play fa-pause');
	});

	jQuery('#bweButton').on('click', function() {
		s.stepDown(1);
		sliderchange()
	});

	jQuery('#fweButton').on('click', function() {
		s.stepUp(1);
		sliderchange()
	});
	jQuery('#neeButton').on('click', function() {
		jQuery('#neeButton').toggleClass('active')
	});


	jQuery('#opacity').on('change', function() {
		map.setPaintProperty('grid_layer','fill-opacity', parseFloat(jQuery('#opacity').val())) 
	})

	gauge = new JustGage({
		id: "gauge",
		value: 0,
		min: 0,
		max: 90,
		valueFontColor: '#F7F5C5',
		label: "Millions of birds",
	});

	jQuery('#gauge > svg > text').css('font-family','inherit');
	jQuery('#gauge > svg > text:nth-child(5)').css('font-size','50px');
	jQuery('#gauge > svg > text:nth-child(6)').css('font-size','14px');
	jQuery('#gauge > svg > text:nth-child(7)').css('font-size','12px');
	jQuery('#gauge > svg > text:nth-child(8)').css('font-size','12px');
	
});

const d0 = new Date('01-Jan-2018Z');
const s = document.getElementById("slider");
var oReq = new XMLHttpRequest();
oReq.responseType = "arraybuffer";

oReq.onload = function (oEvent) {
	if (oReq.response) {
		const byteArray = new Uint16Array(oReq.response);
		const chunk = 2207;
		let dens=[]
		for (let i=0; i<byteArray.length; i+=chunk) { 
			dens = [...dens, byteArray.slice(i,i+chunk)];
		} 
		gauge.refresh(dens[0].reduce( (a,i) => {return a+i})/100*500/1000000);
		for (var i = 0, len = grid_geojson.features.length; i < len; i++) {
			if (logscale) {
				grid_geojson.features[i].properties.value = dens[0][i]==0 ? 0 : Math.log(dens[0][i]);
			} else {
				grid_geojson.features[i].properties.value = dens[0][i];
			}
			const x=dens[1][i]==0 ? 0 : dens[1][i]/100-30;
			const y=dens[2][i]==0 ? 0 : dens[2][i]/100-30;
			quiver_geojson.features[i].properties.angle = Math.atan2(y,x) * (180/Math.PI) -90;
			quiver_geojson.features[i].properties.size =  Math.min(1, Math.sqrt(x*x + y*y)/20);
		}
		map.getSource('grid_source').setData(grid_geojson);
		map.getSource('quiver_source').setData(quiver_geojson);

	}
};


const sliderchange = function(){
	if (date[s.value]>0){
		map.setLayoutProperty('grid_layer', 'visibility', 'visible');
		map.setLayoutProperty('quiver_layer', 'visibility', 'visible');
		oReq.open("GET", "/2018/bin/density_" + String(date[s.value]) + ".bin", true);
		oReq.send(null);
		jQuery('#tt-nb-div').removeClass('day').addClass('night')
		jQuery('#tt-sun').removeClass('fa-sun').addClass('fa-moon')
		jQuery('#gauge > svg > text:nth-child(5) > tspan').removeClass('day').addClass('night')
	} else if (jQuery('#neeButton').hasClass('active')) {
		i=0
		while (date[parseFloat(s.value)+i] == 0){
			i++
		}
		s.stepUp(i);
		sliderchange()
	} else {
		map.setLayoutProperty('grid_layer', 'visibility', 'none');
		map.setLayoutProperty('quiver_layer', 'visibility', 'none');
		jQuery('#tt-nb-div').removeClass('night').addClass('day')
		jQuery('#tt-sun').removeClass('fa-moon').addClass('fa-sun')		
		jQuery('#gauge > svg > text:nth-child(5) > tspan').removeClass('night').addClass('day')
	}
	let d = new Date(d0.getTime() + s.value*15*60000);
	jQuery('#date').html(d.toISOString().slice(0,16).replace('T','&nbsp;'))
};



const animate = () => {
	s.stepUp(1);
	sliderchange()
	timer = setTimeout(animate, 1000/speed)
}

const getFillColor = (color) => {
	if (logscale){
		return [
		'interpolate',
		['linear'],
		['get', 'value'],
		0, colorbrewer[color][9][0],
		1.25, colorbrewer[color][9][1],
		2.5, colorbrewer[color][9][2],
		3.75, colorbrewer[color][9][3],
		5, colorbrewer[color][9][4],
		6.25, colorbrewer[color][9][5],
		7.5, colorbrewer[color][9][6],
		8.75, colorbrewer[color][9][7],
		10, colorbrewer[color][9][8],
		]
	} else {
		return [
		'interpolate',
		['linear'],
		['get', 'value'],
		0, colorbrewer[color][9][0],
		2500, colorbrewer[color][9][1],
		5000, colorbrewer[color][9][2],
		7500, colorbrewer[color][9][3],
		10000, colorbrewer[color][9][4],
		12500, colorbrewer[color][9][5],
		15000, colorbrewer[color][9][6],
		17500, colorbrewer[color][9][7],
		20000, colorbrewer[color][9][8],
		]
	}
	
}
