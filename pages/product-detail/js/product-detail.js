import { getProductDetailData } from "../../../services/getData.js";
import renderNumberProductsInCart from "../../../services/cart-services.js";
import { renderNumberProductsInWishlist } from "../../../services/wishlist-services.js";
import { initEventPopUpWishlistModal } from "../../../services/wishlist-services.js";
import showSuccessAlert from "../../../services/alert.js";
import { showDangerAlert, showWarningAlert } from "../../../services/alert.js";
import { postProductDetailToCart } from "../../../services/postData.js";

document.addEventListener('DOMContentLoaded', async () => {
    const productDetailContainer = document.querySelector('.product-detail-page-section-1');

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        productDetailContainer.innerHTML = "<p>Không tìm thấy sản phẩm!</p>";
        return;
    }

    try {

        getProductDetailData(slug)
            .then(result => {
                if (result.success == true) {
                    // 3. Render dữ liệu
                    renderProductDetail(result.data, productDetailContainer);
                    setupAddToCart(result.data._id);
                }
                else {
                    console.warn("Lỗi trong quá trình truy vấn")
                }
            })
            .catch(err => {
                console.log(err);
            })
    } catch (error) {
        console.error("Lỗi:", error);
        productDetailContainer.innerHTML = `<div class="container mt-5"><h3>Đã xảy ra lỗi khi tải sản phẩm.</h3></div>`;
    }
});

function renderProductDetail(productData, container) {

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    // Xử lý danh sách ảnh cho Carousel
    const indicatorsHTML = productData.images.map((img, index) => `
        <button type="button" data-bs-target="#productCarousel" data-bs-slide-to="${index}" 
        class="${index === 0 ? 'active' : ''} border rounded-circle mb-2" style="width: 8px; height: 8px;"></button>
    `).join('');

    const imagesHTML = productData.images.map((img, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${img.url}" class="d-block w-100" alt="${productData.name}">
        </div>
    `).join('');

    // Xử lý danh sách màu sắc
    const colorsHTML = productData.colors.map((color, index) => `
    <div class="color-option">
        <input type="radio" name="productColor" id="color-${index}" value="${color.name}" 
               class="d-none color-radio" ${index === 0 ? 'checked' : ''}>
        <label for="color-${index}" class="color-swatch rounded-circle" 
               style="background-color: ${color.hex}; width: 24px; height: 24px; cursor: pointer; display: block; border: 2px solid transparent;">
        </label>
    </div>
    `).join('');

    // Xử lý danh sách size
    const sizesHTML = productData.sizes.map((size, index) => `
    <div class="size-option">
        <input type="radio" name="productSize" id="size-${index}" value="${size}" 
               class="d-none size-radio" ${index === 0 ? 'checked' : ''}>
        <label for="size-${index}" class="btn btn-outline-dark size-label">
            ${size}
        </label>
    </div>
    `).join('');
    
    const buttonAddToCart = userInfo && userInfo.userrole != 'admin' ? `<button class="btn btn-dark w-100 py-3 rounded-0 fw-bold mb-5" id="addToCartBtn">Add to Cart</button>` : ""; 

    // Đổ toàn bộ HTML vào container
    container.innerHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-lg-8">
                        <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-indicators flex-column m-0 justify-content-center h-100 left-0 ms-3" style="width: fit-content; right: auto;">
                                ${indicatorsHTML}
                            </div>
                            <div class="carousel-inner carousel-inner-product-detail  bg-light">
                                ${imagesHTML}
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>

                    <div class="col-lg-4 ps-lg-5">
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb small text-muted mb-2">
                                <li class="breadcrumb-item"><a href="/shop.html" class="text-reset text-decoration-none">Shop</a></li>
                                <li class="breadcrumb-item active" aria-current="page">${productData.material}</li>
                            </ol>
                        </nav>

                        <p class="h4 fw-normal mb-1">${productData.name}</p>
                        <p class="fs-5 mb-4">$${productData.price}</p>

                        <p class="text-muted small mb-4 lh-lg">${productData.description}</p>

                        <div class="mb-4">
                            <p class="small mb-1">Color:</p>
                            <div class="d-flex gap-2">
                                ${colorsHTML}
                            </div>
                        </div>

                        <div class="mb-4">
                            <div class="d-flex justify-content-between mb-2">
                                <p class="small mb-0">Product Size:</p>
                                <a href="#" class="small text-muted text-decoration-underline">Size Chart</a>
                            </div>
                            <div class="d-flex gap-2">
                                ${sizesHTML}
                            </div>
                        </div>

                        ${buttonAddToCart}

                        <!-- Accordion giữ nguyên phần tĩnh của bạn -->
                        <div class="accordion accordion-flush border-top" id="productInfo">
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed px-0 shadow-none small fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#fit">
                                        Fit Details
                                    </button>
                                </h2>
                                <div id="fit" class="accordion-collapse collapse" data-bs-parent="#productInfo">
                                    <div class="accordion-body px-0 py-2 small text-muted">Rating: ${productData.rating} ⭐ (${productData.reviewCount} reviews)</div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed px-0 shadow-none small fw-bold" type="button"
                                        data-bs-toggle="collapse" data-bs-target="#care">
                                        Fabrication & Care
                                    </button>
                                </h2>
                                <div id="care" class="accordion-collapse collapse" data-bs-parent="#productInfo">
                                    <div class="accordion-body px-0 py-2 small text-muted">1 for 1 exchange warranty within 30
                                        days.</div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed px-0 shadow-none small fw-bold" type="button"
                                        data-bs-toggle="collapse" data-bs-target="#return">
                                        Shopping & Returns
                                    </button>
                                </h2>
                                <div id="return" class="accordion-collapse collapse" data-bs-parent="#productInfo">
                                    <div class="accordion-body px-0 py-2 small text-muted">Return and refund quickly.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function setupAddToCart(productId) {
    const addBtn = document.getElementById('addToCartBtn');

    addBtn.addEventListener('click', async () => {

        const token = JSON.parse(localStorage.getItem('userInfo')).usertoken;
        if (!token) {
            showWarningAlert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
            return;
        }

        // 2. Thu thập dữ liệu từ các Radio Input đã chọn
        const selectedColor = document.querySelector('input[name="productColor"]:checked')?.value;
        const selectedSize = document.querySelector('input[name="productSize"]:checked')?.value;

        // Bạn có thể thêm input số lượng nếu có, ở đây mình mặc định là 1
        const quantity = 1;

        // 3. Kiểm tra dữ liệu hợp lệ
        if (!selectedColor || !selectedSize) {
            showWarningAlert("Vui lòng chọn màu sắc và kích cỡ");
            return;
        }

        // 4. Hiệu ứng Loading (Optional nhưng nên có)
        addBtn.innerText = 'Adding...';
        addBtn.disabled = true;
        // 5. Gửi request POST lên Server
        postProductDetailToCart(productId, quantity, selectedSize, selectedColor, token)
            .then(result => {
                if (result.success) {
                    showSuccessAlert(result.message);
                    renderNumberProductsInCart();
                } else {
                    showDangerAlert(result.message);
                }
            })
            .catch(error => {
                console.error('Cart Error:', error);
                showDangerAlert("Không thể kết nối đến server");
            })
            .finally(() => {
                addBtn.innerText = 'Add to Cart';
                addBtn.disabled = false;
            })
    });
}

// init header wishlist & cart effect 

renderNumberProductsInCart();

renderNumberProductsInWishlist();

initEventPopUpWishlistModal();