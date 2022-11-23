var mobile = false;
var ogSizes = [];

function lockWindowPos(){
  mobile = false;
  if(document.documentElement.clientWidth * 1.25 <= document.documentElement.clientHeight)
    mobile = true;

  console.log (mobile);

    for (let index = 0; index < document.getElementsByClassName("topBar").length; index++) {
        const ReSelnt = document.getElementsByClassName("topBar")[index];
        reSizeCheck(index);
        ReSelnt.style.top = clamp (ReSelnt.style.top, 0, (document.documentElement.clientHeight - ReSelnt.clientHeight - 52)) + "px";
        ReSelnt.style.left = clamp (ReSelnt.style.left, 0 ,(document.documentElement.clientWidth - ReSelnt.clientWidth - 2)) + "px";
    }
}

function closeAllWindows(){
  for (let index = 0; index < document.getElementsByClassName("topBar").length; index++) {
    BringWindowOut(index);
  }
}

function BringWindowOut(BarPeace){
    document.getElementsByClassName("topBar")[BarPeace].style.top = - document.getElementsByClassName("topBar")[BarPeace].clientHeight - 32;
}

function reSizeCheck(windowValue){    
  if(mobile == true){
    closeAllWindows();
    document.getElementsByClassName("topBar")[windowValue].style.width = document.documentElement.clientWidth;
    document.getElementsByClassName("topBar")[windowValue].style.left = 0;
    document.getElementsByClassName("topBar")[windowValue].style.top = 0;
    //document.getElementsByClassName("topBar")[windowValue].style.top = clamp (document.getElementsByClassName("topBar")[windowValue].style.top , 0, (document.documentElement.clientHeight)) + "px"
  } else{
    document.getElementsByClassName("topBar")[windowValue].style.width = ogSizes[windowValue * 2];
    //document.getElementsByClassName("topBar")[windowValue].style.height = ogSizes[(windowValue * 2) + 1];
  
  }
}

function Start(){
  for (let index = 0; index < document.getElementsByClassName("topBar").length; index++) {
    ogSizes.push(document.getElementsByClassName("topBar")[index].clientWidth);
    ogSizes.push(document.getElementsByClassName("topBar")[index].clientHeight);
    BringWindowOut(index);
  }
}

for (let index = 0; index < document.getElementsByClassName("topBar").length; index++) {
    const element = document.getElementsByClassName("topBar")[index];
    //gets proceeding header. topBarheader peices come in the same order as the topbar meaning to reference a top and top header you only need the index for one as there in the same location in each array
    const element2 = document.getElementsByClassName("topBarHeader")[index];
    dragElement(element, element2);
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function dragElement(item, headeritem) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (headeritem) {
    headeritem.onmousedown = dragMouseDown;
  } 
  else {
    item.onmousedown = dragMouseDown;
  }

  function dragMouseDown(Md) {
    Md = Md || window.event;
    Md.preventDefault();
    
    pos3 = Md.clientX; pos4 = Md.clientY;

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(Md) {
    Md = Md || window.event;
    Md.preventDefault();

    pos1 = pos3 - Md.clientX; pos2 = pos4 - Md.clientY;

    pos3 = Md.clientX; pos4 = Md.clientY;

    item.style.top = clamp (item.offsetTop - pos2, 0, (document.documentElement.clientHeight - item.clientHeight - 52)) + "px";
    item.style.left = clamp (item.offsetLeft - pos1, 0 ,(document.documentElement.clientWidth - item.clientWidth - 2)) + "px";
    //item.style.width = document.documentElement.clientWidth;
    for (let index = 0; index < array.length; index++) {
        if(item == document.getElementsByClassName("topBar")[index])
        reSizeCheck(index);
    }
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function pressedisation(windowValue){
    if(mobile == true)
      closeAllWindows();
    
    console.log(windowValue);
    document.getElementsByClassName("topBar")[windowValue].style.top = 32;
        //BringWindowIn(document.getElementsByClassName("iconSe")[index]);
}

Start();

window.addEventListener("resize", lockWindowPos);
lockWindowPos();