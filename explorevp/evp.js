var map, markers2018, markersclean, markers2019, markers, gallery;

jQuery.getJSON('https://bmm.raphaelnussbaumer.com/2018/vp/radar_list.json',function(radars){



markers2018 = L.markerClusterGroup({maxClusterRadius: 50});
markersclean = L.markerClusterGroup({maxClusterRadius: 50});
markers2019 = L.markerClusterGroup({maxClusterRadius: 50});
markers=markers2018;

radars.forEach(function (r, _idx, _array){
	var clean = false;
	var y2019 = false;
	var y2018 = false;
	
	var pop = '<h6>' + r.name + '</h6>';
	pop += '<b>Elevation of the radar:</b> ' + r.height +'m';
	if (r.scatter_lim>0){
		pop += '<br><b>Elevation of first accepatble data:</b> ' + r.scatter_lim + 'm';
	}
	pop += '<br><b>Distance of scan (radius):</b> ' + r.maxrange +'m';
	pop += '<br><b>Time resolution:</b> ' + r.dt + 'min';
	if (r.nanrawday2018>0){
		pop += '<br><br><b>Duration of available data (raw 2018):</b> ' + Math.round(r.nanrawday2018,2) + ' day(s)';
		y2018 = true;
	}
	
	if (r.nancleanday2018>0){
		pop += '<br><b>Duration of available data (clean 2018):</b> ' + Math.round(r.nancleanday2018,2) + ' day(s)';
		clean = true;
	}
	if (r.nanrawday2019>0){
		pop += '<br><b>Duration of available data (raw 2019):</b> ' + Math.round(r.nancleanday2019,2) + ' day(s)';
		y2019 = true;
	}	
	var m = L.marker([r.lat, r.lon], {
		title: r.name,
		id: r.name,
		sel: false,
		icon: L.AwesomeMarkers.icon({icon: 'circle', markerColor: 'blue'})
	}).bindPopup(pop)
	.on('click', function(e) {
		if (!e.target.options.sel){
			e.target.setIcon(L.AwesomeMarkers.icon({icon: 'circle', markerColor: 'red'}))
			markers.eachLayer(function(e){
				if (e.options.sel){
					e.options.sel=false
					e.setIcon(L.AwesomeMarkers.icon({icon: 'circle', markerColor: 'blue'}))
				}
			})
			e.target.options.sel=true
			
		} else {
			e.target.options.sel=false
			e.target.setIcon(L.AwesomeMarkers.icon({icon: 'circle', markerColor: 'blue'}));
		}
		
	})
	console.log(m.getLatLng())
	if (y2018){
		markers2018.addLayer(m);
	}
	if (clean){
		markersclean.addLayer(m);
	}
	if (y2019){
		markers2019.addLayer(m);
	}
	
	jQuery('#sel1').append(jQuery("<option></option>").attr("value", r.name).attr('clean', clean).attr('y2019',y2019).attr('y2018',y2018).text(r.name))
})
UpdateFigure();


});

jQuery(document).ready(function() {
	
	gallery = new Viewer(document.getElementById('images'));
	
	
	jQuery('#sel2').change(function() {
		var source = jQuery('#sel2 option:selected').val();
		jQuery('#sel1  option').removeAttr('disabled');
		if (source=='vp-2018'){
			jQuery('#sel1 option[y2018="false"]').attr('disabled','disabled')
		} else if (source=='vp-clean'){
			jQuery('#sel1 option[clean="false"]').attr('disabled','disabled')
		} else {
			jQuery('#sel1 option[y2019="false"]').attr('disabled','disabled')
		}
	});
	jQuery('#sel1 option[y2018="false"]').attr('disabled','disabled')
	
	jQuery('#thison').on('click', function(){
		markers.eachLayer(function(e){
			if (e.options.sel){
				$("#sel1").val(e.options.title);
			}
		})
		$('#exampleModal').modal('hide');
	})
	
	jQuery('[data-toggle="tooltip"]').tooltip();
	
	/*Leaflet*/
	map = L.map('map').setView([51.505, -0.09], 13);
	
	L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g', {
	tileSize: 512,
	zoomOffset: -1,
	attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




$('#exampleModal').on('show.bs.modal', function(){
	var source = jQuery('#sel2 option:selected').val();
	map.removeLayer(markers);
	if (source=='vp-raw'){
		markers = markers2018;
	} else if (source=='vp-clean'){
		markers = markersclean;
	} else {
		markers = markers2019;
	}
	map.addLayer(markers);
	setTimeout(function() { map.invalidateSize(); map.fitBounds(markers.getBounds());}, 500);
});

})


function UpdateFigure(){
	jQuery('#status').html('<i class="fas fa-lg fa-spinner fa-spin"></i>')
	var radar = jQuery('#sel1 option:selected').val();
	var source = jQuery('#sel2 option:selected').val();
	jQuery.getJSON('https://bmm.raphaelnussbaumer.com/2018/vp/' + source + '/dc_'+radar+'.json',function(d){
	
	
	if (jQuery('input[name=0toNaN]').prop('checked')){
		d.dens = d.dens.map( tmp2 => tmp2.map( tmp3 => tmp3 === 0 ? null : tmp3 ));
	}
	if (jQuery('input[name=logscale]').prop('checked')){
		d.dens = d.dens.map( tmp2 => tmp2.map( tmp3 => tmp3 < 1 ? 0 : Math.log10(tmp3) ));
	}
	
	d.dens = d.dens.map( tmp2 => tmp2.map( tmp3 => tmp3 < jQuery('#range-from').val() ? jQuery('#range-from').val() : ( tmp3 > jQuery('#range-to').val() ? jQuery('#range-to').val() : tmp3 ) ));
	
	var data = [{
		x: d.time,
		y: d.alt,
		z: d.dens,
		type: 'heatmap',
		colorbar: {
			title: "Bird density <br>[bird/km^3]",
		},
		colorscale: 'Viridis',
	}];
	
	
	var selectorOptions = {
		buttons: [{
			step: 'day',
			stepmode: 'backward',
			count: 1,
			label: '1d'
		},{
			step: 'day',
			stepmode: 'backward',
			count: 7,
			label: '1w'
		},{
			step: 'month',
			stepmode: 'backward',
			count: 1,
			label: '1m'
		},{
			step: 'all',
		}],
	};
	
	
	var layout = {
		height: 500,
		xaxis: {
			rangeselector: selectorOptions,
			rangeslider: {}
		},
		yaxis: {
			fixedrange: true
		},
	};
	
	data.push({
		x: [d.time[0], d.time[d.time.length - 1]],
		y: [d.height, d.height],
		mode: 'lines',
		line: {
			color: 'rgb(255, 255, 255)',
			width: 3
		}
	})
	Plotly.newPlot('myDiv', data, layout, {responsive: true});
	Plotly.Plots.resize('myDiv')
	jQuery('#status').html('')
	
})
}


