const apiKey = "6c9ef297b236ae91e3105e8fcc25e4f0";

document.addEventListener('DOMContentLoaded', function() {
    const defaultCity = "Delhi";
    document.getElementById('cityInput').value = defaultCity;

    getWeather();
});

function getWeather() {
    const city = document.getElementById('cityInput').value.trim();

    if (!city) {
        getLocation(); 
        } else {
        fetchWeatherData(city);
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log(`Location found: Lat: ${lat}, Lon: ${lon}`);
                fetchWeatherData(null, lat, lon); // Use latitude and longitude
            },
            (error) => {
                console.error("Error fetching location:", error);
                console.log("Defaulting to Delhi due to location fetch failure.");
                fetchWeatherData("Delhi"); // Default to Delhi if location fetch fails
            }
        );
    }
}

function fetchWeatherData(city = "Delhi", lat = null, lon = null) {
    const currentWeatherUrl = lat && lon
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const forecastUrl = lat && lon
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    console.log(`Fetching current weather from URL: ${currentWeatherUrl}`);
    console.log(`Fetching forecast from URL: ${forecastUrl}`);

    fetch(currentWeatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => displayCurrentWeather(data))
        .catch(error => {
            console.error('Error fetching current weather data:', error);
        });

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => displayForecast(data.list))
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}

function displayCurrentWeather(data) {
    const currentCity = document.getElementById("currentCity");
    const currentConditionEle = document.getElementById('currentCondition');
    const currentTempEle = document.getElementById('currentTemp');
    const currentHumidityEle = document.getElementById('currentHumidity');
    const currentWindSpeedEle = document.getElementById('currentWindSpeed');
    const currentDateTimeEle = document.getElementById('currentDateTime');
    const imgIcon = document.getElementById('weatherIcon').querySelector('img');

    if (data.cod === '404') {
        alert(data.message);
    } else {
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const dateTime = new Date(data.dt * 1000).toLocaleString();
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        currentCity.innerHTML = `${data.name}`;
        currentConditionEle.innerHTML = `Description: ${description}`;
        currentTempEle.innerHTML = `<i class="fa-solid fa-temperature-three-quarters"></i> Temperature: ${temperature}°C`;
        currentHumidityEle.innerHTML = `<i class="fas fa-tint"></i> Humidity: ${humidity}%`;
        currentWindSpeedEle.innerHTML = `<i class="fas fa-wind"></i> Wind Speed: ${windSpeed} m/s`;
        currentDateTimeEle.innerHTML = `<i class="fas fa-calendar-day"></i> Date & Time: ${dateTime}`;
        imgIcon.src = iconUrl;
        imgIcon.alt = description;
    }
}

function displayForecast(forecastData) {
    const labels = [];
    const temps = [];
    const humidities = [];
    const conditions = [];

    forecastData.forEach((entry, index) => {
        if (index % 8 === 0) { // Get data for every 24 hours (8 * 3 hours = 24 hours)
            const date = new Date(entry.dt * 1000).toLocaleDateString();
            labels.push(date);
            temps.push(entry.main.temp);
            humidities.push(entry.main.humidity);
            conditions.push(entry.weather[0].main);
        }
    });

    // new Chart(tempChartCtx, {
    //     type: 'line',
    //     data: {
    //         labels: labels,
    //         datasets: [{
    //             label: 'Temperature (°C)',
    //             data: temps,
    //             borderColor: 'rgba(75, 192, 192, 1)',
    //             borderWidth: 1,
    //             fill: false
    //         }]
    //     },
    //     options: {
    //         scales: {
    //             y: {
    //                 beginAtZero: true
    //             }
    //         }
    //     }
    // });

    // new Chart(humidityChartCtx, {
    //     type: 'line',
    //     data: {
    //         labels: labels,
    //         datasets: [{
    //             label: 'Humidity (%)',
    //             data: humidities,
    //             borderColor: 'rgba(153, 102, 255, 1)',
    //             borderWidth: 1,
    //             fill: false
    //         }]
    //     },
    //     options: {
    //         scales: {
    //             y: {
    //                 beginAtZero: true
    //             }
    //         }
    //     }
    // });

    const ctx = document.getElementById('combinedChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // Your x-axis labels, like days of the week
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temps, // Your temperature data
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false,
                    yAxisID: 'y1'
                },
                {
                    label: 'Humidity (%)',
                    data: humidities, // Your humidity data
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    fill: false,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            scales: {
                y1: {
                    beginAtZero: true,
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                y2: {
                    beginAtZero: true,
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    },
                    grid: {
                        drawOnChartArea: false // To prevent grid lines from overlapping
                    }
                }
            }
        }
    });

}
