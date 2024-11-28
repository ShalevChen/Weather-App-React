import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Day with two digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month with two digits
    const year = date.getFullYear(); // Year
    const hours = String(date.getHours()).padStart(2, '0'); // Hour with two digits
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutes with two digits
    return `${day}/${month}/${year} at ${hours}:${minutes}`;
  };

  // Function to fetch weather forecast data
  const fetchWeather = async () => {
    if (!city) {
      setError('Please enter a city name');
      return;
    }
    try {
      const response = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
        params: {
          key: '6475110d702840a4a44121114242611',    // Replace with your own API key
          q: city,                // City name
          days: 1,                // For one day
          hours: 1                // Request hourly forecast data
        },
      });

      // Print the full API response
      console.log('Full API Response:', response.data);
      console.log('Hourly Forecast Data:', response.data.forecast.forecastday[0].hour);

      // If no hourly forecast data
      if (!response.data.forecast || !response.data.forecast.forecastday[0].hour) {
        setError('Hourly forecast data not available.');
        setWeather(null);
        return;
      }

      // If data is available, store it
      setWeather(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Could not fetch weather data');
      setWeather(null);
    }
  };

  // Function to generate the forecast for the last five hours
  const generateHourlyForecast = () => {
    const hourlyTemps = [];
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    // Select the last five hours
    for (let i = 0; i < 5; i++) {
      const hourData = weather.forecast.forecastday[0].hour[currentHour - i];
      let time = hourData.time.split(' ')[1];  // Extract the time from the date

      // Add 1 to the hour, so it becomes one hour later
      let hour = parseInt(time.split(':')[0], 10) + 1;
      let minutes = time.split(':')[1];

      // If the hour exceeds 23, reset to 00
      if (hour === 24) {
        hour = 0;
      }

      // Update the new time
      time = `${hour.toString().padStart(2, '0')}:${minutes}`;

      const temp = Math.floor(hourData.temp_c); // Temperature at this hour
      hourlyTemps.push({ time, temp });
    }
    // Reverse the array so the hours appear from future to past
    return hourlyTemps.reverse();
  };

  return (
    <div className="App">
      <div className="content">
        <div className="logo">
          <img src={`${process.env.PUBLIC_URL}/Fintek.png`} alt="Logo" />
        </div>
        <p className="weather-description">
          Use our weather app<br /> to see the weather<br /> around the world
        </p>
        <div className="input-container">
          <label htmlFor="city" className="city-label">City name</label>
          <div className="input-box">
            <input
              id="city"
              type="text"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button onClick={fetchWeather}>Check</button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        <br /><br /><br /><br /><br />
        {weather && (
          <div className="weather-info">
            <div className="details">
              <p>
                <span>latitude: {weather.location.lat.toFixed(2)}</span>
                <span style={{ marginLeft: '10px' }}>
                  longitude: {weather.location.lon.toFixed(2)}
                </span>
              </p>
              <p>accurate to: {formatDate(weather.current.last_updated)}</p>
            </div>
          </div>
        )}
      </div>
      <div className="side-background">
        <div className="weather-side">
          {weather && (
            <>
              <p className="city-name">{weather.location.name}</p>
              <p className="country">{weather.location.country}</p>
              <p className="last-updated">
                {formatDate(weather.current.last_updated)}
              </p>
              <h1 className="temp">
                {Math.floor(weather.current.temp_c)}<span className="degree">°</span>
              </h1>
              <p className="condition">{weather.current.condition.text}</p>
              <div className="details-info">
                <div>
                  <p>precipitation</p>
                  <p>{Math.floor(weather.current.precip_mm)} mm</p>  {/* Round the number to an integer */}
                </div>
                <div>
                  <p>humidity</p>
                  <p>{Math.floor(weather.current.humidity)}%</p>  {/* Round the number to an integer */}
                </div>
                <div>
                  <p>wind</p>
                  <p>{Math.floor(weather.current.wind_kph)} km/h</p>  {/* Round the number to an integer */}
                </div>
              </div>

              {/* Display hourly forecast */}
              <div className="group-hours">
                {generateHourlyForecast().map((hour, index) => {
                  return (
                    <div className="hour" key={index}>
                      <p>{hour.time}</p>  {/* Displays the time only */}
                      <p className="temperature">{hour.temp}°</p>  {/* Displays the temperature without decimals */}
                    </div>
                  );
                })}
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
