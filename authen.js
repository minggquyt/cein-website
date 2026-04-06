import postLoginData from "./services/postData.js";

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

    // Thiếu validate dữ liệu đầu vào 

    postLoginData(userEmail, userPassword)
        .then(data => {
            if (data.usertoken && data.username) {
                console.log(data);
                localStorage.setItem("userInfo", JSON.stringify(data));
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

    confirmButton.addEventListener('click', (e) => {

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

    confirmButton.addEventListener('click', (e) => {

        e.stopPropagation();

        modal.remove();

    })
}

function updateUIForLoginUser() {
    const loginIcon = document.querySelector("#login-icon");

    const wisthListIcon = document.querySelector('#wishlist');

    const cartIcon = document.querySelector('#cart');

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo) {

        const username = userInfo.username;

        const usertoken = userInfo.usertoken;

        const useravatarurl = userInfo.useravatarurl;

        loginIcon.src = useravatarurl;

        wisthListIcon.style.display = "inline-block";

        cartIcon.style.display = "inline-block"

        loginIcon.setAttribute("data-bs-toggle", "#");
        loginIcon.setAttribute("data-bs-target", "#");

        assignUserSettingBoxToUserIcon();

    }
    else {

        loginIcon.src = '/assets/images/account.png';

        wisthListIcon.style.display = "none";

        cartIcon.style.display = "none"

        // assign login modal to icon
        loginIcon.setAttribute("data-bs-toggle", "modal");
        loginIcon.setAttribute("data-bs-target", "#exampleModalCenter");
    }
}

function handleEventClikOnLogOutButton(e){
    e.stopPropagation();

    localStorage.clear();

    location.reload(); // reload to run updateUIForLoginUser()
}

function assignUserSettingBoxToUserIcon(){
    // init user setting box 
    const userSettingBox = document.querySelector('.user-setting-box');

    const userIcon = document.querySelector("#login-icon");
    
    userIcon.addEventListener('click',(e) => {
        e.preventDefault();
        e.stopPropagation();

        userSettingBox.classList.toggle("visibility-inherit");

    })

    const logOutButton = document.querySelector(".user-setting-box--logoutbutton");

    logOutButton.addEventListener("click",handleEventClikOnLogOutButton);

}

const loginButton = document.querySelector(".sign-in-button");

loginButton.addEventListener("click", onLoginSubmit);

document.addEventListener('DOMContentLoaded', () => {

    updateUIForLoginUser();

})

