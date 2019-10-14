var map, gd_density, gd_sum, gd_mtr;
var frame = [[43 , -5], [68, 30]];

jQuery(document).ready(function() {

	var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
	var isFirefox = typeof InstallTrigger !== 'undefined';

	if( !(isChrome || isFirefox) ) {
		jQuery('body').append('<div class="alert alert-warning" id="alert-bar">'+
			'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+
			'<strong>Warning!</strong> Your browser might not be compatible. We recommend using <a href="https://www.google.com/chrome/">Chrome</a>.'+
			'</div>');
	}

	map = L.map('mapid',{
		timeDimension: true,
		timeDimensionControl: true,
		timeDimensionOptions: {
			timeInterval: "2016-09-19T00:00:00Z/2016-10-10T00:00:00Z",
			period: "PT15M",
			currentTime: Date.parse("2016-09-19T00:00:00Z"),
			updateTimeDimensionMode: "replace",
		},
		timeDimensionControlOptions: {
			autoPlay: true,
			playerOptions: {
				buffer: 50,
				minBufferReady: 10,
				transitionTime: 100,
				loop: true,
			}
		}
	}).fitBounds(frame);

	map.timeDimensionControl._dateUTC=false;
	
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.run-bike-hike',
		accessToken: 'pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g'
	}).addTo(map);


	var folderDens = "Density_estimationMap_ImageOverlay/";
	var folderFlight = "Quiver_est/";
	var zoom='';//'_4/';
	//imageLayerDay = L.imageOverlay("https://bmm.raphaelnussbaumer.com/data/mask_day_3857.webp",frame,{opacity:0.5}).addTo(map);
	imageLayerDens = L.imageOverlay("https://bmm.raphaelnussbaumer.com/data/0000-00-00-00-00_3857.webp",frame,{opacity:0.9}).addTo(map);
	imageLayerFlight = L.imageOverlay("https://bmm.raphaelnussbaumer.com/data/0000-00-00-00-00_3857.webp",frame,{opacity:0.9});//.addTo(map);
	imageLayerRain = L.imageOverlay("https://bmm.raphaelnussbaumer.com/data/0000-00-00-00-00_3857.webp",frame,{opacity:0.8}).addTo(map);


	ImageTimeLayerDens = L.timeDimension.layer.imageOverlay(imageLayerDens, {
		getUrlFunction: function(baseUrl, time) {
			var t = new Date(time);//-1000*60*60*2);
			var beginUrl = "https://bmm.raphaelnussbaumer.com/data/"+folderDens;
			return beginUrl + t.getFullYear() + '-' + ('0' + (t.getMonth()+1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2)  + '-' + ('0' + t.getHours()).slice(-2) + '-' + ('0' + t.getMinutes()).slice(-2) +'_3857.webp';
		}
	}).addTo(map);

	ImageTimeLayerFlight = L.timeDimension.layer.imageOverlay(imageLayerFlight, {
		getUrlFunction: function(baseUrl, time) {
			var t = new Date(time);//-1000*60*60*2);
			var beginUrl = "https://bmm.raphaelnussbaumer.com/data/"+folderFlight;
			return beginUrl + zoom + t.getFullYear() + '-' + ('0' + (t.getMonth()+1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2)  + '-' + ('0' + t.getHours()).slice(-2) + '-' + ('0' + t.getMinutes()).slice(-2) +'_3857.webp';
		}
	}).addTo(map);

	/*map.on('zoomend', function() {
		if(map.getZoom()<5){
			zoom='_4/';
		}else{
			zoom='/';
		}
	});*/

	ImageTimeLayerRain = L.timeDimension.layer.imageOverlay(imageLayerRain, {
		getUrlFunction: function(baseUrl, time) {
			var t = new Date(time);//-1000*60*60*2);
			var beginUrl = "https://bmm.raphaelnussbaumer.com/data/rain/";
			return beginUrl + t.getFullYear() + '-' + ('0' + (t.getMonth()+1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2)  + '-' + ('0' + t.getHours()).slice(-2) + '-' + ('0' + t.getMinutes()).slice(-2) +'_3857.webp';
		}
	}).addTo(map);

	

	var figure = L.control({position: 'bottomleft'});
	figure.onAdd = function (map) {
		var div = L.DomUtil.create('div','timeseries-div');
		div.innerHTML = '<ul class="nav nav-tabs" id="myTab" role="tablist"><li class="nav-item">'+
		'<a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true"><i class="fa fa-chevron-down"></i></a>'+
		'</li><li class="nav-item"  data-toggle="tooltip" title="Time series of bird density">'+
		'<a class="nav-link" id="density-tab" data-toggle="tab" href="#tab_density" role="tab" aria-controls="tab_density" aria-selected="false">Density Profile [bird/km<sup>2</sup>]</a>'+
		'</li><li class="nav-item" data-toggle="tooltip" title="Time series of the total number of bird">'+
		'<a class="nav-link" id="sum-tab" data-toggle="tab" href="#tab_sum" role="tab" aria-controls="tab_sum" aria-selected="false" >Sum Profile [bird]</a>'+
		'</li><li class="nav-item" data-toggle="tooltip" title="Time series of the Mean Traffic Rate (flux of bird perpendicular to a transect)">'+
		'<a class="nav-link" id="mtr-tab" data-toggle="tab" href="#tab_mtr" role="tab" aria-controls="tab_mtr" aria-selected="false" >MTR Profile [bird/km/hr]</a>'+
		'</li></ul>'+
		'<div class="tab-content" id="myTabContent">'+
		'<div class="tab-pane show active" id="home" role="tabpanel" aria-labelledby="home-tab"></div>'+
		'<div class="tab-pane" id="tab_density" role="tabpanel" aria-labelledby="density-tab">'+
		'<div id="plot_density"></div>'+
		'<div id="mapbuttons_density_div" class="leaflet-bar leaflet-control mapbuttons_div" title="Choose a location on the map to display the time serie of bird density at this location" data-toggle="tooltip"></div>'+
		'</div>'+
		'<div class="tab-pane" id="tab_sum" role="tabpanel" aria-labelledby="sum-tab">'+
		'<div id="plot_sum"></div>'+
		'<div id="mapbuttons_sum_div" class="leaflet-bar leaflet-control mapbuttons_div" title="Choose a polygon on the map to compute the total number of bird flying over this area" data-toggle="tooltip"></div>'+
		'</div>'+
		'<div class="tab-pane" id="tab_mtr" role="tabpanel" aria-labelledby="mtr-tab">'+
		'<div id="plot_mtr"></div>'+
		'<div id="mapbuttons_mtr_div" class="leaflet-bar leaflet-control mapbuttons_div" title="Choose a transect to compute the flux of bird across this transect" data-toggle="tooltip"></div>'+
		'</div>'+
		'</div>';
		//div.innerHTML = '<a data-toggle="collapse" href="#collapseExample" aria-expanded="false" aria-controls="collapseExample" class="btn form-control" id="btn-timeserie-toggle">Time Series <i class="fa fa-chevron-up pull-up"></i><i class="fa fa-chevron-down pull-up"></i></a>';
		//<span id="new-ts">Query the map with point, transect of area: </span>'+
		div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
		return div;
	};
	figure.addTo(map);


	figure.getContainer().addEventListener('mouseover', function () {
		map.dragging.disable();
	});
	figure.getContainer().addEventListener('mouseout', function () {
		map.dragging.enable();
	});

	var legend_left=L.control({position: 'topleft'})
	legend_left.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		div.innerHTML = '<div id="intro-div" class="form-control">'+
		'<h5>Welcome!</h5>'+
		'<p>This interactive map displays the nocturnal bird migration of Autumn 2016 based on data from the European network of weather radars.</p>'+
		'<p>This map was generated using a novel geostatistical model presented in a scientific paper (<a href="https://doi.org/10.3390/rs11192233"><i class="ai ai-doi"></i>/10.3390/rs11192233</a>).</p>'+
		'<p>Explore time series of bird densities for specific locations using the tabs below, or check <a id="modal" href="#" onclick="return false;">the more detailed instructions <i class="fas fa-info-circle"></i></a>\.</p>';
		div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
		return div
	}
	legend_left.addTo(map);

	var legend_right = L.control({position: 'topright'});
	legend_right.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		div.innerHTML += '<div class="form-group" id="select-map" data-toggle="tooltip" title="Estimation: most likely values (mean), Simulation: possible values (outcome)">'+
		'<select class="form-control" id="sel1">'+
		'<option value=\'{\"folderDens\":\"Density_estimationMap_ImageOverlay/\",\"folderFlight\":\"Quiver_est/\",\"minval\":\"1\",\"maxval\":\"100\",\"titleval\":\"Bird Density [bird/km<sup>2</sup>] (log-scale)\"}\'>Estimation</option>'+
		'<option disable value=\'{\"folderDens\":\"Density_simulationMap_ImageOverlay/\",\"folderFlight\":\"Quiver_sim/\",\"minval\":\"1\",\"maxval\":\"100\",\"titleval\":\"Bird Density [bird/km<sup>2</sup>] (log-scale)\"}\' >Simulation</option>'+
		'<option disable value=\'{\"folderDens\":\"SinkSource_estimationMap_ImageOverlay/\",\"folderFlight\":\"Quiver_est/\",\"minval\":\"-20\",\"maxval\":\"20\",\"titleval\":\"Arrival(-)/Departure(+) [bird/km<sup>2</sup>/15min]\"}\'>Arrival/departure</option>'+
		'</select>'+
		'</div>';

		div.innerHTML += '<div id="canvas-div" class="form-control">'+
		'<p id="canvas-title">Bird Density [bird/km<sup>2</sup>] (log-scale)</p>'+
		'<canvas id="canvas_viridis" width="247" height="20" ></canvas>'+
		'<canvas id="canvas_spectral" width="247" height="20" style="display: none;"></canvas>'+
		'<p id="canvas-range"><span id="canvas-min">1</span><span id="canvas-max">100</span></p>'+
		'<label class="checkbox-inline" data-toggle="tooltip" title="Threshold of 0.01mm/hr"><input type="checkbox" checked id="checkbox2"> Rain</label>'+
		'<label class="checkbox-inline"><input type="checkbox" checked id="checkbox1"> Flight vectors</label>'+
		'</div>';

		div.innerHTML += '<div id="tt-nb-div" class="form-control night">'+
		'<div id="gauge"></div><i id="tt-sun" class="fas fa-2x fa-moon"></i></div>';

		div.innerHTML += '<div id="learnmore-div" class="form-control">\
		<a role="button" data-toggle="tooltip" class="btn btn-default" title="Introduction to the interpolation model" href="https://Rafnuss-PostDoc.github.io/BMM/2016" target="_blank"><i class="fas fa-atom"></i></a>\
		<a role="button" data-toggle="tooltip" class="btn btn-default" title="Paper" href="https://www.biorxiv.org/content/10.1101/690065v1" target="_blank"><i class="ai ai-biorxiv"></i></a>\
		<a role="button" data-toggle="tooltip" class="btn btn-default" title="Matlab Livescript" href="https://rafnuss-postdoc.github.io/BMM/MatlabLiveScript/Inference.html" target="_blank"><img width="20" src="https://camo.githubusercontent.com/0f25b3f52ab9619f688204528a7e22e84aeac07d/68747470733a2f2f63646e2e6f6e6c696e65776562666f6e74732e636f6d2f7376672f696d675f3433373034312e706e67"></a>\
		<a role="button" data-toggle="tooltip" class="btn btn-default" title="Researchgate project webpage" href="https://www.researchgate.net/project/Bird-Migration-Modelling-BMM" target="_blank"><i class="fab fa-researchgate"></i></a>\
		<a role="button" data-toggle="tooltip" class="btn btn-default" title="Code of the website" href="https://github.com/Rafnuss-PostDoc/BMM-web" target="_blank"><i class="fab fa-github"></i></a>\
		</div>';

		div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
		return div;
	}
	legend_right.addTo(map);

	legend_right.getContainer().addEventListener('mouseover', function () {
		map.dragging.disable();
	});
	legend_right.getContainer().addEventListener('mouseout', function () {
		map.dragging.enable();
	});
	legend_left.getContainer().addEventListener('mouseover', function () {
		map.dragging.disable();
	});
	legend_left.getContainer().addEventListener('mouseout', function () {
		map.dragging.enable();
	});

	var gauge = new JustGage({
		id: "gauge",
		value: 24.7,
		min: 0,
		max: 120,
		valueFontColor: '#F7F5C5',
		label: "Millions of birds",
	});

	jQuery('#gauge > svg > text').css('font-family','inherit');
	jQuery('#gauge > svg > text:nth-child(5)').css('font-size','50px');
	jQuery('#gauge > svg > text:nth-child(6)').css('font-size','14px');
	jQuery('#gauge > svg > text:nth-child(7)').css('font-size','12px');
	jQuery('#gauge > svg > text:nth-child(8)').css('font-size','12px');


	jQuery('#checkbox1').change(function() {
		if(jQuery(this).is(":checked")) {
			//ImageTimeLayerFlight.addTo(map)
			ImageTimeLayerFlight.setOpacity(1);

		} else {
			//ImageTimeLayerFlight.removeFrom(map)
			ImageTimeLayerFlight.setOpacity(0);
		}
	});

	jQuery('#checkbox2').change(function() {
		if(jQuery(this).is(":checked")) {
			//ImageTimeLayerRain.addTo(map)
			ImageTimeLayerRain.setOpacity(1);
		} else {
			//ImageTimeLayerRain.removeFrom(map)
			ImageTimeLayerRain.setOpacity(0);
		}
	});

	jQuery('#sel1').change(function(){
		var sel = jQuery.parseJSON(this.value);
		folderDens = sel.folderDens;
		folderFlight = sel.folderFlight;
		jQuery('#canvas-min').html(sel.minval);
		jQuery('#canvas-max').html(sel.maxval);
		jQuery('#canvas-title').html(sel.titleval);
		if (folderDens=='SinkSource_estimationMap_ImageOverlay/'){
			jQuery('#canvas_viridis').hide();
			jQuery('#canvas_spectral').show();
		} else {
			jQuery('#canvas_viridis').show();
			jQuery('#canvas_spectral').hide();
		}
	});

	/*var sliderDay = document.getElementById("opacity-day");
	sliderDay.oninput = function() {
		imageLayerDay.setOpacity(this.value/100);
	}
	var sliderRain = document.getElementById("opacity-rain");
	sliderRain.oninput = function() {
		ImageTimeLayerRain.setOpacity(this.value/100);
	}*/

	var canvas = document.getElementById('canvas_viridis');
	var ctx = canvas.getContext('2d');
	var gradient = ctx.createLinearGradient(0, 0, 247, 0);
	viridis=[[0.2670, 0.0049, 0.3294], [0.2685, 0.0096, 0.3354], [0.2700, 0.0147, 0.3414], [0.2713, 0.0200, 0.3473], [0.2726, 0.0257, 0.3532], [0.2738, 0.0316, 0.3590], [0.2750, 0.0379, 0.3647], [0.2760, 0.0443, 0.3703], [0.2770, 0.0505, 0.3759], [0.2780, 0.0565, 0.3814], [0.2788, 0.0624, 0.3868], [0.2796, 0.0681, 0.3921], [0.2803, 0.0737, 0.3974], [0.2809, 0.0792, 0.4026], [0.2815, 0.0846, 0.4077], [0.2819, 0.0900, 0.4127], [0.2823, 0.0953, 0.4176], [0.2827, 0.1005, 0.4225], [0.2829, 0.1058, 0.4272], [0.2831, 0.1109, 0.4319], [0.2832, 0.1161, 0.4365], [0.2832, 0.1212, 0.4409], [0.2832, 0.1263, 0.4453], [0.2831, 0.1313, 0.4496], [0.2829, 0.1364, 0.4538], [0.2826, 0.1414, 0.4579], [0.2822, 0.1464, 0.4619], [0.2818, 0.1514, 0.4658], [0.2813, 0.1564, 0.4696], [0.2808, 0.1613, 0.4733], [0.2802, 0.1663, 0.4769], [0.2795, 0.1712, 0.4804], [0.2787, 0.1761, 0.4838], [0.2779, 0.1810, 0.4871], [0.2770, 0.1859, 0.4903], [0.2760, 0.1907, 0.4934], [0.2750, 0.1956, 0.4964], [0.2740, 0.2004, 0.4993], [0.2728, 0.2052, 0.5021], [0.2716, 0.2100, 0.5048], [0.2704, 0.2148, 0.5074], [0.2691, 0.2196, 0.5100], [0.2677, 0.2243, 0.5124], [0.2663, 0.2291, 0.5147], [0.2649, 0.2338, 0.5170], [0.2634, 0.2385, 0.5191], [0.2618, 0.2431, 0.5212], [0.2603, 0.2478, 0.5232], [0.2586, 0.2524, 0.5251], [0.2560, 0.2560, 0.5269], [0.2553, 0.2616, 0.5286], [0.2536, 0.2662, 0.5303], [0.2518, 0.2707, 0.5319], [0.2501, 0.2752, 0.5334], [0.2482, 0.2797, 0.5349], [0.2464, 0.2842, 0.5362], [0.2446, 0.2886, 0.5375], [0.2427, 0.2931, 0.5388], [0.2408, 0.2975, 0.5400], [0.2389, 0.3019, 0.5411], [0.2370, 0.3062, 0.5422], [0.2351, 0.3106, 0.5432], [0.2331, 0.3149, 0.5441], [0.2312, 0.3192, 0.5451], [0.2293, 0.3234, 0.5459], [0.2273, 0.3277, 0.5467], [0.2254, 0.3319, 0.5475], [0.2234, 0.3361, 0.5482], [0.2215, 0.3403, 0.5489], [0.2195, 0.3444, 0.5496], [0.2176, 0.3486, 0.5502], [0.2157, 0.3527, 0.5508], [0.2138, 0.3568, 0.5513], [0.2119, 0.3608, 0.5519], [0.2100, 0.3649, 0.5523], [0.2081, 0.3689, 0.5528], [0.2062, 0.3729, 0.5532], [0.2043, 0.3769, 0.5537], [0.2025, 0.3809, 0.5540], [0.2007, 0.3849, 0.5544], [0.1989, 0.3888, 0.5547], [0.1971, 0.3928, 0.5551], [0.1953, 0.3967, 0.5554], [0.1935, 0.4006, 0.5557], [0.1918, 0.4045, 0.5559], [0.1901, 0.4083, 0.5562], [0.1883, 0.4122, 0.5564], [0.1867, 0.4161, 0.5566], [0.1850, 0.4199, 0.5568], [0.1833, 0.4237, 0.5570], [0.1817, 0.4275, 0.5572], [0.1801, 0.4313, 0.5573], [0.1784, 0.4351, 0.5575], [0.1768, 0.4389, 0.5576], [0.1753, 0.4427, 0.5577], [0.1737, 0.4464, 0.5578], [0.1721, 0.4502, 0.5579], [0.1706, 0.4540, 0.5580], [0.1691, 0.4577, 0.5581], [0.1675, 0.4614, 0.5581], [0.1660, 0.4652, 0.5581], [0.1645, 0.4689, 0.5581], [0.1630, 0.4726, 0.5581], [0.1615, 0.4763, 0.5581], [0.1601, 0.4801, 0.5581], [0.1586, 0.4838, 0.5580], [0.1571, 0.4875, 0.5580], [0.1557, 0.4912, 0.5579], [0.1542, 0.4949, 0.5578], [0.1527, 0.4986, 0.5577], [0.1513, 0.5023, 0.5575], [0.1498, 0.5060, 0.5574], [0.1484, 0.5097, 0.5572], [0.1470, 0.5134, 0.5569], [0.1455, 0.5171, 0.5567], [0.1441, 0.5208, 0.5564], [0.1427, 0.5245, 0.5562], [0.1413, 0.5281, 0.5558], [0.1399, 0.5318, 0.5555], [0.1385, 0.5355, 0.5551], [0.1371, 0.5392, 0.5547], [0.1358, 0.5429, 0.5543], [0.1344, 0.5466, 0.5538], [0.1331, 0.5503, 0.5533], [0.1318, 0.5544, 0.5532], [0.1306, 0.5577, 0.5522], [0.1293, 0.5614, 0.5516], [0.1282, 0.5651, 0.5509], [0.1270, 0.5688, 0.5502], [0.1259, 0.5725, 0.5495], [0.1249, 0.5762, 0.5487], [0.1239, 0.5799, 0.5479], [0.1230, 0.5836, 0.5470], [0.1222, 0.5873, 0.5461], [0.1215, 0.5910, 0.5451], [0.1208, 0.5947, 0.5441], [0.1203, 0.5984, 0.5430], [0.1199, 0.6021, 0.5419], [0.1196, 0.6058, 0.5408], [0.1195, 0.6095, 0.5395], [0.1195, 0.6132, 0.5383], [0.1196, 0.6169, 0.5370], [0.1199, 0.6205, 0.5356], [0.1204, 0.6242, 0.5341], [0.1211, 0.6279, 0.5326], [0.1219, 0.6316, 0.5311], [0.1230, 0.6353, 0.5295], [0.1242, 0.6389, 0.5278], [0.1257, 0.6426, 0.5260], [0.1274, 0.6462, 0.5242], [0.1293, 0.6499, 0.5224], [0.1314, 0.6535, 0.5205], [0.1337, 0.6572, 0.5185], [0.1363, 0.6608, 0.5164], [0.1391, 0.6644, 0.5143], [0.1421, 0.6681, 0.5121], [0.1453, 0.6717, 0.5098], [0.1488, 0.6753, 0.5075], [0.1525, 0.6789, 0.5051], [0.1564, 0.6824, 0.5026], [0.1605, 0.6860, 0.5001], [0.1648, 0.6896, 0.4975], [0.1693, 0.6931, 0.4948], [0.1740, 0.6966, 0.4920], [0.1789, 0.7002, 0.4892], [0.1840, 0.7037, 0.4863], [0.1892, 0.7072, 0.4833], [0.1947, 0.7106, 0.4803], [0.2003, 0.7141, 0.4771], [0.2061, 0.7176, 0.4739], [0.2120, 0.7210, 0.4707], [0.2181, 0.7244, 0.4673], [0.2244, 0.7278, 0.4639], [0.2308, 0.7312, 0.4604], [0.2373, 0.7345, 0.4568], [0.2440, 0.7379, 0.4531], [0.2508, 0.7412, 0.4494], [0.2577, 0.7445, 0.4456], [0.2648, 0.7478, 0.4417], [0.2720, 0.7510, 0.4378], [0.2793, 0.7543, 0.4337], [0.2868, 0.7575, 0.4296], [0.2943, 0.7607, 0.4254], [0.3020, 0.7638, 0.4211], [0.3098, 0.7670, 0.4168], [0.3177, 0.7701, 0.4123], [0.3257, 0.7732, 0.4078], [0.3337, 0.7762, 0.4032], [0.3419, 0.7792, 0.3986], [0.3502, 0.7822, 0.3938], [0.3586, 0.7852, 0.3890], [0.3671, 0.7882, 0.3841], [0.3757, 0.7911, 0.3791], [0.3843, 0.7940, 0.3741], [0.3931, 0.7968, 0.3690], [0.4019, 0.7996, 0.3638], [0.4108, 0.8024, 0.3585], [0.4199, 0.8052, 0.3531], [0.4289, 0.8079, 0.3477], [0.4381, 0.8106, 0.3422], [0.4474, 0.8132, 0.3366], [0.4567, 0.8158, 0.3309], [0.4661, 0.8184, 0.3252], [0.4756, 0.8209, 0.3194], [0.4851, 0.8234, 0.3135], [0.4947, 0.8259, 0.3075], [0.5044, 0.8283, 0.3015], [0.5142, 0.8307, 0.2954], [0.5240, 0.8331, 0.2892], [0.5339, 0.8354, 0.2830], [0.5438, 0.8376, 0.2767], [0.5538, 0.8399, 0.2704], [0.5638, 0.8421, 0.2639], [0.5739, 0.8442, 0.2575], [0.5841, 0.8463, 0.2509], [0.5943, 0.8484, 0.2443], [0.6045, 0.8504, 0.2377], [0.6148, 0.8524, 0.2310], [0.6251, 0.8544, 0.2243], [0.6355, 0.8563, 0.2175], [0.6459, 0.8582, 0.2108], [0.6563, 0.8600, 0.2040], [0.6667, 0.8618, 0.1972], [0.6772, 0.8635, 0.1903], [0.6877, 0.8652, 0.1835], [0.6982, 0.8669, 0.1767], [0.7087, 0.8686, 0.1700], [0.7193, 0.8702, 0.1633], [0.7298, 0.8718, 0.1567], [0.7403, 0.8733, 0.1502], [0.7509, 0.8748, 0.1438], [0.7614, 0.8763, 0.1376], [0.7719, 0.8777, 0.1316], [0.7824, 0.8792, 0.1259], [0.7929, 0.8806, 0.1204], [0.8034, 0.8819, 0.1153], [0.8138, 0.8833, 0.1107], [0.8242, 0.8846, 0.1065], [0.8346, 0.8859, 0.1029], [0.8450, 0.8872, 0.0999], [0.8552, 0.8885, 0.0976], [0.8655, 0.8898, 0.0960], [0.8757, 0.8911, 0.0953], [0.8858, 0.8923, 0.0954], [0.8962, 0.8938, 0.0963], [0.9060, 0.8948, 0.0981], [0.9159, 0.8961, 0.1006], [0.9258, 0.8973, 0.1040], [0.9357, 0.8985, 0.1080], [0.9454, 0.8998, 0.1127], [0.9551, 0.9010, 0.1180], [0.9648, 0.9023, 0.1239], [0.9743, 0.9036, 0.1302], [0.9838, 0.9049, 0.1369], [0.9932, 0.9062, 0.1439]];
	viridis.forEach(function(elmt,i){
		gradient.addColorStop( parseFloat(i/viridis.length), "rgb("+parseFloat(elmt[0]*255)+","+parseFloat(elmt[1]*255)+","+parseFloat(elmt[2]*255)+")");
	});
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 247, 20);

	var canvas2 = document.getElementById('canvas_spectral');
	var ctx2 = canvas2.getContext('2d');
	var gradient2 = ctx2.createLinearGradient(0, 0, 247, 0);
	spectral=[[0.6196, 0.0039, 0.2588],[0.6296, 0.0220, 0.2656],[0.6396, 0.0401, 0.2723],[0.6496, 0.0582, 0.2791],[0.6595, 0.0763, 0.2859],[0.6690, 0.0877, 0.2905],[0.6784, 0.0988, 0.2951],[0.6878, 0.1099, 0.2997],[0.6973, 0.1210, 0.3043],[0.7062, 0.1296, 0.3071],[0.7151, 0.1381, 0.3097],[0.7239, 0.1465, 0.3124],[0.7328, 0.1550, 0.3151],[0.7412, 0.1623, 0.3162],[0.7495, 0.1694, 0.3172],[0.7578, 0.1766, 0.3182],[0.7662, 0.1838, 0.3192],[0.7740, 0.1904, 0.3190],[0.7817, 0.1969, 0.3187],[0.7894, 0.2034, 0.3183],[0.7972, 0.2099, 0.3180],[0.8044, 0.2161, 0.3167],[0.8115, 0.2222, 0.3153],[0.8187, 0.2284, 0.3139],[0.8258, 0.2346, 0.3124],[0.8324, 0.2407, 0.3104],[0.8389, 0.2468, 0.3082],[0.8455, 0.2529, 0.3061],[0.8520, 0.2591, 0.3039],[0.8580, 0.2653, 0.3014],[0.8640, 0.2716, 0.2988],[0.8699, 0.2779, 0.2962],[0.8758, 0.2841, 0.2936],[0.8812, 0.2907, 0.2909],[0.8866, 0.2973, 0.2882],[0.8919, 0.3039, 0.2855],[0.8972, 0.3105, 0.2828],[0.9021, 0.3174, 0.2802],[0.9068, 0.3245, 0.2778],[0.9116, 0.3316, 0.2753],[0.9163, 0.3387, 0.2728],[0.9206, 0.3462, 0.2708],[0.9248, 0.3539, 0.2690],[0.9290, 0.3615, 0.2672],[0.9332, 0.3692, 0.2653],[0.9370, 0.3773, 0.2642],[0.9406, 0.3857, 0.2635],[0.9442, 0.3941, 0.2627],[0.9478, 0.4025, 0.2620],[0.9511, 0.4113, 0.2622],[0.9541, 0.4205, 0.2630],[0.9572, 0.4297, 0.2638],[0.9603, 0.4388, 0.2646],[0.9630, 0.4484, 0.2664],[0.9655, 0.4583, 0.2689],[0.9680, 0.4681, 0.2714],[0.9705, 0.4780, 0.2739],[0.9727, 0.4881, 0.2773],[0.9746, 0.4984, 0.2812],[0.9766, 0.5086, 0.2852],[0.9785, 0.5189, 0.2891],[0.9802, 0.5292, 0.2937],[0.9816, 0.5396, 0.2987],[0.9831, 0.5500, 0.3038],[0.9845, 0.5604, 0.3088],[0.9857, 0.5708, 0.3142],[0.9867, 0.5811, 0.3199],[0.9876, 0.5914, 0.3257],[0.9886, 0.6017, 0.3314],[0.9893, 0.6119, 0.3373],[0.9899, 0.6219, 0.3433],[0.9904, 0.6319, 0.3494],[0.9910, 0.6419, 0.3554],[0.9914, 0.6517, 0.3614],[0.9916, 0.6613, 0.3673],[0.9918, 0.6708, 0.3732],[0.9921, 0.6803, 0.3791],[0.9922, 0.6896, 0.3849],[0.9923, 0.6985, 0.3905],[0.9923, 0.7074, 0.3960],[0.9924, 0.7164, 0.4016],[0.9924, 0.7251, 0.4071],[0.9924, 0.7334, 0.4125],[0.9924, 0.7417, 0.4180],[0.9923, 0.7501, 0.4234],[0.9923, 0.7583, 0.4289],[0.9923, 0.7661, 0.4346],[0.9923, 0.7739, 0.4402],[0.9923, 0.7818, 0.4459],[0.9923, 0.7895, 0.4517],[0.9924, 0.7969, 0.4580],[0.9925, 0.8044, 0.4642],[0.9926, 0.8118, 0.4704],[0.9927, 0.8191, 0.4769],[0.9930, 0.8262, 0.4841],[0.9932, 0.8333, 0.4912],[0.9935, 0.8403, 0.4983],[0.9938, 0.8473, 0.5058],[0.9942, 0.8541, 0.5142],[0.9947, 0.8609, 0.5226],[0.9952, 0.8677, 0.5310],[0.9957, 0.8744, 0.5396],[0.9964, 0.8810, 0.5495],[0.9971, 0.8875, 0.5593],[0.9978, 0.8941, 0.5692],[0.9985, 0.9006, 0.5792],[0.9989, 0.9068, 0.5899],[0.9993, 0.9130, 0.6006],[0.9997, 0.9192, 0.6112],[1.0000, 0.9253, 0.6219],[1.0000, 0.9310, 0.6324],[1.0000, 0.9367, 0.6429],[1.0000, 0.9424, 0.6535],[1.0000, 0.9480, 0.6639],[1.0000, 0.9530, 0.6733],[1.0000, 0.9580, 0.6826],[1.0000, 0.9629, 0.6920],[1.0000, 0.9679, 0.7012],[1.0000, 0.9719, 0.7085],[1.0000, 0.9760, 0.7158],[1.0000, 0.9801, 0.7230],[1.0000, 0.9841, 0.7301],[1.0000, 0.9871, 0.7343],[1.0000, 0.9901, 0.7384],[1.0000, 0.9930, 0.7425],[1.0000, 0.9960, 0.7466],[0.9993, 0.9970, 0.7467],[0.9986, 0.9980, 0.7468],[0.9978, 0.9990, 0.7469],[0.9971, 1.0000, 0.7470],[0.9952, 1.0000, 0.7432],[0.9932, 1.0000, 0.7393],[0.9912, 1.0000, 0.7355],[0.9892, 1.0000, 0.7316],[0.9865, 1.0000, 0.7252],[0.9837, 1.0000, 0.7186],[0.9809, 1.0000, 0.7121],[0.9782, 1.0000, 0.7055],[0.9746, 0.9986, 0.6976],[0.9709, 0.9972, 0.6896],[0.9673, 0.9957, 0.6816],[0.9636, 0.9942, 0.6736],[0.9591, 0.9919, 0.6654],[0.9545, 0.9894, 0.6573],[0.9499, 0.9869, 0.6491],[0.9454, 0.9844, 0.6410],[0.9400, 0.9815, 0.6338],[0.9344, 0.9784, 0.6268],[0.9289, 0.9754, 0.6199],[0.9234, 0.9723, 0.6129],[0.9171, 0.9690, 0.6079],[0.9107, 0.9655, 0.6034],[0.9042, 0.9621, 0.5989],[0.8978, 0.9586, 0.5944],[0.8906, 0.9550, 0.5924],[0.8833, 0.9513, 0.5911],[0.8760, 0.9476, 0.5898],[0.8686, 0.9440, 0.5885],[0.8607, 0.9402, 0.5890],[0.8525, 0.9364, 0.5902],[0.8444, 0.9326, 0.5914],[0.8362, 0.9288, 0.5925],[0.8275, 0.9249, 0.5949],[0.8186, 0.9211, 0.5976],[0.8097, 0.9172, 0.6004],[0.8008, 0.9134, 0.6031],[0.7914, 0.9095, 0.6064],[0.7818, 0.9057, 0.6099],[0.7722, 0.9019, 0.6134],[0.7626, 0.8981, 0.6169],[0.7525, 0.8944, 0.6204],[0.7423, 0.8907, 0.6238],[0.7321, 0.8870, 0.6272],[0.7218, 0.8834, 0.6307],[0.7113, 0.8798, 0.6336],[0.7006, 0.8763, 0.6362],[0.6899, 0.8729, 0.6388],[0.6792, 0.8694, 0.6414],[0.6684, 0.8661, 0.6431],[0.6574, 0.8628, 0.6443],[0.6464, 0.8596, 0.6454],[0.6355, 0.8563, 0.6466],[0.6245, 0.8531, 0.6471],[0.6134, 0.8499, 0.6471],[0.6023, 0.8467, 0.6471],[0.5913, 0.8435, 0.6471],[0.5802, 0.8401, 0.6468],[0.5692, 0.8367, 0.6463],[0.5582, 0.8333, 0.6457],[0.5472, 0.8298, 0.6451],[0.5363, 0.8261, 0.6445],[0.5255, 0.8222, 0.6438],[0.5146, 0.8183, 0.6432],[0.5038, 0.8143, 0.6425],[0.4932, 0.8101, 0.6421],[0.4827, 0.8054, 0.6419],[0.4722, 0.8008, 0.6417],[0.4617, 0.7962, 0.6415],[0.4514, 0.7911, 0.6417],[0.4414, 0.7855, 0.6424],[0.4314, 0.7799, 0.6432],[0.4214, 0.7743, 0.6439],[0.4116, 0.7683, 0.6452],[0.4021, 0.7615, 0.6474],[0.3927, 0.7548, 0.6495],[0.3832, 0.7481, 0.6516],[0.3739, 0.7409, 0.6542],[0.3649, 0.7331, 0.6576],[0.3559, 0.7253, 0.6610],[0.3468, 0.7175, 0.6644],[0.3380, 0.7094, 0.6680],[0.3293, 0.7007, 0.6722],[0.3207, 0.6921, 0.6763],[0.3120, 0.6834, 0.6805],[0.3035, 0.6746, 0.6847],[0.2951, 0.6653, 0.6891],[0.2868, 0.6560, 0.6936],[0.2784, 0.6467, 0.6980],[0.2702, 0.6373, 0.7024],[0.2623, 0.6277, 0.7067],[0.2544, 0.6180, 0.7109],[0.2464, 0.6083, 0.7152],[0.2387, 0.5986, 0.7193],[0.2317, 0.5887, 0.7230],[0.2246, 0.5788, 0.7266],[0.2175, 0.5690, 0.7303],[0.2108, 0.5591, 0.7337],[0.2056, 0.5492, 0.7364],[0.2003, 0.5393, 0.7391],[0.1951, 0.5294, 0.7417],[0.1905, 0.5195, 0.7441],[0.1885, 0.5098, 0.7453],[0.1866, 0.5000, 0.7466],[0.1846, 0.4902, 0.7478],[0.1834, 0.4805, 0.7488],[0.1861, 0.4710, 0.7482],[0.1887, 0.4615, 0.7477],[0.1914, 0.4520, 0.7471],[0.1946, 0.4425, 0.7463],[0.2018, 0.4333, 0.7436],[0.2090, 0.4242, 0.7408],[0.2162, 0.4151, 0.7381],[0.2237, 0.4060, 0.7351],[0.2342, 0.3973, 0.7298],[0.2448, 0.3886, 0.7245],[0.2553, 0.3800, 0.7192],[0.2660, 0.3713, 0.7138],[0.2784, 0.3632, 0.7056],[0.2908, 0.3552, 0.6974],[0.3033, 0.3471, 0.6892],[0.3157, 0.3390, 0.6809],[0.3290, 0.3317, 0.6695],[0.3422, 0.3244, 0.6581],[0.3554, 0.3171, 0.6467],[0.3686, 0.3098, 0.6353]];	
	spectral.forEach(function(elmt,i){
		gradient.addColorStop( parseFloat(i/spectral.length), "rgb("+parseFloat(elmt[0]*255)+","+parseFloat(elmt[1]*255)+","+parseFloat(elmt[2]*255)+")");
	});
	ctx2.fillStyle = gradient2;
	ctx2.fillRect(0, 0, 247, 20);

	/*var canvas = document.getElementById("canvas-day");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#CCCCCC";
	ctx.fillRect(0,0,30,20);

	var canvas = document.getElementById("canvas-rain");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#4D4DFF";
	ctx.fillRect(0,0,30,20);*/


	jQuery('#modal').on('click',function(){
		map.fire('modal', {
			content: '<h2>Instructions</h2>'+
			'<img id="instruction-img" src="https://github.com/Rafnuss-PostDoc/BMM-web/raw/master/FigureS5-1.png">'+
			'<h5>Block 1: Interactive map</h5>'+
			'<p>The main block of the website is a map with interactive visualization tools (e.g. zoom and pan). On top of this map, three layers can be displayed:</p>'+ 
			'<ul><li>The first layer illustrates bird densities in a log-color scale. This layer can display either the estimation map or a single simulation map. Users can choose using the drop-down menu (1a).</li>'+
			'<li>The second layer displays the rain in light blue. The layer can be hidden/displayed using the checkbox (1b).</li>'+
			'<li>The third layer corresponds to bird flight speed and direction, visualized by black arrows. The checkbox (1c) allows users to display/hide this layer. </li></ul>'+
			'<p>Finally, the menu (1d) provides a link to (1) documentation, (2) model description, (3) Github repository, (4) MATLAB livescript and (5) Researchgate page.</p>'+
			'<h5>Block 2: Time series</h5>'+
			'<p>The second block (hidden by default on the website) shows three time series, each in a different tab (2a): </p>'+
			'<ul><li> Densities profile shows the bird densities [bird/km2] at a specific location.</li>'+
			'<li>Sum profile shows the total number of bird [bird] over an area.</li>'+
			'<li>MRT profile shows the mean traffic rate (MTR) [bird/km/hr] perpendicular to a transect.</li></ul>'+
			'<p>A dotted vertical line (2d) appears on each time series to show the current time frame displayed on the map (Block 1). Basic interactive tools for the visualization of the time series include zooming on a specific time period (day, week or all periods) ((2b) and general zoom and auto-scale functions (2e). Each time serie can be displayed or hidden by clicking on its legend (2c).</p>'+
			'<p>The main feature of this block is the ability to visualise bird densities at any location chosen on the map. For the densities profile tab, the button with a marker icon (2f) allows users to plot a marker on the map, and displays the bird densities profile with uncertainty (quantile 10 and 90) on the time series corresponding to this location. Users can plot several markers to compare the different locations. Similarly, for the sum profile, the button with a polygon icon (2f) allows users to draw any polygon and returns the time series of the total number of birds flying over this area (Figure~\ref{fig:E3}). For the MTR tab, the flux of birds is computed on a segment (line of two points) by multiplying the bird densities  with the local flight speed perpendicular to that segment. </p>'+
			'<h5>Block 3: Time control</h5>'+
			'<p>The third block shows the time progression of the animated map with a draggable slider (3d). Users can control the time with the buttons play/pause (3b), previous (3a) and next frame (3c). The speed of animation can be changed with a slider (3e).</p>'+
			'<h2>API</h2>'+
			'<p>An API based on mangodb and NodeJS allows users to download any time serie described in Block 2. Instructions can be found on www.github.com/Rafnuss-PostDoc/BMM-web#how-to-use-the-api</p>'
		});
	});



	var drawn = new L.FeatureGroup();
	map.addLayer(drawn);

	var drawControl_density = new L.Control.Draw({
		edit: {
			featureGroup: drawn,
			remove: false,
			edit:false,
		},
		draw: {
			rectangle: false,
			polyline:false,
			circle: false,
			circlemarker: false,
			polygon:false,
			marker:{
				icon: new L.MakiMarkers.icon({icon: "circle-stroked", color: '#000000' , size: "m"})
			}
		},
	});
	var drawControl_sum = new L.Control.Draw({
		edit: {
			featureGroup: drawn,
			remove: false,
			edit:false,
		},
		draw: {
			rectangle: false,
			polyline:false,
			circle: false,
			circlemarker: false,
			marker: false,
		},
	});
	var drawControl_mtr = new L.Control.Draw({
		edit: {
			featureGroup: drawn,
			remove: false,
			edit:false,
		},
		draw: {
			rectangle: false,
			polygon:false,
			circle: false,
			circlemarker: false,
			marker: false,
		},
	});

	map.on(L.Draw.Event.CREATED, function (e) {

		e.layer.bindPopup(''+
			'<div class="modal-header">'+
			'<h4 class="modal-title"><i class="fa fa-spinner fa-pulse fa-fw"></i> Loading</h4>'+
			'</div>'+
			'<div class="modal-body">'+
			'Computing the timeserie requested. Please, wait up to a minute.'+
			'</div>');
		//'<a class="btn btn-success" href="'+link+'" target="_blank" download style="color:white;"><i class="fas fa-download"></i> Downolad data </a><br><a class="btn btn-defaul" style="color:black;" href="https://github.com/Rafnuss-PostDoc/BMM-web#how-to-use-the-api" target="_blank"><i class="fas fa-info-circle"></i> More info </a>')
		drawn.addLayer(e.layer);
		e.layer.openPopup();
		
		if ( e.layerType === 'marker') {
			var link = 'https://bmm.raphaelnussbaumer.com/api/marker_density/' + e.layer._latlng.lat +','+e.layer._latlng.lng;
		} else if ( e.layerType === 'polygon') {
			var polyPoints = e.layer.getLatLngs();
			var pts_string = polyPoints[0].map( (e) => e.lat+","+e.lng).join('/');
			var link = 'https://bmm.raphaelnussbaumer.com/api/polygon_sum/'+pts_string;
		} else if ( e.layerType === 'polyline') {
			var polyPoints = e.layer.getLatLngs();
			var pts_string = polyPoints.map( (e) => e.lat+","+e.lng).join('/');
			var link = 'https://bmm.raphaelnussbaumer.com/api/polyline_mtr/' + pts_string;
		}

		jQuery.getJSON(link, function(data){
			if (data.length < 1) {
				alert('No data for this location (Try closer to existing data =)');
				map.removeLayer(e.layer);
			} else if (e.layerType === 'marker'){					
				e.layer.setIcon(L.MakiMarkers.icon({icon: "circle-stroked", color: col[(gd_density.i_group*3-4)%10], size: "m"}));
				name = Math.round(e.layer._latlng.lat/2)*2+"°N "+Math.round(e.layer._latlng.lng/2)*2+"°NE";
				loadNewData(gd_density,[data.density.est,data.density.q10,data.density.q90],est_time,name);
			} else if (e.layerType === 'polygon'){
				e.layer.setStyle({fillColor: col[(gd_sum.i_group*3-2)%10], color:col[(gd_sum.i_group*3-2)%10]});
				name = "Polygon ("+KMBFormatter(data.area)+' km<sup>2</sup>)';
				loadNewData(gd_sum,[data.avg,data.min,data.max],sim_time,name);
			} else if (e.layerType === 'polyline') {
				e.layer.setStyle({fillColor: col[(2+gd_mtr.i_group-1)%10], color:col[(gd_mtr.i_group-1)%10]});
				name = "Polyline ("+KMBFormatter(data[1])+' km)';
				loadNewData(gd_mtr,data[0],est_time,name);
			}

			e.layer.bindPopup(''+
				'<div class="modal-header">'+
				'<h4 class="modal-title"><i class="fas fa-check"></i> Success</h4>'+
				'</div>'+
				'<div class="modal-body">'+
				'Data loaded succesfully. See the time serie in the corresponding panel below.'+
				'</div>');
		}).fail(function() {
			e.layer.bindPopup(''+
				'<div class="modal-header"'+
				'<h4 class="modal-title"><i class="fas fa-exclamation-triangle"></i> Error</h4>'+
				'</div>'+
				'<div class="modal-body">'+
				'Error when downloading the data. Please try again. If the error persists, please contact rafnuss@gmail.com. '+
				'</div>');
		});
	});

	map.on('draw:drawvertex', e => {
		const layerIds = Object.keys(e.layers._layers);
		if (layerIds.length > 1) {
			const secondVertex = e.layers._layers[layerIds[1]]._icon;
			requestAnimationFrame(() => secondVertex.click());
		}

	});

	map.addControl(drawControl_density).addControl(drawControl_sum).addControl(drawControl_mtr);
	L.DomUtil.get('mapbuttons_density_div').appendChild(drawControl_density.getContainer());
	L.DomUtil.get('mapbuttons_sum_div').appendChild(drawControl_sum.getContainer());
	L.DomUtil.get('mapbuttons_mtr_div').appendChild(drawControl_mtr.getContainer());




	d3colors = Plotly.d3.scale.category10();
	col=[]
	for (var i = 0; i < 11; i += 1) {
		col.push(d3colors(i));
	}


	gd_style ={
		width: '100%',
		'margin-left': '0px',
		height: '290px',
		'max-height': 'calc( 100vh - 105px )',
		'margin-top': '0px'
	};

	gd_density = document.getElementById('plot_density');
	gd_sum = document.getElementById('plot_sum'); 
	gd_mtr = document.getElementById('plot_mtr'); 
	Plotly.d3.select(gd_density).style(gd_style).node();
	Plotly.d3.select(gd_sum).style(gd_style).node();
	Plotly.d3.select(gd_mtr).style(gd_style).node();
	gd_density.i_group=1;
	gd_sum.i_group=1;
	gd_mtr.i_group=1;

	jQuery.getJSON("https://bmm.raphaelnussbaumer.com/data/API/exportEst_time.json",function(data){
		est_time=data[0];

		jQuery.getJSON("https://bmm.raphaelnussbaumer.com/data/API/exportSim_time.json",function(data){

			sim_time=data[0];
			sim_time_d = sim_time.map(x=> new Date(x));

			var layout = {
				autosize:true,
				margin: {
					l: 35,
					r: 35,
					b: 15,
					t: 0,
				},
				//title:"Density [bird/km<sup>2</sup>]",
				showlegend: true,
				legend: {"orientation": "h", x: 0,y: 1},
				xaxis: {
					//autorange: true,
					range: [est_time[0], est_time[est_time.length - 1] ],
					rangeselector: {buttons: [
						{
							count: 1,
							label: '1d',
							step: 'day',
							stepmode: 'backward'
						},
						{
							count: 7,
							label: '1w',
							step: 'day',
							stepmode: 'backward'
						},
						{step: 'all'}
						]
					},
					//rangeslider: {range: [d_date[0], d_date[d_date.length - 1]]},
					type: 'date'
				},
				yaxis: {
					autorange: true,
					//range: [Math.min(...DG_all.est), Math.max(...DG_all.est)],
					type: 'linear',
				},
				shapes: [  {
					type: "line",
					x0: est_time[0],
					x1: est_time[0],
					y0: 0,
					y1: 1,
					yref: "paper",
					line: {
						color: '#7F7F7F',
						width: 2,
						dash: 'dot'
					},
				}]
			};

			Plotly.newPlot(gd_density, [], layout,  {modeBarButtonsToRemove: ['toImage','sendDataToCloud','hoverCompareCartesian','hoverClosestCartesian','hoverCompareCartesian','resetScale2d','zoomIn2d','zoomOut2d']});
			Plotly.newPlot(gd_sum, [], layout,  {modeBarButtonsToRemove: ['toImage','sendDataToCloud','hoverCompareCartesian','hoverClosestCartesian','hoverCompareCartesian','resetScale2d','zoomIn2d','zoomOut2d']});
			Plotly.newPlot(gd_mtr, [], layout,  {modeBarButtonsToRemove: ['toImage','sendDataToCloud','hoverCompareCartesian','hoverClosestCartesian','hoverCompareCartesian','resetScale2d','zoomIn2d','zoomOut2d']});

			// Update figure with time
			map.timeDimension.on('timeload', function(data) {
				var date = new Date(map.timeDimension.getCurrentTime());
				date_str = date.toISOString().replace('T',' ').slice(0,16);
				Plotly.relayout(gd_density, {'shapes[0].x0':date_str,'shapes[0].x1':date_str})
				Plotly.relayout(gd_sum, {'shapes[0].x0':date_str,'shapes[0].x1':date_str})
				Plotly.relayout(gd_mtr, {'shapes[0].x0':date_str,'shapes[0].x1':date_str})
				i=0;
				while(sim_time_d[i]<date){
					i=i+1;
				}
				
				gauge.refresh(gd_sum.data[1].y[i]/1000000);
				if (gd_sum.data[1].y[i]==0){
					//jQuery('#tt-nb').html('0')
					jQuery('#tt-nb-div').removeClass('night').addClass('day')
					jQuery('#tt-sun').removeClass('fa-moon').addClass('fa-sun')		
					jQuery('#gauge > svg > text:nth-child(5) > tspan').removeClass('night').addClass('day')
				} else{
					// jQuery('#tt-nb').html(KMBFormatter(parseFloat(gd_sum.data[1].y[id])))
					jQuery('#tt-nb-div').removeClass('day').addClass('night')
					jQuery('#tt-sun').removeClass('fa-sun').addClass('fa-moon')
					jQuery('#gauge > svg > text:nth-child(5) > tspan').removeClass('day').addClass('night')
				}
				
			});

			setTimeout(function (){
				Plotly.Plots.resize(gd_density);
				Plotly.Plots.resize(gd_mtr);
				jQuery('[data-title="Toggle Spike Lines"]').remove();
				jQuery('[data-title="Produced with Plotly"]').remove()
				jQuery('[data-title="Lasso Select"]').remove()
				jQuery('[data-title="Box Select"]').remove()
			}, 2000);


			jQuery.getJSON('https://bmm.raphaelnussbaumer.com/data/API/global.json', function(data){
				var name = "Total Sum ("+KMBFormatter(data.area)+' km<sup>2</sup>)';
				loadNewData(gd_sum,[data.avg,data.min,data.max],sim_time,name)

				var name = "Total Average ("+KMBFormatter(data.area)+' km<sup>2</sup>)';
				var d = data.avg.map( (e) => e/data.area,sim_time);
				loadNewData(gd_density,d,sim_time,name)
			})
		});
	});


	window.onresize = function() {
		Plotly.Plots.resize(gd_density);
		Plotly.Plots.resize(gd_sum);
		Plotly.Plots.resize(gd_mtr);
	};

	jQuery('.nav-item a').on('shown.bs.tab', function(event){
		Plotly.Plots.resize(gd_density);
		Plotly.Plots.resize(gd_sum);
		Plotly.Plots.resize(gd_mtr);
	});

	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
	})
});














