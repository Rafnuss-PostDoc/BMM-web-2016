# BMM-web

Website to visualize the result of [BMM](https://rafnuss-postdoc.github.io/BMM/).

## Demo
[See demo on bmm.raphaelnussbaumer.com](https://bmm.raphaelnussbaumer.com/).

## Description
The map displays 3 layers: the bird density with a colorbar, the rain with a blue mask and the bird flight speed and direction as quiver. These layers are animated with the time control on the bottom of the screen which allows for pausing, changing the speed, moving a fram at the time and move foward or backward with a slider. In addition, 3 timeseries are available (collaped by default) on the bottom of the screen, just above the timecontrol. The first one displays the bird density at a single location, the second the sum of all bird present in an area and the third the mean bird traffic (MTR) perpendicular to a transect. For each of them, a drawing button positined on the right of the time series allows to query on the map the corresponding point, area or line. 

<img src="description.png">


Using leaflet to displays the various layer on the map, Leaflet.TimeDimension to control the time. Layer are basic image store on the server and calby Leaflet.TimeDimension. The time series on the bottom allow to visualized the density at a point, the sum of bird over a polygon, or the MTR over a transect. The data are served by Nodejs using Mongodb to store the data. 



## How to use the API

### marker_density

Query the bird density [bird/km^2] at a location defined by its coordinates (lat, lng). 
```
https://bmm.raphaelnussbaumer.com/api/marker_density/{{lat}},{{lng}}
```
Exemple:
```
https://bmm.raphaelnussbaumer.com/api/marker_density/60.58696734225869,14.941406250000002
```
The return a json dataset containing the estimated density `density.est` togethuer with the 10 and 90th quantile `density.q10` and `density.e90`. The same query also return the north-south and east-west flight vector as `u` and `v` respectively. Each data return a vector of size ... 
```
{
  "density": {
      "est": [],
      "q10": [],
      "q90": [],
  },
  "u": [],
  "v": [],
}
```


### Sum of bird over an area
```
https://bmm.raphaelnussbaumer.com/api/polygon_sum/{{lat}},{{lng}}/
```
Exemple:
```
https://bmm.raphaelnussbaumer.com/api/polygon_sum/51.6180165487737,8.349609375000002/49.61070993807422,7.954101562500001/49.5822260446217,12.260742187500002/52.214338608258224,17.226562500000004
```

### Mean bird traffic over a transect
```
https://bmm.raphaelnussbaumer.com/api/polyline_mtr/{{lat1}},{{lng1}}/{{lat2}},{{lng2}}/
```
Exemple:
```
https://bmm.raphaelnussbaumer.com/api/polyline_mtr/48.980216985374994,1.1425781250000002/45.89000815866184,8.525390625000002
```
