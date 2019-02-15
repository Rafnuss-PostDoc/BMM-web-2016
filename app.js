/*
	Response header info:
	Access-Control-Allow-Origin:*ss
	Content-Type:text/jsons
	X-Powered-By:nodejs
	*/

	var express = require('express');
	var app     = express();
	var fs 		= require('fs');
	var url     = require('url');
	var geolib  = require('geolib')
	const { check, validationResult } = require('express-validator/check');

	var port 	= "8004" ;

	var pow_a = 0.1352;

	var DG_grid,DG_density,DG_all,DG_uv, DG_speed;

	fs.readFile('layer/exportGrid_grid.json', function(err, content){
		data = JSON.parse(content);
		DG_grid = data[0];
		console.log('exportGrid_grid.json loaded')
	});
	fs.readFile('layer/exportGrid_density_all.json', function(err, content){
		data = JSON.parse(content);
		DG_all = data[0];
		console.log('exportGrid_density_all.json loaded')
	});
	fs.readFile('layer/exportGrid_density.json', function(err, content){
		data = JSON.parse(content);
		DG_density = data[0];
		console.log('exportGrid_density.json loaded')
	});
	fs.readFile('layer/exportGrid_UV.json', function(err, content){
		data = JSON.parse(content);
		DG_uv = data[0];
		DG_speed = DG_uv.map(function(d,id1){
			return d[0].map( (e,id2) => Math.sqrt( Math.pow(e,2) + Math.pow(d[1][id2],2) ) );
		})
		console.log('exportGrid_UV.json loaded')
	});
/*fs.readFile('layer/exportDensityGrid.json', function(err, content){
	data = JSON.parse(content);
	DG_grid = data[0];
	DG_density = data[1];
	DG_all = data[2];
	console.log('exportDensityGrid.json loaded')
});*/

var findNearest =function(latlng){
	var acc = DG_grid.reduce(function(acc, curr, id_curr) {
		val = Math.pow((DG_grid[id_curr][0] - latlng[0]),2) + Math.pow((DG_grid[id_curr][1] - latlng[1]),2);
		return val < acc[0] ? [val, id_curr] : acc;
	});
	return acc[1]
}

dotproduct = function(a,b) {
	return a.map(function(x,i) {
		return a[i] * b[i];
	}).reduce(function(m,n) { return m + n; });
}


app.get('/all', function (req, res) {
	res.json(DG_all);
});

app.get('/:type/:pts(*)', function (req, res) {

	var pts = req.params.pts.split("/").map( (e) => e.split(',')).map(parseFloat);
	console.log(pts)

	//t='%5B%7B"lat"%3A43.406010535221114%2C"lng"%3A12.902358770370485%7D%2C%7B"lat"%3A49.32203671803393%2C"lng"%3A14.871110916137697%7D%2C%7B"lat"%3A51.12270747319485%2C"lng"%3A23.16798806190491%7D%2C%7B"lat"%3A46.68616210700476%2C"lng"%3A25.4179859161377%7D%5D'
	//var pts = JSON.parse(decodeURIComponent(req.params.pts));
	//var pts = JSON.parse(decodeURIComponent(t));  

	if (req.params.type == 'marker_density'){
		var id = findNearest(pts)
		res.json(DG_density[id]);

	} else if (req.params.type == 'polygon_sum'){
		var sum = Array(DG_density[0].length).fill(0);
		var nb = 0;
		var area = 0;

		DG_grid.forEach(function(pt, id1){
			if (geolib.isPointInside({ lat: pt[0], lng: pt[1] }, pts)){
				sum = sum.map(function(e,id2){return e+DG_density[id1][id2]});
				nb=nb+1;
				area = area + pt[2];
			}
		})
		sum=sum.map( (e) => e/nb );
		res.json([sum, area]);

	} else if ( req.params.type == 'polyline_mtr' ){

		//var pts = e.layer.getLatLngs().map( (e) => [e.lat,e.lng])
		var direction_vector = [-(pts[1][0]-pts[0][0]), pts[1][1]-pts[0][1]];
		var norm = Math.sqrt(direction_vector[0]*direction_vector[0] + direction_vector[1]*direction_vector[1]);
		var direction_vector =  [ direction_vector[0]/norm , direction_vector[1]/norm ];

		var polyPointsExtended=[];
		var dist = geolib.getDistance(pts[0],pts[1])/1000;
		var nb_pt = Math.round(dist/30);

		var dlat = (pts[1][0] - pts[0][0])/(nb_pt-1);
		var dlng = (pts[1][1] - pts[0][1])/(nb_pt-1);

		for (var i = 0; i < (nb_pt-1); i++) {
			polyPointsExtended.push([pts[0][0]+i*dlat, pts[0][1]+i*dlng])
		}
		polyPointsExtended.push([pts[1][0], pts[1][1]])

		var mtr = Array(DG_density[0][0].length).fill(0);
		var nb = 0;

		polyPointsExtended.forEach(function(d){
			var id1 = findNearest(d)

			var speed_dir = DG_uv[id1].map( (e) => dotproduct(e, direction_vector) );
			
			mtr.map( (e,id2) => e + DG_density[id1][0][id2]*speed_dir[id2]) 

			nb=nb+1;
		})

		mtr = mtr.map( (e) => e/nb)

		res.json([density, dist_acc]);
	}
});

app.listen(port);

console.log("Listening on port " + port );