var app = angular.module('myApp', ['esri.map']);

app.controller('MainController', function($scope, $q, esriLoader, Mapper, Creator, Coordinates) {
	esriLoader.require([
			'esri/map',
			'esri/layers/GraphicsLayer',
			'esri/SpatialReference',
			'esri/geometry/Extent'
		], function(Map, FeatureLayer, SpatialReference, Extent) {

		Mapper.then(function(data){
			$scope.mapView = data;
			$scope.mapView.setExtent(new Extent(19444805.215987768, -4423667.31188955, 19462767.91763476, -4416023.609061042, new SpatialReference(102100)));   
			addLocations();
		});

		var addLocations = function(){
			Coordinates.success(function(data){
				$q(function(resolve, reject){
					resolve(Creator.getLocations(data))
				}).then(function(arr){
					var coordLayer = new FeatureLayer({
						id: "locations"
					});
					coordLayer.spatialReference = new SpatialReference(102100);
					
					angular.forEach(arr, function(value, key){
						coordLayer.add(value);
					});
					coordLayer.on("mouse-over", function(evt){
						$scope.mapView.setMapCursor("pointer");
					});
					coordLayer.on("mouse-down", function(evt){
						$scope.mapView.centerAt(evt.mapPoint);
						parent.access(evt.graphic.attributes);
					});
					coordLayer.on("mouse-out", function(evt){
						$scope.mapView.setMapCursor("default");
					});
					$scope.mapView.addLayer(coordLayer);
				})

			}); 
		}

		$scope.check = function(){
			if ($scope.mapView) {
				console.log($scope.mapView);
				console.log($scope.mapView.extent);
			};
		}
    });
});

app.factory('Mapper', function($q, esriRegistry){
    return $q(function(resolve, reject){
        resolve(esriRegistry.get('demoMap'));
    });
});

app.factory('Coordinates', function($http){
    return $http.get('coordinates.js')
    .success(function(data){
        return data;
    })
    .error(function(err){
        return err;
    });
});

app.service('Creator', function($http, esriLoader){
	var Creator = {};
	var locations = [];

	Creator.getLocations = function(coordinates){
		esriLoader.require([
			'esri/graphic',
			'esri/geometry/Point',
			'esri/SpatialReference',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/symbols/PictureMarkerSymbol',
			'esri/dijit/PopupTemplate',
			'esri/InfoTemplate'
		], function(Graphic, Point, SpatialReference, SimpleMarkerSymbol, PictureMarkerSymbol, PopupTemplate, InfoTemplate) {

			for (var i = 0; i < coordinates.length; i++) {
				var location = new Graphic();
				location.attributes = {
				  "name": coordinates[i].Name,
				  "address": coordinates[i].Address
				};
				location.geometry = new Point({
					"x": coordinates[i].X,
					"y": coordinates[i].Y,
					"spatialReference": new SpatialReference(102100)
				});

				var infoContent = "<label>Address:</label><br>" + coordinates[i].Address.replace(/,/g, "<br>");

				// location.infoTemplate = new InfoTemplate(coordinates[i].Name, infoContent);

				// location.symbol = new SimpleMarkerSymbol({
				//   color: "red",
				//   outline: {
				//     color: [128, 128, 128, 0.5],
				//     width: "0.5px"
				//   }
				// });

				// location.symbol = new SimpleMarkerSymbol({
				//   "color": [255,0,0,255],
				//   "size": 12,
				//   "xoffset": 0,
				//   "yoffset": 0,
				//   "type": "esriSMS",
				//   "style": "esriSMSCircle",
				//   "outline": {
				//     "color": [0,0,0,255],
				//     "width": 1,
				//     "type": "esriSLS",
				//     "style": "esriSLSSolid"
				//   }
				// });

				location.symbol = new PictureMarkerSymbol({
				  "url": "marker.png",
				  "width": 11,
				  "height": 18,
					"type":"esriPMS"
				});
				locations.push(location);
			}
		});  
		
		return locations;
	}

	return Creator;

});
