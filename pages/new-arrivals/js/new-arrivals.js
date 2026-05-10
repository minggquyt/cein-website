import { getProductsDataFromDb } from "../../../services/getData.js";
import showLoading from "../../../components/loading/loading.js";
import { hideLoading } from "../../../components/loading/loading.js";
import { postProductToCart } from "../../../services/postData.js"
import renderNumberProductsInCart from '../../../services/cart-services.js'
import showSuccessAlert from "../../../services/alert.js";
import { showDangerAlert, showWarningAlert } from "../../../services/alert.js";
import { initEventClickButtonAddToWishlist } from "../../../services/wishlist-services.js";

const state = {
    allProducts: [],
    filteredProducts: [],
    filters: {
        page: 1,
        limit: 12,
        category: null,
        sort: null,
        color: null,
        material: null,
        size: null
    }
};

let productStore = {};

function applyLogicAndRender() {
    return new Promise((resolve) => {

        let result = [...state.allProducts];

        // 1. Filter theo Category
        if (state.filters.category) {
            result = result.filter(p => {
                console.log(p.categoryDetails.slug.includes(state.filters.category));
                return p.categoryDetails.slug.includes(state.filters.category)
            });
        }

        // 2. Filter theo Color
        if (state.filters.color) {
            result = result.filter(p =>
                p.colors && p.colors.some(c => c.name.toLowerCase() === state.filters.color.toLowerCase())
            );
        }

        // 3. Filter theo Material
        if (state.filters.material) {
            // so sánh theo tất cả chữ thường
            result = result.filter(p => p.material.toLowerCase() === state.filters.material.toLowerCase());
        }

        // 4. Filter theo Size
        if (state.filters.size) {
            result = result.filter(p => p.sizes && p.sizes.includes(state.filters.size));
        }
        // 5. Sort
        switch (state.filters.sort) {
            case "Price: Low to High":
                result.sort((a, b) => a.price - b.price);
                break;
            case "Price: High to Low":
                result.sort((a, b) => b.price - a.price);
                break;
            case "Sales":
                result = result.filter(p => p.tags.isSale == true);
                break;
            case "Featured":
                result = result.filter(p => p.tags.isNew == true);
                break;
        }

        state.filteredProducts = result;

        // 6. Pagination dựa trên data đã được filter 
        const start = (state.filters.page - 1) * state.filters.limit;
        const end = start + state.filters.limit;
        const displayData = result.slice(start, end);


        // Render UI
        renderProducts({
            data: displayData,
            pagination: {
                page: state.filters.page,
                totalPages: Math.ceil(result.length / state.filters.limit),
                totalItems: result.length
            }
        });

        mapProductsToStore({ data: displayData });
        resolve(displayData);
    });
}

function fetchProductData() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = "";
    showLoading();

    // Lấy một lượng lớn sản phẩm để làm việc ở FE (ví dụ limit: 1000)
    getProductsDataFromDb({ limit: 1000 })
        .then((response) => {
            state.allProducts = response.data;
            return applyLogicAndRender();
        })
        .then(() => {
            hideLoading();
        })
        .catch(err => {
            hideLoading();
            showDangerAlert("Lỗi tải dữ liệu từ server");
        });
}

function renderProducts(products) {
    const productList = document.getElementById('product-list');
    let html = "";
    const userInfoInLS = JSON.parse(localStorage.getItem("userInfo"));

    products.data.filter(p => p.tags.isNew == true).forEach(product => {
        const isHidden = (!userInfoInLS || userInfoInLS.userrole == 'admin') ? 'style="visibility: hidden"' : '';
        
        let tagsHtml = "";
        if (product.tags) {
            if (product.tags.isNew) {
                tagsHtml += `<span class="badge badge-new">New</span>`;
            }
            if (product.tags.isSale) {
                tagsHtml += `<span class="badge badge-sale">Sale</span>`;
            }
        }

        html += `
        <a data-productid="${product._id}" href="../product-detail/product-detail.html?slug=${product.slug}" class="product-item">
            <div class="product-badges">
                ${tagsHtml}
            </div>
            <img src="/assets/icon/Heart.png" class="heart-icon" ${isHidden} width="36px" height="36px">
            <img src="${product.images[0]?.url || ''}" class="product-main-img">
            <img src="/assets/icon/Plus.png" ${isHidden} class="plus-icon add-variant-btn" width="36px" height="36px" >
            <h3>${product.name}</h3>
            <p>$${product.price}</p>
        </a>`;
    });

    productList.innerHTML = html;

    if (userInfoInLS && userInfoInLS.userrole !== 'admin') {
        initEventClickButtonAddToCart();
        initEventClickButtonAddToWishlist();
    }
}

