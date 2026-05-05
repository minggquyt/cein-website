export default function postLoginData(userEmail, userPassword) {

    const userInfo = {
        email: userEmail,
        password: userPassword,
    }

    return fetch("http://localhost:5000/api/authen/login", {
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
}

export function postRegisterData(userEmail, userName, userPassword, avatar_url) {

    const userInfo = {
        name: userName,
        email: userEmail,
        password: userPassword,
        avatar_url: avatar_url
    }

    return fetch("http://localhost:5000/api/authen/register", {
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
    return fetch("http://localhost:5000/api/cart/", {
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
    return fetch('http://localhost:5000/api/wishlist', { 
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

export async function postPayment() {
    const response = await fetch('http://localhost:5000/api/payment/create_payment_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: 50000, 
            orderDescription: "Thanh toan don hang 123"
        })
    });
    const result = await response.json();
    if (result.success) {
        // Chuyển hướng sang trang VNPAY
        window.location.href = result.url;
    }
}