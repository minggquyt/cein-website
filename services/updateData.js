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