function mapProductsToStore(apiResponse) {
    if (!apiResponse || !Array.isArray(apiResponse.data)) return;
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

function initSortAndFilterEvents() {
    // 1. Sort Panel Events
    const sortOptions = document.querySelectorAll(".sort-panel ul li a");
    sortOptions.forEach(option => {
        option.addEventListener("click", (e) => {
            e.preventDefault();
            state.filters.sort = e.target.innerText;

            applyLogicAndRender();
        });
    });

    // 2. Category Filter (Dải button trên cùng)
    const categoriesBar = document.querySelector(".filter-options");
    categoriesBar.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-filter")) {
            e.preventDefault();
            const categoryText = e.target.innerText.toLowerCase();
            state.filters.category = categoryText;
            state.filters.page = 1;
            applyLogicAndRender();
        }
    });

    // 3. Filter Panel - Color (Radio buttons)
    const colorInputs = document.querySelectorAll('input[name="filter-color"]');
    colorInputs.forEach(input => {
        input.addEventListener("change", (e) => {
            state.filters.color = e.target.value;
        });
    });

    // 4. Filter Panel - Material
    const materialOptions = document.querySelectorAll(".material-option ul li label");
    materialOptions.forEach(opt => {
        opt.addEventListener("click", (e) => {
            e.preventDefault();
            state.filters.material = e.target.innerText;
        });
    });

    // 5. Filter Panel - Size
    const sizeOptions = document.querySelectorAll(".size-option ul li label");
    sizeOptions.forEach(opt => {
        opt.addEventListener("click", (e) => {
            e.preventDefault();
            state.filters.size = e.target.innerText;
        });
    });

    // 6. Button "See Results"
    const btnSeeResults = document.getElementById("btn-see-results");
    if (btnSeeResults) {
        btnSeeResults.addEventListener("click", () => {
            state.filters.page = 1;
            applyLogicAndRender().then(() => {
                // Đóng filter panel sau khi áp dụng
                document.querySelector(".filter-panel").style.display = 'none';
                document.getElementById("overlay-filter").style.display = 'none';
            });
        });
    }
}

function renderVariantModal(productId) {
    const product = productStore[productId];
    if (!product) return;

    const modal = document.getElementById('variantBox');
    const colorContainer = modal.querySelector('.variant-group:nth-child(3) .option-list');
    colorContainer.innerHTML = product.colors.map((color, index) => `
        <input type="radio" name="color" id="color-${index}" value="${color.name}" hidden ${index === 0 ? 'checked' : ''}>
        <label for="color-${index}" class="color-swatch" style="background-color: ${color.hex};" title="${color.name}"></label>
    `).join('');

    const sizeContainer = modal.querySelector('.variant-group:nth-child(4) .option-list');
    sizeContainer.innerHTML = product.sizes.map((size, index) => `
        <input type="radio" name="size" id="size-${size}" value="${size}" hidden ${index === 0 ? 'checked' : ''}>
        <label for="size-${size}" class="size-box">${size}</label>
    `).join('');

    const submitBtn = modal.querySelector('.add-to-cart-submit');
    submitBtn.setAttribute('data-productid', productId);

    // Xử lý nút Add to Cart trong Modal (sửa lỗi gán chồng event bằng cách dùng onclick hoặc clear cũ)
    submitBtn.onclick = (e) => {
        e.preventDefault();
        const colorChecked = modal.querySelector(`input[name="color"]:checked`).value;
        const sizeChecked = modal.querySelector(`input[name="size"]:checked`).value;
        const userToken = JSON.parse(localStorage.getItem("userInfo"))?.usertoken;

        if (userToken) {
            postProductToCart(productId, 1, sizeChecked, colorChecked, userToken)
                .then(result => {
                    if (result?.success) {
                        showSuccessAlert(result.message);
                        renderNumberProductsInCart();
                    } else showWarningAlert(result?.message || "Thất bại");
                });
        }
    };
}

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

function initEventClickButtonAddToCart() {
    const buttonAddToCarts = document.querySelectorAll(".plus-icon");
    buttonAddToCarts.forEach(button => {
        button.addEventListener("click", handleEventClickButtonAddToCart);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initSortAndFilterEvents();
    fetchProductData();
})

//Tìm kiếm
const searchInput = document.getElementById('search-input');

async function performSearch() {
    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) {
        fetchProductData();
        return;
    }

    try {
        showLoading();
        const response = await getProductsDataFromDb({ limit: 1000 });
        const products = response.data;

        const results = products.filter(product =>
            product.name?.toLowerCase().includes(keyword)
        );

        renderProducts({
            data: results,
            pagination: {
                page: 1,
                totalPages: 1,
                totalItems: results.length
            }
        });

        mapProductsToStore({ data: results });
    } catch (error) {
        showDangerAlert("Lỗi tìm kiếm sản phẩm");
        console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
    } finally {
        hideLoading();
    }
}


searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});