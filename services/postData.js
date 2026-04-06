export default function postLoginData(userEmail, userPassword) {

    const userInfo = {
        email: userEmail,
        password: userPassword,
    }

    return fetch("https://cein-website-server-production.up.railway.app/api/authen/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userInfo)
    })
        .then(res => res.json())
        .then((data) => data)
        .catch((error) => {
            console.log(error)
            return null;
        })
        .finally(() => console.log("Quá trình gửi thông tin đăng nhập kết thúc"))
}

export function postRegisterData(userEmail, userName, userPassword, avatar_url) {

    const userInfo = {
        name: userName,
        email: userEmail,
        password: userPassword,
        avatar_url: avatar_url
    }

    return fetch("https://cein-website-server-production.up.railway.app/api/authen/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userInfo)
    })
        .then((data) => {
            console.log(data);
            return data;
        })
        .catch(error => {
            console.log(error);
            return null;
        })
}

export function postProductToCart(productId, quantity, size, color, token) {
    return fetch("https://cein-website-server-production.up.railway.app/api/cart/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            productId: productId,
            quantity: quantity,
            size: size,
            color: color
        })  
    })
    .then(res => res.json())
    .then(result => result)
    .catch(error => {
        console.log(error);
        return null;
    })
}

export function postProductToWishlist(productId, token){
    return fetch('https://cein-website-server-production.up.railway.app/api/wishlist', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ productId: productId })
        })
        .then(res => res.json())
        .then(result => result)
        .catch(error => {
            console.log(error);
            return null
        })
}

export function postProductDetailToCart(productId, quantity, selectedSize, selectedColor, token){
    return fetch('http://localhost:5000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity,
                    size: selectedSize,
                    color: selectedColor
                })
            })
            .then(res => res.json())
            .then(result => result)
            .catch(err => err);
}