import { getCartData } from "./getData.js";

export default function renderNumberProductsInCart() {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo) {
        console.warn("User chưa đăng nhập");
    }
    else {
        getCartData(userInfo.usertoken)
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
