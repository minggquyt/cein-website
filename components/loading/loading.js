export default function showLoading(){
    const alertLoadingModal = document.querySelector('.alert-loading-modal');
    alertLoadingModal.classList.add("active-alert-loading-modal");
}

export function hideLoading(){
    const alertLoadingModal = document.querySelector('.alert-loading-modal');
    alertLoadingModal.classList.remove("active-alert-loading-modal");
}