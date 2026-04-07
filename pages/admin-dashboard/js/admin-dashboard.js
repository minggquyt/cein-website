import { getAdminData } from "../../../services/getData.js";
import { updateProduct } from "../../../services/updateData.js";
import { deleteProductRequest } from "../../../services/deleteData.js";

// Biến lưu trữ dữ liệu tập trung (State)
let state = {
    dashboardData: null,
    charts: {}
};

let tempProductData = {
    images: [],
    colors: [],
    variants: []
};

const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));

function renderCharts(chartData) {

    // Hủy các chart cũ nếu tồn tại để tránh lỗi overlap của Chart.js
    Object.values(state.charts).forEach(chart => {
        if (chart) chart.destroy();
    });

    // Biểu đồ Giỏ hàng
    const ctxCart = document.getElementById('cartChart').getContext('2d');
    state.charts.cart = new Chart(ctxCart, {
        type: 'bar',
        data: {
            labels: chartData.cart.labels,
            datasets: [{
                label: 'Lượt thêm',
                data: chartData.cart.values,
                backgroundColor: '#000'
            }]
        }
    });

    // Biểu đồ Wishlist
    const ctxWish = document.getElementById('wishlistChart').getContext('2d');
    state.charts.wishlist = new Chart(ctxWish, {
        type: 'doughnut',
        data: {
            labels: chartData.wishlist.labels,
            datasets: [{
                data: chartData.wishlist.values,
                backgroundColor: ['#000', '#666', '#ccc']
            }]
        }
    });

    // thêm logic biểu đồ đường cho sales
}

function renderCustomerTable(customers) {
    const tableBody = document.querySelector('#customer-section tbody');
    if (!tableBody) return;

    tableBody.innerHTML = customers.map(c => `
        <tr>
            <td>${c.name}<br><small class="text-muted">${c.email}</small></td>
            <td>${c.cartCount || 0} Items</td>
            <td>${c.wishlistCount || 0} Items</td>
            <td class="fw-bold">$${c.totalSpent || 0}</td>
            <td>
                <button class="btn btn-link text-dark p-0 me-2" data-id="${c._id}">Edit</button>
                <button class="btn btn-link text-danger p-0" data-id="${c._id}">Delete</button>
            </td>
        </tr>
    `).join('');
}

function switchTab(sectionId) {
    const sections = ['system', 'customer'];
    sections.forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (el) el.style.display = (s === sectionId) ? 'block' : 'none';
    });

    // Cập nhật trạng thái Active cho Sidebar 
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
    });
}

function initDashboard() {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    // Kiểm tra login ngay lập tức
    if (!userInfo) {
        window.location.href = "/login.html";
        return;
    }

    // Bắt đầu chuỗi Promise
    getAdminData(userInfo.usertoken)
        .then(result => {
            console.log("Dữ liệu đã tải thành công:", result.data);

            // Lưu dữ liệu vào State để tái sử dụng khi chuyển tab
            state.dashboardData = result.data;

            // Render giao diện lần đầu (Mặc định trang Hệ thống)
            renderCharts(state.dashboardData.charts);
            renderCustomerTable(state.dashboardData.customers);
            renderProductTable(state.dashboardData.products);
        })
        .catch(error => {
            console.error("Lỗi khởi tạo Dashboard:", error);
            alert(error.message);
            window.location.href = "/login.html";
        });
}

function handleAddProduct(e) {
    e.preventDefault();
    e.stopPropagation();
    const modalElement = document.getElementById('editProductModal');

    // 1. Reset ID trong dataset (Quan trọng để phân biệt ADD và EDIT)
    delete modalElement.dataset.productid;

    // 2. Reset tiêu đề và các ô input text
    document.getElementById('modal-product-name-title').innerText = "THÊM SẢN PHẨM MỚI";
    document.getElementById('edit-product-form').reset(); // reset() - form's function 

    // 3. Reset các biến tạm (Dữ liệu mảng)
    tempProductData = {
        images: [],
        colors: [],
        variants: []
    };

    // 4. Bỏ check tất cả các checkbox Size
    document.querySelectorAll('.size-checkbox').forEach(cb => cb.checked = false);

    // 5. Vẽ lại danh sách trống cho Hình ảnh, Màu sắc, Biến thể
    renderTempListsUI();

    // 6. Mở Modal
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
}

