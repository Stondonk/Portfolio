const fs = require('fs');

async function RequestJson(Address){
    var TempData = await fetch(Address);
    var Data = await TempData.json();

    return Data;
}


async function LoadCard(PreviewID = "EMPTY", CardAdress = "", ManualID = -1){
    const Card = document.getElementById(PreviewID);
    var JsonData = await RequestJson("PreviewCards/"+CardAdress);
    if(!JsonData) return "ERROR";
    var Title = Card.children[0];//Might Change later
    var ImageD = Card.children[1];
    var Des = Card.children[2];

    var IdChild = Card.childElementCount-1;
    var CardID = Card.children[IdChild];
    CardID.textContent = ManualID >= 0 ? (await RPathIndex(CardAdress)).toString() : ManualID;
    //Title
    Title.textContent = JsonData["Title"];
    //Images
    ImageD.querySelectorAll('*').forEach(c => c.remove());
    ImageD.style.gridTemplateColumns = "repeat("+JsonData["Images"].length.toString()+", 3fr)";
    for (let ImgIdx = 0; ImgIdx < JsonData["Images"].length; ImgIdx++) {
        let Image = document.createElement("img");
        Image.id = (ImgIdx <= 0 ? "MediaImgStart" : ImgIdx >= JsonData["Images"].length-1 ? "MediaImgEnd" : "");
        Image.src = "imageReference/"+JsonData["Images"][ImgIdx];
        if(ImgIdx <= 0) Image.style.marginLeft = 0;
        if(ImgIdx >= JsonData["Images"].length-1) Image.style.marginRight = 0;
        ImageD.appendChild(Image);
    }
    //Description
    Des.textContent = JsonData["Description"];
    //console.log(JsonData["Title"]);
    
}

async function RPathIndex(CardAdress = ""){
    const W = CardAdress.split("/");
    var JsonData = await RequestJson("PreviewCards/Files.Json");
    for (let wIdx = 0; wIdx < JsonData[W[0]].length; wIdx++) {
        if(JsonData[W[0]][wIdx] == W[1]) return wIdx;
    }
    return 0;
}

async function LoadNextCard(PreviewID = "EMPTY", Direction = 1, Files="Games"){
    const Card = document.getElementById(PreviewID);
    var IdChild = Card.childElementCount-1;
    var CardID = Card.children[IdChild];
    console.log(CardID.textContent);
    let IdT = parseInt(CardID.textContent)+Direction
    var FilesData = await RequestJson("PreviewCards/Files.Json");
    if(IdT >= FilesData[Files].length) IdT -= FilesData[Files].length
    if(IdT < 0) IdT += FilesData[Files].length
    LoadCard(PreviewID,(Files + "/" + FilesData[Files][IdT]).toString(), IdT);
    //CardID.textContent = (parseInt(Card.textContent)).toString();
}