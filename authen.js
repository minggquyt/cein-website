import postLoginData from "./services/postData.js";
import renderNumberProductsInCart from "./services/cart-services.js";
import { renderNumberProductsInWishlist } from "./services/wishlist-services.js";
import { initEventPopUpWishlistModal } from "./services/wishlist-services.js";
import { showDangerAlert, showWarningAlert } from "./services/alert.js";
import showLoading from "./components/loading/loading.js";

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

    showLoading();

    postLoginData(userEmail, userPassword)
        .then(data => {
            if (data.usertoken && data.username) {
                localStorage.setItem("userInfo", JSON.stringify(data));
                location.reload(); // reload to run updateUIForLoginUser()
            }
            else if (data.message == 'Wrong password') {
                showWarningAlert("Sai mật khẩu");
            }
            else if (data.message == 'User not found') {
                showWarningAlert("Không tìm thấy người dùng");
            }
        })

}


function updateUIForLoginUser() {
    const loginIcon = document.querySelector("#login-icon");

    const wisthListIcon = document.querySelector('#wishlist');

    const cartIcon = document.querySelector('#cart');

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo) {

        const useravatarurl = userInfo.useravatarurl;

        loginIcon.src = useravatarurl;

        // chỉ hiển thị wishlist và cart cho user khác admin 
        if (userInfo.userrole != 'admin') {
            wisthListIcon.style.display = "inline-block";
            cartIcon.style.display = "inline-block"
            renderNumberProductsInCart();
            
            renderNumberProductsInWishlist();

            initEventPopUpWishlistModal();
        }
        else {
            wisthListIcon.style.display = "none";
            cartIcon.style.display = "none"
        }

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

function handleEventClikOnLogOutButton(e) {
    e.stopPropagation();

    localStorage.clear();

    location.reload(); // reload to run updateUIForLoginUser()
}

function assignUserSettingBoxToUserIcon() {
    // init user setting box 
    const userSettingBox = document.querySelector('.user-setting-box');
    const userSettingBoxPseudoClass = document.querySelector(".user-setting-box-pseudoclass");

    const userIcon = document.querySelector("#login-icon");

    userIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        userSettingBox.classList.toggle("visibility-inherit");
        userSettingBoxPseudoClass.classList.toggle("visibility-inherit")
    })

    const logOutButton = document.querySelector(".user-setting-box--logoutbutton");

    logOutButton.addEventListener("click", handleEventClikOnLogOutButton);

    userSettingBoxPseudoClass.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        userSettingBox.classList.toggle("visibility-inherit");
        userSettingBoxPseudoClass.classList.toggle("visibility-inherit")
    })
}

const loginButton = document.querySelector(".sign-in-button");

loginButton.addEventListener("click", onLoginSubmit);

document.addEventListener('DOMContentLoaded', () => {

    updateUIForLoginUser();

})

