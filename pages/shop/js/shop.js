fetch("../../assets/data/products.json")
    .then(response => response.json())
    .then(products => {
        const productList = document.getElementById('product-list');
        var productItem = '';
        products.forEach(product => {
            productItem += `
            <div class="product-item">
                <a><img src="../../assets/icon/Heart.png" alt="Like" class="heart-icon" style="width: 36px; height: 36px;"></a>
                <a><img src="../../assets/icon/Plus.png" alt="Cart" class="plus-icon" style="width: 36px; height: 36px;"></a>
                <img src="${product.image}" alt="${product.product_name}">
                <h3>${product.product_name}</h3>
                <p>$${product.price}</p>
            </div>`;
        })
        productList.innerHTML = productItem;
    })

