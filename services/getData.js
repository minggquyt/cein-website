export default function getData(){
    return fetch("https://cein-website-server-production.up.railway.app/api/samples")
        .then((response) => response.json())
        .then((result) => result)
        .catch((error) => error)
}   

export function getProductsData(){
    return fetch("/assets/data-test/products.json")
        .then((res) => res.json())
        .then(data => data)
        .catch(error => error)
}

export function getProductsDataBySlug(){
    return fetch("/assets/data-test/products.json")
        .then(res => res.json())
        .then(data => data)
        .catch(error => error)
}

