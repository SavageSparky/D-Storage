import { storeFiles, listUploads } from "./w3Storage"

import { firebaseConfig } from "./modules/firebase-key";
import { initializeApp } from "firebase/app";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { getDatabase, set, ref, get, child } from "firebase/database";
import { getFilesFromPath } from "files-from-path";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);


onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    getFiles(userId)
    uploadButton.addEventListener('click', async (e) => {
      storeCurrentFile(e, userId)
    })
  }
});


function getFiles(userId) {
  const db = ref(getDatabase());
  const dbRef = `${userId}/files`
  get(child(db, dbRef)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
    }
    else {

    }
  }).catch((error) => {
    console.error(error);
  });
}

const status = document.querySelector('.description');
const uploadButton = document.getElementById('submit');


async function storeCurrentFile(e, userId) {
  e.preventDefault();

  const files = document.getElementById('file_selector').files;
  const fileName = files[0].name;

  status.style.color = "#0351c5";
  status.innerHTML = "Please Wait, Uploading Files..."

  const len = files.length;

  if (len == 0) {
    status.innerHTML = "Please select a file"
  }
  else {
    const cid = await storeFiles(files);
    addFileInDb(cid, fileName, userId)
    console.log("from index.js : " + cid);
    status.style.color = "green";
    status.innerHTML = `File uploaded! <br> cid generated! <br> Go to Files Section for more info`;
  }
}

function addFileInDb(cid, fileName, userId) {
  const dbRef = `${userId}/files/${fileName.split('.').slice(0, -1).join('.')}`
  set(ref(database, dbRef), {
    File_name: fileName,
    cid: cid
  }).then(() => {
    console.log("saved")
  })
    .catch((error) => {
      console.log(error)
    });
}


const form = document.querySelector(".files_table");

window.onload = async ()=> {
  let fileArray = await listUploads();
  for (const file of fileArray) {
    console.log(file);
  
    const fileName = file.name;
    const cid = file.cid;
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

function formatSize(byteSize) {
  if (byteSize / 1024 < 1) {
    return byteSize + ' B';
  }
  else if (byteSize / (1024 * 1024) < 1) {
    return (byteSize / (1024)).toFixed(2) + " KB";
  }
  else if (byteSize / (1024 * 1024 * 1024) < 1) {
    return (byteSize / (1024 * 1024)).toFixed(2) + " MB";
  }
  else if (byteSize / (1024 * 1024 * 1024 * 1024) < 1) {
    return (byteSize / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }
}




