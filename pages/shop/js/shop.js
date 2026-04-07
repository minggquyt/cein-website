import { getProductsDataFromDb } from "../../../services/getData.js";
import showLoading from "../../../components/loading/loading.js";
import { hideLoading } from "../../../components/loading/loading.js";
import { postProductToCart } from "../../../services/postData.js"
import renderNumberProductsInCart from '../../../services/cart-services.js'
import { postProductToWishlist } from "../../../services/postData.js";
import showSuccessAlert from "../../../services/alert.js";
import { showDangerAlert, showWarningAlert } from "../../../services/alert.js";
import { renderNumberProductsInWishlist } from "../../../services/wishlist-services.js"
import { initEventPopUpWishlistModal } from "../../../services/wishlist-services.js";

const state = {
    page: 1,
    limit: 12,
    category: null,
    sort: null,
    color: null,
    material: null,
    size: null
};

let productStore = {
    "69c9f6df2dae594eab9dae7f": {
        name: 'Classic Easy Zipper Tote',
        price: 200,
        colors: [{ name: 'Gray', hex: '#cccccc' }, { name: 'Black', hex: '#000000' }],
        sizes: ['L', 'XL'],
        variants: [{ color: 'Gray', size: 'L', stock: 15 }]
    }
};

function renderVariantModal(productId) {
    const product = productStore[productId];
    if (!product) return;

    const modal = document.getElementById('variantBox');

    // 1. Render Màu sắc
    const colorContainer = modal.querySelector('.variant-group:nth-child(3) .option-list');
    colorContainer.innerHTML = product.colors.map((color, index) => `
        <input type="radio" name="color" id="color-${index}" value="${color.name}" hidden ${index === 0 ? 'checked' : ''}>
        <label for="color-${index}" class="color-swatch" 
               style="background-color: ${color.hex};" 
               title="${color.name}">
        </label>
    `).join('');

    // 2. Render Kích thước
    const sizeContainer = modal.querySelector('.variant-group:nth-child(4) .option-list');
    sizeContainer.innerHTML = product.sizes.map((size, index) => `
        <input type="radio" name="size" id="size-${size}" value="${size}" hidden ${index === 0 ? 'checked' : ''}>
        <label for="size-${size}" class="size-box">${size}</label>
    `).join('');

    // 3. Cập nhật ID vào nút Submit để biết đang thêm sản phẩm nào
    const submitBtn = modal.querySelector('.add-to-cart-submit');
    submitBtn.setAttribute('data-productid', productId);

    // 4. Hiển thị modal
    modal.style.display = 'block';

    // 5. Gán event cho button submit 
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const colorChecked = variantBox.querySelector(`input[name="color"]:checked`).value;

        const sizeChecked = variantBox.querySelector(`input[name="size"]:checked`).value;

        const productId = e.target.dataset.productid;

        const userToken = JSON.parse(localStorage.getItem("userInfo")).usertoken;

        if (userToken) {
            // chỉnh logic UI theo từng variant 
            postProductToCart(productId, 1, sizeChecked, colorChecked, userToken)
                .then(result => {
                    if (result != null) {
                        if (result.success == true) {
                            showSuccessAlert(result.message)
                            renderNumberProductsInCart();
                        }
                        else
                            showWarningAlert(result.message);
                    }
                    else 
                        showDangerAlert("Lỗi trong quá trình kết nối tới server");
                })
        }
        else {
            console.warn("Thiếu user token");
        }

    })
}

function mapProductsToStore(apiResponse) {
    // Kiểm tra nếu apiResponse có tồn tại và có mảng data
    if (!apiResponse || !Array.isArray(apiResponse.data)) {
        console.error("Dữ liệu API không đúng định dạng mong đợi.");
        return;
    }

    // Sử dụng reduce để chuyển mảng thành Object với key là _id
    productStore = apiResponse.data.reduce((acc, product) => {
        acc[product._id] = {
            name: product.name,
            price: product.price,
            colors: product.colors,
            sizes: product.sizes,
            variants: product.variants,
            image: product.images.find(img => img.isThumbnail)?.url || product.images[0]?.url
        };
        return acc;
    }, {});
}

