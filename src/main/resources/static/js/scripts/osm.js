
var osm = {};

osm.module = (function () {

	var map;

    // текущий номер точки - уникальный в этом сеансе
    var currnum = 0;


    // массив маршрутов с координатами всех точек
    var routeArr = [];

    // описание одного маршрута
    /*
    routeN : {
        name: "точка 1 - точка 4",
        distance: 145,
        coordsbeg: [lon, lat],
        coordsend: [lon, lat],
        namebeg: "начало ....",
        nameend: "конец ....",

    */

    // итоговое расстояние маршрута
    var totalDistanse = 0;

    // токен авторизации для запросов маршрутизации
    var authtoken = "5b3ce3597851110001cf62481da20da8c69d47249228088761e1cade";


    var init = function(){

        var options = {
            //moveTolerance: 5,
            projection: new OpenLayers.Projection('EPSG:900913'),
            displayProjection: new OpenLayers.Projection('EPSG:4326'),
            units: 'm',
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)
        };


        map = new OpenLayers.Map("map", options);
        // map = new OpenLayers.Map("map");

        var mapnik = new OpenLayers.Layer.OSM();


        //Добавляем подсказку масштаба карты и позици курсора
        map.addControl(new OpenLayers.Control.ScaleLine());
        map.addControl(new OpenLayers.Control.MousePosition());

        //добавляем основной слой
        // map.addLayers([mapnik]);
        map.addLayer(mapnik);

        //Создаем точку на которую будет центрироваться карта при старте
        var point0 = new OpenLayers.Geometry.Point(49.602077, 58.610018);
        //Помним что карта отображается в одной проекции, а с данными работает в другой проекции. 
        point0.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913'));
        //Выполняем центрирование карты на точку с масштабом 8.    
        map.setCenter(new OpenLayers.LonLat(point0.x, point0.y), 16);

        /*
        //опишем стиль для слоя полигонов
        var stylePoint = new OpenLayers.Style(
           { 
              strokeColor: 'red',
              strokeWidth: 2,
              fillColor: 'white',
              labelYOffset: 1,
              label: '${label}',
              fontSize: 10 
           });

        //описываем новый слой
        var vectorPoint = new OpenLayers.Layer.Vector('Fields', 
        {
                styleMap: new OpenLayers.StyleMap(
                    { 'default': stylePoint
                })
        });

        //Складываем слои на карту
         map.addLayer(vectorPoint);
        */

        //Создаем объект стиля отображения картинок. Указываем параметры ширены, высоты, сдвига по вертикале относительно точки, подпись(${} - это объявление параметра, можно выводить константу для всех точек), url к графику, размер шрифта. 
        var styleImage = new OpenLayers.Style(
           {
              graphicWidth: 21,  
              graphicHeight: 25,  
              graphicYOffset: -28, 
              label: "${label}",   
              externalGraphic: "img/map_marker_icon_32_32.png",   
              fontSize: 12 
           });


        //labelYOffset - сдвиг текста по вертикале относительно точки
        var stylePoint = new OpenLayers.Style(
           { 
              pointRadius: 5,
              strokeColor: "red",
              strokeWidth: 2,
              fillColor: "lime",
              labelYOffset: -16,
              label: "${label}",
              fontSize: 16 
           });


        //Создаем слой для точек. В свойстве styleMap указываем как отображать в обычном случае. Свойство select будет применено после выбора элемента. 
        var vectorPoint = new OpenLayers.Layer.Vector("Точки",
            {
                styleMap: new OpenLayers.StyleMap(
                { "default": stylePoint,
                  "select": { pointRadius: 20}
                })
            });


        map.addLayer(vectorPoint);


        //В отличие от слоя с точками, где выделение объекта взывает увеличение радиуса точки, на слое с картинками будет их поворот на 45 градусов

        var vectorImage = new OpenLayers.Layer.Vector("Картинки",
            {
                styleMap: new OpenLayers.StyleMap(
                { "default": styleImage,
                  "select": { rotation: 45}
                })
            });


        map.addLayer(vectorImage);



        /////////////////////////////////////////////////
        // click handler begin           
        /////////////////////////////////////////////////

        //Set up a click handler
        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
            defaultHandlerOptions: {
                'single': true,
                'double': false,
                'pixelTolerance': 5,
                'stopSingle': false,
                'stopDouble': false
            },

            initialize: function(options) {
                this.handlerOptions = OpenLayers.Util.extend(
                    {}, this.defaultHandlerOptions
                );
                OpenLayers.Control.prototype.initialize.apply(
                    this, arguments
                ); 
                this.handler = new OpenLayers.Handler.Click(
                    this, {
                        'click': this.trigger
                    }, this.handlerOptions
                );
            }, 

            trigger: function(e) {
                //A click happened!
                var lonlat = map.getLonLatFromViewPortPx(e.xy)
                
                lonlat.transform(
                  new OpenLayers.Projection("EPSG:900913"), 
                  new OpenLayers.Projection("EPSG:4326")
                );
                
                //alert("You clicked near " + lonlat.lat + " N, " + lonlat.lon + " E");
                console.log("You clicked near " + lonlat.lat + " N, " + lonlat.lon + " E");

                currnum++;

                // передадим координаты
                /*
                document.getElementById("lon").value = lonlat.lon;
                document.getElementById("lat").value = lonlat.lat;
                document.getElementById("currnum").value = currnum;
                */

                addPoint(lonlat.lon, lonlat.lat, "Точка " + currnum, lonlat.lat + "_", map.layers[1]);
                //addPoint(lonlat.lon, lonlat.lat, "Точка 1", lonlat.lat + "_", map.layers[1]);
                //addImg(lonlat.lon, lonlat.lat, 'Изображение 1', lonlat.lat + "_",map.layers[2]);
            }

        });

        /////////////////////////////////////////////////
        // click handler end           
        /////////////////////////////////////////////////

        var click = new OpenLayers.Control.Click();
        map.addControl(click);
        click.activate();


        //console.log(map);
        //console.log(click);

        //return map;

    }


    var addPoint = function(lon,lat,title,ident){
        var ttt = new OpenLayers.LonLat(parseFloat(lon), parseFloat(lat));
        ttt.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
        for (var k = 0; k < map.layers[1].features.length; k++) {
            if (map.layers[1].features[k].attributes.PointId==ident) {
                map.layers[1].features[k].move(ttt);
                map.layers[1].features[k].attributes.label=title;
                return false;
            }
        }
        var point0 = new OpenLayers.Geometry.Point(parseFloat(lon), parseFloat(lat));
        point0.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
        map.layers[1].addFeatures(new OpenLayers.Feature.Vector(point0, { label: title, name: title, PointId: ident, lon: lon, lat: lat}));
    }

   	
   	var addImg = function(lon,lat,title,ident, layr){
        var ttt = new OpenLayers.LonLat(parseFloat(lon), parseFloat(lat));
        ttt.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
        // features-массив объектов на карте. Объект может быть например: точкой, полигоном, кривой, изображением
        for (var k = 0; k < layr.features.length; k++) {
            // У объектов features есть атрибуты, как предопределенные так и добавленные пользователем
            if (layr.features[k].attributes.ImgId==ident) {
            // move - функция перемещения объекта в данную точку
                layr.features[k].move(ttt);
                layr.features[k].attributes.label=title;
                return false;

            }
        }
        var point0 = new OpenLayers.Geometry.Point(parseFloat(lon), parseFloat(lat));
        point0.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
        //Для создание объекта Feature использовался класс OpenLayers.Feature.Vector
        layr.addFeatures(new OpenLayers.Feature.Vector(point0, { label: title, name: title, ImgId: ident }));              
    }


    //Предполагаемый форма данных: координаты разделены точкой с запятой, долгота с широтой разделены пробелом
    //function addLine(lon1, lat1, lon2, lat2, title, ident, layr) {
    var addLine = function(lon1, lat1, lon2, lat2, layer, color) {
        var featuress = Array();

        var point1 = new OpenLayers.Geometry.Point(lon1, lat1);
        point1.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));

        var point2 = new OpenLayers.Geometry.Point(lon2, lat2);
        point2.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));

        featuress.push(point1);
        featuress.push(point2);

        //var linearRing2 = new OpenLayers.Geometry.LinearRing(featuress);
        //map.layers[2].addFeatures(linearRing2);


        var vector = new OpenLayers.Layer.Vector();
        var lineString = new OpenLayers.Geometry.LineString(featuress);
        var myLineStyle = {strokeColor:color, strokeWidth:2};
        var myFeature = new OpenLayers.Feature.Vector(lineString, {}, myLineStyle);

        // map.layers[2].addFeatures([myFeature]);
        layer.addFeatures([myFeature]);

    }


    var clearPoints = function(){
        map.layers[1].removeAllFeatures();
    }


    // перемещения карты по координатам
    // вариант с аргументами moveToPlace(lon, lat)
    var moveToPlace = function(lon, lat){
        // var point0 = new OpenLayers.Geometry.Point(49.602077, 58.610018);
        var point0 = new OpenLayers.Geometry.Point(lon, lat);
        //Помним что карта отображается в одной проекции, а с данными работает в другой проекции.
        point0.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913'));
        //Выполняем центрирование карты на точку с масштабом 8.    
        map.setCenter(new OpenLayers.LonLat(point0.x, point0.y), 16);
        
    }



	return {
		init:init,
		addPoint:addPoint,
		clearPoints:clearPoints,
		moveToPlace:moveToPlace

	}


}());
