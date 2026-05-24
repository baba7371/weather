let searchinput = document.querySelector(`.searchinput`);

navigator.geolocation.getCurrentPosition(async function (position) {
    try {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        
        // 1. Pehle location ka naam nikalne ke liye request bheji
        var map = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`);
        var userdata = await map.json();
        
        // Agar local name english mein available hai toh wo lo, nahi toh default name
        let loc = (userdata && userdata[0]) ? (userdata[0].local_names?.en || userdata[0].name) : "";
        
        // Kharar Tahsil ya Tahsil word ko remove karne ka jugaad taaki API 404 na de
        if (loc.toLowerCase().includes("tahsil")) {
            loc = loc.replace(/tahsil/gi, "").trim();
        }

        // 2. Direct clean Lat & Lon se weather fetch karo taaki sheher ke naam se kabhi 404 na aaye!
        let respond = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        
        if (!respond.ok) {
            throw new Error("Weather data fetch failed");
        }
        
        let data = await respond.json();
        console.log("Current and Forecast Data:", data);
        
        // DOM Elements selection
        let cityMain = document.getElementById("city-name");
        let cityTemp = document.getElementById("metric");
        let weatherMain = document.querySelectorAll("#weather-main");
        let mainHumidity = document.getElementById("humidity");
        let mainFeel = document.getElementById("feels-like");
        let weatherImg = document.querySelector(".weather-icon");
        let weatherImgs = document.querySelector(".weather-icons");
        let tempMinWeather = document.getElementById("temp-min-today");
        let tempMaxWeather = document.getElementById("temp-max-today");

        // Display current weather info securely
        if (cityMain) cityMain.innerHTML = loc || data.city.name;
        if (cityTemp) cityTemp.innerHTML = Math.floor(data.list[0].main.temp) + "°";
        
        if (weatherMain.length > 0) {
            if (weatherMain[0]) weatherMain[0].innerHTML = data.list[0].weather[0].description;
            if (weatherMain[1]) weatherMain[1].innerHTML = data.list[0].weather[0].description;
        }
        
        if (mainHumidity) mainHumidity.innerHTML = Math.floor(data.list[0].main.humidity);
        if (mainFeel) mainFeel.innerHTML = Math.floor(data.list[0].main.feels_like);
        if (tempMinWeather) tempMinWeather.innerHTML = Math.floor(data.list[0].main.temp_min) + "°";
        if (tempMaxWeather) tempMaxWeather.innerHTML = Math.floor(data.list[0].main.temp_max) + "°";

        let weatherCondition = data.list[0].weather[0].main.toLowerCase();

        // Fixed image sources path and conditions cleanly
        let imgSrc = "img/sun.png"; // Default
        if (weatherCondition === "rain") {
            imgSrc = "img/rain.png";
        } else if (weatherCondition === "clear" || weatherCondition === "clear sky") {
            imgSrc = "img/sun.png";
        } else if (weatherCondition === "snow") {
            imgSrc = "img/snow.png";
        } else if (weatherCondition === "clouds" || weatherCondition === "smoke") {
            imgSrc = "img/cloud.png";
        } else if (weatherCondition === "mist" || weatherCondition === "fog") {
            imgSrc = "img/mist.png";
        } else if (weatherCondition === "haze") {
            imgSrc = "img/haze.png";
        } else if (weatherCondition === "thunderstorm") {
            imgSrc = "img/thunderstorm.png";
        }

        if (weatherImg) weatherImg.src = imgSrc;
        if (weatherImgs) weatherImgs.src = imgSrc;

        // Display 5-day forecast from already fetched data (No extra fetch needed!)
        displayForecast(data);

        function displayForecast(data) {
            const dailyForecasts = {};
            let forecast = document.getElementById('future-forecast-box');
            if (!forecast) return;
            
            let forecastbox = "";

            data.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0];
                let dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                let day = new Date(date).getDay();

                if (!dailyForecasts[date]) {
                    dailyForecasts[date] = {
                        day_today: dayName[day],
                        temperature: Math.floor(item.main.temp) + "°",
                        description: item.weather[0].description,
                        weatherImg: item.weather[0].main.toLowerCase()
                    };
                }
            });

            for (const date in dailyForecasts) {
                let fImgSrc = "img/sun.png";

                switch (dailyForecasts[date].weatherImg) {
                    case "rain":
                        fImgSrc = "img/rain.png";
                        break;
                    case "clear":
                    case "clear sky":
                        fImgSrc = "img/sun.png";
                        break;
                    case "snow":
                        fImgSrc = "img/snow.png";
                        break;
                    case "clouds":
                    case "smoke":
                        fImgSrc = "img/cloud.png";
                        break;
                    case "mist":
                    case "fog":
                        fImgSrc = "img/mist.png";
                        break;
                    case "haze":
                        fImgSrc = "img/haze.png";
                        break;
                    case "thunderstorm":
                        fImgSrc = "img/thunderstorm.png";
                        break;
                }

                forecastbox += `
                <div class="weather-forecast-box">
                    <div class="day-weather">
                        <span>${dailyForecasts[date].day_today}</span>
                    </div>
                    <div class="weather-icon-forecast">
                        <img src="${fImgSrc}" />
                    </div>
                    <div class="temp-weather">
                        <span>${dailyForecasts[date].temperature}</span>
                    </div>
                    <div class="weather-main-forecast">${dailyForecasts[date].description}</div>
                </div>`;
            }

            forecast.innerHTML = forecastbox;
        }
    } catch (error) {
        console.error("An error occurred inside main.js:", error);
    }
},
() => {
    alert("Please turn on your location and refresh the page");
});