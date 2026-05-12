import { postRegisterData } from "../../services/postData.js";
import showLoading from "../../components/loading/loading.js";
import { hideLoading } from "../../components/loading/loading.js";
import { showDangerAlert, showWarningAlert } from "../../services/alert.js";
import showSuccessAlert from "../../services/alert.js";

const inputs = {
    username: document.getElementById("form3Example1c"),
    email: document.getElementById("form3Example3c"),
    password: document.getElementById("form3Example4c"),
    repeatPassword: document.getElementById("form3Example4cd")
};

const validators = {
    username: (value) => {
        if (!value.trim()) return "Username không được để trống";
        if (value.trim().length < 4) return "Username tối thiểu 4 ký tự";
        if (value.trim().length > 30) return "Username tối đa 30 ký tự";
        if (!/^[a-zA-ZÀ-ỹ ]+$/.test(value.trim()))
            return "Username chỉ được chứa chữ và khoảng trắng";
        return "";
    },

    email: (value) => {
        if (!value.trim()) return "Email không được để trống";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(value.trim()))
            return "Email không hợp lệ (vd: example@gmail.com)";
        return "";
    },

    password: (value) => {
        if (!value) return "Password không được để trống";
        if (value.length < 8) return "Password tối thiểu 8 ký tự";
        if (!/[A-Z]/.test(value)) return "Password phải có ít nhất 1 chữ hoa";
        if (!/[0-9]/.test(value)) return "Password phải có ít nhất 1 chữ số";
        if (!/[!@#$%^&*]/.test(value))
            return "Password phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*)";
        return "";
    },

    repeatPassword: (value) => {
        const password = inputs.password.value;
        if (!value) return "Vui lòng nhập lại password";
        if (value !== password) return "Password không khớp";
        return "";
    }
};

function showError(input, message) {
    const errorEl = input.parentElement.querySelector(".error-message");
    if (!errorEl) return;
    errorEl.textContent = message;
    if (message) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
    } else {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
    }
}

Object.keys(inputs).forEach((key) => {
    inputs[key].addEventListener("input", () => {
        const error = validators[key](inputs[key].value);
        showError(inputs[key], error);

        if (key === "password" && inputs.repeatPassword.value) {
            const rpError = validators.repeatPassword(inputs.repeatPassword.value);
            showError(inputs.repeatPassword, rpError);
        }
    });
});

async function handleClickButtonSignUp(e) {
    e.preventDefault();
    e.stopPropagation();

    let isValid = true;
    Object.keys(inputs).forEach((key) => {
        const error = validators[key](inputs[key].value);
        showError(inputs[key], error);
        if (error) isValid = false;
    });

    const checkbox = document.getElementById("form2Example3c");
    if (!checkbox.checked) {
        showWarningAlert("Vui lòng đồng ý với điều khoản dịch vụ");
        return;
    }

    if (!isValid) {
        return;
    }

    buttonSignUp.disabled = true;
    showLoading();

    try {
        const data = {
            username: inputs.username.value.trim(),
            email: inputs.email.value.trim(),
            password: inputs.password.value,
            avatar_url: "https://res.cloudinary.com/drfkacsvn/image/upload/v1774757993/default-avatar_ufjtdl.webp"
        };

        const result = await postRegisterData(
            data.email, data.username, data.password, data.avatar_url
        );

        if (result != null) {
            window.location.href = "/index.html";
        } else {
            showDangerAlert("Lỗi hệ thống! Vui lòng thử lại sau");
        }
    } catch (err) {
        showDangerAlert("Lỗi kết nối! Vui lòng thử lại sau");
        console.error(err);
    } finally {
        hideLoading();
        buttonSignUp.disabled = false;
    }
}

const buttonSignUp = document.querySelector(".sign-up-button");
buttonSignUp.addEventListener('click', handleClickButtonSignUp);