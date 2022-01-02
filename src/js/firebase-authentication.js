import { firebaseConfig } from "./modules/firebase-key";

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth();

const signInBtn = document.querySelector("#sign-in-btn");
const signOutBtn = document.querySelector("#sign-out-btn");

signInBtn.addEventListener('click', () => {
    signInWithGoogle();
});

signOutBtn.addEventListener('click', ()=> {
    signOutUser()
})

function signInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log(result.user);
        }).catch((error) => {
            console.log(error)
        });
}


function signOutUser() {
    signOut(auth).then(() => {
        console.log("signed-out successfully");
    }).catch((error) => {
        console.log(error);
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("signed-out");
        signInBtn.style.display="none";
        signOutBtn.style.display="unset"

    } else {
        console.log("signed out");
        signInBtn.style.display="unset";
        signOutBtn.style.display="none"
    }
});
