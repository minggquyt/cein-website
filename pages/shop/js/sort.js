
function openSort() {
    if (window.innerWidth <= 600) {
        const panel = document.querySelector('.sort-panel');
        const overlay = document.getElementById('overlay-sort');
        if(panel) panel.classList.add('active');
        if(overlay) overlay.classList.add('active');
    }
}
export default function closeSort() {
  console.log("hàm này chạy");
    if (window.innerWidth > 600) return;
  document.getElementsByClassName('sort-panel')[0].classList.remove('active');
  document.getElementById('overlay-sort').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-sort').addEventListener('click', openSort);
  document.getElementById('btn-close-sort').addEventListener('click', closeSort);
  document.getElementById('overlay-sort').addEventListener('click', closeSort);
});