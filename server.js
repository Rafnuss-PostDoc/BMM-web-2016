

var express = require('express');
var app     = express();
var fs    = require('fs');
var inside = require('point-in-polygon')
var MongoClient = require('mongodb').MongoClient;
var port  = "8004" ;

var pow_a = 0.1352;

var r





var DG_grid, DG_all;
fs.readFile('data/exportGrid_grid.json', function(err, content){
	data = JSON.parse(content);
	DG_grid = data[0];
	console.log('exportGrid_grid.json loaded')
});
/*fs.readFile('data/exportGrid_density_all.json', function(err, content){
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
fs.readFile('layer/exportDensityGrid.json', function(err, content){
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

var dotproduct = function(a,b) {
	return a.map(function(x,i) {
		return a[i] * b[i];
	}).reduce(function(m,n) { return m + n; });
}
function calcCrow(pts) {
	var R = 6371;
	var dLat = toRad(pts[1][0]-pts[0][0]);
	var dLon = toRad(pts[1][1]-pts[0][1]);
	var lat1 = toRad(pts[0][0]);
	var lat2 = toRad(pts[1][0]);

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}
function toRad(Value) {// Converts numeric degrees to radians
	return Value * Math.PI / 180;
}



app.get('/:type/:pts(*)', function (req, res) {

	var pts = req.params.pts.split("/").map( (e) => e.split(',').map(parseFloat));

	MongoClient.connect("mongodb://localhost:27017/bmm", function(err, client) {
		if (err) throw err;
		if (req.params.type == 'marker_density'){
			var id = findNearest(pts[0])
			col = client.db("bmm").collection('data');
			col.findOne({'_id': id}, function(err, result) {
				if (err) throw err;
				res.json(result);
				client.close();
			});


		} else if (req.params.type == 'polygon_sum'){

			var area = 0;
			var insidepts=[];

			DG_grid.forEach(function(pt, id){
				if (inside(pt, pts)){
					insidepts.push(id)
					area = area + pt[2];
				}
			})

			var nb = insidepts.length;
			client.db("bmm").collection('data').find({'_id': {$in: insidepts}},{ projection: { u: 0, v: 0 } }).toArray(function(err, result) {
				if (err) throw err;
				result = result.map( (e) => e.density.est.map( (ed) => ed*DG_grid[e._id][2] ) )
				result= result.reduce( (acc,e) => e.map( (ed,id) => ed+acc[id] ) )
				result = result.map( (e) => +e.toFixed(2))
				res.json([result, area]);
				client.close();
			});

		} else if ( req.params.type == 'polyline_mtr' ){

			var direction_vector = [-(pts[1][0]-pts[0][0]), pts[1][1]-pts[0][1]];
			var norm = Math.sqrt(direction_vector[0]*direction_vector[0] + direction_vector[1]*direction_vector[1]);
			var direction_vector =  [ direction_vector[0]/norm , direction_vector[1]/norm ];

			var nearest=[];
			var dist = calcCrow(pts);
			var nb_pt = Math.round(dist/30);

			var dlat = (pts[1][0] - pts[0][0])/(nb_pt-1);
			var dlng = (pts[1][1] - pts[0][1])/(nb_pt-1);
			for (var i = 0; i < (nb_pt-1); i++) {
				nearest.push(findNearest([pts[0][0]+i*dlat, pts[0][1]+i*dlng]))
			}

			nearest.push(findNearest([pts[1][0], pts[1][1]]))

			console.log(direction_vector)

			client.db("bmm").collection('data').find({'_id': {$in: nearest}}).toArray(function(err, result) {
				if (err) throw err;
				var mtr = result.map(r => r.u.map( (tmp,id) => r.density.est[id]*dotproduct([r.u[id],r.v[id]], direction_vector) ) )

				var mtr_list = [];
				nearest.forEach(function(n){
					var i = result.findIndex(x => x._id == n)
					mtr_list.push(mtr[i])
				})

				result= mtr_list.reduce( (acc,e) => e.map( (ed,id) => ed+acc[id] ) )
				result = result.map( (e) => +e.toFixed(2))
				res.json([result, dist]);
				client.close();
			})
		}


	});


});

app.listen(port);

console.log("Listening on port " + port );