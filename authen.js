import postLoginData from "./services/postData.js";
import renderNumberProductsInCart from "./services/cart-services.js";
import { renderNumberProductsInWishlist } from "./services/wishlist-services.js";
import { initEventPopUpWishlistModal } from "./services/wishlist-services.js";
import { showDangerAlert, showWarningAlert } from "./services/alert.js";
import showLoading, { hideLoading } from "./components/loading/loading.js";

const validators = {
    email: (value) => {
        if (!value.trim()) return "Email không được để trống";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(value.trim())) return "Email không hợp lệ";
        return "";
    },
    password: (value) => {
        if (!value) return "Mật khẩu không được để trống";
        if (value.length < 8) return "Mật khẩu tối thiểu 8 ký tự";
        return "";
    }
};

async function onLoginSubmit(e) {
    e.preventDefault();

    const emailInput = document.getElementById("exampleInputEmail1");
    const passwordInput = document.getElementById("exampleInputPassword1");

    const emailError = validators.email(emailInput.value);
    const passwordError = validators.password(passwordInput.value);

    if (emailError || passwordError) {
        showWarningAlert(emailError || passwordError);
        return;
    }

    showLoading();

    try {
        const data = await postLoginData(emailInput.value.trim(), passwordInput.value);

        if (data.usertoken && data.username) {
            localStorage.setItem("userInfo", JSON.stringify(data));
            location.reload();
        } else if (data.message === 'Wrong password') {
            showWarningAlert("Sai mật khẩu");
        } else if (data.message === 'User not found') {
            showWarningAlert("Không tìm thấy người dùng");
        } else {
            showDangerAlert("Đăng nhập thất bại, vui lòng thử lại");
        }
    } catch (err) {
        showDangerAlert("Lỗi hệ thống! Vui lòng thử lại sau");
        console.error(err);
    } finally {
        hideLoading();
    }
}

function updateUIForLoginUser() {
    const loginIcon = document.querySelector("#login-icon");
    const wisthListIcon = document.querySelector('#wishlist');
    const cartIcon = document.querySelector('#cart');
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    

    if (userInfo) {
        loginIcon.src = userInfo.useravatarurl
        
        if (userInfo.userrole !== 'admin') {
            wisthListIcon.style.display = "inline-block";
            cartIcon.style.display = "inline-block";
            renderNumberProductsInCart();
            renderNumberProductsInWishlist();
            initEventPopUpWishlistModal();
        } else {
            wisthListIcon.style.display = "none";
            cartIcon.style.display = "none";
        }

        loginIcon.setAttribute("data-bs-toggle", "");
        loginIcon.setAttribute("data-bs-target", "");
        assignUserSettingBoxToUserIcon();
    } else {
        loginIcon.src = '/assets/images/account.png';
        wisthListIcon.style.display = "none";
        cartIcon.style.display = "none";
        loginIcon.setAttribute("data-bs-toggle", "modal");
        loginIcon.setAttribute("data-bs-target", "#exampleModalCenter");
    }
}

function handleEventClikOnLogOutButton(e) {
    e.stopPropagation();
    localStorage.clear();
    location.reload();
}

function assignUserSettingBoxToUserIcon() {
    const userSettingBox = document.querySelector('.user-setting-box');
    const userSettingBoxPseudoClass = document.querySelector(".user-setting-box-pseudoclass");
    const userIcon = document.querySelector("#login-icon");

    userIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        userSettingBox.classList.toggle("visibility-inherit");
        userSettingBoxPseudoClass.classList.toggle("visibility-inherit");
    });

    const logOutButton = document.querySelector(".user-setting-box--logoutbutton");
    if (logOutButton) {
        logOutButton.addEventListener("click", handleEventClikOnLogOutButton);
    }

    userSettingBoxPseudoClass.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        userSettingBox.classList.toggle("visibility-inherit");
        userSettingBoxPseudoClass.classList.toggle("visibility-inherit");
    });
}

const loginButton = document.querySelector(".sign-in-button");
if (loginButton) {
    loginButton.addEventListener("click", onLoginSubmit);
}

const passwordInput = document.getElementById("exampleInputPassword1");
if (passwordInput) {
    passwordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            onLoginSubmit(e);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateUIForLoginUser();
});