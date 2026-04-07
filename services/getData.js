export function getProductsDataFromDb(state) {

    const params = new URLSearchParams();

    for (let key in state) {

        if (state[key] != null) {
            params.append(key, state[key]);
        }
    }

    return fetch(`https://cein-website-server-production.up.railway.app/api/products?${params.toString()}`)
        .then((res) => res.json())
        .then(data => data)
        .catch(error => error)
}

export function getCartData(token) {
    return fetch("https://cein-website-server-production.up.railway.app/api/cart", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

        .then(res => res.json())
        .then((data) => {
            return data;
        })
        .catch(error => {
            return error
        });
}

export function getWishListData(token) {
    return fetch("https://cein-website-server-production.up.railway.app/api/wishlist", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

        .then(res => res.json())
        .then((data) => {
            return data;
        })
        .catch(error => {
            return error
        });
}

export function getProductDetailData(slug) {
    return fetch(`https://cein-website-server-production.up.railway.app/api/products/${slug}`)
        .then(res => res.json())
        .then(result => result)
        .catch(error => {
            return error;
        })
}

export function getUserInfo(token){
    return fetch('https://cein-website-server-production.up.railway.app/api/user/profile', {
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        })
        .then(res => res.json())
        .then(result => result)
        .catch(err => err)
}

export function  getAdminData(userToken) {
    return fetch("https://cein-website-server-production.up.railway.app/api/admin/statistics", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { 
                throw new Error(err.message || "Xác thực thất bại"); 
            });
        }
        return response.json();
    });
}
