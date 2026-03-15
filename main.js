import postLoginData from "./services/postData.js";

const loginButton = document.querySelector(".sign-in-button");

function onLoginSubmit() {
    const inputs = document.querySelectorAll(".modal-body input");

    let userEmail = null;
    let userPassword = null;

    inputs.forEach(input => {
        if (input.name == "email")
            userEmail = input.value;
        else if (input.name == "password")
            userPassword = input.value
    })

    postLoginData(userEmail, userPassword)
        .then(data => {
            if (data.usertoken && data.username) {
                console.log(data);
                localStorage.setItem("userInfo", data);
                location.reload(); // reload to run updateUIForLoginUser()
            }
            else if (data.message == 'Wrong password') {
                wrongPasswordAlert();
            }
            else if (data.message == 'User not found') {
                userNotFound();
            }
        })

}

loginButton.addEventListener("click", onLoginSubmit);

function wrongPasswordAlert() {
    const bodyHTML = document.querySelector('body');

    const modal = document.createElement('div');
    modal.classList.add('pop-up-modal');

    modal.innerHTML = `
    <h3>Wrong password !</h3>
    <button class="pop-up-modal-confirm-button">Confirm</button>
    `
    bodyHTML.appendChild(modal);

    const confirmButton = document.querySelector('.pop-up-modal-confirm-button');
   
    confirmButton.addEventListener('click',(e) => {

        e.stopPropagation();

        modal.remove();

    })

}

function userNotFound() {
    const bodyHTML = document.querySelector('body');

    const modal = document.createElement('div');
    modal.classList.add('pop-up-modal');

    modal.innerHTML = `
        <h3>User not found !</h3>
        <button class="pop-up-modal-confirm-button">Confirm</button>
    `
    bodyHTML.appendChild(modal);

    const confirmButton = document.querySelector('.pop-up-modal-confirm-button');
   
    confirmButton.addEventListener('click',(e) => {

        e.stopPropagation();

        modal.remove();

    })
}

function updateUIForLoginUser(){
    const loginIcon = document.querySelector("#login-icon");

    const userInfo = localStorage.getItem("userInfo");

    if(userInfo){
        loginIcon.style.display = 'none';
        // import username | user image
        // display wishlist & shopping cart
    }
    else{
        // undisplay wishlist & shopping cart
    }
}

document.addEventListener('DOMContentLoaded',() => {

    updateUIForLoginUser();

})