function KMBFormatter(num) {
	if (num > 999999999 ){
		num = (num/1000000000).toFixed(1) + 'B'
	} else if (num > 999999 ){
		num = (num/1000000).toFixed(1) + 'M'
	} else if(num > 999){
		num = (num/1000).toFixed(1) + 'K'
	} else {
		num = num.toFixed(1)
	}
	return num
}


function loadNewData(gd,data,time,name){
	if (data.length==3){
		Plotly.addTraces(gd,{
			x: time, 
			y: data[1], 
			line: {width: 0}, 
			marker: {color: "444"}, 
			mode: "lines", 
			type: "scatter",
			legendgroup: 'group'+gd.i_group,
			showlegend:false,
			hoverinfo:'none'
		});

		Plotly.addTraces(gd,{
			x: time, 
			y: data[0], 
			fill: "tonexty", 
			fillcolor: "rgba(68, 68, 68, 0.3)", 
			//line: {color: "rgb(31, 119, 180)"}, 
			mode: "lines", 
			name: name,
			type: "scatter",
			legendgroup: 'group'+gd.i_group,
			hoverinfo:'none'
		});

		Plotly.addTraces(gd,{
			x: time, 
			y: data[2], 
			fill: "tonexty", 
			fillcolor: "rgba(68, 68, 68, 0.3)", 
			line: {width: 0}, 
			marker: {color: "444"}, 
			mode: "lines", 
			type: "scatter",
			showlegend:false,
			legendgroup: 'group'+gd.i_group,
			hoverinfo:'none',
		});
	} else {
		Plotly.addTraces(gd,{
			x: time, 
			y: data, 
			mode: "lines", 
			name: name,
			type: "scatter",
			legendgroup: 'group'+gd.i_group,
			hoverinfo:'none'
		});
	}
	gd.i_group +=1; 
}



