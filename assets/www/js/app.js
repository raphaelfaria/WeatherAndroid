$(function(){

  //Get weather

  windowHeight = $(window).height();
  windowWidth = $(window).width();

  var forecastList = [];
  var markersList = [];

  $('.forecast-list li').each(function(){
    forecastList.push($(this));
  });
  
  $('#markers li').each(function(){
    markersList.push($(this));
  });

  var geoLocal = false;

  var cityName = 'Madrid';

  var lang = 'en'

  var DEG = 'c';

  var reloadTime = 30; //in minutes

  var menu = $('#menu');
  var wrapper = $('#content-wrapper');
  var contWrapper = $('#forecast-wrapper');

  var colours = [];

  var liCur = 0;

  var posHolder;
  var posStart;

  var dragThreshold = (windowHeight * 0.6)/16;

  wrapper.hammer().on("dragstart", function(event) {
    posStart = event.gesture.center.pageY;
    posHolder = posStart;
  });

  wrapper.hammer({drag_min_distance: 1}).on("drag", function(event) {
    console.log('start: ' + posHolder + ' pageY: ' + event.gesture.center.pageY + ' delta: ' + event.gesture.deltaY);

    if (liCur == 15 && event.gesture.center.pageY > posHolder) {
      posHolder = event.gesture.center.pageY;
    }
    if (liCur == 0 && event.gesture.center.pageY < posHolder) {
      posHolder = event.gesture.center.pageY;
    }
    if (event.gesture.center.pageY >= posHolder + dragThreshold && liCur < 15) {
      liCur++;
      wrapper.css('background-color', colours[liCur]);
      $('.forecast-list li').removeClass('show');
      forecastList[liCur].addClass('show');
      $('#markers li').removeClass('show');
      markersList[liCur].addClass('show');
      posHolder = event.gesture.center.pageY;
    }
    else if (event.gesture.center.pageY <= posHolder - dragThreshold && liCur > 0) {
      liCur--;
      wrapper.css('background-color', colours[liCur]);
      $('.forecast-list li').removeClass('show');
      forecastList[liCur].addClass('show');
      $('#markers li').removeClass('show');
      markersList[liCur].addClass('show');
      posHolder = event.gesture.center.pageY;
    }
  });

  if (geoLocal == true) {
     if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
     }
     else {
         alert('Error in localization');
     }
  }
  else {
     var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&callback=?&lang=' + lang;

     var forecastAPI = 'http://api.openweathermap.org/data/2.5/forecast?q='+ cityName +'&callback=?&lang=' + lang;

     getWeatherInfo(weatherAPI, forecastAPI);
  }

  var menu = $('#menu');

  wrapper.hammer().on("touch", function(event) {
    if (menu.hasClass('menu-active'))
      toggleMenu();
  });

  $('#menu-button').hammer().on("touch", function(event) {
    toggleMenu();
  });

  function locationSuccess(position) {
    var crd = position.coords;

    var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?lat='+crd.latitude+'&lon='+crd.longitude+'&callback=?&lang=' + lang;

    var forecastAPI = 'http://api.openweathermap.org/data/2.5/forecast?lat='+crd.latitude+'&lon='+crd.longitude+'&callback=?&lang=' + lang;

    getWeatherInfo(weatherAPI, forecastAPI);
  }

  function getWeatherInfo(weatherAPI, forecastAPI) {

    $.getJSON(weatherAPI, function(response){
      localStorage.weatherCache = JSON.stringify({
        timestamp:(new Date()).getTime(),
        data: response
      });
    });

    var cache = $.parseJSON(localStorage.weatherCache);

    var d = new Date();

    var offset = d.getTimezoneOffset();
    var localtime = d.getTime();

    console.log(localtime);

    var sunrise = cache.data.sys.sunrise * 1000;
    var sunset = cache.data.sys.sunset * 1000;
    var city = cache.data.name;
    var temp = cache.data.main.temp;
    var hum = cache.data.main.humidity;
    var conditionId = cache.data.weather[0].id;
    var mainCondition = cache.data.weather[0].main;
    var condition = cache.data.weather[0].description;
    var minMax = [cache.data.main.temp_min, cache.data.main.temp_max];

    var iconLocation = 'img/';
    var iconExt = '.png';

    colours[0] = getColour(temp, hum, sunrise, sunset, localtime);

    var markup = "<div class='time-location'><div class='time'>now</div><p class='location'>" + city + "</p></div><div class='weather-main'><div class='weather-icon'><img alt='' src='" + iconLocation + getIcon(conditionId) + iconExt + "' width='225px'></div><div class='temp'>" + tempConverter(temp) + 'º' + "</div></div><div class='weather-info'><p class='weather-condition'>" + condition + "</p><span class='min-max'>&nbsp;</span></div>"
    forecastList[0].append(markup);


    $.getJSON(forecastAPI, function(response){
      localStorage.forecastCache = JSON.stringify({
        timestamp:(new Date()).getTime(),
        data: response
      });
    });

    var cacheForecast = $.parseJSON(localStorage.forecastCache);

    var forecastMilliseconds;
    var date;
    var hour;
    var day;
    var forecastTime;

    var j = 0;
    while (localtime > ((cacheForecast.data.list[j].dt * 1000) - offset))
      j++;

    for (var i = j; i < j + 15; i++) {
      // forecastMilliseconds = cacheForecast.data.list[i].dt * 1000 - offset;
      forecastTime = cacheForecast.data.list[i].dt * 1000 - offset;
      date = new Date(forecastTime);
      hour = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
      conditionId = cacheForecast.data.list[i].weather[0].id;
      temp = cacheForecast.data.list[i].main.temp;
      condition = cacheForecast.data.list[i].weather[0].description;
      colours[i - j + 1] = getColour(temp, hum, sunrise, sunset, forecastTime);
      day = getDayName(new Date(forecastTime).getDay());
      markup = "<div class='time-location'><div class='time'>"
                + day + ' ' + hour + "</div><p class='location'>"
                + city + "</p></div><div class='weather-main'><div class='weather-icon'><img alt='' src='"
                + iconLocation + getIcon(conditionId) + iconExt + "' width='225px'></div><div class='temp'>"
                + tempConverter(temp) + 'º' + "</div></div><div class='weather-info'><p class='weather-condition'>"
                + condition + "</p><span class='min-max'>&nbsp;</span></div>"
      forecastList[i - j + 1].append(markup);
    }
    paintBg(colours,0);
  }

  function locationError(error){
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
    days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[day];
  }

  function getColour(temp, hum, sunrise, sunset, time) {

    var curDay = time;

    var riseSetDif = sunset - sunrise;

    var threshold = riseSetDif / 2;

    var dayms = 24 * 60 * 60 * 1000;

    var setRiseDif = dayms - riseSetDif;

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

    HSL[1] = S;

    vertex = 50;
    mid = sunrise + riseSetDif/2;

    while ((time < sunrise && time < sunset) || (time > sunrise && time > sunset)) {    
      if (sunrise > sunset) {
        sunset += dayms;
        mid = sunrise + riseSetDif/2;
      }

      else if (time < sunrise && time < sunset) {
        sunset -= dayms;
        mid = sunset + setRiseDif/2;
        vertex = 8;
      }
      else if (time > sunrise && time > sunset) {
        sunrise += dayms;
        mid = sunset + setRiseDif/2;
        vertex = 8;
      }
    }

    if ((time < sunrise && time > sunset)) 
      vertex = 8;
    else
      vertex = 50;

    var a;
    var y = 17;

    a = (y - vertex)/((sunrise - mid) * (sunrise - mid));

    V = a * ((time - mid) * (time - mid)) + vertex;

    HSL[2] = V;

    return 'hsl('+ HSL[0] + ',' + HSL[1] + '% ,' + HSL[2] + '%)'
  }

  function paintBg(colours, index) {
    wrapper.css('background-color',colours[index]);
  }

  function changeInfo(index) {
    $('.forecast-list li').removeClass('show');
    forecastList[index].addClass('show');
    $('#markers li').removeClass('show');
    markersList[index].addClass('show');
  }

  function toggleMenu(){
    menu.toggleClass('menu-active');

    if (menu.hasClass('menu-active'))
      contWrapper.css('opacity', 0.4);
    else
      contWrapper.css('opacity', 1);
  }
})