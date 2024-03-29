$(function(){
  windowHeight = $(window).height();
  windowWidth = $(window).width();
  
  $('.forecast-list li').each(function(){
    forecastList.push($(this));
  });
  
  $('#markers li').each(function(){
    markersList.push($(this));
  });

  var geoLocal = false;
  var cityName = 'Madrid';
  var lang = 'en';
  var DEG = 'c';
  var reloadTime = 30;

  var menu = $('#menu');
  var wrapper = $('#content-wrapper');

  var colours = [];

  var weatherCache;
  var forecastCache;

  var weatherAPI, forecastAPI;


  if (geoLocal == true) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    }
    else {
      alert('Error in localization');
    }
  }
  else {
    weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&callback=?&lang=' + lang;
    forecastAPI = 'http://api.openweathermap.org/data/2.5/forecast?q='+ cityName +'&callback=?&lang=' + lang;

    weatherCache = getWeatherInfo(weatherAPI);
  }

  var date = new Date();
  var offset = d.getTimezoneOffset()*60*1000;

  function locationSuccess(position) {
    var crd = position.coords;

    weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?lat='+crd.latitude+'&lon='+crd.longitude+'&callback=?&lang=' + lang
    forecastAPI = 'http://api.openweathermap.org/data/2.5/forecast?lat='+crd.latitude+'&lon='+crd.longitude+'&callback=?&lang=' + lang;

    forecastCache = getWeatherInfo(weatherAPI);
  }

  function locationError(error) {
    switch(error.code) {
      case error.TIMEOUT:
        showError("A timeout occured! Please try again!");
        break;
      case error.POSITION_UNAVAILABLE:
        showError('We can\'t detect your location. Sorry!');
        break;
      case error.PERMISSION_DENIED:
        showError('Please allow geolocation access for this to work.');
        break;
      case error.UNKNOWN_ERROR:
        showError('An unknown error occured!');
        break;
    }
  }

  function getWeatherInfo(weatherAPI) {
    $.getJSON(weatherAPI, function(response){
      localStorage.weatherCache = JSON.stringify({
        timestamp:(new Date()).getTime(),
        data: response
      });
    });

    var cacheWeather = $.parseJSON(localStorage.weatherCache);

    return cacheWeather;
  }

  function getForecastInfo(forecastAPI) {
    $.getJSON(forecastAPI, function(response){
      localStorage.forecastCache = JSON.stringify({
        timestamp:(new Date()).getTime(),
        data: response
      });
    });

    var cacheForecast = $.parseJSON(localStorage.forecastCache);

    return cacheForecast;
  }

  function getIcon(conditionId) {
    if (conditionId == '200' || conditionId == '201' || conditionId == '202' || conditionId == '210' || conditionId == '211' || conditionId == '212' || conditionId == '221' || conditionId == '230' || conditionId == '231' || conditionId == '232')
      return 'thunderstorm';

    else if (conditionId == '300' || conditionId == '301' || conditionId == '302' || conditionId == '310')
      return 'drizzle-light';

    else if (conditionId == '311' || conditionId == '312' || conditionId == '321')
      return 'drizzle-heavy';

    else if (conditionId == '500' || conditionId == '501' || conditionId == '520' || conditionId == '521' || conditionId == '522')
      return 'rain-light';

    else if (conditionId == '502' || conditionId == '503' || conditionId == '504')
      return 'rain-heavy';

    else if (conditionId == '511' || conditionId == '611')
      return 'sleet';

    else if (conditionId == '600' || conditionId == '601' || conditionId == '621')
      return 'snow-light';

    else if (conditionId == '602')
      return 'snow-heavy';

    else if (conditionId == '701' || conditionId == '711' || conditionId == '731' || conditionId == '741' || conditionId == '751')
      return 'fog';

    else if (conditionId == '721')
      return 'haze';

    else if (conditionId == '800')
      return 'clear-d';

    else if (conditionId == '801')
      return 'clouds-few-d';

    else if (conditionId == '802' || conditionId == '803' || conditionId == '804')
      return 'clouds-overcast';

    else if (conditionId == '900')
      return 'tornado';

    else if (conditionId == '901' || conditionId == '902')
      return 'clouds-storm';

    else if (conditionId == '903')
      return 'cold';

    else if (conditionId == '904')
      return 'hot';

    else if (conditionId == '905')
      return 'wind';

    else if (conditionId == '906')
      return 'hail';
  }

  function tempConverter(temperature) {
      return Math.round(DEG == 'c' ? (temperature - 273.15) : (temperature*9/5 - 459.67));
  }

  function getDayName(day) {
    days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

    return days[day];
  }

  function getColour(temp, hum, sunrise, sunset, time) {

    var curDay = time;

    var riseSetDif = sunset - sunrise;

    var threshold = riseSetDif / 2;

    var dayms = 24 * 60 * 60 * 1000;

    var setRiseDif = dayms - riseSetDif;

    // while (sunset + riseSetDif * 2 < time) {
    //   sunset = sunset + riseSetDif * 2;
    //   sunset = sunset + riseSetDif * 2;
    // }

    var mid;
    var vertex;

    var kelvin = 273.15;
    var minTemp = -10 + kelvin;
    var maxTemp = 30 + kelvin;

    var S;
    var V;

    var HSL = new Array();

    HSL[0] = 240 * (maxTemp - temp)/(maxTemp - minTemp);

    if (HSL[0] < 0)
      HSL[0] = 0;
    else if (HSL[0] > 240)
      HSL[0] = 240;

    S = 0.4 * (100 - hum) + 60;


    // S /= 100;

    HSL[1] = S;

    vertex = 50;
    mid = sunrise + riseSetDif/2;

    while ((time < sunrise && time < sunset) || (time > sunrise && time > sunset)) {    
      if (time < sunrise && time < sunset) {
        sunset -= dayms;
        mid = sunset + setRiseDif/2;
        vertex = 8;
      }
      else if (time > sunrise && time > sunset) {
        sunrise += dayms;
        mid = sunset + setRiseDif/2;
        vertex = 8;
      }
      // else {
      //   vertex = 90;
      //   mid = sunrise + riseSetDif/2;
      // }
    }

    if ((time < sunrise && time > sunset))
      vertex = 8;
    else
      vertex = 50;

    // f(x)=a(x-h)2+k,  vertex (h,k)

    var a;
    var y = 17;

    a = (y - vertex)/((sunrise - mid) * (sunrise - mid));

    V = a * ((time - mid) * (time - mid)) + vertex;

    // V /= 100;


    // HSL[2] = (2 - S) * V;
    HSL[2] = V;

    // HSL[1] = S * V;

    // HSL[1] /= (HSL[2] <= 1) ? (HSL[2]) : 2 - (HSL[2]);

    // HSL[2] /= 2;

    // HSL[1] *= 100;
    // HSL[2] *= 100;

    // if (HSL[2] > 50)
    //   HSL[2] = 50;

    // return HSL;
    return 'hsl('+ HSL[0] + ',' + HSL[1] + '% ,' + HSL[2] + '%)'
  }

  function paintBg(colours, index) {

    // var hslColour;

    // if (index == 15) {
      wrapper.css('background-color', colours[index]);
    // }

    // else {
    //   hslColour = '-webkit-linear-gradient(top,' + colours[index] + ',' + colours[index + 1] + ' 50%,' + colours[index + 2] + ')'
    //   // wrapper.css('background-color', 'none');
    //   wrapper.css('background-image', '-webkit-' + hslColour);
    //   wrapper.css('background-image', hslColour);
    //   // wrapper.css('background-image', 'linear-gradient(top,' + colours[index] + ',' + colours[index + 1] + ')');
    //   // wrapper.css('background-image', '-webkit-linear-gradient(top,' + colours[index] + ',' + colours[index + 1] + ')');
    // }
  }

  function changeInfo(index) {
    $('.forecast-list li').removeClass('show');
    forecastList[index].addClass('show');
    $('#markers li').removeClass('show');
    markersList[index].addClass('show');
  }
})