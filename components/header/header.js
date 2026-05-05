const searchBtn = document.getElementById('btn-search-trigger');
const searchInput = document.getElementById('search-input');

searchBtn.addEventListener('click', () => {

  searchInput.classList.toggle('active')
  if (searchInput.classList.contains('active')) {
    searchInput.focus();
  }
});
 
// Logic lọc sản phẩm & phân trang ở đây
