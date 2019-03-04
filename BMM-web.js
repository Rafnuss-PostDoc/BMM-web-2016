var frame = [[43 , -5], [68, 30]];
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


function loadNewData(gd,data,name){
	if (data.length==3){
		Plotly.addTraces(gd,{
			x: DG_time, 
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
			x: DG_time, 
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
			x: DG_time, 
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
			x: DG_time, 
			y: data, 
			mode: "lines", 
			name: name,
			type: "scatter",
			legendgroup: 'group'+gd.i_group,
			hoverinfo:'none'
		});
	}
	gd.i_group+=1;
}



L.MakiMarkers.accessToken = "pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g";


jQuery(document).ready(function() {

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
		div.innerHTML = '	<ul class="nav nav-tabs" id="myTab" role="tablist"><li class="nav-item">\
		<a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true"><i class="fa fa-chevron-down"></i></a>\
		</li><li class="nav-item">\
		<a class="nav-link" id="density-tab" data-toggle="tab" href="#tab_density" role="tab" aria-controls="tab_density" aria-selected="false">Density Profile [bird/km<sup>2</sup>]</a>\
		</li><li class="nav-item">\
		<a class="nav-link" id="sum-tab" data-toggle="tab" href="#tab_sum" role="tab" aria-controls="tab_sum" aria-selected="false">Sum Profile [bird]</a>\
		</li><li class="nav-item">\
		<a class="nav-link" id="mtr-tab" data-toggle="tab" href="#tab_mtr" role="tab" aria-controls="tab_mtr" aria-selected="false">MTR Profile [bird/km/hr]</a>\
		</li></ul>\
		<div class="tab-content" id="myTabContent">\
		<div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab"></div>\
		<div class="tab-pane fade" id="tab_density" role="tabpanel" aria-labelledby="density-tab">\
		<div id="plot_density"></div>\
		<div id="mapbuttons_density_div" class="leaflet-bar leaflet-control mapbuttons_div"></div>\
		</div>\
		<div class="tab-pane fade" id="tab_sum" role="tabpanel" aria-labelledby="sum-tab">\
		<div id="plot_sum"></div>\
		<div id="mapbuttons_sum_div" class="leaflet-bar leaflet-control mapbuttons_div"></div>\
		</div>\
		<div class="tab-pane fade" id="tab_mtr" role="tabpanel" aria-labelledby="mtr-tab">\
		<div id="plot_mtr"></div>\
		<div id="mapbuttons_mtr_div" class="leaflet-bar leaflet-control mapbuttons_div"></div>\
		</div>\
		</div>';
		//div.innerHTML = '<a data-toggle="collapse" href="#collapseExample" aria-expanded="false" aria-controls="collapseExample" class="btn form-control" id="btn-timeserie-toggle">Time Series <i class="fa fa-chevron-up pull-up"></i><i class="fa fa-chevron-down pull-up"></i></a>';
		//<span id="new-ts">Query the map with point, transect of area: </span>\

		div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
		return div
	};
	figure.addTo(map);


	figure.getContainer().addEventListener('mouseover', function () {
		map.dragging.disable();
	});
	figure.getContainer().addEventListener('mouseout', function () {
		map.dragging.enable();
	});

	var legend = L.control({position: 'topright'});
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		div.innerHTML = '<div class="form-group" id="select-map">\
		<select class="form-control" id="sel1">\
		<option value=\'{\"folderDens\":\"Density_estimationMap_ImageOverlay/\",\"folderFlight\":\"Quiver_est/\",\"minval\":\"0\",\"maxval\":\"2\",\"titleval\":\"Bird Density [Log bird/km<sup>2</sup>]\"}\'>Estimation</option>\
		<option disable value=\'{\"folderDens\":\"Density_simulationMap_ImageOverlay/\",\"folderFlight\":\"Quiver_est/\",\"minval\":\"0\",\"maxval\":\"3\",\"titleval\":\"Bird Density [Log bird/km<sup>2</sup>]\"}\' >Simulation</option>\
		<option disable value=\'{\"folderDens\":\"SinkSource_estimationMap_ImageOverlay/\",\"folderFlight\":\"Quiver_est/\",\"minval\":\"-10\",\"maxval\":\"10\",\"titleval\":\"Bird Density [bird/km<sup>2</sup>/15min]\"}\'>Sink/Source</option>\
		</select>\
		</div>';

		div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;

		div.innerHTML += '<div id="canvas-div" class="form-control">\
		<p id="canvas-title">Bird Density [Log bird/km<sup>2</sup>]</p>\
		<canvas id="canvas" width="247" height="20" ></canvas>\
		<p id="canvas-range"><span id="canvas-min">0</span><span id="canvas-max">2</span></p>\
		</div>';

		div.innerHTML += '<div class="form-control container-fluid" id="layer-div"><div class="row">'+
		/*<div class="col-sm-6"><canvas id="canvas-day" width="30" height="20" ></canvas> Day</div>*/
		'<div class="col-sm-12"><canvas id="canvas-rain" width="30" height="20" ></canvas> Rain (>0.01mm/hr)</div>\
		</div><div class="row">'+
		/*'<div class="col-sm-6"><div class="slidecontainer"><input type="range" min="1" max="100" value="30" class="slider" id="opacity-day"></div></div>*/
		'<div class="col-sm-12">\
		<div class="slidecontainer"><input type="range" min="1" max="100" value="80" class="slider" id="opacity-rain"></div>\
		</div></div>\
		<div class="row"><div class="col-sm-12">\
		<div class="checkbox"><label class="checkbox-inline"><input type="checkbox" checked id="checkbox1">Flight quiver</label></div>\
		</div></div>';

		div.innerHTML += '<div id="learnmore-div" class="form-control">\
		<a role="button" class="btn btn-default btn-sm" href="https://Rafnuss-PostDoc.github.io/BMM/" target="_blank"><i class="fas fa-external-link-alt"></i></a>\
		<a role="button" class="btn btn-default btn-sm" href="https://github.com/Rafnuss-PostDoc/BMM" target="_blank"><i class="fab fa-github"></i></a>\
		<a role="button" class="btn btn-default btn-sm" href="https://Rafnuss-PostDoc.github.io/BMM/html/Density_modelInf_crossValid" target="_blank"><img width="27" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Matlab_Logo.png/267px-Matlab_Logo.png"></a>\
		<a role="button" class="btn btn-default btn-sm" href="https://github.com/Rafnuss-PostDoc/BMM" target="_blank"><i class="fas fa-download"></i></a>\
		</div>';
		return div;
	};
	legend.addTo(map);

	legend.getContainer().addEventListener('mouseover', function () {
		map.dragging.disable();
	});
	legend.getContainer().addEventListener('mouseout', function () {
		map.dragging.enable();
	});


	jQuery('#checkbox1').change(function() {
		if(jQuery(this).is(":checked")) {
			imageLayerFlight.setOpacity(100)
		} else {
			imageLayerFlight.setOpacity(0)
		}
	});

	jQuery('#sel1').change(function(){
		var sel = jQuery.parseJSON(this.value);
		folderDens = sel.folderDens;
		folderFlight = sel.folderFlight;
		jQuery('#canvas-min').html(sel.minval)
		jQuery('#canvas-max').html(sel.maxval)
		jQuery('#canvas-title').html(sel.titleval)
	});

	/*var sliderDay = document.getElementById("opacity-day");
	sliderDay.oninput = function() {
		imageLayerDay.setOpacity(this.value/100);
	}*/
	var sliderRain = document.getElementById("opacity-rain");
	sliderRain.oninput = function() {
		ImageTimeLayerRain.setOpacity(this.value/100);
	}

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var gradient = ctx.createLinearGradient(0, 0, 247, 0);
	viridis=[[0.2670, 0.0049, 0.3294], [0.2685, 0.0096, 0.3354], [0.2700, 0.0147, 0.3414], [0.2713, 0.0200, 0.3473], [0.2726, 0.0257, 0.3532], [0.2738, 0.0316, 0.3590], [0.2750, 0.0379, 0.3647], [0.2760, 0.0443, 0.3703], [0.2770, 0.0505, 0.3759], [0.2780, 0.0565, 0.3814], [0.2788, 0.0624, 0.3868], [0.2796, 0.0681, 0.3921], [0.2803, 0.0737, 0.3974], [0.2809, 0.0792, 0.4026], [0.2815, 0.0846, 0.4077], [0.2819, 0.0900, 0.4127], [0.2823, 0.0953, 0.4176], [0.2827, 0.1005, 0.4225], [0.2829, 0.1058, 0.4272], [0.2831, 0.1109, 0.4319], [0.2832, 0.1161, 0.4365], [0.2832, 0.1212, 0.4409], [0.2832, 0.1263, 0.4453], [0.2831, 0.1313, 0.4496], [0.2829, 0.1364, 0.4538], [0.2826, 0.1414, 0.4579], [0.2822, 0.1464, 0.4619], [0.2818, 0.1514, 0.4658], [0.2813, 0.1564, 0.4696], [0.2808, 0.1613, 0.4733], [0.2802, 0.1663, 0.4769], [0.2795, 0.1712, 0.4804], [0.2787, 0.1761, 0.4838], [0.2779, 0.1810, 0.4871], [0.2770, 0.1859, 0.4903], [0.2760, 0.1907, 0.4934], [0.2750, 0.1956, 0.4964], [0.2740, 0.2004, 0.4993], [0.2728, 0.2052, 0.5021], [0.2716, 0.2100, 0.5048], [0.2704, 0.2148, 0.5074], [0.2691, 0.2196, 0.5100], [0.2677, 0.2243, 0.5124], [0.2663, 0.2291, 0.5147], [0.2649, 0.2338, 0.5170], [0.2634, 0.2385, 0.5191], [0.2618, 0.2431, 0.5212], [0.2603, 0.2478, 0.5232], [0.2586, 0.2524, 0.5251], [0.2560, 0.2560, 0.5269], [0.2553, 0.2616, 0.5286], [0.2536, 0.2662, 0.5303], [0.2518, 0.2707, 0.5319], [0.2501, 0.2752, 0.5334], [0.2482, 0.2797, 0.5349], [0.2464, 0.2842, 0.5362], [0.2446, 0.2886, 0.5375], [0.2427, 0.2931, 0.5388], [0.2408, 0.2975, 0.5400], [0.2389, 0.3019, 0.5411], [0.2370, 0.3062, 0.5422], [0.2351, 0.3106, 0.5432], [0.2331, 0.3149, 0.5441], [0.2312, 0.3192, 0.5451], [0.2293, 0.3234, 0.5459], [0.2273, 0.3277, 0.5467], [0.2254, 0.3319, 0.5475], [0.2234, 0.3361, 0.5482], [0.2215, 0.3403, 0.5489], [0.2195, 0.3444, 0.5496], [0.2176, 0.3486, 0.5502], [0.2157, 0.3527, 0.5508], [0.2138, 0.3568, 0.5513], [0.2119, 0.3608, 0.5519], [0.2100, 0.3649, 0.5523], [0.2081, 0.3689, 0.5528], [0.2062, 0.3729, 0.5532], [0.2043, 0.3769, 0.5537], [0.2025, 0.3809, 0.5540], [0.2007, 0.3849, 0.5544], [0.1989, 0.3888, 0.5547], [0.1971, 0.3928, 0.5551], [0.1953, 0.3967, 0.5554], [0.1935, 0.4006, 0.5557], [0.1918, 0.4045, 0.5559], [0.1901, 0.4083, 0.5562], [0.1883, 0.4122, 0.5564], [0.1867, 0.4161, 0.5566], [0.1850, 0.4199, 0.5568], [0.1833, 0.4237, 0.5570], [0.1817, 0.4275, 0.5572], [0.1801, 0.4313, 0.5573], [0.1784, 0.4351, 0.5575], [0.1768, 0.4389, 0.5576], [0.1753, 0.4427, 0.5577], [0.1737, 0.4464, 0.5578], [0.1721, 0.4502, 0.5579], [0.1706, 0.4540, 0.5580], [0.1691, 0.4577, 0.5581], [0.1675, 0.4614, 0.5581], [0.1660, 0.4652, 0.5581], [0.1645, 0.4689, 0.5581], [0.1630, 0.4726, 0.5581], [0.1615, 0.4763, 0.5581], [0.1601, 0.4801, 0.5581], [0.1586, 0.4838, 0.5580], [0.1571, 0.4875, 0.5580], [0.1557, 0.4912, 0.5579], [0.1542, 0.4949, 0.5578], [0.1527, 0.4986, 0.5577], [0.1513, 0.5023, 0.5575], [0.1498, 0.5060, 0.5574], [0.1484, 0.5097, 0.5572], [0.1470, 0.5134, 0.5569], [0.1455, 0.5171, 0.5567], [0.1441, 0.5208, 0.5564], [0.1427, 0.5245, 0.5562], [0.1413, 0.5281, 0.5558], [0.1399, 0.5318, 0.5555], [0.1385, 0.5355, 0.5551], [0.1371, 0.5392, 0.5547], [0.1358, 0.5429, 0.5543], [0.1344, 0.5466, 0.5538], [0.1331, 0.5503, 0.5533], [0.1318, 0.5544, 0.5532], [0.1306, 0.5577, 0.5522], [0.1293, 0.5614, 0.5516], [0.1282, 0.5651, 0.5509], [0.1270, 0.5688, 0.5502], [0.1259, 0.5725, 0.5495], [0.1249, 0.5762, 0.5487], [0.1239, 0.5799, 0.5479], [0.1230, 0.5836, 0.5470], [0.1222, 0.5873, 0.5461], [0.1215, 0.5910, 0.5451], [0.1208, 0.5947, 0.5441], [0.1203, 0.5984, 0.5430], [0.1199, 0.6021, 0.5419], [0.1196, 0.6058, 0.5408], [0.1195, 0.6095, 0.5395], [0.1195, 0.6132, 0.5383], [0.1196, 0.6169, 0.5370], [0.1199, 0.6205, 0.5356], [0.1204, 0.6242, 0.5341], [0.1211, 0.6279, 0.5326], [0.1219, 0.6316, 0.5311], [0.1230, 0.6353, 0.5295], [0.1242, 0.6389, 0.5278], [0.1257, 0.6426, 0.5260], [0.1274, 0.6462, 0.5242], [0.1293, 0.6499, 0.5224], [0.1314, 0.6535, 0.5205], [0.1337, 0.6572, 0.5185], [0.1363, 0.6608, 0.5164], [0.1391, 0.6644, 0.5143], [0.1421, 0.6681, 0.5121], [0.1453, 0.6717, 0.5098], [0.1488, 0.6753, 0.5075], [0.1525, 0.6789, 0.5051], [0.1564, 0.6824, 0.5026], [0.1605, 0.6860, 0.5001], [0.1648, 0.6896, 0.4975], [0.1693, 0.6931, 0.4948], [0.1740, 0.6966, 0.4920], [0.1789, 0.7002, 0.4892], [0.1840, 0.7037, 0.4863], [0.1892, 0.7072, 0.4833], [0.1947, 0.7106, 0.4803], [0.2003, 0.7141, 0.4771], [0.2061, 0.7176, 0.4739], [0.2120, 0.7210, 0.4707], [0.2181, 0.7244, 0.4673], [0.2244, 0.7278, 0.4639], [0.2308, 0.7312, 0.4604], [0.2373, 0.7345, 0.4568], [0.2440, 0.7379, 0.4531], [0.2508, 0.7412, 0.4494], [0.2577, 0.7445, 0.4456], [0.2648, 0.7478, 0.4417], [0.2720, 0.7510, 0.4378], [0.2793, 0.7543, 0.4337], [0.2868, 0.7575, 0.4296], [0.2943, 0.7607, 0.4254], [0.3020, 0.7638, 0.4211], [0.3098, 0.7670, 0.4168], [0.3177, 0.7701, 0.4123], [0.3257, 0.7732, 0.4078], [0.3337, 0.7762, 0.4032], [0.3419, 0.7792, 0.3986], [0.3502, 0.7822, 0.3938], [0.3586, 0.7852, 0.3890], [0.3671, 0.7882, 0.3841], [0.3757, 0.7911, 0.3791], [0.3843, 0.7940, 0.3741], [0.3931, 0.7968, 0.3690], [0.4019, 0.7996, 0.3638], [0.4108, 0.8024, 0.3585], [0.4199, 0.8052, 0.3531], [0.4289, 0.8079, 0.3477], [0.4381, 0.8106, 0.3422], [0.4474, 0.8132, 0.3366], [0.4567, 0.8158, 0.3309], [0.4661, 0.8184, 0.3252], [0.4756, 0.8209, 0.3194], [0.4851, 0.8234, 0.3135], [0.4947, 0.8259, 0.3075], [0.5044, 0.8283, 0.3015], [0.5142, 0.8307, 0.2954], [0.5240, 0.8331, 0.2892], [0.5339, 0.8354, 0.2830], [0.5438, 0.8376, 0.2767], [0.5538, 0.8399, 0.2704], [0.5638, 0.8421, 0.2639], [0.5739, 0.8442, 0.2575], [0.5841, 0.8463, 0.2509], [0.5943, 0.8484, 0.2443], [0.6045, 0.8504, 0.2377], [0.6148, 0.8524, 0.2310], [0.6251, 0.8544, 0.2243], [0.6355, 0.8563, 0.2175], [0.6459, 0.8582, 0.2108], [0.6563, 0.8600, 0.2040], [0.6667, 0.8618, 0.1972], [0.6772, 0.8635, 0.1903], [0.6877, 0.8652, 0.1835], [0.6982, 0.8669, 0.1767], [0.7087, 0.8686, 0.1700], [0.7193, 0.8702, 0.1633], [0.7298, 0.8718, 0.1567], [0.7403, 0.8733, 0.1502], [0.7509, 0.8748, 0.1438], [0.7614, 0.8763, 0.1376], [0.7719, 0.8777, 0.1316], [0.7824, 0.8792, 0.1259], [0.7929, 0.8806, 0.1204], [0.8034, 0.8819, 0.1153], [0.8138, 0.8833, 0.1107], [0.8242, 0.8846, 0.1065], [0.8346, 0.8859, 0.1029], [0.8450, 0.8872, 0.0999], [0.8552, 0.8885, 0.0976], [0.8655, 0.8898, 0.0960], [0.8757, 0.8911, 0.0953], [0.8858, 0.8923, 0.0954], [0.8962, 0.8938, 0.0963], [0.9060, 0.8948, 0.0981], [0.9159, 0.8961, 0.1006], [0.9258, 0.8973, 0.1040], [0.9357, 0.8985, 0.1080], [0.9454, 0.8998, 0.1127], [0.9551, 0.9010, 0.1180], [0.9648, 0.9023, 0.1239], [0.9743, 0.9036, 0.1302], [0.9838, 0.9049, 0.1369], [0.9932, 0.9062, 0.1439]];
	viridis.forEach(function(elmt,i){
		gradient.addColorStop( parseFloat(i/viridis.length), "rgb("+parseFloat(elmt[0]*255)+","+parseFloat(elmt[1]*255)+","+parseFloat(elmt[2]*255)+")");
	})
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 247, 20);

	/*var canvas = document.getElementById("canvas-day");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#CCCCCC";
	ctx.fillRect(0,0,30,20);*/

	var canvas = document.getElementById("canvas-rain");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#4D4DFF";
	ctx.fillRect(0,0,30,20);

});



