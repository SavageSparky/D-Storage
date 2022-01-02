
import { firebaseConfig } from "./modules/firebase-key";
import { initializeApp } from "firebase/app";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { getDatabase, set, ref, get,child } from "firebase/database";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        const dbRef = user.uid
        checkInDb(dbRef,user)
    }
});

function checkInDb(dbRef) {
    const db = ref(getDatabase());
    get(child(db, dbRef)).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
        }
         else {
          storeUserDet(dbRef)
        }
      }).catch((error) => {
        console.error(error);
      });
}

function storeUserDet(dbRef,user){
    set(ref(database, dbRef), {
        User_name: user.displayName,
        User_profile_url : user.photoURL,
        User_email : user.email
      }).then(() => {
        console.log("done")
      })
      .catch((error) => {
        console.log(error)
      });
}