// Hàm render table (Chỉnh lại để lấy ảnh từ mảng images)
function renderProductTable(products) {
    console.log(products);
    const tableBody = document.querySelector('#system-section tbody');
    if (!tableBody) return;

    tableBody.innerHTML = products.map(p => {
        // Tìm ảnh thumbnail trong mảng images
        const thumb = p.images?.find(img => img.isThumbnail)?.url || 'https://via.placeholder.com/40';

        return `
        <tr slug=${p.slug} >
            <td>#${p._id.toString().slice(-4)}</td>
            <td><img src="${thumb}" class="rounded" style="width:40px"></td>
            <td>${p.name}</td>
            <td>$${p.price}</td>
            <td>
                <button class="btn btn-outline-secondary btn-sm admin-dashboard-edit-product" data-id="${p._id}">
                    <i class="bi bi-pencil">Edit</i>
                </button>
                <button class="btn btn-outline-danger btn-sm admin-dashboard-delete-product" data-id="${p._id}">
                    <i class="bi bi-trash">Delete</i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

// thay hàm này thành chàm get Product Detail của mình
function getProductDetailRequest(slug, token) {
    // Gọi đến router GET /:slug mà bạn đã viết ở BE
    return fetch(`http://localhost:5000/api/products/${slug}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }).then(res => {
        if (!res.ok) throw new Error("Không tìm thấy thông tin sản phẩm.");
        return res.json();
    });
}
function fillProductDataToEditModal(product) {

    const modal = document.querySelector("#editProductModal");
    modal.dataset.productid = product._id;
    modal.dataset.categoryid = product.categoryId;
    modal.dataset.material = product.material;

    // Gán dữ liệu cơ bản
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-description').value = product.description;

    // Tags
    document.getElementById('tag-new').checked = product.tags?.isNew || false;
    document.getElementById('tag-sale').checked = product.tags?.isSale || false;

    // Load dữ liệu vào biến tạm
    tempProductData.images = [...(product.images || [])];
    tempProductData.colors = [...(product.colors || [])];
    tempProductData.variants = [...(product.variants || [])];

    // Check các ô Size tương ứng
    document.querySelectorAll('.size-checkbox').forEach(cb => {
        cb.checked = (product.sizes || []).includes(cb.value);
    });

    renderTempListsUI();
}

function setupProductTableEvents() {
    const tableBody = document.querySelector('#system-section tbody');
    if (!tableBody) return;

    tableBody.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.admin-dashboard-delete-product');
        if (deleteBtn) {
            const productId = deleteBtn.getAttribute('data-id');
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));

            if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
                deleteProductRequest(productId, userInfo.usertoken)
                    .then(result => {
                        alert("Xóa thành công!");
                        deleteBtn.closest('tr').remove();
                        state.dashboardData.products = state.dashboardData.products.filter(p => p._id !== productId);
                    })
                    .catch(err => alert(err.message));
            }
        }

        const editBtn = e.target.closest('.admin-dashboard-edit-product');
        if (editBtn) {

            // chưa xử lý lấy thông tin material và categoryId của phần edit

            const productSlug = editBtn.closest('tr').getAttribute('slug');
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));

            getProductDetailRequest(productSlug, userInfo.usertoken)
                .then(result => {
                    const product = result.data;

                    // 2. Đổ dữ liệu vào Form
                    fillProductDataToEditModal(product);

                    // 3. Hiển thị Modal
                    editModal.show();
                })
                .catch(err => alert("Lỗi: " + err.message));
        }
    });
}

// HÀM RENDER UI TẠM THỜI 
function renderTempListsUI() {
    // Render Hình ảnh
    const imgContainer = document.getElementById('list-images');
    imgContainer.innerHTML = tempProductData.images.map((img, idx) => `
        <div class="position-relative border">
            <img src="${img.url}" style="width:50px;height:50px;object-fit:cover">
            <span class="badge bg-danger position-absolute top-0 end-0 cursor-pointer" onclick="removeImg(${idx})">x</span>
            ${img.isThumbnail ? '<small class="d-block text-center bg-primary text-white" style="font-size:10px">Thumb</small>' : ''}
        </div>
    `).join('');

    // Render Màu sắc
    const colorContainer = document.getElementById('list-colors');
    colorContainer.innerHTML = tempProductData.colors.map((c, idx) => `
        <span class="badge d-flex align-items-center gap-1 border text-dark" style="background:#f8f9fa">
            <div style="width:12px;height:12px;background:${c.hex};border-radius:50%"></div>
            ${c.name} <i class="bi bi-x cursor-pointer" onclick="removeColor(${idx})"></i>
        </span>
    `).join('');

    // Render Variants Table
    const varBody = document.querySelector('#table-variants tbody');
    varBody.innerHTML = tempProductData.variants.map((v, idx) => `
        <tr>
            <td>${v.color}</td>
            <td>${v.size}</td>
            <td>${v.stock}</td>
            <td class="text-danger cursor-pointer" onclick="removeVariant(${idx})">X</td>
        </tr>
    `).join('');
}

