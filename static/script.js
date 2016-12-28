window.$ = document.querySelectorAll.bind(document);

Node.prototype.on = window.on = function (name, fn) {
  this.addEventListener(name, fn);
}

NodeList.prototype.__proto__ = Array.prototype;

NodeList.prototype.on = NodeList.prototype.addEventListener = function (name, fn) {
  this.forEach(function (elem, i) {
    elem.on(name, fn);
  });
}

var button = $('#toggle-light')  
var sliders = $('.brightness-slider')

var config = window.__app.config;
var prefix = config.prefix ? '/' + config.prefix : '';

var contentType = {"content-type": "application/json"};

sliders.on('change', function(e) {         
  console.log('changed ', e.target.value);
  e.target.nextElementSibling.textContent = e.target.value
  var color = e.target.dataset.color;
  var id = e.target.dataset.id;
  var data = JSON.stringify({id: id, color: color, value: parseInt(e.target.value)}); 
  promise.post(prefix + '/update', data, contentType);
})       
    
button.on('click', function(){         
  promise.post(prefix + '/toggle')        
})

var connectBtns =  $('.connect-btn');

connectBtns.on('click', function(e) {
  var id = e.target.dataset.id;
  data = {};
  data.id = id;
  data = JSON.stringify(data);
  promise.post(prefix + '/connect', data, contentType).then(function(bool, res) {
   console.log(res) 
  });
});
