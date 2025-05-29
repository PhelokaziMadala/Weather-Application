
class WeatherApp {
    constructor() {
        this.apiKey = 'f69036f0a4909e684fedc65173797672'; // OpenWeatherMap API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.currentUnit = 'celsius';
        this.currentLocationString = null;
        this.currentWeatherData = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateCurrentDate();
        
        // Try to get user's location on load
        this.getCurrentLocation();
    }
    
    initializeElements() {
        // Buttons and inputs
        this.getLocationBtn = document.getElementById('getLocationBtn');
        this.searchBtn = document.getElementById('searchBtn');
        this.cityInput = document.getElementById('cityInput');
        this.celsiusBtn = document.getElementById('celsiusBtn');
        this.fahrenheitBtn = document.getElementById('fahrenheitBtn');
        
        // Tab buttons
        this.currentTab = document.getElementById('currentTab');
        this.hourlyTab = document.getElementById('hourlyTab');
        this.dailyTab = document.getElementById('dailyTab');
        
        // Weather sections
        this.currentWeatherSection = document.getElementById('currentWeather');
        this.hourlyWeatherSection = document.getElementById('hourlyWeather');
        this.dailyWeatherSection = document.getElementById('dailyWeather');
        
        // Current weather elements
        this.currentLocationElement = document.getElementById('currentLocation');
        this.currentDate = document.getElementById('currentDate');
        this.currentTemp = document.getElementById('currentTemp');
        this.currentIcon = document.getElementById('currentIcon');
        this.visibility = document.getElementById('visibility');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.feelsLike = document.getElementById('feelsLike');
        this.weatherDescription = document.getElementById('weatherDescription');
        
        // Forecast containers
        this.hourlyForecast = document.getElementById('hourlyForecast');
        this.dailyForecast = document.getElementById('dailyForecast');
        
        // Utility elements
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
    }
    
    setupEventListeners() {
        this.getLocationBtn.addEventListener('click', () => this.getCurrentLocation());
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        
        this.celsiusBtn.addEventListener('click', () => this.switchUnit('celsius'));
        this.fahrenheitBtn.addEventListener('click', () => this.switchUnit('fahrenheit'));
        
        this.currentTab.addEventListener('click', () => this.showTab('current'));
        this.hourlyTab.addEventListener('click', () => this.showTab('hourly'));
        this.dailyTab.addEventListener('click', () => this.showTab('daily'));
    }
    
    showLoading() {
        this.loading.classList.add('show');
        this.hideError();
    }
    
    hideLoading() {
        this.loading.classList.remove('show');
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        this.hideLoading();
    }
    
