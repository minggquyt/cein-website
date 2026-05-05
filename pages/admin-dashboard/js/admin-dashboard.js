import { getAdminData } from "../../../services/getData.js";
import { synProductWithServer } from "../../../services/updateData.js";
import { deleteProductRequest } from "../../../services/deleteData.js";
import { deleteUserRequest } from "../../../services/deleteData.js";

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

    // Giả lập nhãn cho 7 ngày gần nhất vì mảng salesStats của bạn có 7 phần tử
    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    const ctxSales = document.getElementById('bestSellerChart').getContext('2d');
    state.charts.sales = new Chart(ctxSales, {
        type: 'line',
        data: {
            labels: dayLabels, 
            datasets: [{
                label: 'Doanh thu ($)',
                data: chartData.sales, // Mảng [500, 800, 450, 1200, 900, 2000, 1800]
                borderColor: '#000',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                fill: true,
                tension: 0.4, // Tạo độ cong cho đường kẻ
                pointRadius: 5,
                pointBackgroundColor: '#000'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return '$' + value; }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

function renderCustomerTable(customers) {
    const tableBody = document.querySelector('#customer-section tbody');
    if (!tableBody) return;

    tableBody.innerHTML = customers.map(c => `
        <tr>
            <td>
                <span class="fw-bold">${c.name}</span><br>
                <small class="text-muted">${c.email}</small>
            </td>
            <td>
                <span class="badge bg-light text-dark border">
                    <i class="bi bi-telephone me-1"></i>${c.phone || ""}
                </span>
            </td>
            <td class="text-center">
                <span class="badge bg-info text-white">${c.totalOrders || 0} Đơn</span>
            </td>
            <td>${c.cartCount || 0} Items</td>
            <td>${c.wishlistCount || 0} Items</td>
            <td class="fw-bold text-success">$${c.totalSpent || 0}</td>
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
                        const productRow = deleteBtn.closest('tr');
                        productRow.style.transition = "all 0.3s ease";
                        productRow.style.opacity = '0';
                        
                        setTimeout(() => {
                            productRow.remove();
                        },300)

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

    synProductWithServer(method, productDataForServer, productId)
        .then(result => {
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

// Khởi tạo event edit và lưu user
// Khởi tạo Modal
const userModal = new bootstrap.Modal(document.getElementById('editUserModal'));

// Lắng nghe sự kiện click trên bảng User
document.querySelector('#customer-section tbody').addEventListener('click', (e) => {
    const editBtn = e.target.closest('button.text-dark'); // Nút Edit
    if (editBtn) {
        const userId = editBtn.getAttribute('data-id');

        // Tìm dữ liệu user trong state hiện tại
        const user = state.dashboardData.customers.find(c => c._id === userId);
        
        if (user) {
            // Đổ dữ liệu vào Form
            document.getElementById('edit-user-name').value = user.name;
            document.getElementById('edit-user-email').value = user.email;
            document.getElementById('edit-user-phone').value = user.phone || "";
            
            // Đổ dữ liệu vào các ô bị khóa
            document.getElementById('edit-user-id').value = user._id;
            document.getElementById('edit-user-total-orders').value = user.totalOrders + " đơn";
            document.getElementById('edit-user-total-spent').value = "$" + user.totalSpent;

            // Mở modal
            userModal.show();
        }
    }

    const deleteBtn = e.target.closest("button.text-danger");
    if(deleteBtn){
        const userId = deleteBtn.dataset.id;
        const userRow = deleteBtn.closest("tr");
        handleDeleteUserUI(userId,userRow);
    }
});

// Xử lý sự kiện lưu thông tin user:
// Gắn sự kiện cho nút Lưu trong Modal Edit User
document.getElementById('save-user-changes').addEventListener('click', async () => {
    const userId = document.getElementById('edit-user-id').value;
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const updateData = {
        name: document.getElementById('edit-user-name').value,
        email: document.getElementById('edit-user-email').value,
        phone: document.getElementById('edit-user-phone').value
    };

    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${userInfo.usertoken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (result.success) {
            alert("Cập nhật thông tin thành công!");
            // Đóng modal
            userModal.hide();
            // Reload lại bảng hoặc gọi lại hàm render
            location.reload(); 
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error("Update User Error:", error);
        alert("Không thể kết nối đến server.");
    }
});

function handleDeleteUserUI(userId, rowElement) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const isConfirm = confirm("CẢNH BÁO: Xóa người dùng này sẽ xóa sạch Giỏ hàng và Wishlist liên quan. Tiếp tục?");
    if (!isConfirm) return;

    deleteUserRequest(userId, userInfo.usertoken)
        .then(result => {
            // Bước 1: Hiệu ứng UI
            rowElement.style.transition = "all 0.3s ease";
            rowElement.style.opacity = "0";
            
            setTimeout(() => {
                rowElement.remove();
                alert(result.message);
            }, 300);

            // Bước 2: Cập nhật State toàn cục (nếu có)
            if (state.dashboardData && state.dashboardData.customers) {
                state.dashboardData.customers = state.dashboardData.customers.filter(c => c._id !== userId);
            }
        })
        .catch(error => {
            // Xử lý khi có lỗi (Ví dụ: Xóa nhầm Admin sẽ nhảy vào đây)
            console.error("Lỗi xóa user:", error);
            alert("Lỗi: " + error);
        })
        .finally(() => {
            console.log("Hoàn tất tiến trình xóa ID:", userId);
        });
}

// Khởi tạo event click edit và 

// BỔ SUNG PHẦN QUẢN LÝ USER:
// - THÊM TOTAL ORDERS ( GIẢ LẬP DỮ LIỆU CỨNG Ở DATABASE )
// - THÊM SỐ ĐIỆN THOẠI ( THÔNG TIN LIÊN LẠC )
// - THÊM BỘ LỌC ĐỂ SEARCH THEO:
// + TRẠNG THÁI TÀI KHOẢN 
// + SEARCH THEO TỔNG CHI TIÊU 
// - PHÂN TRANG 