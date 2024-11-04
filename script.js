const apiKeyOpenWeather = "49e2122f5c9da4368f1cd972696db508"; // replace with your OpenWeatherMap API key
const apiKeyMeteoWeather = "YOUR_METEOWEATHER_API_KEY"; // replace with your MeteoWeather API key (optional)

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getWeatherData, showError);
  } else {
    document.getElementById("output").innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showError(error) {
  let message = '';
  switch (error.code) {
    case error.PERMISSION_DENIED:
      message = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      message = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      message = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      message = "An unknown error occurred.";
      break;
  }
  document.getElementById("output").innerHTML = message;
}

async function getWeatherData(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKeyOpenWeather}&units=metric`;
  const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKeyOpenWeather}`;

  try {
    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(airQualityUrl)
    ]);

    const weatherData = await weatherResponse.json();
    const airQualityData = await airQualityResponse.json();

    displayData(weatherData, airQualityData);
  } catch (error) {
    document.getElementById("output").innerHTML = "Error fetching data: " + error.message;
  }
}

function displayData(weather, airQuality) {
  const output = document.getElementById("output");
  output.innerHTML = `
    <h2>Weather in ${weather.name}</h2>
    <p>Temperature: ${weather.main.temp}°C</p>
    <p>Weather: ${weather.weather[0].description}</p>
    <p>Humidity: ${weather.main.humidity}%</p>
    <p>Wind Speed: ${weather.wind.speed} m/s</p>
    <h2>Air Quality</h2>
    <p>CO: ${airQuality.list[0].components.co} µg/m³</p>
    <p>NO: ${airQuality.list[0].components.no} µg/m³</p>
    <p>NO₂: ${airQuality.list[0].components.no2} µg/m³</p>
    <p>O₃: ${airQuality.list[0].components.o3} µg/m³</p>
    <p>PM₂.₅: ${airQuality.list[0].components.pm2_5} µg/m³</p>
    <p>PM₁₀: ${airQuality.list[0].components.pm10} µg/m³</p>
  `;
}
