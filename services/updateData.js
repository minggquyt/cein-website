export default function updateNumberProductsVariant(variantId, quantity, token) {
    return fetch(`https://cein-website-server-production.up.railway.app/api/cart/${variantId}`, {
        method: "PUT", 
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            quantity: quantity
        })
    })
        .then(data => console.log(data))
        .catch(error => console.log(error))
}

export function updateProduct(method, productData, productId = null) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const url = productId 
        ? `https://cein-website-server-production.up.railway.app/api/products/${productId}` 
        : `https://cein-website-server-production.up.railway.app/api/products`;

    const payload = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        categoryId: productData.categoryId || "", 
        material: productData.material,
        images: productData.images || [],     
        colors: productData.colors || [],     
        sizes: productData.sizes || [],       
        variants: productData.variants || [], 
        tags: productData.tags || {}
    };

    return fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userInfo.usertoken}`
        },
        body: JSON.stringify(payload)
    }).then(res => res.json());
}