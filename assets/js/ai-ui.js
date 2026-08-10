/*======================================================
PTIS AI UI
======================================================*/

const aiButton =
document.getElementById("aiButton");

const aiWindow =
document.getElementById("aiWindow");

const closeAI =
document.getElementById("closeAI");

aiButton.onclick = ()=>{

    aiWindow.classList.remove("hidden");

};

closeAI.onclick = ()=>{

    aiWindow.classList.add("hidden");

};

console.log("PTIS AI UI Loaded");