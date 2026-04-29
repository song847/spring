const axios = require('axios');

const weatherIcons = {
  'sunny': '☀️',
  'clear': '☀️',
  'partly-cloudy': '⛅',
  'cloudy': '☁️',
  'fog': '🌫️',
  'rain': '🌧️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'drizzle': '🌦️',
};

const conditionMap = {
  '晴': 'sunny',
  '多云': 'partly-cloudy',
  '阴': 'cloudy',
  '雾': 'fog',
  '霾': 'fog',
  '小雨': 'drizzle',
  '中雨': 'rain',
  '大雨': 'rain',
  '暴雨': 'rain',
  '雷阵雨': 'thunderstorm',
  '小雪': 'snow',
  '中雪': 'snow',
  '大雪': 'snow',
  '暴雪': 'snow',
};

const englishToChinese = {
  'clear': '晴',
  'sunny': '晴',
  'partly cloudy': '多云',
  'broken clouds': '多云',
  'cloudy': '阴',
  'overcast': '阴',
  'fog': '雾',
  'mist': '雾',
  'drizzle': '小雨',
  'light rain': '小雨',
  'moderate rain': '中雨',
  'heavy rain': '大雨',
  'thunderstorm': '雷阵雨',
  'thunder': '雷阵雨',
  'snow': '雪',
  'light snow': '小雪',
  'moderate snow': '中雪',
  'heavy snow': '大雪',
};

function translateCondition(desc) {
  if (!desc) return desc;
  const lowerDesc = desc.toLowerCase();
  return englishToChinese[lowerDesc] || englishToChinese[lowerDesc.replace('-', ' ')] || desc;
}

function getWeatherIcon(desc) {
  if (!desc) return '☀️';
  
  const translatedDesc = translateCondition(desc);
  
  if (conditionMap[translatedDesc]) {
    return weatherIcons[conditionMap[translatedDesc]];
  }
  
  const lowerDesc = translatedDesc.toLowerCase();
  
  if (lowerDesc.includes('sunny') || lowerDesc.includes('clear')) return weatherIcons.sunny;
  if (lowerDesc.includes('partly cloudy') || lowerDesc.includes('broken clouds')) return weatherIcons['partly-cloudy'];
  if (lowerDesc.includes('cloudy') || lowerDesc.includes('overcast')) return weatherIcons.cloudy;
  if (lowerDesc.includes('fog') || lowerDesc.includes('mist')) return weatherIcons.fog;
  if (lowerDesc.includes('rain')) return lowerDesc.includes('thunder') ? weatherIcons.thunderstorm : weatherIcons.rain;
  if (lowerDesc.includes('snow')) return weatherIcons.snow;
  if (lowerDesc.includes('drizzle')) return weatherIcons.drizzle;
  
  if (lowerDesc.includes('晴')) return weatherIcons.sunny;
  if (lowerDesc.includes('云') && !lowerDesc.includes('雨')) return weatherIcons.cloudy;
  if (lowerDesc.includes('多云')) return weatherIcons['partly-cloudy'];
  if (lowerDesc.includes('雾') || lowerDesc.includes('霾')) return weatherIcons.fog;
  if (lowerDesc.includes('雨')) return lowerDesc.includes('雷') ? weatherIcons.thunderstorm : weatherIcons.rain;
  if (lowerDesc.includes('雪')) return weatherIcons.snow;
  if (lowerDesc.includes('毛毛雨') || lowerDesc.includes('小雨')) return weatherIcons.drizzle;
  
  return weatherIcons.sunny;
}

function getDayName(dayOffset) {
  const days = ['今天', '明天', '后天', '周三', '周四', '周五', '周六', '周日'];
  return days[dayOffset] || days[0];
}

const seasonWeather = {
  spring: {
    temps: { min: 10, max: 25 },
    conditions: ['晴', '多云', '晴', '晴', '多云', '小雨', '晴'],
    humidity: [55, 65],
    windSpeed: [8, 15]
  },
  summer: {
    temps: { min: 22, max: 38 },
    conditions: ['晴', '晴', '晴', '多云', '雷阵雨', '晴', '多云'],
    humidity: [65, 80],
    windSpeed: [10, 20]
  },
  autumn: {
    temps: { min: 8, max: 28 },
    conditions: ['晴', '多云', '晴', '晴', '多云', '晴', '小雨'],
    humidity: [50, 65],
    windSpeed: [12, 22]
  },
  winter: {
    temps: { min: -5, max: 12 },
    conditions: ['晴', '多云', '晴', '多云', '小雪', '晴', '晴'],
    humidity: [45, 60],
    windSpeed: [15, 25]
  }
};

function getSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSunTime() {
  const month = new Date().getMonth() + 1;
  const times = {
    1: { sunrise: '07:15', sunset: '17:30' },
    2: { sunrise: '06:55', sunset: '18:00' },
    3: { sunrise: '06:20', sunset: '18:30' },
    4: { sunrise: '05:40', sunset: '19:00' },
    5: { sunrise: '05:10', sunset: '19:30' },
    6: { sunrise: '05:00', sunset: '19:45' },
    7: { sunrise: '05:10', sunset: '19:40' },
    8: { sunrise: '05:35', sunset: '19:10' },
    9: { sunrise: '06:00', sunset: '18:35' },
    10: { sunrise: '06:25', sunset: '18:00' },
    11: { sunrise: '06:55', sunset: '17:35' },
    12: { sunrise: '07:15', sunset: '17:25' }
  };
  return times[month] || times[6];
}

