export default function deleteProductsInCart(productCartId, token) {
  return fetch(`https://cein-website-server-production.up.railway.app/api/cart/${productCartId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(data => data)
    .catch(error => {
      console.log(error);
      return null;
    });
}

export function deleteProductsInWishlist(productId, token) {
  return fetch(`https://cein-website-server-production.up.railway.app/api/wishlist/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(result => result)
  .catch(error => {
    console.log(error);
    return null;
  })
}

export function deleteProductRequest(productId, token) {
    return fetch(`https://cein-website-server-production.up.railway.app/api/products/${productId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).then(res => {
        if (!res.ok) throw new Error("Không thể xóa sản phẩm này.");
        return res.json();
    });
}