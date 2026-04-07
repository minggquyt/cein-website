document.addEventListener("DOMContentLoaded",handleInitUserSettingBox)

function handleInitUserSettingBox(){
    // logic phân quyền UI user 
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if(!userInfo)
        console.warn("User chưa đăng nhập");
    else{
        const role = userInfo.userrole;
        const navDashboard = document.querySelector('.user-setting-box--dashboard > a');

        if(role == 'customer'){
            navDashboard.href = "../../pages/user-dashboard/user-dashboard.html"
        }
        else if(role == 'admin'){
            navDashboard.href = "../../pages/admin-dashboard/admin-dashboard.html"
        }
        else{
            console.warn("role thuộc người dùng thứ 3 !");
        }
    }
}