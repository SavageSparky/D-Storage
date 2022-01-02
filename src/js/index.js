import {storeFiles, listUploads} from "./w3Storage"


const status = document.querySelector('.description');
const uploadButton = document.getElementById('submit');
uploadButton.addEventListener('click', async (event)=> {
  event.preventDefault();

  const files = document.getElementById('file_selector').files;
  console.log(files);

  status.style.color = "#0351c5";
  status.innerHTML = "Please Wait, Uploading Files..."

  const len = files.length;
  
  if(len == 0){
    status.innerHTML = "Please select a file"
  }
  else{   
    const cid = await storeFiles(files);
    console.log("from index.js : "+cid);
    status.style.color = "green";
    status.innerHTML = `File uploaded! <br> cid generated! <br> Go to Files Section for more info`;
  }  
})


// Files Section
const form = document.querySelector(".files_table");
form.innerHTML = `
<tr class="table_heading">
<th>Name</th>
<th>CID</th>
<th>Size</th>
<th>Status</th>
<th></th>
<th></th>
</tr>
`;


window.onload = async ()=> {
  let fileArray = await listUploads();
  for (const file of fileArray) {
    console.log(file);
  
    const fileName = file.name;
    const cid = file.cid;
    // const status = pins.status;
    const size = formatSize(file.dagSize); 

    form.innerHTML += `<tr class="table_records">
    <td class="file_name">${fileName}</td>
    <td class="file_cid"><a href="https://${cid}.ipfs.dweb.link/" target="blank">${cid}</a></td>
    <td class="file_size">${size}</td>
    <td>queued</td>
    <td><a href="https://${cid}.ipfs.dweb.link/${fileName}" target="blank" download><img class="download_img" src="./assets/download_icon.svg" alt=""></a></td>
    <td><a href=""><img class="trash_img" src="./assets/trash_icon.svg" alt=""></a></td>
    </tr>`;
  }
}

function formatSize(byteSize){
  if(byteSize/1024 < 1){
    return byteSize+' B';
  }
  else if(byteSize/(1024*1024) < 1){
    return (byteSize/(1024)).toFixed(2)+" KB";
  }
  else if(byteSize/(1024*1024*1024) < 1){
    return (byteSize/(1024*1024)).toFixed(2)+" MB";
  }
  else if(byteSize/(1024*1024*1024*1024) < 1){
    return (byteSize/(1024*1024*1024)).toFixed(2)+" GB";
  } 
}




