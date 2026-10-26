// Погода немножко лагучая

// То, что сохраняется в файл
const gameState = {
    level: 1,
    exp: 0,
    points: 5,
    feed: 100,
    play: 100,
    tasks: []
};

// Параметры настройки
const gameEnv = {
    'expmult': 5, //для расчёта оставшейся экспы до уровня (дефолт 50)
    'feedtimeout': 60000,
    'playtimeout': 180000,
    'formattedDate': '' //для поиска по данным погоды
};

// Координаты для Москвы
const lat = 55.752,
      lon = 37.6178;
const weatherLink = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,rain,snowfall&forecast_days=2`;

// Управление погодой
let RainOn, SnowOn,
    rainFlag = false, snowFlag = false,
    visualWeather = true,
    backgroundDiffColour = true;
    onStart = true; // Для проверки, надо ли показывать страницу

// Кнопки
const Button_Feed = document.querySelector('#Button_Feed');
const Button_Play = document.querySelector('#Button_Play');
const Button_Add = document.querySelector('#Button_Add');

// Для вставки значений времени и погоды
const Span_Time = document.querySelector('#Span_Time');
const Span_Date = document.querySelector('#Span_Date');
const Table_Weather = document.querySelector('#Table_Weather');
const Span_Temp = document.querySelector('#Span_Temp');
const Span_Rain = document.querySelector('#Span_Rain');
const Span_Snow = document.querySelector('#Span_Snow');

// Для вставки разных значений
const Span_Level = document.querySelector('#Span_Level');
const Span_Stage = document.querySelector('#Span_Stage');
const Span_Feed = document.querySelector('#Span_Feed');
const Span_Play = document.querySelector('#Span_Play');
const Span_Points = document.querySelector('#Span_Points');
const Span_UntilNext = document.querySelector('#Span_UntilNext');

const Progress_Feed = document.querySelector('#Progress_Feed');
const Progress_Play = document.querySelector('#Progress_Play');

const Input_Task = document.querySelector('#Input_Task');
const Table_Tasks = document.querySelector('#Table_Tasks');
const tableContent = Table_Tasks.querySelector('tbody');

// Для изменения картинки
const frogimg = document.querySelector('.frogimg');


// При загрузке окна
window.addEventListener('load', async () => {
    console.log('page is fully loaded');
    //weatherPlaceholder();

    // Загрузка пользовательских настроек
    try {
        settingsData = file.read('settings.json');
        visualWeather = settingsData.visualWeather;
        backgroundDiffColour = settingsData.backgroundDiffColour;
    } catch(e) {
        console.log('Failed to load the settings!');
    };

    changeDate();
});

function changeDate() {
    const now = new Date();
    Span_Date.innerHTML = `${now.getDate()} ${monthToWords(now.getMonth() + 1)} ${now.getFullYear()}`;
};

function monthToWords(mon) {
    let monRes;
    switch (mon) {
        case 1:
            monRes = 'янв';
            break;
        case 2:
            monRes = 'фев';
            break;
        case 3:
            monRes = 'мар';
            break;
        case 4:
            monRes = 'апр';
            break;
        case 5:
            monRes = 'мая';
            break;
        case 6:
            monRes = 'июн';
            break;
        case 7:
            monRes = 'июл';
            break;
        case 8:
            monRes = 'авг';
            break;
        case 9:
            monRes = 'сен';
            break;
        case 10:
            monRes = 'окт';
            break;
        case 11:
            monRes = 'ноя';
            break;
        case 12:
            monRes = 'дек';
            break;                                                                                                                                                                                                                                                              
    };
    return monRes;
};

window.electronAPI.onSaveProgress(() => {
    try {
        file.save('ownFrogSave.json', gameState);
        notify('Файл сохранён', 'green');
    } catch(e) {
        console.log('Failed to save the file!');
        notify('Не удалось сохранить файл', 'red');
    };
});

window.electronAPI.onLoadProgress(() => {
    try {
        const parsedFile = file.read('ownFrogSave.json');
        gameState.level = parsedFile.level;
        gameState.exp = parsedFile.exp;
        gameState.points = parsedFile.points;
        gameState.feed = parsedFile.feed;
        gameState.play = parsedFile.play;
        resetTable();
        gameState.tasks = parsedFile.tasks;
        gameState.tasks.forEach((el) => {
            addTask(el, false);
        });
        //console.log(gameState.tasks, gameState.tasks.length);
        if (gameState.tasks.length !== 0) {
            Table_Tasks.style.visibility = 'visible';
        };
        setValuesAccordingToArray();
        notify('Файл загружен', 'blue');
    } catch(e) {
        console.log('Failed to load the file!');
        notify('Не удалось загрузить файл', 'red');
    };
});

function setValuesAccordingToArray() {
    setFrogStage(gameState.level);
    Span_Points.innerHTML = gameState.points;
    Span_Feed.innerHTML = gameState.feed;
    Span_Play.innerHTML = gameState.play;
    Progress_Feed.style.width = `${gameState.feed}%`;
    Progress_Play.style.width = `${gameState.play}%`;

    const untilNext = gameState.level * gameEnv.expmult - gameState.exp;
    Span_UntilNext.innerHTML = `${untilNext}`;
};

function rainGenerator() {
    const parent = document.querySelector('#rain');
    let drop = document.createElement('div');
    let left = Math.floor(Math.random() * 570);
    let width = Math.random() * 5;
    let height = Math.random() * 20;
    let duration = Math.random() * 0.5;

    drop.classList.add('drop');
    parent.appendChild(drop);
    drop.style.left = left + 'px';
    drop.style.width = 0.5 + width + 'px';
    drop.style.height = 0.5 + height + 'px';
    drop.style.animationDuration = 1.5 + duration + 's';

    drop.style.borderRadius = '49% 51% 49% 51% / 68% 72% 28% 32% ';

    setTimeout(() => {
        parent.removeChild(drop);
    }, 2000);
};

function snowGenerator() {
    const parent = document.querySelector('#rain');
    let drop = document.createElement('div');
    let left = Math.floor(Math.random() * 570);
    let width = Math.random() * 5;
    let duration = Math.random() * 0.5;

    drop.classList.add('sdrop');
    parent.appendChild(drop);
    drop.style.left = left + 'px';
    drop.style.width = 0.5 + width + 'px';
    drop.style.height = 0.5 + width + 'px';
    drop.style.animationDuration = 4 + duration + 's';

    setTimeout(() => {
        parent.removeChild(drop);
    }, 3000);
};

async function getWeather(link) {
    try {
        let response = await axiosRequest.get(link);
        return response.data;
    } catch (error) {
        console.error(`ERROR: ${error}`);
        return 'err';
    };
};

async function requestAndSetWeather() {
    const weatherData = await getWeather(weatherLink);

    if (onStart === true) {
        document.querySelector('body').style.display = 'block';
        onStart = false;
    };

    if (weatherData === 'err') {
        //Table_Weather.innerHTML = 'Нет данных';
        Span_Temp.innerHTML = '?';
        Span_Rain.innerHTML = '?';
        Span_Snow.innerHTML = '?';
        return;
    };
    const index = weatherData.hourly.time.indexOf(gameEnv.formattedDate);
    console.log(`Температура: ${weatherData.hourly.temperature_2m[index]}`);
    console.log(`Дождь: ${weatherData.hourly.rain[index]}`);
    console.log(`Снег: ${weatherData.hourly.snowfall[index]}`);
    //Table_Weather.innerHTML = `${weatherData.hourly.temperature_2m[index]}<br/>${weatherData.hourly.rain[index]}<br/>${weatherData.hourly.snowfall[index]}`;
    Span_Temp.innerHTML = weatherData.hourly.temperature_2m[index];
    Span_Rain.innerHTML = weatherData.hourly.rain[index];
    Span_Snow.innerHTML = weatherData.hourly.snowfall[index];

    if (backgroundDiffColour === true) {
        // Можно добавить больше разделов и сделать нормальный переход по спектру
        // Короче, эта штука меняет фон в зависимости от температуры
        if (weatherData.hourly.temperature_2m[index] <= 15) {
            document.body.style.background = '#95e1ea';
        } else if (weatherData.hourly.temperature_2m[index] >= 27) {
            document.body.style.background = '#eece4f';
        } else {
            document.body.style.background = '#00aaaa';
        };
    };

    // Если пользователь выключил визуал, осадки не включаются
    if (visualWeather === false) return;

    if (weatherData.hourly.rain[index] !== 0 || weatherData.hourly.snowfall[index] !== 0) {
        startPrecip(weatherData.hourly.rain[index], weatherData.hourly.snowfall[index]);
    } else {
        stopPrecip();
    };
};

function summonRain() {
    if (rainFlag === true) return;
    RainOn = setInterval(() => {
            rainGenerator();
        }, 20);
    rainFlag = true;
};

function summonSnow() {
    if (snowFlag === true) return;
    SnowOn = setInterval(() => {
            snowGenerator();
        }, 20);
    snowFlag = true;
};

function startPrecip(rain, snow) {
    if (rain !== 0 && snow !== 0) {
        summonRain();
        summonSnow();
    } else if (rain !== 0) {
        summonRain();
        // Сытость быстрее, настроение медленнее
        // Дефолт 60 000, 180 000
        setInterval(() => changeFeed(), 30000); //30 секунд
        setInterval(() => changePlay(), 300000); //5 минут
    } else if (snow !== 0) {
        summonSnow();
        // Сытость медленнее, настроение быстрее
        setInterval(() => changeFeed(), 120000); //2 минуты
        setInterval(() => changePlay(), 60000); //1 минута
    };
};

function stopPrecip() {
    clearInterval(RainOn);
    clearInterval(SnowOn);
    rainFlag = false;
    snowFlag = false;
    setInterval(() => changeFeed(), gameEnv.playtimeout);
    setInterval(() => changePlay(), gameEnv.playtimeout);
};

function manageTime() {
    let newDay = false;
    const now = new Date();

    let currentHour = now.getHours();
    let currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1;
    if (now.getMinutes() > 30) {
        if (currentHour == 23) {
            currentHour = 0;
            newDay = true;
        } else {
            currentHour += 1;
        };
    };
    if (newDay === true) {
        currentDay += 1;
    };
    const edit = {
        'month': (currentMonth < 10) ? `0${currentMonth}` : currentMonth,
        'day': (currentDay < 10) ? `0${currentDay}` : currentDay,
        'hours': (currentHour < 10) ? `0${currentHour}` : currentHour
    };
    // Что получилось в эту секунду
    const currentFormattedDate = `${now.getFullYear()}-${edit.month}-${edit.day}T${edit.hours}:00`;
    console.log(currentFormattedDate);
    if (gameEnv.formattedDate !== currentFormattedDate) {
        gameEnv.formattedDate = currentFormattedDate;
        // Вызвать погоду
        requestAndSetWeather();
        //console.log(gameEnv.formattedDate);
    };

    if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        changeDate();
    };
};
// Отображение динамических часов
function getCurrentTimeString() {
    return new Date().toTimeString().replace(/ .*/, '');
};
//setInterval(() => Span_Time.innerHTML = getCurrentTimeString(), 1000);
setInterval(() => {
    Span_Time.innerHTML = getCurrentTimeString();
    manageTime();

}, 1000);

// Сытость уменьшается на 5 в минуту
setInterval(() => changeFeed(), gameEnv.feedtimeout);
// Настроение уменьшается на 5 в 3 минуты
setInterval(() => changePlay(), gameEnv.playtimeout);

function changeLevel() {
    gameState.level += 1;
    Span_Level.innerHTML = gameState.level;
    gameState.exp = 0;
};

function changeExp() {
    gameState.exp += 1;
    const untilNext = gameState.level * gameEnv.expmult - gameState.exp;
    Span_UntilNext.innerHTML = `${untilNext}`;
    if (untilNext == 0) {
        changeLevel();
        setFrogStage(gameState.level);
        // Сразу пересчёт значения, чтобы при переходе на новый уровень не отображалось 0
        const untilNext = gameState.level * gameEnv.expmult - gameState.exp;
        Span_UntilNext.innerHTML = `${untilNext}`;
    };
};

function changeFeed(action) {
    if (action == true) {
        if (gameState.feed !== 100) {
            gameState.feed += 5;
            Span_Feed.innerHTML = `${gameState.feed}`;
            Progress_Feed.style.width = `${gameState.feed}%`;
            changePoints(false);
        };
    } else {
        if (gameState.feed !== 0) {
            gameState.feed -= 5;
            Span_Feed.innerHTML = `${gameState.feed}`;
            Progress_Feed.style.width = `${gameState.feed}%`;
        }; 
    }
};

function changePlay(action) {
    if (action == true) {
        if (gameState.play !== 100) {
            gameState.play += 5;
            Span_Play.innerHTML = `${gameState.play}`;
            Progress_Play.style.width = `${gameState.play}%`;
            changePoints(false);
        };
    } else {
        if (gameState.play !== 0) {
            gameState.play -= 5;
            Span_Play.innerHTML = `${gameState.play}`;
            Progress_Play.style.width = `${gameState.play}%`;
        }; 
    }
};

function changePoints(action) { //true - up, false - down
    if (action == true) {
        gameState.points += 1;
        Span_Points.innerHTML = `${gameState.points}`;
    } else {
        if (gameState.points != 0) {
            gameState.points -= 1;
            Span_Points.innerHTML = `${gameState.points}`;
            // Если мы употребили очко на благое дело (успешно), то добавляем экспу
            changeExp();
        };
    };
};

Button_Feed.addEventListener('click', () => {
    //console.log('Нажата кнопка Кормить');
    //console.log(`Сейчас ${gameState.feed}`);
    if (gameState.points == 0) return;
    changeFeed(true);
});

Button_Play.addEventListener('click', () => {
    //console.log('Нажата кнопка Играть');
    //console.log(`Сейчас ${gameState.play}`);
    if (gameState.points == 0) return;
    changePlay(true);
});

Button_Add.addEventListener('click', () => {
    addTask(Input_Task.value, true);
    Input_Task.value = '';
    Input_Task.focus(); //перекинуть фокус обратно на инпут
});

// Чтобы не приходилось постоянно фокусироваться на кнопку для добавления
Input_Task.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        Button_Add.click();
    };
});

// caller = true => элемент создаётся пользователем
// caller = false => элемент загружается из сейва
function addTask(text, caller) { //caller - элемент был добавлен пользователем или загружен из файла
    if (text.length !== 0) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `<tr><td class="col1">${text}</td><td class="col2"><div class="hzzzz"><input type="checkbox"/><div class="tasks done"></div></div></td><td class="col2"><div class="hzzzz"><input type="checkbox"/><div class="tasks delete"></div></div></td></tr>`;
        newRow.addEventListener('click', tableRowRemover);
        tableContent.append(newRow);
        if (gameState.tasks.length === 0) {
            Table_Tasks.style.visibility = 'visible';
        };
        if (caller === true) { gameState.tasks.push(text); }
    };
};

function tableRowRemover(event) {
    //if (event.target.nodeName === 'DIV') { //если чекбоксы не застилены, брать INPUT
    if (event.target.classList.contains('tasks')) {
        //console.log(this);
        gameState.tasks.splice(gameState.tasks.indexOf(this.querySelector('td').innerHTML), 1); //удаление задачи из массива
        this.remove(); //удаление элемента со страницы
        if (event.target.classList.contains('done')) {
            changePoints(true);
        };
        //console.log(gameState.tasks);
    };
    if (gameState.tasks.length === 0) {
        Table_Tasks.style.visibility = 'hidden';
    };
};

function resetTable() {
    //console.log(tableContent.querySelectorAll('tr'));
    tableContent.querySelectorAll('tr').forEach((el, i) => {
        if (i !== 0) {
            el.remove();
        }
    });
};

function setFrogStage(stage) {
    Span_Level.innerHTML = stage;
    if (stage < 3) {
        frogimg.innerHTML = '<img src="../assets/01-baby.png" />';
        Span_Stage.innerHTML = 'ребёнок';
    } else if (stage < 5) {
        frogimg.innerHTML = '<img src="../assets/02-young.png" />';
        Span_Stage.innerHTML = 'подросток';
    } else if (stage >= 5) {
        frogimg.innerHTML = '<img src="../assets/03-adult.png" />';
        Span_Stage.innerHTML = 'взрослый';
    };
};

function notify(message, mode) {
    let colours;
    if (mode === 'green') {
        colours = 'linear-gradient(.25turn, #78ff78, 10%, #11b511, 70%, #0e990e)';
    } else if (mode === 'blue') {
        colours = 'linear-gradient(.25turn, #66c4ff, 10%, #1179b5, 70%, #0e5c99)';
    } else {
        colours = 'linear-gradient(.25turn, #ff0000, 10%, #990e0e, 70%, #b51111)';
    };

      Toastify.showToast({
        text: message,
        duration: 2000,
        close: false,
        gravity: 'top',
        position: 'left',
        stopOnFocus: false,
        style: {
            background: colours
        }
      });
};

/////////

//=====================================================
//=====================================================
//======================  DEV  ========================
//=====================================================
//=====================================================

const DEV_Level1 = document.querySelector('#DEV_Level1');
const DEV_Level3 = document.querySelector('#DEV_Level3');
const DEV_Level5 = document.querySelector('#DEV_Level5');
const DEV_LevelUp = document.querySelector('#DEV_LevelUp');

DEV_Level1.addEventListener('click', () => {
    //setFrogStage(1);
    stopPrecip();
});

DEV_Level3.addEventListener('click', () => {
    //setFrogStage(3);
    summonRain();
});

DEV_Level5.addEventListener('click', () => {
    //setFrogStage(5);
    summonSnow();
});

let devSwitch = 1;

DEV_LevelUp.addEventListener('click', () => {
    //setFrogStage(Number(Span_Level.innerHTML) + 1);
    //notify('test', 'blue');
    //changeFeed();
    if (devSwitch === 1) {
        devSwitch = 2;
        document.body.style.background = '#95e1ea';
    } else if (devSwitch === 2) {
        devSwitch = 3;
        document.body.style.background = '#eece4f';
    } else {
        devSwitch = 1;
        document.body.style.background = '#00aaaa';
    }

    stopPrecip();
});

function weatherPlaceholder() {
    const placeh_temp = 19;
    Table_Weather.innerHTML = `[${placeh_temp}]<br/>[3]<br/>[1]`;
    if (placeh_temp <= 15) {
        document.body.style.background = '#95e1ea';
    } else if (placeh_temp >= 27) {
        document.body.style.background = '#eece4f';
    } else {
        document.body.style.background = '#00aaaa';
    };
};