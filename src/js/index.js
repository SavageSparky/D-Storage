import {storeFiles, storeWithProgress} from "./store"


const status = document.querySelector('.description');
const uploadButton = document.getElementById('submit');
uploadButton.addEventListener('click', async (event)=> {
  event.preventDefault();

  const files = document.getElementById('file_selector').files;
  console.log(files);

  status.style.color = "#0351c5";
  status.innerHTML = "Please Wait, Uploading Files..."

  let cid = await storeFiles(files);
  console.log("from index.js : "+cid);

  status.style.color = "green";
  status.innerHTML = `File uploaded! <br> cid generated! <br> Go to Files Section for more info`;
})
