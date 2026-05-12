import showSuccessAlert, { showDangerAlert, showWarningAlert } from "../../../services/alert.js";
import { getUserInfo } from "../../../services/getData.js";

const inputFile = document.querySelector("#avatarInput");

inputFile.addEventListener('change', function (event) {
    const input = event.target;
    const avatarPreview = document.getElementById('avatarPreview');

    // Kiểm tra xem người dùng đã chọn file chưa
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        // Đọc dữ liệu từ file được chọn
        reader.onload = function (e) {
            // Cập nhật thuộc tính 'src' của ảnh xem trước với dữ liệu đã đọc
            avatarPreview.src = e.target.result;
            // Hiệu ứng mờ dần (fade-in) nhẹ
            avatarPreview.style.opacity = 0;
            setTimeout(() => {
                avatarPreview.style.opacity = 1;
            }, 50);
        }

        reader.readAsDataURL(input.files[0]);
    }
});

// Xử lý sự kiện submit form (Optional: Để test)
document.getElementById('profileForm').addEventListener('submit',handleUpdateProfile);

const validators = {
    username: (value) => {
        if (!value.trim()) return "Username không được để trống";
        if (value.trim().length < 4) return "Username tối thiểu 4 ký tự";
        if (value.trim().length > 30) return "Username tối đa 30 ký tự";
        if (!/^[a-zA-ZÀ-ỹ ]+$/.test(value.trim()))
            return "Username chỉ được chứa chữ và khoảng trắng";
        return "";
    },
}

function handleUpdateProfile(event) {
    event.preventDefault();

    // 1. Lấy Token từ userInfo trong localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
        showWarningAlert("Vui lòng đăng nhập!");
        return;
    }
    const token = userInfo.usertoken;

    const saveBtn = event.target.querySelector('button[type="submit"]');
    const avatarInput = document.getElementById('avatarInput');
    
    // Thu thập dữ liệu cơ bản
    const fullName = document.getElementById('fullName').value;

    // validate user name
    const messageValid = validators.username(fullName);
    if(messageValid != ""){
        showWarningAlert(messageValid);
        return;
    }

    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    let finalAvatarUrl = document.getElementById('avatarPreview').src;

    saveBtn.disabled = true;
    saveBtn.innerText = "Processing...";

    // Khởi tạo một Promise để xử lý việc Upload ảnh (nếu có)
    let uploadPromise = Promise.resolve(finalAvatarUrl);

    if (avatarInput.files && avatarInput.files[0]) {
        const file = avatarInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'cein-website');

        uploadPromise = fetch('https://api.cloudinary.com/v1_1/drfkacsvn/image/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(cloudData => {
            if (cloudData.secure_url) {
                return cloudData.secure_url;
            } else {
                throw new Error("Upload ảnh thất bại!");
            }
        });
    }

    // Sau khi upload xong (hoặc dùng ảnh cũ), tiến hành gọi API Server
    uploadPromise
        .then(avatarUrl => {
            finalAvatarUrl = avatarUrl; // Cập nhật lại biến url cuối cùng

            return fetch('https://cein-website-server.onrender.com/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: fullName,
                    gender: gender,
                    avatar_url: finalAvatarUrl
                })
            });
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showSuccessAlert("Cập nhập thông tin thành công");

                // Cập nhật lại localStorage ( vẩn đảm bảo giữ nguyên schema )
                const newUserInfo = { ...userInfo };
                newUserInfo.username = fullName;
                newUserInfo.useravatarurl = finalAvatarUrl;
                localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
                
                window.location.reload(); 
            } else {
                showDangerAlert("Lỗi: " + result.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showDangerAlert("Đã xảy ra lỗi: " + error.message);
        })
        .finally(() => {
            saveBtn.disabled = false;
            saveBtn.innerText = "SAVE CHANGES";
        });
    
}

// Gán sự kiện
document.getElementById('profileForm').addEventListener('submit', handleUpdateProfile);

// Gán sự kiện
document.getElementById('profileForm').addEventListener('submit', handleUpdateProfile);

// ĐANG BỊ LỖI Ở ĐÂY - KHÔNG THỂ GET USER INFO
async function loadUserProfile() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo){
        window.location.href = "/index.html"
        console.warn("User chưa đăng nhập");
    }
    else {
        const token = userInfo.usertoken;
        getUserInfo(token)
            .then(result => {
                if (result.success) {
                    const user = result.data;
                    // Đổ dữ liệu vào các input
                    document.getElementById('fullName').value = user.name || '';
                    document.getElementById('email').value = user.email || '';
                    document.getElementById('avatarPreview').src = user.avatar_url || 'https://res.cloudinary.com/drfkacsvn/image/upload/v1774757993/default-avatar_ufjtdl.webp';

                    // Chọn radio giới tính tương ứng
                    if (user.gender) {
                        const genderRadio = document.querySelector(`input[name="gender"][value="${user.gender}"]`);
                        if (genderRadio) genderRadio.checked = true;
                    }
                }
                else {
                    console.log(result.message);
                }
            })
    }
}

// Gọi hàm tải thông tin người dùng sau khi tải trang
document.addEventListener('DOMContentLoaded', loadUserProfile);
