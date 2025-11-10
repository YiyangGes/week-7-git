const dropdown = document.getElementById("country-select");
const loadingImg = document.getElementById('loading-img');
const tableBody = document.getElementById('table');

async function fillTable(data, coord, tempAvg, rainAvg) {
    let fieldsAll = document.querySelectorAll('.right');
    fieldsAll.forEach(element => {
        element.innerHTML='';
    });

    document.getElementById('name').textContent = data[0].name.common;
    document.getElementById('o-name').textContent = data[0].name.official;
    document.getElementById('capital').textContent = data[0].capital[0];
    document.getElementById('language').textContent = Object.values(data[0].languages)[0];

    let linkT = document.createElement("a");
    let att = document.createAttribute("href");
    att.value = data[0].maps.googleMaps;
    linkT.setAttributeNode(att);
    linkT.innerHTML = "View Map"
    document.getElementById('map-link').appendChild(linkT)

    document.getElementById('population').textContent = data[0].population;

    let flagImg = document.createElement('img');
    let src = document.createAttribute('src');
    src.value = data[0].flags.png;
    flagImg.setAttributeNode(src);
    flagImg.style.height = "32px";
    document.getElementById('flag').appendChild(flagImg);

    document.getElementById('coordinate').textContent = coord;
    document.getElementById('rainfall').textContent = `${rainAvg.toFixed(2)} mm`;
    document.getElementById('temperature').textContent = `${tempAvg.toFixed(2)} \u00B0C`;
    
};

async function getAverage(arr){
    let sum = 0;
    for (let i=0; i<arr.length; i++) {
        sum += arr[i];
    };
    return sum/arr.length;
};

async function fetchPost(country) {
    loadingImg.style.display = "block";
    tableBody.style.marginTop = "0px";

    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${country}`);

        // pause to test if the seq works :)
        // await new Promise(resolve => setTimeout(resolve, 3000));

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // console.log(data[0]);

        // await new Promise(resolve => setTimeout(resolve, 3000));

        let latitude = data[0].capitalInfo.latlng[0];
        let longtitude = data[0].capitalInfo.latlng[1];
        let coord = `${latitude}, ${longtitude}`;
        // console.log(latitude,longtitude);

        const responseWeather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longtitude}&hourly=temperature_2m,weather_code,rain,wind_speed_10m&forecast_days=1`);
        if (!responseWeather.ok) {
            throw new Error('Network response was not ok');
        }

        const weatherData = await responseWeather.json();
        const hourlyData = weatherData.hourly;

        let tempAvg = await getAverage(hourlyData.temperature_2m);
        // console.log(tempAvg);

        let rainAvg = await getAverage(hourlyData.rain);
        // console.log(rainAvg);

        // await new Promise(resolve => setTimeout(resolve, 5000));

        await fillTable(data, coord, tempAvg, rainAvg);

        loadingImg.style.display = "none";
        tableBody.style.marginTop = "32px";
        
    } catch (error) {
        console.log('Error: ' + error.message);
    }
};

dropdown.addEventListener('change', (event)=>{
    // console.log(event.target.value);
    if (event.target.value != "Empty") {
        // console.log('not empty')
        fetchPost(event.target.value);
    }
});