// SỰ KIỆN THÊM DỮ LIỆU 
document.getElementById('btn-add-img').onclick = () => {
    const url = document.getElementById('input-img-url').value;
    if (!url) return;
    tempProductData.images.push({ url, public_id: "p" + Date.now(), isThumbnail: tempProductData.images.length === 0 });
    document.getElementById('input-img-url').value = "";
    renderTempListsUI();
};

document.getElementById('btn-add-color').onclick = () => {
    const name = document.getElementById('input-color-name').value;
    const hex = document.getElementById('input-color-hex').value;
    if (!name) return;
    tempProductData.colors.push({ name, hex });
    document.getElementById('input-color-name').value = "";
    renderTempListsUI();
};

document.getElementById('btn-add-variant').onclick = () => {
    const color = document.getElementById('var-color').value;
    const size = document.getElementById('var-size').value;
    const stock = parseInt(document.getElementById('var-stock').value);
    if (!color || !size || isNaN(stock)) return;
    tempProductData.variants.push({ color, size, stock });
    renderTempListsUI();
};

// Khởi tạo trang dashboard
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupProductTableEvents();

    // Ủy quyền sự kiện (Event Delegation) cho Sidebar
    document.addEventListener('click', (e) => {
        const navLink = e.target.closest('.nav-link');
        if (navLink) {
            e.preventDefault();
            const section = navLink.getAttribute('data-section');
            if (section) switchTab(section);
        }
    });
});

// Khỡi tạo event click cho button add product
const btnAddProduct = document.querySelector("#admin-dashboard-add-product-btn");
btnAddProduct.addEventListener('click', handleAddProduct);

// khởi tạo event lưu sản phẩm sau khi sửa trong edit modal
const saveBtn = document.getElementById('save-product-changes')
saveBtn.addEventListener('click', () => {
    const modalElement = document.getElementById('editProductModal');
    const productId = modalElement.dataset.productid; 
    // có productId -> update || không có productId -> add 

    const selectedSizes = Array.from(document.querySelectorAll('.size-checkbox:checked')).map(cb => cb.value);

    const productDataForServer = {
        name: document.getElementById('edit-name').value,
        description: document.getElementById('edit-description').value,
        price: Number(document.getElementById('edit-price').value),
        categoryId: document.getElementById('edit-category').value, // Lấy từ Select
        material: document.getElementById('edit-material').value,    // Lấy từ Input mới
        sizes: selectedSizes,
        images: tempProductData.images,
        colors: tempProductData.colors,
        variants: tempProductData.variants,
        tags: {
            isNew: document.getElementById('tag-new').checked,
            isSale: document.getElementById('tag-sale').checked
        }
    };

    // Validation nhẹ
    if (!productDataForServer.name || !productDataForServer.price) {
        alert("Vui lòng nhập tên và giá sản phẩm!");
        return;
    }

    // THÊM LOGIC VALIDATION Ở ĐÂY - KHÔNG CHO CÁC FIELD RỖNG !

    // Quyết định Method dựa trên việc có productId hay không
    const method = productId ? "PUT" : "POST";

    updateProduct(method, productDataForServer, productId)
        .then(result => {
            console.log(result);
            if (result.success) {
                alert(productId ? "Cập nhật thành công!" : "Thêm sản phẩm mới thành công!");

                // Đóng modal
                bootstrap.Modal.getInstance(modalElement).hide();

                location.reload();

                renderProductTable(state.dashboardData.products);
            }
        })
        .catch(err => {
            alert("Lỗi: " + (err.message || "Không thể lưu sản phẩm"));
        });
});