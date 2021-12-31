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
  console.log(files)
  const cid = await client.put(files)
  console.log("from store.js : "+cid)
  return cid
}

export async function storeWithProgress(files) {  
  // show the root cid as soon as it's ready
  const onRootCidReady = cid => {
    console.log('uploading files with cid:', cid)
  }

  // when each chunk is stored, update the percentage complete and display
  const totalSize = files.map(f => f.size).reduce((a, b) => a + b, 0)
  let uploaded = 0

  const onStoredChunk = size => {
    uploaded += size
    const pct = totalSize / uploaded
    console.log(`Uploading... ${pct.toFixed(2)}% complete`)
  }

  // makeStorageClient returns an authorized Web3.Storage client instance
  const client = makeStorageClient()

  // client.put will invoke our callbacks during the upload
  // and return the root cid when the upload completes
  return client.put(files, { onRootCidReady, onStoredChunk })
}