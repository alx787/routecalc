var test = {};

test.module = (function () {

    var testdata = '{"segments":[{"name":null,"distance":262.8,"placebegin":"8 улица Кольцова, Kirov, Kirov","placeend":"2 улица Кольцова, Kirov, Kirov","coordinatesBegin":{"lon":49.604341,"lat":58.608181},"coordinatesEnd":{"lon":49.607685,"lat":58.609693},"wayPointBegin":0,"wayPointEnd":6},{"name":null,"distance":377.2,"placebegin":"2 улица Кольцова, Kirov, Kirov","placeend":"Храм Веры, Надежды, Любви и матери их Софии, Kirov, Kirov","coordinatesBegin":{"lon":49.607685,"lat":58.609693},"coordinatesEnd":{"lon":49.612156,"lat":58.607469},"wayPointBegin":6,"wayPointEnd":15},{"name":null,"distance":293.3,"placebegin":"Храм Веры, Надежды, Любви и матери их Софии, Kirov, Kirov","placeend":"58Б улица Лепсе, Kirov, Kirov","coordinatesBegin":{"lon":49.612156,"lat":58.607469},"coordinatesEnd":{"lon":49.616127,"lat":58.608877},"wayPointBegin":15,"wayPointEnd":21},{"name":null,"distance":178.8,"placebegin":"58Б улица Лепсе, Kirov, Kirov","placeend":"32 улица Монтажников, Kirov, Kirov","coordinatesBegin":{"lon":49.616127,"lat":58.608877},"coordinatesEnd":{"lon":49.614062,"lat":58.610031},"wayPointBegin":21,"wayPointEnd":27}],"coordinates":[{"lon":49.604341,"lat":58.608181},{"lon":49.604602,"lat":58.608296},{"lon":49.605196,"lat":58.608566},{"lon":49.605399,"lat":58.608656},{"lon":49.607484,"lat":58.609574},{"lon":49.607714,"lat":58.609675},{"lon":49.607685,"lat":58.609693},{"lon":49.607714,"lat":58.609675},{"lon":49.608676,"lat":58.609063},{"lon":49.608773,"lat":58.609005},{"lon":49.609003,"lat":58.608866},{"lon":49.609771,"lat":58.608401},{"lon":49.610429,"lat":58.608003},{"lon":49.611213,"lat":58.607529},{"lon":49.611323,"lat":58.607463},{"lon":49.612156,"lat":58.607469},{"lon":49.613361,"lat":58.607479},{"lon":49.613483,"lat":58.607518},{"lon":49.614958,"lat":58.608274},{"lon":49.615416,"lat":58.608508},{"lon":49.616087,"lat":58.608857},{"lon":49.616127,"lat":58.608877},{"lon":49.616087,"lat":58.608857},{"lon":49.615933,"lat":58.608943},{"lon":49.615844,"lat":58.608994},{"lon":49.615102,"lat":58.609416},{"lon":49.614622,"lat":58.609699},{"lon":49.614062,"lat":58.610031}]}';

    var getTestData = function() {
        return JSON.parse(testdata);
    }

    return {
        getTestData:getTestData
    }

}());