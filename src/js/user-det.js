import { firebaseConfig } from "./modules/firebase-key";
import { initializeApp } from "firebase/app";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { getDatabase, set, ref, get, child } from "firebase/database";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);

let currentUser;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    checkInDb();
  }
});

function checkInDb() {
  const db = ref(getDatabase());
  get(child(db, currentUser.uid))
    .then((snapshot) => {
      if (!snapshot.exists()) {
        storeUserDet();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function storeUserDet() {
  set(ref(database, currentUser.uid), {
    User_name: currentUser?.displayName,
    User_profile_url: currentUser?.photoURL,
    User_email: currentUser?.email,
  })
    .then(() => {
      console.log("stored user details");
    })
    .catch((error) => {
      console.log(error);
    });
}
