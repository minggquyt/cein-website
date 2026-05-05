import { getCartData } from "./getData.js";
import { getWishListData } from "./getData.js";
import { deleteProductsInWishlist } from "./deleteData.js";
import { postProductToWishlist } from "./postData.js";
import { showWarningAlert, showDangerAlert } from "./alert.js";
import showSuccessAlert from "./alert.js";

export function displayWishListModal() {
    const wishListContainer = document.querySelector(".wish-list-modal");

    const wishListBox = document.querySelector('.wish-list-modal-box');

    wishListContainer.classList.add("wish-list-modal-active");

    wishListBox.classList.add("wish-list-modal-box-active");
}


function updateNumberProductsInCart(total) {
    const cartNumber = document.querySelector(".left-menu-bag span");
    cartNumber.innerHTML = total;
}

function removeWishListBox() {
    const closeIcon = document.querySelector(".wishlist-close");

    const pseudoContainer = document.querySelector(".wish-list-modal");

    const wishListContainer = document.querySelector(".wish-list-modal");

    const wishListBox = document.querySelector('.wish-list-modal-box');

    closeIcon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        wishListContainer.classList.remove("wish-list-modal-active");

        wishListBox.classList.remove("wish-list-modal-box-active");

    })

    pseudoContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        wishListContainer.classList.remove("wish-list-modal-active");

        wishListBox.classList.remove("wish-list-modal-box-active");
    })
}

function handleEventClickOnRemoveItemBtnInWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    const currentProduct = e.currentTarget.closest(".wish-list-modal-box-item");
    const productId = currentProduct.dataset.productid;

    const userToken = JSON.parse(localStorage.getItem("userInfo")).usertoken;

    if (productId && userToken) {
        deleteProductsInWishlist(productId, userToken)
            .then(result => {
                if (result.success == true) {
                    // remove effect 
                    currentProduct.style.transition = "all 0.3s ease";
                    currentProduct.style.transform = "scale(0.75)"
                    currentProduct.style.opacity = '0';
                    setTimeout(() => {
                        syncDataOfWishlist();
                    }, (300));
                }
                else if (result.success == false) {
                    console.log(result.message);
                }
                else {
                    console.warn("Lỗi trong quá trình kết nối FE đến Server !");
                }
            })
    }
}

function initEventRemoveItemInWishList() {
    const removeItemBtns = document.querySelectorAll(".remove-btn-wishlist");
    removeItemBtns.forEach(btn => {
        btn.addEventListener('click', handleEventClickOnRemoveItemBtnInWishlist)
    })
}

function renderProductsInWishList(wishlistItems) {
    const container = document.querySelector('.wish-list-modal-box-items')

    // 1. Kiểm tra nếu wishlist trống
    if (!wishlistItems || wishlistItems.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Your wishlist is empty.</p>';
        return;
    }

    // 2. Tạo chuỗi HTML từ dữ liệu
    const htmlContent = wishlistItems.map(item => {
        const product = item.product; // Đây là kết quả từ $unwind trong API

        // Tìm ảnh thumbnail (isThumbnail: true) hoặc lấy ảnh đầu tiên
        const displayImage = product.images.find(img => img.isThumbnail)?.url
            || product.images[0]?.url;

        return `
            <a href="/pages/product-detail/product-detail.html?slug=${product.slug}" class="wish-list-modal-box-item" data-slug=${product.slug} data-productid="${product._id}">
                <div class="wish-list-modal-box-item-card-image">
                    <img src="${displayImage}" alt="${product.name}">
                </div>

                <div class="wish-list-modal-box-item-card-description">
                    <div class="item-header">
                        <h3 class="item-title">${product.name}</h3>
                        <button class="remove-btn-wishlist">✕</button>
                    </div>
                    <p class="item-price">$${product.price}</p>

                </div>
            <a>
        `;
    }).join('');

    // 3. Đổ HTML vào container và thêm nút Add To Cart ở cuối
    container.innerHTML = htmlContent + `
        <button class="wishlist-btn-add-to-cart roboto-400">Add All To Cart</button>
    `;

    initEventRemoveItemInWishList();
}


function syncDataOfWishlist() {
    // logic fetch data từ server để render ra wishlist 
    const userToken = JSON.parse(localStorage.getItem("userInfo")).usertoken;

    getWishListData(userToken)
        .then(result => {
            if (result.success == true) {
                renderProductsInWishList(result.data);
                renderNumberProductsInWishlist();
            }
            else {
                console.warn("Lỗi server không render ra products trong wishlist");
            }
        })
        .catch(error => {
            console.log(error);
        })

    removeWishListBox();
}

export function initEventPopUpWishlistModal() {
    const wishlistIcon = document.querySelector(".left-menu-wishlist");
    wishlistIcon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // hiển thị wishlist
        displayWishListModal();

        // lấy dữ liệu và đổ vào wishlist
        syncDataOfWishlist();
    })
}

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

function updateNumberProductsInWishlist(total){
    const wishlistNumber = document.querySelector(".left-menu-wishlist span");
    wishlistNumber.innerHTML = total;
}

export function renderNumberProductsInWishlist() {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo && userInfo.userrole == 'admin') {
        console.warn("User chưa đăng nhập");
    }
    else {
        getWishListData(userInfo.usertoken)
            .then((products) => {
                if (products.success == true) {
                    let totalProducts = products.data.length;
                    updateNumberProductsInWishlist(totalProducts);
                }
            })
            .catch((error) => [
                console.log(error)
            ])
    }
}

function handleEventClickButtonAddToWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    const userToken = JSON.parse(localStorage.getItem("userInfo")).usertoken;
    const productId = e.target.closest(".product-item").dataset.productid;

    if (userToken && productId) {
        postProductToWishlist(productId, userToken)
            .then(result => {
                if (result != null && result.success == true) {
                    showSuccessAlert(result.message);
                    renderNumberProductsInWishlist();
                }
                else if (result != null && result.success == false) {
                    showWarningAlert(result.message);
                }
                else {
                    showDangerAlert("Lỗi trong quá trình kết nối tới server");
                }
            })
    }
    else {
        console.warn("Lỗi khi thêm sản phẩm vào giỏ hàng");
    }
}


export function initEventClickButtonAddToWishlist() {
    const buttonAddToWishList = document.querySelectorAll(".heart-icon");
    buttonAddToWishList.forEach(button => {
        button.addEventListener("click", handleEventClickButtonAddToWishlist);
    })
}

// using this to create wishlist modal and update number products in wishlist realtime

// renderNumberProductsInWishlist();

// renderNumberProductsInCart();

// initEventPopUpWishlistModal();