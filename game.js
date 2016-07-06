var gamefield,					// объект поля игры
	fields = [],				// массив для хранения номера поля
	twoBlockSelected = true,	// переключатель выделения двух блоков
	firstSelectBlock,			// первый выделенный блок из двух
	clickCounter = 0;			// каунтер нажатий
	ms = 0,						// каунтер времени
	gameStarted = 0,			// метка начала игры
	pictureCount = 10,			// количество картинок
	imagesURL = 'https://kde.link/test/'; // адрес места хранения картинок

var req = new XMLHttpRequest();

// после загружки страницы
window.onload = function(){
	gamefield = document.getElementById('gamefield');	// получает объект поля игры UL по ID

	// парсим JSON объект для получения размеров поля
	req.open("GET", "https://kde.link/test/get_field_size.php", true);
	req.onreadystatechange = getFieldSize;
	req.send(null);
	// getFieldSize();				// для ручного запуска игры
};

// функция обработки нажатия на блок
function checkBlock(e){
	if(gameStarted === 0) timer();	// включаем таймер
	clickCounter++;					// фиксируем нажатие

	// проверяем на предмет нажатия второго блока
	if(twoBlockSelected = twoBlockSelected === false)
		e.classList.toggle('active');
	else{
		killActiveBlock();			// отменяем все активные элементы
		e.classList.toggle('active');
		firstSelectBlock = e;		// устанавливаем нажатый блок, как первый из двух выделенных
	}

	// получаем индексы первого и второго нажатых блоков
	var index  = [].indexOf.call(gamefield.children, e);
	var index2 = [].indexOf.call(gamefield.children, firstSelectBlock);

	// отображаем картинку у активного блока и скрываем у неактивного
	if(e.classList.contains('active'))	e.style.background = 'url("' + imagesURL + String(fields[index]) + '.png") no-repeat';
	else								e.removeAttribute('style');

	// проверяем на совпадение картинок блоков
	if( firstSelectBlock && 				// если сущетвует первый выделенный блок
		twoBlockSelected && 				// если выделено два блока
		firstSelectBlock !== e && 			// исключаем нажатие и отмену выделения одного и того же блока
		fields[index] === fields[index2])	// сравниваем картинки блоков
	{
		killActiveBlock();								// отменяем все активные элементы
		firstSelectBlock.classList.add('deactive');		// делаем 1-й выделенный блок неактивным
		firstSelectBlock.removeAttribute('onclick');	// удаляем обработчик нажатия у 1-го блока
		e.classList.add('deactive');					// делаем 2-й выделенный блок неактивным
		e.removeAttribute('onclick');					// удаляем обработчик нажатия у 2-го блока
	}

	// если игры окончена
	if(isGameEnded()){
		timer();					// останавливаем таймер
		// считаем и выводим очки
		document.getElementById('time').innerHTML += ' <b>Кликов: ' + clickCounter + '</b> <i>Очков: ' + 
			(gamefield.children.length / clickCounter * 10).toFixed(0) *			// очки за клики
			(gamefield.children.length / (ms / 1000).toFixed(1) * 10).toFixed(0) *	// умножить на очки за время
			gamefield.children.length;												// умножить на коэффициент сложности
		// деактивируем поле игры
		gamefield.classList.remove('started');
		// продолжить игру?
		if(confirm('Хотите продолжить игру?'))
		{
			// удаляем все блоки и очищаем массив с номерами
			while(gamefield.firstChild) gamefield.removeChild(gamefield.firstChild);
			fields = [];
			// парсим JSON объект для получения размеров поля
			req.open("GET", "https://kde.link/test/get_field_size.php", true);
			req.onreadystatechange = getFieldSize;
			req.send(null);
		}
	}
}

// функция удаления всех классов ACTIVE и очистки пустых атрибутов
function killActiveBlock(){
	for(var i = 0; i < gamefield.children.length; i++){
		// только если элемент активный
		if(gamefield.children.item(i).classList.contains('active')){
			gamefield.children.item(i).classList.remove('active');		// деактивируем его
			gamefield.children.item(i).removeAttribute('style');		// удаляем стили (скрываем фон-картинку)
			if(gamefield.children.item(i).classList.length === 0) gamefield.children.item(i).removeAttribute('class'); // очищаем атриут с классом
			if(gamefield.children.item(i).getAttribute('style') === '') gamefield.children.item(i).removeAttribute('style'); // очищае атрибут стиля
		}
	}
};

// получение размеров поля, его инициализация и заполнение блоками
function getFieldSize(){
	if(req.readyState === 4){							// 
		var doc = eval('(' + req.responseText + ')');	// 
		initGameField(doc.width, doc.height);			// задаем размеры полю игры
		fillField(doc.width * doc.height);				// заполняем поле блоками
	}
		// initGameField(4, 4);							// ручной ввод размеров поля
		// fillField(16);								// ручное заполнение блоками
};

// установка размеров поля 
function initGameField(width, height){
	gamefield.parentNode.style.width = width * 50 + 'px';	// установка ширины поля игры
	gamefield.parentNode.style.height = height * 50 + 'px';	// установка высоты поля игры
	gamefield.classList.add('started');						// активируем поле игры
};

// функция заполнения поля игры блоками
function fillField(countBlocks){
	var li = document.createElement('li');				// создаем блок
	var liClone;										// переменная для копирования блока

	// заполняем массив номеров блоков
	for(i = 0; i < countBlocks / 2; i++)
		fields.push(i % 10, i % 10);

	// перемешиваем номера блоков
	fields.sort(randomatic);

	// добавляем блоки в поле игры
	for(i = 0; i < countBlocks; i++){
		liClone = li.cloneNode(true);
		liClone.setAttribute('onclick', 'checkBlock(this)');
		gamefield.appendChild(liClone);
	}
};

// случайный выбор одного из двух элементов массива (для метода sort)
function randomatic(a, b){
	return Math.random() - 0.5;
}

// проверка окончания игры перебором всех элементов
function isGameEnded(){
	for(i = 0; i < gamefield.children.length; i++){
		if(!gamefield.children.item(i).classList.contains('deactive'))
			break;			// останавливаем цикл, если находим не деактивированный блок
		if(i === gamefield.children.length - 1)
			return true;	// если доходим до конца цикла, значит все элементы дактивированы, значит игра закончена
	}
	return false;			// возвращаем false - игра не закончена
}

// функция запуска и остановки таймера
function timer(){
	if (gameStarted === 0){	// если игра не запущена
		gameStarted = 1;	// запускаем её
		then = new Date();	// создаем точку отсчета
		then.setTime(then.getTime());
	}else{
		gameStarted = 0;	// останавливаем игру
		now = new Date();	// фиксируем дату окончания игры
		ms = now.getTime() - then.getTime();	// ищем разницу между точкой отсчета и окончанием игры
		// выводим длительность игры
		document.getElementById('time').innerHTML = 'Время прохождения игры ' +  (ms/1000).toFixed(1) + ' секунд';
	}
}
