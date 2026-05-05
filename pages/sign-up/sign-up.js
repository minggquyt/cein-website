import { postRegisterData } from "../../services/postData.js";
import showLoading from "../../components/loading/loading.js";
import { hideLoading } from "../../components/loading/loading.js";
import { showDangerAlert } from "../../services/alert.js";

function handleClickButtonSignUp(e) {
    e.preventDefault();
    e.stopPropagation();

    showLoading();

    let isValid = false;

    // validate form 
    Object.keys(inputs).forEach((key) => {
        const input = inputs[key];
        const error = validators[key](input.value);
        showError(input, error);
        if (!error)
            isValid = true;
    })

    if(isValid){
         const data = {
            username: inputs.username.value,
            email: inputs.email.value,
            password: inputs.password.value,
            avatar_url: "https://res.cloudinary.com/drfkacsvn/image/upload/v1774757993/default-avatar_ufjtdl.webp"
        };

        postRegisterData(data.email, data.username, data.password, data.avatar_url)
            .then((data) => {
                if(data != null){
                    hideLoading();
                    window.location.href = "/index.html"; // redirect to homepage for login
                }
                else{
                    hideLoading();

                    showDangerAlert("Lỗi hệ thống ! Vui lòng thử lại sau")
                }
            })
        
    }

}


function showError(input, message) {
    const errorEl = input.parentElement.querySelector(".error-message");
    errorEl.textContent = message;

    if (message) {
        input.classList.add("is-invalid");
    } else {
        input.classList.remove("is-invalid");
    }
}

const buttonSignUp = document.querySelector(".sign-up-button");

buttonSignUp.addEventListener('click', handleClickButtonSignUp);

const validators = {
    username: (value) => {
        if (!value) return "Username không được để trống";
        if (value.length < 4) return "Username tối thiểu 4 ký tự";
        return "";
    },

    email: (value) => {
        if (!value) return "Email không được để trống";
        if (!value.includes("@")) return "Email phải có @";
        if (!value.includes("gmail")) return "Email phải có gmail";
        if (!value.includes(".com")) return "Email phải có .com";
        return "";
    },

    password: (value) => {
        if (!value) return "Password không được để trống";
        if (value.length < 6) return "Password tối thiểu 6 ký tự";
        return "";
    },

    repeatPassword: (value) => {
        const password = document.getElementById("form3Example4c").value;
        if (!value) return "Vui lòng nhập lại password";
        if (value !== password) return "Password không khớp";
        return "";
    }
};

const inputs = {
    username: document.getElementById("form3Example1c"),
    email: document.getElementById("form3Example3c"),
    password: document.getElementById("form3Example4c"),
    repeatPassword: document.getElementById("form3Example4cd")
};

// validate oninput form 
Object.keys(inputs).forEach((key) => {
    const input = inputs[key];

    input.addEventListener("input", () => {
        const error = validators[key](input.value);
        showError(input, error);
    });
});