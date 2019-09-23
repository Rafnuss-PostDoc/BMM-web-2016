

var express = require('express');
var app     = express();
var fs    = require('fs');
const https = require('https');
var inside = require('point-in-polygon')
var MongoClient = require('mongodb').MongoClient;
var port  = "8004" ;
//mongoimport --db bmm --collection dens_sim --file ./exportSim_mongodb.json;
var pow_a = 0.1352;

var r





var est_grid, sim_grid, sim_time;
fs.readFile('data/API/exportEst_grid.json', function(err, content){
	data = JSON.parse(content);
	est_grid = data;
	console.log('exportEst_grid.json loaded')
});
fs.readFile('data/API/exportEst_time.json', function(err, content){
	data = JSON.parse(content);
	est_time = data;
	console.log('exportEst_time.json loaded')
});
fs.readFile('data/API/exportSim_grid.json', function(err, content){
	data = JSON.parse(content);
	sim_grid = data;
	console.log('exportSim_grid.json loaded')
});
fs.readFile('data/API/exportSim_time.json', function(err, content){
	data = JSON.parse(content);
	sim_time = data;
	console.log('exportSim_time.json loaded')
});


var findNearest =function(latlng){
	var acc = est_grid.reduce(function(acc, curr, id_curr) {
		val = Math.pow((est_grid[id_curr][0] - latlng[0]),2) + Math.pow((est_grid[id_curr][1] - latlng[1]),2);
		return val < acc[0] ? [val, id_curr] : acc;
	},[20,-1]);
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


//var pts =[[69,-7],[69,32],[40,32],[40,-7]];


MongoClient.connect("mongodb://localhost:27017/bmm", function(err, client) {

	app.get('/:type/:pts(*)', function (req, res) {

		var pts = req.params.pts.split("/").map( (e) => e.split(',').map(parseFloat));

		MongoClient.connect("mongodb://localhost:27017/bmm", function(err, client) {
			if (err) throw err;
			if (req.params.type == 'marker_density'){
				var id = findNearest(pts[0])
				if (id==-1){
					res.json([]);
					client.close();
				} else {
					col = client.db("bmm").collection('dens_est');
					col.findOne({'_id': id}, function(err, result) {
						if (err) throw err;
						//result.time = est_time;
						filename = 'marker_density_'+ req.params.pts.split('.').join('_').split(',').join('-') + '.json';
						res.setHeader('Content-disposition', 'filename='+filename);
						res.json(result);
						client.close();
					});				
				}



			} else if (req.params.type == 'polygon_sum'){

				var area = 0;
				var insidepts=[];
				sim_grid.forEach(function(pt, id){
					if (inside(pt, pts)){
						insidepts.push(id)
						area = area + pt[2];
					}
				})

				var center = pts.reduce( function(acc, cur){
					acc[0] += cur[0]; 
					acc[1] += cur[1];
					return acc
				}, [0,0]);
				center[0] = center[0] / pts.length;
				center[1] = center[1] / pts.length;

				var filename = 'polygon_sum_'+ center.toString().split('.').join('_').split(',').join('-') +'.json';

				col = client.db("bmm").collection('dens_sim');
				col.aggregate([{$match: 
					{'loc_id': {$in: insidepts}}
				}, 
				{$group:
					{_id: {real_id: "$real_id", time_id: "$time_id"}, total: {$sum: '$sim'} }
				},
				{$group:
					{_id: '$_id.time_id', average: {$avg: '$total'}, min: {$min: '$total'}, max: {$max: '$total'} }
				}
				]).toArray(function(err, result) {
					if (err) throw err;
					result.sort((a,b) => (a._id > b._id) ? 1 : ((b._id > a._id) ? -1 : 0));
					ret={};
					ret.avg = result.map( (r) => r.average.toFixed(2));
					ret.min = result.map( (r) => r.min.toFixed(2));
					ret.max = result.map( (r) => r.max.toFixed(2));
					ret.area = area
					res.setHeader('Content-disposition', 'filename='+filename);
					res.json(ret);
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
				nearest.filter(pts => pts > -1)

				client.db("bmm").collection('dens_est').find({'_id': {$in: nearest}}).toArray(function(err, result) {
					if (err) throw err;

					if (result.length==0){
						res.json([[], 0]);
						client.close();
					} else {
						var mtr = result.map(r => r.u.map( (tmp,id) => r.density.est[id]*dotproduct([r.u[id],r.v[id]], direction_vector) ) )

						var mtr_list = [];
						nearest.forEach(function(n){
							var i = result.findIndex(x => x._id == n)
							mtr_list.push(mtr[i])
						})


						result= mtr_list.reduce( (acc,e) => e.map( (ed,id) => ed+acc[id] ) )
						result = result.map( (e) => +e.toFixed(2))
						filename = 'polyline_mtr.json';
						res.setHeader('Content-disposition', 'filename='+filename);
						res.json([result, dist]);
						client.close();
					}
				})
			}


		});
	});
});

app.listen(port);

console.log("Listening on port " + port );
/*
setTimeout(function(){
	const file = fs.createWriteStream("./data/global.json");
	const request = https.get('https://bmm.raphaelnussbaumer.com/api/polygon_sum/69,-7/69,32/40,32/40,-7', function(response) {
		response.pipe(file);
		console.log('global_file_written')
	});
},5000)
*/
