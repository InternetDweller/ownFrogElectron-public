const Button_Save = document.querySelector('#Button_Save');
const checkboxVisualWeather = document.querySelector('#visualWeather');
const checkboxBackgroundDiffColour = document.querySelector('#backgroundDiffColour');

let settingsData;

// При загрузке страницы
window.addEventListener('load', async () => {
    try {
        //settingsData = file.read('settings.json');
        settingsData = file.readAndCheck('settings.json');
        settingsData.visualWeather
            ? checkboxVisualWeather.checked = true
            : checkboxVisualWeather.checked = false;
            settingsData.backgroundDiffColour
            ? checkboxBackgroundDiffColour.checked = true
            : checkboxBackgroundDiffColour.checked = false;
    } catch(e) {
        console.log('Failed to load the file!');
    };
});

// Сохранение настроек
Button_Save.addEventListener('click', () => {
    try {
        file.save('settings.json', settingsData);
        window.close();
    } catch(e) {
        console.log('Failed to save the file!');
    };
});

// Кнопка для погоды
checkboxVisualWeather.addEventListener('click', () => {
    checkboxVisualWeather.checked
        ? settingsData.visualWeather = true
        : settingsData.visualWeather = false;
});

checkboxBackgroundDiffColour.addEventListener('click', () => {
    checkboxBackgroundDiffColour.checked
        ? settingsData.backgroundDiffColour = true
        : settingsData.backgroundDiffColour = false;
});