L.MakiMarkers.accessToken = "pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g";




















/* TIMEDIMENSION*/
L.TimeDimension.Layer.ImageOverlay = L.TimeDimension.Layer.extend({

	initialize: function(layer, options) {
		L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
		this._layers = {};
		this._defaultTime = 0;
		this._timeCacheBackward = this.options.cacheBackward || this.options.cache || 0;
		this._timeCacheForward = this.options.cacheForward || this.options.cache || 0;
		this._getUrlFunction = this.options.getUrlFunction;

		this._baseLayer.on('load', (function() {
			this._baseLayer.setLoaded(true);
			this.fire('timeload', { 
				time: this._defaultTime
			});
		}).bind(this));
	},

	eachLayer: function(method, context) {
		for (var prop in this._layers) {
			if (this._layers.hasOwnProperty(prop)) {
				method.call(context, this._layers[prop]);
			}
		}
		return L.TimeDimension.Layer.prototype.eachLayer.call(this, method, context);
	},

	_onNewTimeLoading: function(ev) {
		var layer = this._getLayerForTime(ev.time);
		if (!this._map.hasLayer(layer)) {
			this._map.addLayer(layer);
		}
	},

	isReady: function(time) {
		var layer = this._getLayerForTime(time);
		return layer.isLoaded();
	},

	_update: function() {
		if (!this._map)
			return;
		var time = map.timeDimension.getCurrentTime();
		var layer = this._getLayerForTime(time);
		if (this._currentLayer == null) {
			this._currentLayer = layer;
		}
		if (!this._map.hasLayer(layer)) {
			this._map.addLayer(layer);
		} else {
			this._showLayer(layer, time);
		}
	},

	_showLayer: function(layer, time) {
		if (this._currentLayer && this._currentLayer !== layer) {
			this._currentLayer.hide();
			this._map.removeLayer(this._currentLayer);
		}
		layer.show();
		if (this._currentLayer && this._currentLayer === layer) {
			return;
		}
		this._currentLayer = layer;
		// Cache management
		var times = this._getLoadedTimes();
		var strTime = String(time);
		var index = times.indexOf(strTime);
		var remove = [];
		// remove times before current time
		if (this._timeCacheBackward > -1) {
			var objectsToRemove = index - this._timeCacheBackward;
			if (objectsToRemove > 0) {
				remove = times.splice(0, objectsToRemove);
				this._removeLayers(remove);
			}
		}
		if (this._timeCacheForward > -1) {
			index = times.indexOf(strTime);
			var objectsToRemove = times.length - index - this._timeCacheForward - 1;
			if (objectsToRemove > 0) {
				remove = times.splice(index + this._timeCacheForward + 1, objectsToRemove);
				this._removeLayers(remove);
			}
		}
	},

	_getLayerForTime: function(time) {
		if (time == 0 || time == this._defaultTime) {
			return this._baseLayer;
		}
		if (this._layers.hasOwnProperty(time)) {
			return this._layers[time];
		}
		var url = this._getUrlFunction(this._baseLayer.getURL(), time);
		imageBounds = this._baseLayer._bounds;

		var newLayer = L.imageOverlay(url, imageBounds, this._baseLayer.options);
		this._layers[time] = newLayer;
		newLayer.on('load', (function(layer, time) {
			layer.setLoaded(true);
			if (map.timeDimension && time == map.timeDimension.getCurrentTime() && !map.timeDimension.isLoading()) {
				this._showLayer(layer, time);
			}
			this.fire('timeload', {
				time: time
			});
		}).bind(this, newLayer, time));

		// Hack to hide the layer when added to the map.
		// It will be shown when timeload event is fired from the map (after all layers are loaded)
		newLayer.onAdd = (function(map) {
			Object.getPrototypeOf(this).onAdd.call(this, map);
			this.hide();
		}).bind(newLayer);
		return newLayer;
	},

	_getLoadedTimes: function() {
		var result = [];
		for (var prop in this._layers) {
			if (this._layers.hasOwnProperty(prop)) {
				result.push(prop);
			}
		}
		return result.sort();
	},

	_removeLayers: function(times) {
		for (var i = 0, l = times.length; i < l; i++) {
			this._map.removeLayer(this._layers[times[i]]);
			delete this._layers[times[i]];
		}
	},
});

L.timeDimension.layer.imageOverlay = function(layer, options) {
	return new L.TimeDimension.Layer.ImageOverlay(layer, options);
};

L.ImageOverlay.include({
	_visible: true,
	_loaded: false,

	_originalUpdate: L.imageOverlay.prototype._update,

	_update: function() {
		if (!this._visible && this._loaded) {
			return;
		}
		this._originalUpdate();
	},

	setLoaded: function(loaded) {
		this._loaded = loaded;
	},

	isLoaded: function() {
		return this._loaded;
	},

	hide: function() {
		this._visible = false;
		if (this._image && this._image.style)
			this._image.style.visibility = 'hidden';
	},

	show: function() {
		this._visible = true;
		if (this._image && this._image.style)
			this._image.style.visibility = 'visible';
	},

	getURL: function() {
		return this._url;
	},
});