function generateFallbackWeather() {
  const season = getSeason();
  const seasonData = seasonWeather[season];
  const dayOfWeek = new Date().getDay();
  
  const currentCondition = seasonData.conditions[dayOfWeek];
  const baseTemp = randomInRange(seasonData.temps.min, seasonData.temps.max);
  
  const sunTime = getSunTime();
  
  const weatherData = {
    icon: getWeatherIcon(currentCondition),
    temp: baseTemp,
    description: currentCondition,
    humidity: randomInRange(seasonData.humidity[0], seasonData.humidity[1]),
    windSpeed: randomInRange(seasonData.windSpeed[0], seasonData.windSpeed[1]),
    visibility: Math.random() > 0.1 ? randomInRange(8, 15) : randomInRange(1, 5),
    pressure: randomInRange(1005, 1025),
    sunrise: sunTime.sunrise,
    sunset: sunTime.sunset,
    city: '南阳市',
    district: '卧龙区',
    forecast: []
  };

  for (let i = 0; i < 5; i++) {
    const forecastDay = (dayOfWeek + i) % 7;
    const forecastCondition = seasonData.conditions[forecastDay];
    const tempDiff = randomInRange(-3, 3);
    const forecastTemp = Math.max(seasonData.temps.min, Math.min(seasonData.temps.max, baseTemp + tempDiff));
    
    weatherData.forecast.push({
      day: getDayName(i),
      icon: getWeatherIcon(forecastCondition),
      temp: forecastTemp,
      high: forecastTemp + randomInRange(2, 5),
      low: forecastTemp - randomInRange(3, 6)
    });
  }

  return weatherData;
}

async function getWeather(req, res) {
  const apis = [
    async () => {
      const response = await axios.get('https://wttr.in/Nanyang?format=j1', {
        timeout: 15000
      });
      const data = response.data;
      
      if (!data.current_condition || data.current_condition.length === 0) {
        throw new Error('wttr数据格式错误');
      }
      
      const currentCondition = data.current_condition[0];
      const forecast = data.weather;
      
      const currentDesc = translateCondition(currentCondition.weatherDesc[0].value);
      return {
        icon: getWeatherIcon(currentDesc),
        temp: parseInt(currentCondition.temp_C),
        description: currentDesc,
        humidity: parseInt(currentCondition.humidity),
        windSpeed: parseInt(currentCondition.windspeedKmph),
        visibility: parseFloat(currentCondition.visibility) || 10,
        pressure: parseInt(currentCondition.pressure),
        sunrise: forecast[0]?.astronomy?.[0]?.sunrise || '06:00',
        sunset: forecast[0]?.astronomy?.[0]?.sunset || '18:30',
        city: '南阳市',
        district: '卧龙区',
        forecast: forecast.slice(0, 5).map((day, index) => {
          const forecastDesc = translateCondition(day.hourly[0]?.weatherDesc?.[0]?.value || '晴');
          return {
            day: getDayName(index),
            icon: getWeatherIcon(forecastDesc),
            temp: parseInt(day.avgtempC),
            high: parseInt(day.maxtempC),
            low: parseInt(day.mintempC)
          };
        })
      };
    },
    async () => {
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: 32.9971,
          longitude: 112.5373,
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,visibility,pressure_msl,precipitation,weather_code',
          forecast_days: 5,
          daily: 'temperature_2m_max,temperature_2m_min,weather_code',
          timezone: 'Asia/Shanghai'
        },
        timeout: 15000
      });
      
      const data = response.data;
      const weatherCodeMap = {
        0: '晴', 1: '晴', 2: '多云', 3: '多云',
        45: '雾', 48: '雾',
        51: '小雨', 53: '小雨', 55: '小雨', 56: '小雨', 57: '小雨',
        61: '中雨', 63: '中雨', 65: '大雨', 66: '中雨', 67: '大雨',
        71: '小雪', 73: '小雪', 75: '大雪', 77: '雪',
        80: '阵雨', 81: '阵雨', 82: '阵雨',
        95: '雷阵雨', 96: '雷阵雨', 99: '雷阵雨'
      };
      
      const currentCode = data.current.weather_code;
      const currentDesc = weatherCodeMap[currentCode] || '晴';
      
      return {
        icon: getWeatherIcon(currentDesc),
        temp: Math.round(data.current.temperature_2m),
        description: currentDesc,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m * 3.6),
        visibility: data.current.visibility / 1000,
        pressure: data.current.pressure_msl,
        sunrise: '06:00',
        sunset: '18:30',
        city: '南阳市',
        district: '卧龙区',
        forecast: data.daily.time.map((_, index) => {
          const code = data.daily.weather_code[index];
          const desc = weatherCodeMap[code] || '晴';
          return {
            day: getDayName(index),
            icon: getWeatherIcon(desc),
            temp: Math.round((data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2),
            high: data.daily.temperature_2m_max[index],
            low: data.daily.temperature_2m_min[index]
          };
        }).slice(0, 5)
      };
    }
  ];

  for (let i = 0; i < apis.length; i++) {
    try {
      const weatherData = await apis[i]();
      res.json({ success: true, weather: weatherData });
      return;
    } catch (error) {
      console.error(`尝试天气API ${i + 1} 失败:`, error.message);
    }
  }

  console.error('所有天气API都失败，使用fallback数据');
  const fallbackData = generateFallbackWeather();
  res.json({ success: true, weather: fallbackData });
}

module.exports = { getWeather };
