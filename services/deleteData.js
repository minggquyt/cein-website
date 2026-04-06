export default function deleteProductsInCart(productCartId, token) {
  return fetch(`http://localhost:5000/api/cart/${productCartId}`, {
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
  return fetch(`http://localhost:5000/api/wishlist/${productId}`, {
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