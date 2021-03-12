:warning: Project archieved! Current version on [Rafnuss-PostDoc/BMM-website/](https://github.com/Rafnuss-PostDoc/BMM-website/tree/master/2016)  :warning:

# BMM-web-2016

This repository store the code and dataset for building the website [bmm.raphaelnussbaumer.com/2016](https://bmm.raphaelnussbaumer.com/2016) used to visualize the result of the interpolation of migrant bird density measured by a weather radar network [BMM](https://rafnuss-postdoc.github.io/BMM/).

## Demo

<img src="BMM-web.gif">

## Description
<img src="FigureS5-1.png">

### Block 1: interactive map
The main block of the website is a map with a standard interactive visualization allowing for zoom and pan. On top of this map, three layers can be displayed: 
- Layer 1 corresponds to bird densities displayed in a log-color scale. This layer can display either the estimation map, or a single simulation map by using the drop-down menu (1a).
-	Layer 2 corresponds to the rain (rainy areas are in light blue), which can be hidden/displayed with a checkbox (1b)
-	Layer 3 corresponds to the bird flight speed and direction, displayed by black arrows. The checkbox allows to display/hide this layer (1c). 
The last item on the top-right menu is the link menu (1d).

### Block 2: time series

### Timeseries
The second block (hidden by default on the website) shows three time series, each in a different tab (2a): 
-	Densities profile shows the bird densities [bird/km2] at a specific location.
-	Sum profile shows the total number of bird [bird] over an area.
-	MRT profile shows the mean traffic rate (MTR) [bird/km/hr] perpendicular to a transect.

A dotted vertical line (2d) appears on each time series to show the current time frame displayed in the map. Basic interactive tools for time series include zooming on a specific time period (day, week or all period) (2b) and general zoom and auto-scale (2e). Each time series can be hidden and displayed by clicking on its legend (2c).
The main feature of this block is the ability to visualise bird densities time series for any location chosen on the map. For the densities profile tab, the button with a marker icon (2f) lets you plot a marker on the map, and displays the bird densities profile with uncertainty (quantile 10 and 90) on the time series corresponding to this location. You can plot several markers to compare the different locations. Similarly, for the sum profile, the button with a polygon icon (2f) lets you draw any polygon and returns the time series of the total number of birds flying over this area. For the MTR tab, the flux of birds is computed on a segment (line of two points) by multiplying along the segment the bird densities with the local flight speed perpendicular to that segment. 

### Block 3: time control
The third block shows the time progression of the animated map with a draggable slider (3d). You can control the time with the buttons play/pause (3b), previous (3a) and next frame (3c). The speed of animation can be changed with a slider (3e).
API.

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

## Packaged used
[leaflet](https://leafletjs.com/) is used manage the map and various layer, [Leaflet.TimeDimension](https://github.com/socib/Leaflet.TimeDimension) controls the time and interaction with the layer. The data query on the time series are served by [Nodejs](https://nodejs.org/) and stoed by [Mongodb](https://www.mongodb.com/). 

## Download data
- The raw data used in this study are found on the repository of [European Network for the Radar surveillance of Animal Movement (ENRAM)](http://enram.github.io/data-repository/) and were generated with [vol2bird](https://github.com/adokter/vol2bird).
- These data were cleaned manually into vertical profile of reflectivity. These data are available on zenodo [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3243396.svg)](https://doi.org/10.5281/zenodo.3243396)
- The final interpolated spatio-temporal map can also be downloaded from zenodo [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3243465.svg)](https://doi.org/10.5281/zenodo.3243465).
