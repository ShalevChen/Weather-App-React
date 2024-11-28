import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  // פונקציה לעיבוד התאריך
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // יום דו-ספרתי
    const month = String(date.getMonth() + 1).padStart(2, '0'); // חודש דו-ספרתי
    const year = date.getFullYear(); // שנה
    const hours = String(date.getHours()).padStart(2, '0'); // שעה דו-ספרתית
    const minutes = String(date.getMinutes()).padStart(2, '0'); // דקות דו-ספרתיות
    return `${day}/${month}/${year} at ${hours}:${minutes}`;
  };

  // פונקציה שמביאה את נתוני תחזית מזג האוויר
  const fetchWeather = async () => {
    if (!city) {
      setError('Please enter a city name');
      return;
    }
    try {
      const response = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
        params: {
          key: '6475110d702840a4a44121114242611',    // החלף ב-API key שלך
          q: city,                // שם העיר
          days: 1,                // עבור יום אחד
          hours: 1                // בקשה לעדכון תחזית לפי שעה
        },
      });

      // הדפסת נתוני ה-API
      console.log('Full API Response:', response.data);
      console.log('Hourly Forecast Data:', response.data.forecast.forecastday[0].hour);

      // אם אין תחזית לפי שעה
      if (!response.data.forecast || !response.data.forecast.forecastday[0].hour) {
        setError('Hourly forecast data not available.');
        setWeather(null);
        return;
      }

      // אם יש נתונים, שמור אותם
      setWeather(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Could not fetch weather data');
      setWeather(null);
    }
  };

  // פונקציה שמייצרת תחזית לפי חמש השעות האחרונות
  const generateHourlyForecast = () => {
    const hourlyTemps = [];
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    // בחר את חמש השעות האחרונות
    for (let i = 0; i < 5; i++) {
      const hourData = weather.forecast.forecastday[0].hour[currentHour - i];
      let time = hourData.time.split(' ')[1];  // חילוץ השעה מתוך התאריך

      // הוסף 1 לשעה, כך שתהיה שעה אחת יותר
      let hour = parseInt(time.split(':')[0], 10) + 1;
      let minutes = time.split(':')[1];

      // אם השעה עולה על 23, חזור ל-00
      if (hour === 24) {
        hour = 0;
      }

      // עדכן את השעה החדשה
      time = `${hour.toString().padStart(2, '0')}:${minutes}`;

      const temp = Math.floor(hourData.temp_c); // טמפ' בשעה זו
      hourlyTemps.push({ time, temp });
    }
    // הופך את המערך כך שהשעות יוצגו מהעתיד לעבר
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
                  <p>{Math.floor(weather.current.precip_mm)} mm</p>  {/* עיגול המספר השלם */}
                </div>
                <div>
                  <p>humidity</p>
                  <p>{Math.floor(weather.current.humidity)}%</p>  {/* עיגול המספר השלם */}
                </div>
                <div>
                  <p>wind</p>
                  <p>{Math.floor(weather.current.wind_kph)} km/h</p>  {/* עיגול המספר השלם */}
                </div>
              </div>

              {/* הצגת תחזית לפי שעה */}
              <div className="group-hours">
                {generateHourlyForecast().map((hour, index) => {
                  return (
                    <div className="hour" key={index}>
                      <p>{hour.time}</p>  {/* מציג את השעה בלבד */}
                      <p className="temperature">{hour.temp}°</p>  {/* מציג את הטמפרטורה ללא עשרוניות */}
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
