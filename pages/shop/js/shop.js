import { getProductsData } from "../../../services/getData.js"; 

function initProductsData() {
    getProductsData()
        .then(products => {
            console.log(products);
            const productList = document.getElementById('product-list');
            var productItem = '';
            products.forEach(product => {
                productItem += `
                <a href="../product-detail/product-detail.html?slug=${product.slug}" class="product-item">
                    <img src="/assets/icon/Heart.png" alt="Like" class="heart-icon" style="width: 36px; height: 36px;">
                    <img src="/assets/icon/Plus.png" alt="Cart" class="plus-icon" style="width: 36px; height: 36px;">
                    <img src="${product.images[0].url}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                </a>`;
            })
            productList.innerHTML = productItem;
        })
        .catch(error => {
            console.log(error);
        })
}

initProductsData();
