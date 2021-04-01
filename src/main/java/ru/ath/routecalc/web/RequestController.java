package ru.ath.routecalc.web;

import com.google.gson.*;
import org.apache.log4j.Logger;
import org.springframework.web.bind.annotation.*;
import ru.ath.routecalc.dto.RouteInfoDTO;
import ru.ath.routecalc.model.Coordinates;
import ru.ath.routecalc.model.RouteSegment;
import ru.ath.routecalc.util.WebRequestUtil;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/route")
public class RequestController {

    private static final Logger log = Logger.getLogger(RequestController.class);


    // запрос должен выглядеть так
//[
//    {
//        "lon": 49.6019804547486,
//        "lat": 58.610112992272555
//    },
//    {
//        "lon": 49.607731110876536,
//        "lat": 58.6096435794413
//    },
//    {
//        "lon": 49.63637710315533,
//        "lat": 58.614627974755045
//    }
//]

    @RequestMapping(value = "/find", method = RequestMethod.POST)
    public @ResponseBody
    RouteInfoDTO routeInfoDTO(@RequestBody List<Coordinates> coordinatesList) {
        // тут надо выполнить запрос на сайт где выполняется маршрутизация


        /////////////////////////////////////////////
        // сформируем данные для запроса
        /////////////////////////////////////////////
        JsonObject jsonRequestObj = new JsonObject();
        JsonArray jsonCoordsArr = new JsonArray();

        for (Coordinates oneCoord : coordinatesList) {

            JsonArray jsonOneCoord = new JsonArray();
            jsonOneCoord.add(new JsonPrimitive(oneCoord.getLon()));
            jsonOneCoord.add(new JsonPrimitive(oneCoord.getLat()));

            jsonCoordsArr.add(jsonOneCoord);

        }

        jsonRequestObj.add("coordinates", jsonCoordsArr);

        /////////////////////////////////////////////


//        log.warn(gson.toJson(jsonRequestObj));



        // запросить маршрутизацию
        String directionsProfile = "driving-car";
        Integer typeProfile = 0;

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



        String restUrl = "https://api.openrouteservice.org/v2/directions/" + directionsProfile + "/geojson";

        Gson gson = new Gson();

        // запрос маршрута
        String authToken = "5b3ce3597851110001cf62481da20da8c69d47249228088761e1cade";
        String serverAnswer = WebRequestUtil.sendRequest(restUrl, authToken,"post",gson.toJson(jsonRequestObj));

        if (serverAnswer == null) {
            return null;
        }


        if (serverAnswer != null) {
            log.warn(serverAnswer);
        }

        JsonObject jsonAnswerObject = JsonParser.parseString(serverAnswer).getAsJsonObject();

        // разбираем ответ сервера для первой части ответа нашего сервиса
        JsonArray featuresArr = jsonAnswerObject.getAsJsonArray("features");
        JsonObject featuresObj = featuresArr.get(0).getAsJsonObject();
        JsonObject geometryObj = featuresObj.getAsJsonObject("geometry");
        JsonArray coordinatesArr = geometryObj.getAsJsonArray("coordinates");

        //int lengthArr = coordinatesArr.size();

        /////////////////////////////////////////////////////////
        // первая часть ответа - координаты точек маршрута
        List<Coordinates> answerCoordinates = new ArrayList<>();

        for (int i = 0; i < coordinatesArr.size(); i++) {

            answerCoordinates.add(new Coordinates(
                                        coordinatesArr.get(i).getAsJsonArray().get(0).getAsString(),
                                        coordinatesArr.get(i).getAsJsonArray().get(1).getAsString()
                                    ));

//            log.warn("lon " + coordinatesArr.get(i).getAsJsonArray().get(0).getAsString()
//                    + " lat " + coordinatesArr.get(i).getAsJsonArray().get(1).getAsString());

        }


        // разбираем для второй части
        JsonObject propertiesObj = featuresObj.getAsJsonObject("properties");
        JsonArray segmentsArr = propertiesObj.getAsJsonArray("segments");

        /////////////////////////////////////////////////////////
        // вторая часть ответа - описание сегментов маршрута
        List<RouteSegment> answerRouteSegments = new ArrayList<>();




        for (int i = 0; i < segmentsArr.size(); i++) {

            JsonObject oneSegObj = segmentsArr.get(i).getAsJsonObject();

            RouteSegment routeSegment = new RouteSegment();
            routeSegment.setDistance(oneSegObj.get("distance").getAsString());

            JsonArray stepsArr = oneSegObj.get("steps").getAsJsonArray();

            // индекс координаты начала сегмента
            int indexCoordBegin = stepsArr.get(0).getAsJsonObject().get("way_points").getAsJsonArray().get(0).getAsInt();
            // индекс координаты конца сегмента
            int indexCoordEnd = stepsArr.get(stepsArr.size() - 1).getAsJsonObject().get("way_points").getAsJsonArray().get(1).getAsInt();

            routeSegment.setCoordinatesBegin(answerCoordinates.get(indexCoordBegin));
            routeSegment.setCoordinatesEnd(answerCoordinates.get(indexCoordEnd));


            // получим имена через запрос к геокодам
            // начало сегмента
            restUrl = "https://api.openrouteservice.org/geocode/reverse"
                    + "?api_key=" + authToken
                    + "&point.lon=" + answerCoordinates.get(indexCoordBegin).getLon()
                    + "&point.lat=" + answerCoordinates.get(indexCoordBegin).getLat()
                    + "&boundary.circle.radius=1&size=1";

            String serverGeoAnswer = WebRequestUtil.sendRequest(restUrl, null,"get", null);
//            log.warn(serverGeoAnswer);

            routeSegment.setPlacebegin(getAddressFromGeoJsonAnswer(serverGeoAnswer));

            // окончание сегмента
            restUrl = "https://api.openrouteservice.org/geocode/reverse"
                    + "?api_key=" + authToken
                    + "&point.lon=" + answerCoordinates.get(indexCoordEnd).getLon()
                    + "&point.lat=" + answerCoordinates.get(indexCoordEnd).getLat()
                    + "&boundary.circle.radius=1&size=1";

            serverGeoAnswer = WebRequestUtil.sendRequest(restUrl, null,"get", null);
//            log.warn(serverGeoAnswer);

            routeSegment.setPlaceend(getAddressFromGeoJsonAnswer(serverGeoAnswer));

            answerRouteSegments.add(routeSegment);

        }

        return new RouteInfoDTO(answerRouteSegments, answerCoordinates);
    }


    private String getAddressFromGeoJsonAnswer(String geoJsonAnswer) {
        JsonObject jsonGeoObject = JsonParser.parseString(geoJsonAnswer).getAsJsonObject();
        JsonArray featuresGeoArr = jsonGeoObject.getAsJsonArray("features");
        JsonObject featuresGeoObj = featuresGeoArr.get(0).getAsJsonObject();
        JsonObject propertiesGeoObj = featuresGeoObj.get("properties").getAsJsonObject();

        return propertiesGeoObj.get("name").getAsString()
                + ", " + propertiesGeoObj.get("county").getAsString()
                + ", " + propertiesGeoObj.get("region").getAsString();

    }
}
