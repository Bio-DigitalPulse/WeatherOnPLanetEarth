  

var apiKey = "d735412b94d837506da35310984787e4";        //API key to call data

$(document).ready(function(){

    $("#searchButton").on("click",searchLocation);      //Search function examining localStorage for recent history

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
        $("#forecastDisplay").hide();       //If there exists history, append it, otherwise hide card and forecast
    }
});

$("#historylist").on("click", "li", function(event){        //Click event for appended cities

    var previousCityName = $(this).text();
    currentLocationWeather(previousCityName);
});
 
function searchLocation(event){     //Search function to search location
    event.preventDefault();

    var searchInput = $("#citySearch").val();       //Checks to see if there is any input, if there is then return
    if(searchInput === "")
    {
        return;
    } 
    currentLocationWeather(searchInput);        //Return these functons
    createSearchHistory(searchInput);
    $("#citySearch").val("");
}

function createSearchHistory(city){     //Once a search is made, the request gets recorded to the list in localStorage

    var history = JSON.parse(localStorage.getItem("history"));  
    var listitem;

    if(history){

        for(var i = 0 ; i < history.length; i++){
            if(history[i] === city){
                return;
            }         
        } 
        history.unshift(city);      //Else statement adding or removing search history to localStorage
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


function showForecast(forecastQuery){       //Function that creates cards displaying the forcast, adding various elements including icon
    
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
            var dateForecast = dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0];
            var time = list[i].dt_txt.split(" ")[1];
            
            if(time === "12:00:00"){

                temp = list[i].main.temp;
                humidity = list[i].main.humidity;
                icon = list[i].weather[0].icon;

                var card = $("<div>").addClass("card bg-primary text-white");
                var cardBody = $("<div>").addClass("card-body");
                var fDate = $("<h5>").addClass("card-text").text(dateForecast);
                var imgIcon = $("<img>").attr("src","https://openweathermap.org/img/wn/" + icon + ".png"); 
                var tempP  = $("<p>").addClass("card-text").text("Temp: " + temp + "°F");
                var humidityP = $("<p>").addClass("card-text").text("Humidity : " + humidity + " % ");

                cardBody.append(fDate, imgIcon, tempP, humidityP);
                card.append(cardBody);

                $("#forecast").append(card);
            }
       
        }
    });
}


function currentLocationWeather(city){      //Function pulling current location weather information

    var searchQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey; 

    $.ajax({
        url: searchQueryURL,
        method: "GET"

    }).then(function(response){         //Creates card displaying the data for the user
 
        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        var tempFahr = (response.main.temp - 273.15) * 1.80 + 32;
        var tempCels = (response.main.temp - 273.15);
        var currentDate = new Date().toLocaleDateString();

        var uvQuery = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey;
        var cityID = response.id;
        var forecastQuery = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=imperial&appid=" + apiKey;
          
        $("#city-card").show();
        $("#temperature").text("Temperature : " + tempFahr.toFixed(2) + "°F/" + tempCels.toFixed(2) + "°C");
        $("#humidity").text("Humidity : " + response.main.humidity + "%");
        $("#windspeed").text("Wind Speed : " + response.wind.speed + "MPH");

        var imageIcon = $("<img>").attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon.toString() + ".png");

        $("#city-name").text(response.name + " (" + currentDate + ") ").append(imageIcon);

        collectUV(uvQuery); 
        showForecast(forecastQuery);
        
    });   

}


function collectUV(uvQuery){        //Function pulling UV data, and depending on that data, displaying a color code
    
    $.ajax({
        url: uvQuery,
        method: "GET"

    }).then(function(uvStatus){
    
        var uvRange = uvStatus.value;
        var uvItem = $("<button>").attr("type","button").text(uvRange);
 
        if(uvRange >= 0 && uvRange <= 4){           //Color range

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



