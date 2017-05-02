var SearchControl = document.getElementById('SBox');
var ColorChange = document.getElementById('color');

function searchbox(num) {
  if(num == "1"){
    SearchControl.style.visibility = "visible";
    SearchControl.style.opacity = "1";
  } else if(num == "0") {
    SearchControl.style.visibility = "hidden";
    SearchControl.style.opacity = "0";
    }
  }