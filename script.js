const userTab = document.querySelector('[data-userTab]');
const searchTab = document.querySelector('[data-searchTab]');


const loadingScreen = document.querySelector('.loading');
const grantAccessContainer = document.querySelector('.grantLocationAccess');
const searchForm = document.querySelector('.search-form');
const userInfoConatainer = document.querySelector('.user-Info-Container');
const notFound = document.querySelector('.not-found');

// initialise variable.
const API_key = "1228f9e9c9fe0ac384a4472ad18dcded";
let currentTab = searchTab;
switchTab(userTab);

userTab.addEventListener('click', () =>{
    // pass clicked tab as input.
    switchTab(userTab);
})
searchTab.addEventListener('click', () =>{
    // pass clicked tab as input.
    switchTab(searchTab);
})

function switchTab(clickedTab){
    if(clickedTab!=currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        
        if(searchForm.classList.contains("deactivate")){
            userInfoConatainer.classList.add("deactivate");
            grantAccessContainer.classList.add("deactivate");
            searchForm.classList.remove("deactivate");
        }
        else{
            console.log("contains");
            searchForm.classList.add("deactivate");
            userInfoConatainer.classList.add("deactivate");
            notFound.classList.add("deactivate");
            getfromSessionStorage();
        }
    }
}

// check if coordinates are already present in session storage.
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    console.log(localCoordinates);
    if(localCoordinates==null){
        // if local coordinates are not present.
        grantAccessContainer.classList.remove("deactivate");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

function renderWeatherInfo(weatherInfo){
    console.log("render complete");
    const cityName = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');

    const weatherDesc = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');

    const userTemp = document.querySelector('[user-temp');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const clouds = document.querySelector('[data-clouds]');
    
    // fetch values from weather info. 
    cityName.innerHTML = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    weatherDesc.innerHTML = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://api.openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

    userTemp.innerHTML = (Math.round((weatherInfo?.main?.temp - 273)*100))/100 + "°C";
    windspeed.innerHTML = weatherInfo?.wind?.speed + "m/s";
    humidity.innerHTML = weatherInfo?.main?.humidity + "%";
    clouds.innerHTML = weatherInfo?.clouds?.all + "%";
}

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    // make grant conatiner invisible.
    grantAccessContainer.classList.add("deactivate");
    // make loader visible.
    loadingScreen.classList.remove("deactivate");

    // API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}`);
        const data = await response.json();
        
        console.log(data);
        loadingScreen.classList.add("deactivate");
        userInfoConatainer.classList.remove("deactivate");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.add("deactivate");
        notFound.classList.remove("deactivate");
    }
}

function getLocation(){
    console.log("geolocation");
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        notFound.classList.remove("deactivate");
        alert("Geolocation support is unavailable");
        // HW - show alert for no geolocation support available.
    }
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    console.log("showPosition", userCoordinates);
    fetchUserWeatherInfo(userCoordinates);
}

searchForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    
    const searchInput = document.querySelector('.searchBox');
    let cityName = searchInput.value;
    console.log(cityName);

    fetchUserWeatherInfoByCity(cityName);
})

async function fetchUserWeatherInfoByCity(cityName){
    // make loader visible.
    loadingScreen.classList.remove("deactivate");
    // remove error.
    notFound.classList.add("deactivate");

    console.log("fetch");
    userInfoConatainer.classList.add("deactivate");
    grantAccessContainer.classList.add("deactivate");

    // API call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_key}`);
        const data = await response.json();

        console.log(data);
        if(data?.cod=="404"){
            throw error("Error Found");
        }
        renderWeatherInfo(data);
        grantAccessContainer.classList.add("deactivate");
        loadingScreen.classList.add("deactivate");
        userInfoConatainer.classList.remove("deactivate");
    }
    catch(err){
        console.log(err);
        loadingScreen.classList.add("deactivate");
        notFound.classList.remove("deactivate");
    }
}