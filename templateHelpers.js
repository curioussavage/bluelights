var handlebars = require('handlebars');

module.exports = {
  slider: function(value, color, id) {
    var string =  "<input class='brightness-slider' type='range'  min=0 max=255 value='" + value +
      "' data-color='" + color + "' data-id='" + id + "' />"

    return new handlebars.SafeString(string);
  } 
}
