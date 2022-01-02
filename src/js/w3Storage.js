import { Web3Storage } from 'web3.storage' 

function getAccessToken() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFENWFEOGFlQTQxN0VjODg3MTM2MjQyMTc1MUE2QzU0OWU5YTkyYzEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Mzk0OTM4NDY5NjYsIm5hbWUiOiJTYXZhZ2VTcGFya3kifQ.wjGlz7tlgtlIvSgE2Ox9IYmi7lOwyhCUiaXIlDgqguU";
  return token
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() })
}

export async function storeFiles (files) {
  const client = makeStorageClient()
  console.log(files);
  let cid;
  if(files.length == 1){
    cid = await client.put(files, {name: files.item(0).name});
  }
  else{
    cid = await client.put(files);
  }
  console.log("from store.js : "+cid)
  return cid
}


export async function listUploads() {
  const client = makeStorageClient()
  let fileArray = [];
  for await (const upload of client.list()) {
    fileArray.push(upload);
  }
  return fileArray;
}