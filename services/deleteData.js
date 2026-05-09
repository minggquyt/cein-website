export default function deleteProductsInCart(productCartId, token) {
  return fetch(`https://cein-website-server.onrender.com/api/cart/${productCartId}`, {
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
  return fetch(`https://cein-website-server.onrender.com/api/wishlist/${productId}`, {
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
    return fetch(`https://cein-website-server.onrender.com/api/products/${productId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).then(res => {
        if (!res.ok) throw new Error("Không thể xóa sản phẩm này.");
        return res.json();
    });
}

export function deleteUserRequest(userId, token){
    return fetch(`https://cein-website-server.onrender.com/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                // Nếu server trả về lỗi (400, 403, 404, 500...), ném lỗi vào .catch()
                return Promise.reject(data.message || "Không thể xóa người dùng");
            }
            return data; 
        });
    });
};