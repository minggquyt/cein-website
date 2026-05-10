//Click btn-filter de mo filter panel tren desktop
function openFilter() {
    console.log("Hàm này chạy")
    // if (window.innerWidth >= 600) {
        const panel = document.querySelector('.filter-panel');
        const overlay = document.getElementById('overlay-filter');
        if (panel) panel.classList.add('active');
        if (overlay) overlay.classList.add('active');

        console.log(panel);
        console.log(overlay);
    // }
}
export function closeFilter() {
    // if (window.innerWidth >= 600) {
        document.getElementsByClassName('filter-panel')[0].classList.remove('active');
        document.getElementById('overlay-filter').classList.remove('active');
    // }
}

export default function initFilterEvent(){
    document.getElementById('btn-filter').addEventListener('click', openFilter);
    document.getElementById('btn-close-filter').addEventListener('click', closeFilter);
    document.getElementById('overlay-filter').addEventListener('click', closeFilter);
   
}

document.addEventListener('DOMContentLoaded', () => {
    initFilterEvent();
});