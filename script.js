/*
Задачи: 
1. Ленивая подгрузка добавляет +2 картинки слишком поздно. Сделать пораньше (сразу когда становится активен последний индикатор и картинка)
2. Прятать кнопки next/prev чтобы не тыкали, пока подгружаются новые картинки.
3. Остановить запросы когда кончится база (TOTAL_ITEMS) . На данный момент скрипт подгружаеть пустые элементы списка, 
и делаются активными элементы, которых нет (порядок картинок путается).
3.1. Для этого настроить промис в функции fetchData . Добавить возможность невыполнения промиса (reject)

*/


var list = document.querySelector('.list')
var items
var indicators
//var interval //interval for debounce
var prev_btn = document.querySelector('.prev')
var next_btn = document.querySelector('.next')
var state = {active: 0, auth: null, loadedPages: 0}
const PAGE_SIZE = 3;
const TOTAL_ITEMS = 10;
const data = Array.from(Array(TOTAL_ITEMS)).map((v, i) => `Картинка ${i+1}`);  // БД для запросов
let renderData = []  // rendering items

var intersectionObserver = new IntersectionObserver(onObserve, {
  root: list,
  threshold: 0.6
})

// function debounce(f, t) {
//     let interval
//   return function () {
//     clearTimeout(interval);
//     interval = setTimeout(() => f(), t);
//   }
// }

function debounce(func, wait, immediate) {
  var timeout = undefined;

  // Эта функция выполняется, когда событие DOM вызвано.
  return function executedFunction() {
    // Сохраняем контекст this и любые параметры,
    // переданные в executedFunction.
    var context = this;
    var args = arguments;

    // Функция, вызываемая по истечению времени debounce.
    var later = function later() {
      // Нулевой timeout, чтобы указать, что debounce закончилась.
      timeout = null;

      // Вызываем функцию, если immediate !== true,
      // то есть, мы вызываем функцию в конце, после wait времени.
      if (!immediate) func.apply(context, args);
    };

    // Определяем, следует ли нам вызывать функцию в начале.
    var callNow = immediate && !timeout;

    // clearTimeout сбрасывает ожидание при каждом выполнении функции.
    // Это шаг, который предотвращает выполнение функции.
    clearTimeout(timeout);

    // Перезапускаем период ожидания debounce.
    // setTimeout возвращает истинное значение / truthy value
    // (оно отличается в web и node)
    timeout = setTimeout(later, wait);

    // Вызываем функцию в начале, если immediate === true
    if (callNow) func.apply(context, args);
  };
};

async function lazyLoad() {
  const result = await fetchData(state.loadedPages, PAGE_SIZE).catch(alert)
  
  if (result) {
  console.log("fetched+3")
  console.log(result)
  render(result)
  }
}

function onObserve(entries) {         
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
      activate(items.indexOf(entry.target));
      if (state.active == items.length-1) lazyLoad()
    }
  })
}

window.onload = () => lazyLoad()


function render(someData){
 let loadData = renderData.concat(someData)
 renderData = loadData
 loadData = loadData.map((el)=> `<li class="item">${el}</li>`)
 console.log(loadData)
 list.innerHTML = loadData.join('')  
items = Array.from(document.querySelectorAll(".item"))
 
let indicatorsRender = renderData.map(() => `<button class="indicator"></button>`)
let indicatorsList = document.querySelector('.indicatorsList')
indicatorsList.innerHTML = indicatorsRender.join('')

indicators = document.querySelectorAll(".indicator")

indicators.forEach((indicator, index) => {                      
indicator.onclick = () => { items[index].scrollIntoView() }
})

items.forEach((val) => intersectionObserver.observe(val))

}


const fetchData = (page, pageSize) => {
  let promise = new Promise(function(resolve, reject){

  let possibleCut = data.length - page

pageSize = possibleCut >= pageSize ? pageSize : possibleCut

if (page !== data.length) {

    state.loadedPages += pageSize
      resolve(data.slice(page, page+pageSize)); 
}

reject(new Error("Nothing more"))
  }
  )

  //   if (page + pageSize <= data.length){
  //     state.loadedPages += pageSize
  //     resolve(data.slice(page, page+pageSize)); 
  //   }
  //   else {
  //     if (data.length-page !== 0){
  //       state.loadedPages += (data.length-page)
  //       resolve(data.slice(page, page + (data.length-page)))
  //     }
  //     else reject(new Error("Nothing more"))
  //   }
  // });


  
  return promise;
}  


prev_btn.addEventListener('click', debounce(()=> items[state.active-1]?.scrollIntoView(), 200,true))
next_btn.addEventListener('click', debounce(()=> items[state.active+1]?.scrollIntoView(), 200,true))


function activate(itemNumber) {
  state.active = itemNumber;
  indicators.forEach((indicator, i) => {
    indicator.classList.toggle("active", i == itemNumber)
  }) 
}

