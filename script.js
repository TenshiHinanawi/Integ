const apiKey = "49e2122f5c9da4368f1cd972696db508"; // replace with your OpenWeatherMap API key

// Function to get user's location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(fetchData, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Function to handle location errors
function showError(error) {
  alert(`Error: ${error.message}`);
}

// Function to fetch data using the user's coordinates
async function fetchData(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // API URLs with coordinates
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const locationUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

  try {
    // Fetch both weather and air quality data
    const [weatherRes, airQualityRes, locationRes] = await Promise.all([fetch(weatherUrl), fetch(airQualityUrl),  fetch(locationUrl),]);
    const weatherData = await weatherRes.json();
    const airQualityData = await airQualityRes.json();
    const locationData = await locationRes.json();

    // Update the dashboard with fetched data
    updateLocationLabel(locationData);
    updateSummary(weatherData, airQualityData);
    updateCharts(airQualityData, weatherData);
  } catch (error) {
    alert("Error fetching data: " + error.message);
  }
}
function updateLocationLabel(locationData) {
  const locationName = locationData[0]?.name || "Unknown Location";
  document.getElementById("location-label").textContent = locationName;
}

// Function to update the dashboard based on location-specific data
function updateSummary(weatherData, airQualityData) {
  // Display basic weather information
  document.getElementById("temperature").textContent = `${weatherData.main.temp}°C`;
  document.getElementById("humidity").textContent = `${weatherData.main.humidity}%`;
  document.getElementById("pressure").textContent = weatherData.main.pressure;
  document.getElementById("weather").textContent = weatherData.weather[0].description;

  // Display air quality information with dynamic messages
  const pm25 = airQualityData.list[0].components.pm2_5;
  const ozone = airQualityData.list[0].components.o3;

  // Set PM2.5 level and message based on air quality
  document.getElementById("pm25-value").textContent = pm25;
  document.getElementById("ozone-value").textContent = ozone;
  
  const pm25Message = pm25 > 100 ? "Unhealthy" : pm25 > 50 ? "Moderate" : "Good";
  const ozoneMessage = ozone > 120 ? "Unhealthy" : ozone > 60 ? "Moderate" : "Good";
  
  document.querySelector("#pm25-status").textContent = pm25Message;
  document.querySelector("#ozone-status").textContent = ozoneMessage;
}

let airQualityChart, weatherChart;

function updateCharts(airQualityData, weatherData) {
  const pm25 = airQualityData.list[0].components.pm2_5;
  const ozone = airQualityData.list[0].components.o3;
  const co = airQualityData.list[0].components.co;
  const no2 = airQualityData.list[0].components.no2;

  const temperature = weatherData.main.temp;
  const humidity = weatherData.main.humidity;

  // Data for Air Quality Chart
  const airQualityDataPoints = [pm25, ozone, co, no2];
  const airQualityLabels = ["PM2.5", "Ozone", "CO", "NO2"];

  // Data for Weather Chart
  const weatherDataPoints = [temperature, humidity];
  const weatherLabels = ["Temperature (°C)", "Humidity (%)"];

  // Initialize or update Air Quality Chart
  if (!airQualityChart) {
    const airQualityCtx = document.getElementById("airQualityChart").getContext("2d");
    airQualityChart = new Chart(airQualityCtx, {
      type: 'bar',
      data: {
        labels: airQualityLabels,
        datasets: [{
          label: 'Air Quality Levels',
          data: airQualityDataPoints,
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    // Update existing Air Quality Chart
    airQualityChart.data.datasets[0].data = airQualityDataPoints;
    airQualityChart.update();
  }

  // Initialize or update Weather Chart
  if (!weatherChart) {
    const weatherCtx = document.getElementById("weatherChart").getContext("2d");
    weatherChart = new Chart(weatherCtx, {
      type: 'bar',
      data: {
        labels: weatherLabels,
        datasets: [{
          label: 'Weather Conditions',
          data: weatherDataPoints,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    // Update existing Weather Chart
    weatherChart.data.datasets[0].data = weatherDataPoints;
    weatherChart.update();
  }
}