jQuery(window).bind("load", function() {
	/* PLOT*/

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

	gd_density = Plotly.d3.select('#plot_density').style(gd_style).node();
	gd_sum = Plotly.d3.select('#plot_sum').style(gd_style).node();
	gd_mtr = Plotly.d3.select('#plot_mtr').style(gd_style).node();
	gd_density.i_group=0;
	gd_sum.i_group=0;
	gd_mtr.i_group=1;

	jQuery.getJSON("https://bmm.raphaelnussbaumer.com/data/exportGrid_time.json",function(data){
		
		DG_time=data[0];

		var traceDate = {
			type: "scatter",
			name: 'Time',
			x: [ DG_time[0], DG_time[0] ],
			y: [0, 100],
			line: {color: '#7F7F7F'},
			showlegend:false,
			hoverinfo:'none',
		};

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
				range: [DG_time[0], DG_time[DG_time.length - 1] ],
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
			}
		};

		Plotly.newPlot(gd_density, [traceDate], layout,  {modeBarButtonsToRemove: ['toImage','sendDataToCloud','hoverCompareCartesian','hoverClosestCartesian','hoverCompareCartesian','resetScale2d','zoomIn2d','zoomOut2d']});
		Plotly.newPlot(gd_sum, [traceDate], layout,  {modeBarButtonsToRemove: ['toImage','sendDataToCloud','hoverCompareCartesian','hoverClosestCartesian','hoverCompareCartesian','resetScale2d','zoomIn2d','zoomOut2d']});
		Plotly.newPlot(gd_mtr, [traceDate], layout,  {modeBarButtonsToRemove: ['toImage','sendDataToCloud','hoverCompareCartesian','hoverClosestCartesian','hoverCompareCartesian','resetScale2d','zoomIn2d','zoomOut2d']});

		// Update figure with time
		map.timeDimension.on('timeload', function(data) {
			var date = new Date(map.timeDimension.getCurrentTime());
			date_str = date.toISOString().replace('T',' ').slice(0,16);
			Plotly.restyle(gd_density, {x: [[date_str, date_str]]} ,0)
			Plotly.restyle(gd_sum, {x: [[date_str, date_str]]} ,0)
			Plotly.restyle(gd_mtr, {x: [[date_str, date_str]]} ,0)
			//gd.data[0].x=[date_str, date_str];
		});

		setTimeout(function (){
			Plotly.Plots.resize(gd_density);
			Plotly.Plots.resize(gd_mtr);
			jQuery('[data-title="Toggle Spike Lines"]').remove();
			jQuery('[data-title="Produced with Plotly"]').remove()
			jQuery('[data-title="Lasso Select"]').remove()
			jQuery('[data-title="Box Select"]').remove()
		}, 2000);


		jQuery.getJSON('https://bmm.raphaelnussbaumer.com/api/polygon_sum/69,-7/69,32/40,32/40,-7', function(data){
			var name = "Total Sum ("+KMBFormatter(data[1])+' km<sup>2</sup>)';
			loadNewData(gd_sum,data[0],name)

			var name = "Total Average ("+KMBFormatter(data[1])+' km<sup>2</sup>)';
			var d = data[0].map( (e) => e/data[1]);
			loadNewData(gd_density,d,name)
		})

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
		if ( e.layerType === 'marker') {
			jQuery.getJSON('https://bmm.raphaelnussbaumer.com/api/marker_density/' + e.layer._latlng.lat +','+e.layer._latlng.lng, function(data){
				e.layer.setIcon(L.MakiMarkers.icon({icon: "circle-stroked", color: col[(gd_density.i_group*3)%10], size: "m"}));
				name = Math.round(e.layer._latlng.lat/2)*2+"°N "+Math.round(e.layer._latlng.lng/2)*2+"°NE";
				loadNewData(gd_density,[data.density.est,data.density.q10,data.density.q90],name)
			})
		} else if ( e.layerType === 'polygon') {
			polyPoints = e.layer.getLatLngs();
			var pts_string = polyPoints[0].map( (e) => e.lat+","+e.lng).join('/');
			jQuery.getJSON('https://bmm.raphaelnussbaumer.com/api/polygon_sum/'+pts_string , function(data){
				e.layer.setStyle({fillColor: col[(gd_sum.i_group+1)%10], color:col[(gd_sum.i_group+1)%10]});
				name = "Polygon ("+KMBFormatter(data[1])+' km<sup>2</sup>)';
				loadNewData(gd_sum,data[0],name)
			})
		} else if ( e.layerType === 'polyline') {
			polyPoints = e.layer.getLatLngs();
			var pts_string = polyPoints.map( (e) => e.lat+","+e.lng).join('/');
			jQuery.getJSON('https://bmm.raphaelnussbaumer.com/api/polyline_mtr/' + pts_string, function(data){
				e.layer.setStyle({fillColor: col[(2+gd_mtr.i_group*3)%10], color:col[(gd_mtr.i_group*3-1)%10]});
				name = "Polyline ("+KMBFormatter(data[1])+' km)';
				loadNewData(gd_mtr,data[0],name)
			})
		}
		drawn.addLayer(e.layer);
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

});

































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

