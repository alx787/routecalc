var main = {};

main.module = (function() {

    // получение названия точки через геокод
    /*
    curl --include \
         --header "Content-Type: application/json; charset=utf-8" \
         --header "Accept: application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8" \
      'https://api.openrouteservice.org/geocode/reverse?api_key=5b3ce3597851110001cf62481da20da8c69d47249228088761e1cade&point.lon=49.61351612545934&point.lat=58.58983153250043&boundary.circle.radius=1&size=1'
      */    


    // данные о сегментах полученные с сервера сохраняем
    var routingdata = {};

    var windowVisible = true;

	// заполнение списка выбора подразделений
	var initDepartSelect = function() {

		var podrSelectObj = $("#podrselect");

		podrSelectObj.empty();

		var departArr = getDepartsArr();
		for (var i = 0; i < departArr.length; i++) {
			podrSelectObj.append('<option value="' + departArr[i].lon + '_' + departArr[i].lat + '">' + departArr[i].name + '</option>');
		}

	}

	// убрать - показать окно
	var switchWindowVisible = function() {
		var leftShow = 8;
		var leftHide = -575;

		if (windowVisible) {
			// $("#wrapper").css("left", leftHide});
			$("#wrapper").animate({"left": leftHide});
			windowVisible = false;
		} else {
			// $("#wrapper").css("left", leftShow);
			$("#wrapper").animate({"left": leftShow});
			windowVisible = true;
		}
	}

	// события нажатий на кнопки
	var initButtonEvents = function() {



		// убрать - показать окно
		$("#btnslide").on("click", function() {
			switchWindowVisible();
		});



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
			osm.module.clearSegments();
			clearSegmentsList();
		});


		// запрос маршрута
		$("#btncalc").on("click", function() {
			getRouting(0);
		});


		// копирование параметров маршрута в буфер
		$("#btncopy").on("click", function() {
			var tmpHTML = $("<textarea>");

			var tmpObj = {};
			tmpObj.placebegin = $("#routebegin").val();
			tmpObj.placeend = $("#routeend").val();
			tmpObj.distance = $("#distance").val();

			$("body").append(tmpHTML);
			tmpHTML.val(JSON.stringify(tmpObj)).select();
			document.execCommand("copy");
			tmpHTML.remove();
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

		var payloadArr = osm.module.getPointsWithCoords();


		if (payloadArr.length == 0) {
			alert("Не найдены точки для рассчета маршрута")
			return false;
		}

		if (payloadArr.length == 1) {
			alert("Не достаточно точек для рассчета маршрута")
			return false;
		}

		// console.log(payload);
		// console.log(sendingData);

		// запросить маршрутизацию
		// var restUrl = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
		var restUrl = "route/find";

		$.ajax({
			url: restUrl,
			type: 'post',
			// headers: {"Authorization": authtoken},
			enctype: 'multipart/form-data',
			//processData: false,  // Important!
			dataType: 'json',
			data: JSON.stringify(payloadArr),
			cache: false,
			async: true,
			// async: asyncFlag,
			contentType: "application/json; charset=utf-8",
			//contentType: false,
			crossDomain: true,
			success: function (data) {

				// console.log(data);
				// console.log(JSON.stringify(data));

				// сохранить данные
				routingdata = data;

				// отрисовка линий
				coordsArr = data.coordinates;
				for (var i = 0; i < coordsArr.length - 1; i++) {
					osm.module.addLine(coordsArr[i].lon, coordsArr[i].lat, coordsArr[i + 1].lon, coordsArr[i + 1].lat, "#0500bd", "route");
				}

				// заполнение таблицы сегментов
				fillSegmentsList(data.segments);



				// так выглядит объект описывающий сегмент
				// coordinatesBegin: {
				// 						lat: 58.606832
				// 						lon: 49.601229
				// 					}
				//
				// coordinatesEnd: {
				// 						lat: 58.607549
				// 						lon: 49.61118
				// distance: 801.1
				// name: null
				// placebegin: "Ключ здоровья, Kirov, Kirov"
				// placeend: "27 улица Ломоносова, Kirov, Kirov"
			},
			error: function (data) {

				routingdata = {};

				console.log("ошибка при получении данных с сервера");
				console.log(data);
				alert("ошибка при получении данных с сервера")
			},
			complete: function () {

			},

		});

	}


	// для тестирования
	var __getRouting = function(typeProfile){
		var data = test.module.getTestData();

		console.log(data);
		console.log(JSON.stringify(data));

		// сохранить данные
		routingdata = data;

		// отрисовка линий
		coordsArr = data.coordinates;
		for (var i = 0; i < coordsArr.length - 1; i++) {
			osm.module.addLine(coordsArr[i].lon, coordsArr[i].lat, coordsArr[i + 1].lon, coordsArr[i + 1].lat, "#0500bd", "route");
		}

		// заполнение таблицы сегментов
		fillSegmentsList(data.segments);
	}




	// получить заполненную строку
	var renderRow = function(name, addrbeg, addrend, distance, coordbeglon, coordbeglat, coordendlon, coordendlat) {

		var rowTemplate = '<li>'
							+ '<div class="column30px">&nbsp;</div>'
							+ '<div class="column60px">__name__</div>'
							+ '<div class="column200px">__addrbeg__</div>'
							+ '<div class="column200px">__addrend__</div>'
							+ '<div class="column60px" style="text-align: right;">__distance__</div>'
							+ '<div style="display: none">__coordbeglon__</div>'
							+ '<div style="display: none">__coordbeglat__</div>'
							+ '<div style="display: none">__coordendlon__</div>'
							+ '<div style="display: none">__coordendlat__</div>'
						+ '</li>';

		var rowStr = rowTemplate;

		rowStr = rowStr.replace("__name__", 					name);
		rowStr = rowStr.replace("__addrbeg__", 		addrbeg);
		rowStr = rowStr.replace("__addrend__", 		addrend);
		rowStr = rowStr.replace("__distance__", 		distance);
		rowStr = rowStr.replace("__coordbeglon__", 	coordbeglon);
		rowStr = rowStr.replace("__coordbeglat__", 	coordbeglat);
		rowStr = rowStr.replace("__coordendlon__", 	coordendlon);
		rowStr = rowStr.replace("__coordendlat__", 	coordendlat);

		return rowStr;
	}


	// очистить список сегментов
	var clearSegmentsList = function() {
		$("#datacontainer").empty();
		$("#routebegin").val("");
		$("#routeend").val("");
		$("#distance").val("");

	}


	// заполнить список сегментов маршрута
	var fillSegmentsList = function(segmentsArray) {

		var objContainer = $("#datacontainer");

		clearSegmentsList();

		var oneRow = "";

		var distance = 0;


		for (var i = 0; i < segmentsArray.length; i++) {
			oneRow = renderRow(i + 1,
								segmentsArray[i].placebegin,
								segmentsArray[i].placeend,
								(segmentsArray[i].distance / 1000).toFixed(2),
								segmentsArray[i].coordinatesBegin.lon,
								segmentsArray[i].coordinatesBegin.lat,
								segmentsArray[i].coordinatesEnd.lon,
								segmentsArray[i].coordinatesEnd.lat
							);

			objContainer.append(oneRow);

			distance = distance + segmentsArray[i].distance;
		}

		distance = distance / 1000;

		// заполним итоговые значения
		$("#routebegin").val(segmentsArray[0].placebegin);
		$("#routeend").val(segmentsArray[segmentsArray.length - 1].placeend);
		$("#distance").val(distance.toFixed(2));



		// сейчас нужно навесить на каждую строку обработчик нажатий мыши
		var cnt = objContainer.children().length;
		// цикл по li
		for (var i = 0; i < cnt; i++) {
			$(objContainer.children()[i]).on("click", function (e) {

				$("#datacontainer li").css("color", "#000000");
				$(this).css("color", "#FF0000");

				var liChildren = $(this).children();

				// для получения маршрута нужны дата начала, дата окончания и инв номер
				// console.log(liChildren[1].innerText);


				var segmentnumber = parseInt(liChildren[1].innerText) - 1;

				if (segmentnumber < 0) {
					alert("Ошибка получения номера сегмента маршрута")
					return false;
				}

				osm.module.clearSegments();

				// рисуем сегмент
				for (var ii = routingdata.segments[segmentnumber].wayPointBegin; ii < routingdata.segments[segmentnumber].wayPointEnd; ii++){
					osm.module.addLine(routingdata.coordinates[ii].lon, routingdata.coordinates[ii].lat, routingdata.coordinates[ii + 1].lon, routingdata.coordinates[ii + 1].lat,"#FF0000", "segment");
				}


				// console.log(liChildren[7]);
				// console.log(liChildren[8]);
				// console.log(liChildren[9]);
				// console.log(liChildren[10]);

			})
		}


	}








	return {
		initDepartSelect:initDepartSelect,
		initButtonEvents:initButtonEvents,
		switchWindowVisible:switchWindowVisible
	}


}());