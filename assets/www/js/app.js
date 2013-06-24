$(function(){

  //Resize icon

  // resizeIcon();

  // window.onresize = function(event) {
  //   resizeIcon();
  // }

  // $('.weather-icon').fitText();

  //Get weather

  var hourly = [];

  $('.hourly li').each(function(){
    hourly.push($(this));
  });

  windowHeight = $(window).height();

  var geoLocal = false;

  var cityName = 'Timimoun';

  var lang = 'en'

  var DEG = 'c';

  var reloadTime = 30 //in minutes

  var wrapper = $('#content-wrapper');
  var contWrapper = $('#forecast-wrapper');
  var location = $('.location');
  var tempDiv = $('.temp');
  var conditionDiv = $('.weather-condition');
  var minMaxDiv = $('.min-max');
  var weatherIcon = $('.weather-icon img');

  // $('html').mousedown(function() {
  //   $('.hourly li').css('height', '150px');
  // });
  // $('html').mouseup(function() {
  //   $('.hourly li').css('height', '30px');
  // });

  var menu = $('#menu');

  wrapper.hammer().on("touch", function(event) {
    if (menu.hasClass('menu-active'))
      toggleMenu()
      // menu.toggleClass('menu-active');
    else
      $('.hourly li').css('height', (windowHeight / 3) + 'px');
  });
  wrapper.hammer().on("release", function(event) {
    $('.hourly li').css('height', '30px');
  });
  $('#menu-button').hammer().on("touch", function(event) {
    event.stopPropagation();
  });

  $('#menu-button').hammer().on("touch", function(event) {
    // menu.toggleClass('menu-active');
    toggleMenu()
  });

  var liCur = 0;

  wrapper.hammer().on("dragright", function(event) {
    if (liCur < 15) {
      liCur++;
      var bgc = hourly[liCur].css('background-color');
      wrapper.css('background-color', bgc);
    }
  });
  wrapper.hammer().on("dragleft", function(event) {
    if (liCur > 0) {
      liCur--;
      var bgc = hourly[liCur].css('background-color');
      wrapper.css('background-color', bgc);
    }
  });


  // if (geoLocal == true) {
  //   if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
  //   }
  //   else {
  //       alert('Error in localization');
  //   }
  // }
  // else {
  //   var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&callback=?&lang=' + lang;
  //   getWeatherInfo(weatherAPI);
  // }

  function toggleMenu() {
    menu.toggleClass('menu-active');

    if (menu.hasClass('menu-active'))
      contWrapper.css('opacity', 0.4);
    else
      contWrapper.css('opacity', 1);
  }

  function locationSuccess(position) {
    var crd = position.coords;

    var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?lat='+crd.latitude+'&lon='+crd.longitude+'&callback=?&lang=' + lang;

    getWeatherInfo(weatherAPI);
  }

  function getWeatherInfo(weatherAPI) {

    $.getJSON(weatherAPI, function(response){
      localStorage.weatherCache = JSON.stringify({
        timestamp:(new Date()).getTime(),
        data: response
      });
    });

    var cache = $.parseJSON(localStorage.weatherCache);

    var d = new Date();

    var offset = d.getTimezoneOffset()*60*1000;
    var localtime = d.getTime() + offset;
    var sunrise = cache.data.sys.sunrise * 1000 + offset;
    var sunset = cache.data.sys.sunset * 1000 + offset;
    var city = cache.data.name;
    var temp = cache.data.main.temp;
    var hum = cache.data.main.humidity;
    var conditionId = cache.data.weather[0].id;
    var mainCondition = cache.data.weather[0].main;
    var condition = cache.data.weather[0].description;
    var minMax = [cache.data.main.temp_min, cache.data.main.temp_max];

    var iconLocation = 'img/';
    var iconExt = '.png';

    weatherIcon.attr("src", iconLocation + getIcon(conditionId) + iconExt);
    location.html(city);
    tempDiv.html(tempConverter(temp) + 'º');
    conditionDiv.html(condition);
    minMaxDiv.html(tempConverter(minMax[0]) + 'º / ' + tempConverter(minMax[1]) + 'º')
    var HSL = getColour(temp, hum, sunrise, sunset, localtime);
    // var hslString = 'hsl('+ HSL[0] + ',' + HSL[1] + ', 0.5)';
    wrapper.css('background-color', 'hsl('+ HSL[0] + ',' + HSL[1] + ',' + HSL[2] + ')');
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

    else if (conditionId == '701' || conditionId == '711' || conditionId == '731' || conditionId == '741')
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


  function getColour(temp, hum, sunrise, sunset, time) {

    var riseSetDif = sunset - sunrise;

    var threshold = riseSetDif / 2;

    var mid1 = sunrise - threshold;
    var mid2 = sunrise + threshold;

    var kelvin = 273.15;
    var minTemp = -10 + kelvin;
    var maxTemp = 30 + kelvin;

    var HSL = new Array();

    HSL[0] = 240 * (maxTemp - temp)/(maxTemp - minTemp);

    if (HSL[0] < 0)
      HSL[0] = 0;
    else if (HSL[0] > 240)
      HSL[0] = 240;

    HSL[1] = 0.4 * (100 - hum) + 60 + '%';

    if (time < mid2)
      HSL[2] = ((37.5 / (mid2 - mid1)) * (time - mid2) + 50) + '%';

    return HSL;
  }




})