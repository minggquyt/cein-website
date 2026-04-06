import { getCartData } from "./getData.js";

export default function renderNumberProductsInCart() {
    const token = JSON.parse(localStorage.getItem("userInfo")).usertoken;

    if (!token) {
        console.warn("User chưa đăng nhập");
    }
    else {
        getCartData(token)
            .then((products) => {
                if (products.success == true) {
                    let totalProducts = products.data.length;
                    updateNumberProductsInCart(totalProducts);
                }
            })
            .catch((error) => [
                console.log(error)
            ])
    }

}

export function updateNumberProductsInCart(total) {
    const cartNumber = document.querySelector(".left-menu-bag span");
    cartNumber.innerHTML = total;
}