    hideError() {
        this.errorMessage.classList.remove('show');
    }
    
    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser.');
            await this.getWeatherByLocation('New York');
            return;
        }
        
        this.showLoading();
        
        const options = {
            enableHighAccuracy: true,
            timeout: 15000, // 15 seconds
            maximumAge: 300000 // 5 minutes
        };
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Location found: ${latitude}, ${longitude}`);
                await this.getWeatherByCoords(latitude, longitude);
            },
            async (error) => {
                let errorMessage = 'Unable to get your location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Location access denied. Using default location.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information unavailable. Using default location.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out. Using default location.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred. Using default location.';
                        break;
                }
                console.log(errorMessage);
                await this.getWeatherByLocation('New York');
            },
            options
        );
    }
    
    
    
    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Please enter a city name.');
            return;
        }
        
        this.showLoading();
        await this.getWeatherByLocation(city);
    }
    
    async getWeatherByCoords(lat, lon) {
        try {
            const units = this.currentUnit === 'celsius' ? 'metric' : 'imperial';
            
            // Get current weather and forecast by coordinates
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`),
                fetch(`${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`)
            ]);
            
            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('Weather data not found for this location.');
            }
            
            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();
            
            this.currentWeatherData = { current: currentData, forecast: forecastData };
            this.currentLocationString = `${lat},${lon}`;
            
            this.updateCurrentWeather(currentData);
            this.updateHourlyForecast(forecastData);
            this.updateDailyForecast(forecastData);
            
            this.hideLoading();
            
        } catch (error) {
            this.showError(error.message || 'Failed to fetch weather data. Please try again.');
        }
    }
    
    async getWeatherByLocation(location) {
        try {
            const units = this.currentUnit === 'celsius' ? 'metric' : 'imperial';
            
            // Get current weather and forecast
            const [currentResponse, forecastResponse] = await Promise.all([
                fetch(`${this.baseUrl}/weather?q=${location}&appid=${this.apiKey}&units=${units}`),
                fetch(`${this.baseUrl}/forecast?q=${location}&appid=${this.apiKey}&units=${units}`)
            ]);
            
            if (!currentResponse.ok || !forecastResponse.ok) {
                throw new Error('Weather data not found for this location.');
            }
            
            const currentData = await currentResponse.json();
            const forecastData = await forecastResponse.json();
            
            this.currentWeatherData = { current: currentData, forecast: forecastData };
            this.currentLocationString = location;
            
            this.updateCurrentWeather(currentData);
            this.updateHourlyForecast(forecastData);
            this.updateDailyForecast(forecastData);
            
            this.hideLoading();
            
        } catch (error) {
            this.showError(error.message || 'Failed to fetch weather data. Please try again.');
        }
    }
    
    updateCurrentWeather(data) {
        this.currentLocationElement.textContent = `${data.name}, ${data.sys.country}`;
        this.currentTemp.textContent = this.formatTemperature(data.main.temp);
        this.currentIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        this.currentIcon.alt = data.weather[0].description;
        
        this.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        this.humidity.textContent = `${data.main.humidity}%`;
        this.windSpeed.textContent = `${data.wind.speed} ${this.currentUnit === 'celsius' ? 'm/s' : 'mph'}`;
        this.feelsLike.textContent = this.formatTemperature(data.main.feels_like);
        this.weatherDescription.textContent = data.weather[0].description;
    }
    
    updateHourlyForecast(data) {
        this.hourlyForecast.innerHTML = '';
        
        // OpenWeatherMap provides 5-day forecast with 3-hour intervals
        data.list.slice(0, 8).forEach((hour, index) => {
            const hourElement = this.createHourlyItem(hour, index);
            this.hourlyForecast.appendChild(hourElement);
        });
    }
    
    createHourlyItem(hour, index) {
        const div = document.createElement('div');
        div.className = 'hourly-item';
        
        const time = new Date(hour.dt * 1000);
        const timeString = index === 0 ? 'Now' : time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            hour12: true 
        });
        
        div.innerHTML = `
            <div class="hourly-time">${timeString}</div>
            <img class="hourly-icon" src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
            <div class="hourly-temp">${this.formatTemperature(hour.main.temp)}</div>
            <div class="hourly-desc">${hour.weather[0].description}</div>
        `;
        
        return div;
    }
    
    updateDailyForecast(data) {
        this.dailyForecast.innerHTML = '';
        
        // Group forecast by day (OpenWeatherMap gives 3-hour intervals)
        const dailyData = this.groupForecastByDay(data.list);
        
        dailyData.slice(0, 5).forEach((day, index) => {
            const dayElement = this.createDailyItem(day, index);
            this.dailyForecast.appendChild(dayElement);
        });
    }
    
    groupForecastByDay(forecastList) {
        const grouped = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    date: dateKey,
                    temps: [],
                    weather: item.weather[0],
                    items: []
                };
            }
            
            grouped[dateKey].temps.push(item.main.temp);
            grouped[dateKey].items.push(item);
        });
        
        return Object.values(grouped).map(day => ({
            date: day.date,
            temp_max: Math.max(...day.temps),
            temp_min: Math.min(...day.temps),
            weather: day.weather
        }));
    }
    
    createDailyItem(day, index) {
        const div = document.createElement('div');
        div.className = 'daily-item';
        
        const date = new Date(day.date);
        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });
        
        div.innerHTML = `
            <div class="daily-date">
                <div class="daily-day">${dayName}</div>
                <img class="daily-icon" src="https://openweathermap.org/img/wn/${day.weather.icon}.png" alt="${day.weather.description}">
                <div class="daily-desc">${day.weather.description}</div>
            </div>
            <div class="daily-temps">
                <span class="daily-high">${this.formatTemperature(day.temp_max)}</span>
                <span class="daily-low">${this.formatTemperature(day.temp_min)}</span>
            </div>
        `;
        
        return div;
    }
    
    formatTemperature(temp) {
        if (this.currentUnit === 'celsius') {
            return `${Math.round(temp)}°C`;
        } else {
            return `${Math.round(temp)}°F`;
        }
    }
    
    switchUnit(unit) {
        this.currentUnit = unit;
        
        // Update button states
        this.celsiusBtn.classList.toggle('active', unit === 'celsius');
        this.fahrenheitBtn.classList.toggle('active', unit === 'fahrenheit');
        
        // Refetch data with new units if we have a location
        if (this.currentLocationString) {
            if (this.currentLocationString.includes(',') && this.currentLocationString.split(',').length === 2) {
                // It's coordinates
                const [lat, lon] = this.currentLocationString.split(',');
                this.getWeatherByCoords(parseFloat(lat), parseFloat(lon));
            } else {
                // It's a city name
                this.getWeatherByLocation(this.currentLocationString);
            }
        }
    }
    
    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.weather-section').forEach(section => section.classList.remove('active'));
        
        switch (tabName) {
            case 'current':
                this.currentTab.classList.add('active');
                this.currentWeatherSection.classList.add('active');
                break;
            case 'hourly':
                this.hourlyTab.classList.add('active');
                this.hourlyWeatherSection.classList.add('active');
                break;
            case 'daily':
                this.dailyTab.classList.add('active');
                this.dailyWeatherSection.classList.add('active');
                break;
        }
    }
    
    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.currentDate.textContent = now.toLocaleDateString('en-US', options);
    }
}
navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

function successCallback(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  getWeatherData(latitude, longitude);
}

function errorCallback(error) {
  console.error("Geolocation failed:", error);
}
function getWeatherData(lat, lon) {
  const apiKey = 'ace0a85994c7172b1d35628d6089767d'; // My API key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Use data.main.temp, data.weather[0].description, etc.
    })
    .catch(error => {
      console.error("Error fetching weather data:", error);
    });
}


// Initialize the weather app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
