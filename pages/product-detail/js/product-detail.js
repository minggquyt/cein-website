import { getProductsDataBySlug } from "../../../services/getData.js";

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

function renderProductDataToView(productData){
    console.log(productData);

    const productDetailContainer = document.querySelector('.product-detail-page-section-1');

    productDetailContainer.innerHTML = `
            <div class="col-lg-8">
                <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators flex-column m-0 justify-content-center h-100 left-0 ms-3"
                        style="width: fit-content; right: auto;">
                        <button type="" data-bs-target="#productCarousel" data-bs-slide-to="0"
                            class="active border rounded-circle mb-2" style="width: 8px; height: 8px;"></button>
                        <button type="button" data-bs-target="#productCarousel" data-bs-slide-to="1"
                            class="border rounded-circle mb-2" style="width: 8px; height: 8px;"></button>
                        <button type="button" data-bs-target="#productCarousel" data-bs-slide-to="2"
                            class="border rounded-circle mb-2" style="width: 8px; height: 8px;"></button>
                        <button type="button" data-bs-target="#productCarousel" data-bs-slide-to="3"
                            class="border rounded-circle mb-2" style="width: 8px; height: 8px;"></button>
                    </div>

                    <div class="carousel-inner bg-light">
                        <div class="carousel-item active">
                            <img src=${productData.images[0].url} class="d-block w-100" alt="Product Image 1">
                        </div>
                        <div class="carousel-item">
                            <img src=${productData.images[1].url} class="d-block w-100" alt="Product Image 2">
                        </div>
                        <div class="carousel-item">
                            <img src=${productData.images[2].url} class="d-block w-100" alt="Product Image 3">
                        </div>
                        <div class="carousel-item">
                            <img src=${productData.images[3].url} class="d-block w-100" alt="Product Image 4">
                        </div>
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel"
                        data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#productCarousel"
                        data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>

            <div class="col-lg-4 ps-lg-5">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb small text-muted mb-2">
                        <li class="breadcrumb-item"><a href="#" class="text-reset text-decoration-none">Shop</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Clothing</li>
                    </ol>
                </nav>

                <p class="h4 fw-normal mb-1">${productData.name}</p>
                <p class="fs-5 mb-4">$${productData.price}</p>

                <p class="text-muted small mb-4 lh-lg">
                    ${productData.description}
                </p>

                <div class="mb-4">
                    <p class="small mb-2">Product Color: <span class="fw-bold">Beige</span></p>
                    <p class="small mb-1">Color:</p>
                    <div class="d-flex gap-2">
                        <div class="color-swatch active rounded-circle"
                            style="background-color: #e8decb; width: 24px; height: 24px; cursor: pointer;"></div>
                        <div class="color-swatch rounded-circle"
                            style="background-color: #000000; width: 24px; height: 24px; cursor: pointer;"></div>
                        <div class="color-swatch rounded-circle"
                            style="background-color: #96b3c2; width: 24px; height: 24px; cursor: pointer;"></div>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="d-flex justify-content-between mb-2">
                        <p class="small mb-0">Product Size:</p>
                        <a href="#" class="small text-muted text-decoration-underline">Size Chart</a>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-dark size-btn">XS</button>
                        <button class="btn btn-outline-dark size-btn">S</button>
                        <button class="btn btn-outline-dark size-btn active">M</button>
                        <button class="btn btn-outline-dark size-btn">L</button>
                        <button class="btn btn-outline-dark size-btn">XL</button>
                    </div>
                </div>

                <button class="btn btn-dark w-100 py-3 rounded-0 fw-bold mb-5">Add to Bag</button>

                <div class="accordion accordion-flush border-top" id="productInfo">
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed px-0 shadow-none small fw-bold" type="button"
                                data-bs-toggle="collapse" data-bs-target="#check">
                                Check In-Store Availability
                            </button>
                        </h2>
                        <div id="check" class="accordion-collapse collapse" data-bs-parent="#productInfo">
                            <div class="accordion-body px-0 py-2 small">Availability info here...</div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed px-0 shadow-none small fw-bold" type="button"
                                data-bs-toggle="collapse" data-bs-target="#fit">
                                Fit Details
                            </button>
                        </h2>
                        <div id="fit" class="accordion-collapse collapse" data-bs-parent="#productInfo">
                            <div class="accordion-body px-0 py-2 small text-muted">Model is 1m75 wearing size M.</div>
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
    `
    
}

function initProductsDataBySlug(){
    getProductsDataBySlug()
        .then((products) => {
            let findingProductIndex = 0;
            products.forEach((product,index) => {
                if(product.slug === slug)
                    findingProductIndex = index;
            });

            renderProductDataToView(products[findingProductIndex]);

        })
}

initProductsDataBySlug();
