export default function postLoginData(userEmail, userPassword) {

    const userInfo = {
        email: userEmail,
        password: userPassword
    }

    console.log(userInfo);

    return fetch("http://localhost:5000/api/authen/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userInfo)
    })
    .then(res => res.json())
    .then((data) => data)
    .catch(error => console.log(error))
    .finally(() => console.log("Quá trình gửi thông tin đăng nhập kết thúc"))
}

export function postRegisterData(userEmail, userName, userPassword){
    return fetch("http://localhost:5000/api/authen/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userEmail, userName,userPassword })
    })
    .then((data) => {
        console.log(data);
    })
    .catch(error => {
        console.log(error);
    })
}