function fetchProductData() {
    // clear product + show loading
    const productList = document.getElementById('product-list');
    productList.innerHTML = "";
    showLoading();

    getProductsDataFromDb(state)
        .then((data) => {
            hideLoading();
            renderProducts(data);
            mapProductsToStore(data);
        })
}

function renderProducts(products) {
    const productList = document.getElementById('product-list');

    let html = "";

    const userInfoInLS = JSON.parse(localStorage.getItem("userInfo"));

    // User chưa login
    if (!userInfoInLS) {
        products.data.forEach(product => {
            html += `
        <a data-productid="${product._id}" href="../product-detail/product-detail.html?slug=${product.slug}" class="product-item">
            <img src="/assets/icon/Heart.png" class="heart-icon" style="visibility: hidden" width="36px" height="36px">
            <img src="${product.images[0].url}">
            <img src="/assets/icon/Plus.png" style="visibility: hidden" class="plus-icon add-variant-btn" width="36px" height="36px" >
            <h3>${product.name}</h3>
            <p>$${product.price}</p>
        </a>`;
        });
    }
    // User đã login
    else {
        products.data.forEach(product => {
            html += `
        <a data-productid="${product._id}" href="../product-detail/product-detail.html?slug=${product.slug}" class="product-item">
            <img src="/assets/icon/Heart.png" class="heart-icon" width="36px" height="36px">
            <img src="${product.images[0].url}">
            <img src="/assets/icon/Plus.png" class="plus-icon add-variant-btn" width="36px" height="36px" >
            <h3>${product.name}</h3>
            <p>$${product.price}</p>
        </a>`;
        });
    }

    productList.innerHTML = html;

    // Khởi tạo event click add To Cart & Wishlist cho user login 
    if (userInfoInLS) {
        initEventClickButtonAddToCart();
        initEventClickButtonAddToWishlist();
    }
}

const categoriesBar = document.querySelector(".filter-options");
categoriesBar.addEventListener("click", (e) => {
    e.preventDefault();

    if (e.target.classList.contains("btn-filter-sweater")) {
        state.category = "sweater";
    }

    if (e.target.classList.contains("btn-filter-t-shirts")) {
        state.category = "t-shirts";
    }

    if (e.target.classList.contains("btn-filter-hoodies")) {
        state.category = "hoodies";
    }

    if (e.target.classList.contains("btn-filter-pants")) {
        state.category = "pants";
    }

    if (e.target.classList.contains("btn-filter-bags")) {
        state.category = "bags";
    }

    state.page = 1; // reset page

    fetchProductData(); // refetch with new params
});

function handleEventClickButtonAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();

    const variantBox = document.querySelector("#variantBox");
    const variantBoxPseudoClass = document.querySelector(".variant-modal-pseudoclass");

    variantBox.style.display = 'block';
    variantBoxPseudoClass.style.display = 'block';

    // xóa variiant modal
    variantBoxPseudoClass.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        variantBox.style.display = 'none';
        variantBoxPseudoClass.style.display = 'none';
    })

    // xóa variant modal
    const btnCloseVariantModal = document.querySelector(".close-btn-variant");

    btnCloseVariantModal.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        variantBox.style.display = 'none';
        variantBoxPseudoClass.style.display = 'none';
    })

    const productId = e.target.closest(".product-item").dataset.productid;

    renderVariantModal(productId);
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

function initEventClickButtonAddToWishlist() {
    const buttonAddToWishList = document.querySelectorAll(".heart-icon");
    buttonAddToWishList.forEach(button => {
        button.addEventListener("click", handleEventClickButtonAddToWishlist);
    })
}

function initEventClickButtonAddToCart() {
    const buttonAddToCarts = document.querySelectorAll(".plus-icon");
    buttonAddToCarts.forEach((button) => {
        button.addEventListener("click", handleEventClickButtonAddToCart);
    })
}

fetchProductData();

renderNumberProductsInCart();

renderNumberProductsInWishlist();

initEventPopUpWishlistModal();