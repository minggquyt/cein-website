import { getProductsDataFromDb } from "../../../services/getData.js";
import showLoading from "../../../components/loading/loading.js";
import { hideLoading } from "../../../components/loading/loading.js";

const state = {
    page: 1,
    limit: 12,
    category: null,
    sort: null,
    color: null,
    material: null,
    size: null
};

function fetchProductData() {
    // clear product + show loading
    const productList = document.getElementById('product-list');
    productList.innerHTML = "";
    showLoading();

    getProductsDataFromDb(state)
        .then((data) => {
            hideLoading();
            renderProducts(data);
        })
}

fetchProductData();

function renderProducts(products) {
    const productList = document.getElementById('product-list');

    let html = "";

    products.data.forEach(product => {
        if (product.tags.isNew == true) {
            html += `
                <a href="../product-detail/product-detail.html?slug=${product.slug}" class="product-item">
                    <img src="${product.images[0].url}">
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                </a>`;
        }
    });

    productList.innerHTML = html;
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




