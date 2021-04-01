var main = {};

main.module = (function() {

    // получение названия точки через геокод
    /*
    curl --include \
         --header "Content-Type: application/json; charset=utf-8" \
         --header "Accept: application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8" \
      'https://api.openrouteservice.org/geocode/reverse?api_key=5b3ce3597851110001cf62481da20da8c69d47249228088761e1cade&point.lon=49.61351612545934&point.lat=58.58983153250043&boundary.circle.radius=1&size=1'
      */    


	// заполнение списка выбора подразделений
	var initDepartSelect = function() {

		var podrSelectObj = $("#podrselect");

		podrSelectObj.empty();

		var departArr = getDepartsArr();
		for (var i = 0; i < departArr.length; i++) {
			podrSelectObj.append('<option value="' + departArr[i].lon + '_' + departArr[i].lat + '">' + departArr[i].name + '</option>');
		}

	}


	// события нажатий на кнопки
	var initButtonEvents = function() {


		// переход на подразделение на карте
		$("#btngoto").on("click", function() {
			// нужно получить значения координат и передать их в нужную функцию
			var coordsArr = $("#podrselect").val().split("_");

			if (coordsArr.length != 2) {
				alert("ошибка при получении координат подразделения");
				return false;
			}

			var lon = parseFloat(coordsArr[0]);
			var lat = parseFloat(coordsArr[1]);

			if (isNaN(lon) || isNaN(lat)) {
				alert("ошибка при обработке координат подразделения");
				return false;
			}

			osm.module.moveToPlace(lon, lat);

		});


		// очистить слой от всего
		$("#btnclear").on("click", function() {
			osm.module.clearPoints();
		});


		// запрос маршрута
		$("#btncalc").on("click", function() {

		});




	}





	// запрос маршрутизации
	// если нужно получить маршрут по заранее подготовленным координатам то их надо передать в параметре cordsJsonAT
	// в виде JSON строки

	// typeProfile - профиль

	// 0 - driving-car
	// 1 - driving-hgv
	// 2 - cycling-regular
	// 3 - cycling-road
	// 4 - cycling-mountain
	// 5 - cycling-electric
	// 6 - foot-walking
	// 7 - foot-hiking
	// 8 - wheelchair

//            function getRouting(cordsJsonAT, typeProfile){
	var getRouting = function(typeProfile){

		// пересылаемые данные
		var sendingData = "";


		var payload = {};
		var coords = [];

		var points = map.layers[1].features;
		var pointsCnt = map.layers[1].features.length;
		//for (var i = pointsCnt - 1; i >= 0; i--) {
		//    coords.push([points[i].attributes.lon, points[i].attributes.lat]);
		//};
		for (var i = 0; i < pointsCnt; i++) {
			coords.push([points[i].attributes.lon, points[i].attributes.lat]);
		};

		if (coords.length == 0) {
			return false;
		}

		payload.coordinates = coords;
		payload.language = "ru";
		sendingData = JSON.stringify(payload);

		console.log(payload);
		console.log(sendingData);



		// запросить маршрутизацию
		var directionsProfile = "driving-car";

		if (typeProfile != null) {
			switch(typeProfile) {
				case 0:
					directionsProfile = "driving-car";
					break;
				case 1:
					directionsProfile = "driving-hgv";
					break;
				case 2:
					directionsProfile = "cycling-regular";
					break;
				case 3:
					directionsProfile = "cycling-road";
					break;
				case 4:
					directionsProfile = "cycling-mountain";
					break;
				case 5:
					directionsProfile = "cycling-electric";
					break;
				case 6:
					directionsProfile = "foot-walking";
					break;
				case 7:
					directionsProfile = "foot-hiking";
					break;
				case 8:
					directionsProfile = "wheelchair";
					break;
				default:
					directionsProfile = "driving-car";

			}

		}



		var authtoken = "5b3ce3597851110001cf62481da20da8c69d47249228088761e1cade";

		var restUrl = "https://api.openrouteservice.org/v2/directions/" + directionsProfile + "/geojson";

		//var restUrl = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";

		$.ajax({
			url: restUrl,
			type: 'post',
			headers: {"Authorization": authtoken},
			enctype: 'multipart/form-data',
			//processData: false,  // Important!
			dataType: 'json',
			data: sendingData,
			//data: payload,
			//data: formDataTicket,
			cache: false,
			async: false,
			// async: asyncFlag,
			contentType: "application/json; charset=utf-8",
			//contentType: false,
			crossDomain: true,
			success: function (data) {

				console.log(data);

				// отрисовка линий
				coordsArr = data.features[0].geometry.coordinates;
				for (var i = 0; i < coordsArr.length - 1; i++) {
					addLine(coordsArr[i][0], coordsArr[i][1], coordsArr[i + 1][0], coordsArr[i + 1][1], map.layers[1], "#0500bd");
				}


				/*
                routeN : {
                    name: "точка 1 - точка 4",
                    distance: 145,
                    coordsbeg: [lon, lat],
                    coordsend: [lon, lat],
                    namebeg: "начало ....",
                    nameend: "конец ....",

                */
				// массив маршрутов с координатами всех точек
				routeArr = [];

				var segments = data.features[0].properties.segments;
				// обходим сегменты
				for (var i = 0; i < segments.length; i++) {
					oneroute = {};

					//oneroute.name = (i + 1).toString() + " - " + (i + 1 + 1).toString();
					oneroute.name = (i + 1).toString();
					oneroute.distance = segments[i].distance;

					// шаги сегмента
					var steps = segments.steps;

					oneroute.coordsbeg = coordsArr[segments[i].steps[0].way_points[0]];
					oneroute.coordsend = coordsArr[segments[i].steps[segments[i].steps.length - 1].way_points[1]];

					oneroute.namebeg = getPlaceFromCoords(oneroute.coordsbeg[0], oneroute.coordsbeg[1]);
					oneroute.nameend = getPlaceFromCoords(oneroute.coordsend[0], oneroute.coordsend[1]);
					//oneroute.namebeg = "-";
					//oneroute.nameend = "-";

					routeArr.push(oneroute);

				}

				totalDistanse = data.features[0].properties.summary.distance;

				//data.features[0].geometry.coordinates
				console.log("расстояние");
				console.log(data.features[0].properties.summary.distance);

				console.log("координаты");
				console.log(coordsArr);

				console.log("сегменты");
				console.log(routeArr);

			},
			error: function (data) {
				console.log("ошибка при получении данных с сервера");
			},
			complete: function () {

			},

		});

	}












	return {
		initDepartSelect:initDepartSelect,
		initButtonEvents:initButtonEvents
	}


}());