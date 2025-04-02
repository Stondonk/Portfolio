
async function RequestJson(Address){
    var TempData = await fetch(Address);
    var Data = await TempData.json();
    console.log(Data);

    return Data;
}


async function LoadCard(PreviewID = "EMPTY", CardAdress = ""){
    const Card = document.getElementById(PreviewID);
    var JsonData = await RequestJson("PreviewCards/"+CardAdress);
    if(!JsonData) return "ERROR";
    var Title = Card.children[0];//Might Change later
    var ImageD = Card.children[1];
    var Des = Card.children[2];
    //Title
    Title.textContent = JsonData["Title"];
    //Images
    ImageD.querySelectorAll('*').forEach(c => c.remove());
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