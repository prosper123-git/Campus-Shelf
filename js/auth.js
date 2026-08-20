// import { auth, db } from "./firebase.js";

// import {
//     createUserWithEmailAndPassword,
//     signInWithEmailAndPassword,
//     signOut,
//     onAuthStateChanged
// } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// import {
//     doc,
//     setDoc,
//     getDoc
// } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// // HTML Elements

// const email = document.getElementById("email");
// const password = document.getElementById("password");

// const fullName = document.getElementById("fullName");
// const department = document.getElementById("department");
// const matricNumber = document.getElementById("matricNumber");

// const submitBtn = document.getElementById("modalSubmit");

// const tabLogin = document.getElementById("tabLogin");
// const tabSignup = document.getElementById("tabSignup");

// const authBtnDesktop = document.getElementById("authBtnDesktop");
// const authBtnMobile = document.getElementById("authBtnMobile");

// let signupMode = false;

// tabSignup.addEventListener("click", () => {
//     signupMode = true;
// });

// tabLogin.addEventListener("click", () => {
//     signupMode = false;
// });

// submitBtn.addEventListener("click", async () => {

//     if(email.value === "" || password.value === ""){
//         alert("Please complete all required fields.");
//         return;
//     }

//     if(signupMode){

//         if(fullName.value === ""){
//             alert("Enter your full name.");
//             return;
//         }

//         try{

//             const userCredential =
//                 await createUserWithEmailAndPassword(
//                     auth,
//                     email.value,
//                     password.value
//                 );

//             const user = userCredential.user;

//             await setDoc(doc(db,"users",user.uid),{

//                 fullName: fullName.value,

//                 department: department.value,

//                 matricNumber: matricNumber.value,

//                 email: email.value,

//                 createdAt: new Date()

//             });

//             alert("Account created successfully!");

//             location.reload();

//         }

//         catch(error){

//             alert(error.message);

//         }

//     }

//     else{

//         try{

//             await signInWithEmailAndPassword(

//                 auth,

//                 email.value,

//                 password.value

//             );

//             alert("Login Successful!");

//             location.reload();

//         }

//         catch(error){

//             alert(error.message);

//         }

//     }

// });

// onAuthStateChanged(auth,(user)=>{

//     (async () => {
//         if(user){
//             try{
//                 const snap = await getDoc(doc(db, "users", user.uid));
//                 let firstName = '';
//                 if(snap.exists()){
//                     const data = snap.data();
//                     if(data.fullName) firstName = String(data.fullName).trim().split(/\s+/)[0];
//                 }
//                 if(!firstName && user.email){
//                     firstName = String(user.email).split('@')[0];
//                 }
//                 const greet = firstName ? `Hello, ${firstName}` : 'Hello';
//                 authBtnDesktop.textContent = greet;
//                 authBtnMobile.textContent = greet;
//                 authBtnDesktop.title = 'Click to logout';
//                 authBtnMobile.title = 'Click to logout';
//                 authBtnDesktop.onclick = logout;
//                 authBtnMobile.onclick = logout;
//             }
//             catch(err){
//                 authBtnDesktop.textContent = "Logout";
//                 authBtnMobile.textContent = "Logout";
//                 authBtnDesktop.onclick = logout;
//                 authBtnMobile.onclick = logout;
//             }
//         }
//         else{
//             authBtnDesktop.textContent = "Login / Sign Up";
//             authBtnMobile.textContent = "Login / Sign Up";
//             authBtnDesktop.title = '';
//             authBtnMobile.title = '';
//             // Logged out: clicking the button should open the auth modal.
//             // index.html exposes this via window.CampusShelfModal so both
//             // files agree on a single click handler per auth state.
//             authBtnDesktop.onclick = () => window.CampusShelfModal.open();
//             authBtnMobile.onclick = () => window.CampusShelfModal.open();
//         }
//     })();

// });

// async function logout(){

//     await signOut(auth);

//     alert("Logged Out");

//     location.reload();

// }

import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { openModal } from "./modal.js";

// HTML Elements

const email = document.getElementById("email");
const password = document.getElementById("password");

const fullName = document.getElementById("fullName");
const department = document.getElementById("department");
const matricNumber = document.getElementById("matricNumber");

const submitBtn = document.getElementById("modalSubmit");

const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");

const authBtnDesktop = document.getElementById("authBtnDesktop");
const authBtnMobile = document.getElementById("authBtnMobile");

let signupMode = false;

tabSignup.addEventListener("click", () => {
    signupMode = true;
});

tabLogin.addEventListener("click", () => {
    signupMode = false;
});

submitBtn.addEventListener("click", async () => {

    if(email.value === "" || password.value === ""){
        alert("Please complete all required fields.");
        return;
    }

    if(signupMode){

        if(fullName.value === ""){
            alert("Enter your full name.");
            return;
        }

        try{

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email.value,
                    password.value
                );

            const user = userCredential.user;

            await setDoc(doc(db,"users",user.uid),{

                fullName: fullName.value,

                department: department.value,

                matricNumber: matricNumber.value,

                email: email.value,

                createdAt: new Date()

            });

            alert("Account created successfully!");

            location.reload();

        }

        catch(error){

            alert(error.message);

        }

    }

    else{

        try{

            await signInWithEmailAndPassword(

                auth,

                email.value,

                password.value

            );

            alert("Login Successful!");

            location.reload();

        }

        catch(error){

            alert(error.message);

        }

    }

});

onAuthStateChanged(auth,(user)=>{

    (async () => {
        if(user){
            try{
                const snap = await getDoc(doc(db, "users", user.uid));
                let firstName = '';
                if(snap.exists()){
                    const data = snap.data();
                    if(data.fullName) firstName = String(data.fullName).trim().split(/\s+/)[0];
                }
                if(!firstName && user.email){
                    firstName = String(user.email).split('@')[0];
                }
                const greet = firstName ? `Hello, ${firstName}` : 'Hello';
                authBtnDesktop.textContent = greet;
                authBtnMobile.textContent = greet;
                authBtnDesktop.title = 'Click to logout';
                authBtnMobile.title = 'Click to logout';
                authBtnDesktop.onclick = logout;
                authBtnMobile.onclick = logout;
            }
            catch(err){
                console.error('Could not load user profile for greeting:', err);
                authBtnDesktop.textContent = "Logout";
                authBtnMobile.textContent = "Logout";
                authBtnDesktop.onclick = logout;
                authBtnMobile.onclick = logout;
            }
        }
        else{
            authBtnDesktop.textContent = "Login / Sign Up";
            authBtnMobile.textContent = "Login / Sign Up";
            authBtnDesktop.title = '';
            authBtnMobile.title = '';
            // Logged out: clicking the button should open the auth modal.
            authBtnDesktop.onclick = () => openModal();
            authBtnMobile.onclick = () => openModal();
        }
    })();

});

async function logout(){

    await signOut(auth);

    alert("Logged Out");

    location.reload();

}