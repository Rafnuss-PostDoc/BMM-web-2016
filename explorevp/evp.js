
var tmp

jQuery(document).ready(function() {

	jQuery.getJSON('https://bmm.raphaelnussbaumer.com/data/radar/exportdRadars.json',function(radars){
		jQuery.each(radars,function(id,val){
			jQuery('#sel1').append(jQuery("<option></option>").attr("value", val).text(val))
		})
	})

	jQuery('#sel1').change(function() {
		jQuery('#status').html('<i class="fas fa-lg fa-spinner fa-spin"></i>')
		UpdateFigure(jQuery('#sel1 option:selected').val());
	});

	UpdateFigure('bejab');

})


function UpdateFigure(radar){
	jQuery.getJSON('https://bmm.raphaelnussbaumer.com/data/radar/exportdDens_'+radar+'.json',function(d){
		jQuery('#status').html('')
		tmp=d;

		var data = [{
			x: d.x,
			y: d.y,
			z: d.data,
			type: 'heatmap',
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

		Plotly.newPlot('myDiv', data, layout, {responsive: true});
		Plotly.Plots.resize('myDiv')
	})
}