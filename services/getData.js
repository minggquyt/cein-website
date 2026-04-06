export default function getData() {
    return fetch("https://cein-website-server-production.up.railway.app/api/samples")
        .then((response) => response.json())
        .then((result) => result)
        .catch((error) => error)
}


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
    return fetch(`http://localhost:5000/api/products/${slug}`)
        .then(res => res.json())
        .then(result => result)
        .catch(error => {
            return error;
        })
}