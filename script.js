  

var apiKey = "d735412b94d837506da35310984787e4";

$(document).ready(function(){

    $("#searchButton").on("click",searchLocation);

    var history = JSON.parse(localStorage.getItem("history"));  

    if (history) {
        var lastSearchedCity = history[0];
        currentLocationWeather(lastSearchedCity);

        for(var i = 0 ; i < history.length; i++){
            
            var listitem = $("<li>").addClass("list-group-item previousCity").text(history[i]);
            $("#historylist").append(listitem);    
        }
    } else {
        $("#city-card").hide();
        $("#forecastDisplay").hide();
    }
});

$("#historylist").on("click", "li", function(event){

    var previousCityName = $(this).text();
    console.log("Previous city : "+ previousCityName);
    currentLocationWeather(previousCityName);
});
 
function searchLocation(event){
    event.preventDefault();

    var searchInput = $("#citySearch").val();
    if(searchInput === "")
    {
        return;
    } 
    currentLocationWeather(searchInput);
    createSearchHistory(searchInput);
    $("#citySearch").val("");
}

function createSearchHistory(city){

    var history = JSON.parse(localStorage.getItem("history"));  
    var listitem;

    if(history){

        for(var i = 0 ; i < history.length; i++){
            if(history[i] === city){
                return;
            }         
        } 
        history.unshift(city); 
        listitem = $("<li>").addClass("list-group-item previousCity").text(city);
        $("#historylist").prepend(listitem);    
    }
    else{
            history = [city]; 
            listitem = $("<li>").addClass("list-group-item previousCity").text(city);
            $("#historylist").append(listitem);
        }
    localStorage.setItem("history", JSON.stringify(history));   
}


function showForecast(forecastQuery){


    var temp, humidity,icon;

    $.ajax({
            
        url: forecastQuery,
        method: "GET"

    }).then(function(forecastData){

        $("#forecast").empty();
        var list = forecastData.list;

        for(var i = 0 ; i < list.length ;i++){
            var date = list[i].dt_txt.split(" ")[0];
            var dateArr = date.split("-");
            var dateForecast = dateArr[1]+"/"+dateArr[2]+"/"+dateArr[0];
            var time = list[i].dt_txt.split(" ")[1];
            
            if(time === "12:00:00"){

                temp = list[i].main.temp;
                humidity = list[i].main.humidity;
                icon = list[i].weather[0].icon;

                var card = $("<div>").addClass("card bg-primary text-white");
                var cardBody = $("<div>").addClass("card-body");
                var fDate = $("<h5>").addClass("card-text").text(dateForecast);
                var imgIcon = $("<img>").attr("src","https://openweathermap.org/img/wn/" + icon + ".png"); 
                var tempP  = $("<p>").addClass("card-text").text("Temp: "+temp+"°F");
                var humidityP = $("<p>").addClass("card-text").text("Humidity : "+humidity+" % ");

                cardBody.append(fDate, imgIcon, tempP, humidityP);
                card.append(cardBody);

                $("#forecast").append(card);
            }
       
        }
    });
}


function currentLocationWeather(city){

    var searchQueryURL = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+ apiKey; 

    $.ajax({
        url: searchQueryURL,
        method: "GET"

    }).then(function(response){
 
        var tempFahr = (response.main.temp - 273.15) * 1.80 + 32;
        var tempCels = (response.main.temp - 273.15);
        var currentDate = new Date().toLocaleDateString();
        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        

        var uvQuery = "https://api.openweathermap.org/data/2.5/uvi?lat="+latitude+"&lon="+longitude+"&appid="+ apiKey;
        var cityID = response.id;
        var forecastQuery = "https://api.openweathermap.org/data/2.5/forecast?id="+cityID+"&units=imperial&appid="+apiKey;
          
        $("#city-card").show();
        $("#temperature").text("Temperature : "+tempFahr.toFixed(2)+" °F/ "+tempCels.toFixed(2)+"°C");
        $("#humidity").text("Humidity : "+response.main.humidity+" %");
        $("#windspeed").text("Wind Speed : "+response.wind.speed+" MPH");

        var imageIcon = $("<img>").attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon.toString() + ".png");

        $("#city-name").text(response.name + " ("+currentDate+") ").append(imageIcon);

        collectUV(uvQuery); 
        showForecast(forecastQuery);
        
    });   

}


function collectUV(uvQuery){
    
    $.ajax({
        url: uvQuery,
        method: "GET"

    }).then(function(uvStatus){
    
        var uvRange = uvStatus.value;
        var uvItem = $("<button>").attr("type","button").text(uvRange);
 
        if(uvRange >= 0 && uvRange <= 4){

            $("#uvrange").text("UV : Low, ").append(uvItem);
            uvItem.addClass("btn bg-success");
        }
        else if(uvRange >= 4 && uvRange <= 7){

            $("#uvrange").text("UV : Medium, ").append(uvItem);
            uvItem.addClass("btn bg-warning");
        }
        else if(uvRange >= 7 && uvRange <= 10){

            $("#uvrange").text("UV : High, ").append(uvItem);
            uvItem.addClass("btn bg-danger");
        }
    });
}



