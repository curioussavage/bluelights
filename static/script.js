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
    
button.on('click', function(e){
  var data = JSON.stringify({ id: e.target.dataset.deviceid });
  promise.post(prefix + '/toggle', data, contentType);
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

var editBtns = $('.light-title-edit');
var saveBtns = $('.light-title-save');

editBtns.on('click', function(e) {
  e.target.hidden = true;
  var title = e.target.parentNode.getElementsByClassName('light-name')[0];
  title.contentEditable = true;
  title.focus();

  var savebtn = e.target.parentNode.getElementsByClassName('light-title-save')[0];
  savebtn.hidden = false;
});

saveBtns.on('click', function(e) {
  var id = e.target.dataset.id;
  var titleEl = e.target.parentNode.getElementsByClassName('light-name')[0];
  var title = titleEl.textContent;
  var data = JSON.stringify({id: id, title: title});
  promise.post(prefix + '/save-title', data, contentType);
  var editBtn = e.target.parentNode.getElementsByClassName('light-title-edit')[0];
  editBtn.hidden = false;
  e.target.hidden = true; 
  titleEl.contentEditable = false;
});
