
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
            this._image.style.display = 'none';
    },

    show: function() {
        this._visible = true;
        if (this._image && this._image.style)
            this._image.style.display = 'block';
    },

    getURL: function() {
        return this._url;
    },

});


var frame = [[41.3979, -4.4558], [65.8903, 44.6158]];

var map = L.map('mapid',{
    timeDimension: true,
    timeDimensionControl: true,
    timeDimensionOptions: {
        timeInterval: "2016-09-18T12:00:00Z/2016-10-09T12:00:00Z",
        period: "PT15M",
        currentTime: Date.parse("2016-09-18T12:00:00Z")
    },
    timeDimensionControlOptions: {
        autoPlay: true,
        playerOptions: {
            buffer: 10,
            transitionTime: 250,
            loop: true,
        }
     }
}).fitBounds(frame);
    
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g'
}).addTo(map);


var imageLayer = L.imageOverlay("https://raw.githubusercontent.com/Raphael-Nussbaumer-PhD/BMM/master/figure/Density_estimationMap_ImageOverlay/2016-09-18-12-00.png",frame).addTo(map);

/*Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};*/

var getSirenaImageUrl = function(baseUrl, time) {
    var t = new Date(time);
    var beginUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/") + 1);
    return beginUrl + t.getFullYear() + '-' + ('0' + (t.getMonth()+1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2)  + '-' + ('0' + t.getHours()).slice(-2) + '-' + ('0' + t.getMinutes()).slice(-2) +'.png';
};

var testImageTimeLayer = L.timeDimension.layer.imageOverlay(imageLayer, {
    getUrlFunction: getSirenaImageUrl
});

testImageTimeLayer.addTo(map);

var controlContainer = $("#mapcontrol");
map.timeDimension.on('timeload', function(data) {
    var date = new Date(map.timeDimension.getCurrentTime());
    controlContainer.find('span.date').html(date);
    controlContainer.find('span.time').html(date);
    if (data.time == map.timeDimension.getCurrentTime()) {
        $('#map').removeClass('map-loading');
    }
});
map.timeDimension.on('timeloading', function(data) {
    if (data.time == map.timeDimension.getCurrentTime()) {
        $('#map').addClass('map-loading');
    }
});
controlContainer.find('.btn-prev').click(function() {
    map.timeDimension.previousTime();
});
controlContainer.find('.btn-next').click(function() {
    map.timeDimension.nextTime();
});
var player = new L.TimeDimension.Player({}, map.timeDimension);
controlContainer.find('.btn-play').click(function() {
    var btn = $(this);
    if (player.isPlaying()) {
        btn.removeClass("btn-pause");
        btn.addClass("btn-play");
        btn.html("Play");
        player.stop();
    } else {
        btn.removeClass("btn-play");
        btn.addClass("btn-pause");
        btn.html("Pause");
        player.start();
    }
});
