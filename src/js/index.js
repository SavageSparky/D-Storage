import { storeFiles, listUploads } from "./w3Storage";

import { firebaseConfig } from "./modules/firebase-key";
import { initializeApp } from "firebase/app";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { getDatabase, set, ref, get, child, remove } from "firebase/database";
import { getFilesFromPath } from "files-from-path";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);

const status = document.querySelector(".description");
const uploadButton = document.getElementById("submit");
const filesTable = document.querySelector(".files_table");
const fileInput = document.querySelector("#file_selector");
const fileInfo = document.querySelector("#file_info");

let userId;

onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
    getFilesDb(userId);
    uploadButton.addEventListener("click", async (e) => {
      storeFileInW3(e, userId);
      dispLoaderRow();
    });
  }
});

function getFilesDb(userId) {
  const db = ref(getDatabase());
  const dbRef = `${userId}/files`;
  get(child(db, dbRef))
    .then((snapshot) => {
      if (snapshot.exists()) {
        // console.log(snapshot.val());
        const data = snapshot.val();
        retrieveFromW3(data);
      } else {
        dispNoDataMsg();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function addFileInDb(cid, fileName, userId) {
  const dbRef = `${userId}/files/${fileName.split(".").slice(0, -1).join(".")}`;
  set(ref(database, dbRef), {
    File_name: fileName,
    cid: cid,
  })
    .then(() => {
      getFilesDb(userId);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function storeFileInW3(e, userId) {
  e.preventDefault();
  const files = document.getElementById("file_selector").files;
  const len = files.length;
  const fileName = files[0].name;
  status.style.color = "#0351c5";
  status.innerHTML = "Please Wait, Uploading Files...";
  if (len == 0) {
    status.innerHTML = "Please select a file";
  } else {
    const cid = await storeFiles(files);
    addFileInDb(cid, fileName, userId);
    console.log("from index.js : " + cid);
    status.style.color = "green";
    status.innerHTML = `File uploaded! <br> cid generated! <br> Go to Files Section for more info`;
  }
}

async function retrieveFromW3(data) {
  let fileArray = await listUploads();
  console.log(fileArray);
  // console.log(data);
  const userFiles = Object.keys(data);
  let userCid = [];

  userFiles.forEach((file) => {
    userCid.push(data[file].cid);
  });

  console.log(userCid);

  let userFileArray = [];
  fileArray.forEach((file) => {
    const storedCid = file.cid;
    if (userCid.includes(storedCid)) {
      userFileArray.push(file);
    }
  });
  updateFileContent(userFileArray);
  addDeleteOption();
}

function addDeleteOption() {
  const deleteBtns = document.querySelectorAll(".delete-file");
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteFiles(btn);
    });
  });
}

async function deleteFiles(btn) {
  const fileName = btn.dataset.file_name;
  await deleteFilesDb(fileName);
  btn.parentElement.parentElement.parentElement.remove();
  const row = document.querySelectorAll("tbody");
  console.log(row);
  if (row.length < 2) {
    dispNoDataMsg();
  }
}

async function deleteFilesDb(fileName) {
  const dbRef = `${userId}/files/${fileName}`;
  await remove(ref(database, dbRef));
}

function resetForm() {
  filesTable.innerHTML = `        
  <tr class="table_heading">
    <th>Name</th>
    <th>CID</th>
    <th>Status</th>
    <th>Storage Providers</th>
    <th>Size</th>
    <th></th>
    <th></th>
  </tr>`;
}

function updateFileContent(fileArray) {
  resetForm();
  fileArray.forEach((file) => {
    const fileName = file.name;
    const cid = file.cid;
    const size = formatSize(file.dagSize);
    const fileStatus = getFileStatus(file);
    const storageProviders = getStorageProviders(fileStatus, file);

    filesTable.innerHTML += `<tr class="table_records">
    <td class="file_name">${fileName}</td>
    <td class="file_cid"><a href="https://${cid}.ipfs.dweb.link/" target="blank">${cid}</a>
      <img src="./assets/clipboard.png" alt="" class="copy-to-clipboard" data-cid="${cid}">
    </td>
    <td>${fileStatus}</td>
    <td class="storage_providers">${storageProviders}</td>
    <td class="file_size">${size}</td>
    <td><a href="https://${cid}.ipfs.dweb.link/${fileName}" target="blank" download><img class="download_img" src="./assets/download_icon.svg" alt=""></a></td>
    <td><a class="delete-file" data-file_name="${fileName
      .split(".")
      .slice(0, -1)
      .join(
        "."
      )}" ><img class="trash_img" src="./assets/trash_icon.svg" alt=""></a></td>
    </tr>`;
  });
  addClipboardOption();
}

function getFileStatus(file) {
  if (file.pins.length == 0) {
    return "Queued";
  } else {
    let status = "Pinned";
    file.pins.forEach((element) => {
      if (element.status != "Pinned") {
        status = "Queued";
      }
    });
    return status;
  }
}

function getStorageProviders(fileStatus, file) {
  if (fileStatus == "Queued") {
    return fileStatus;
  } else {
    let storageProviders = "";
    file.deals.forEach((provider) => {
      storageProviders += `<a href="https://filfox.info/en/deal/${provider.dealId}" target="blank">${provider.storageProvider} </a>`;
    });
    return storageProviders;
  }
}

function formatSize(byteSize) {
  if (byteSize / 1024 < 1) {
    return byteSize + " B";
  } else if (byteSize / (1024 * 1024) < 1) {
    return (byteSize / 1024).toFixed(2) + " KB";
  } else if (byteSize / (1024 * 1024 * 1024) < 1) {
    return (byteSize / (1024 * 1024)).toFixed(2) + " MB";
  } else if (byteSize / (1024 * 1024 * 1024 * 1024) < 1) {
    return (byteSize / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }
}

//display no data available message
function dispNoDataMsg() {
  resetForm();
  filesTable.innerHTML += `
    <tr id="no-data-row">
      <td colspan="7">No files were added</td>
    </tr>`;
}

//display loader table row
function dispLoaderRow() {
  const noDataRow = document.querySelector("#no-data-row");
  if (noDataRow) {
    resetForm();
  }
  filesTable.innerHTML += `
  <tr id="loader-row">
    <td colspan="7">wait...</td>
  </tr>`;
}

//update file info
fileInput.addEventListener("change", () => {
  fileInfo.textContent = fileInput?.files[0]?.name;
});

function addClipboardOption() {
  const clipboards = document.querySelectorAll(".copy-to-clipboard");
  clipboards.forEach((clipboard) => {
    clipboard.addEventListener("click", () => {
      const cid = clipboard.dataset.cid;
      navigator.clipboard.writeText(cid);
    });
  });
}
