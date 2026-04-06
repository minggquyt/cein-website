export default function showSuccessAlert(message) {
    const alertSuccessModal = document.querySelector(".alert-modal-success");
    alertSuccessModal.classList.add("alert-modal-success-active");
    alertSuccessModal.innerHTML = `${message} !`;

    setTimeout(() => {
        alertSuccessModal.classList.remove("alert-modal-success-active");
    }, 3000)
}

export function showWarningAlert(message) {
    const alertWarningModal = document.querySelector(".alert-modal-warning");
    alertWarningModal.classList.add("alert-modal-warning-active");
    alertWarningModal.innerHTML = `${message} !`;

    setTimeout(() => {
        alertWarningModal.classList.remove("alert-modal-warning-active");
    }, 3000)
}

export function showDangerAlert(message) {
    const alertDangerModal = document.querySelector(".alert-modal-danger");
    alertDangerModal.classList.add("alert-modal-danger-active");
    alertDangerModal.innerHTML =   `${message} !`;

    setTimeout(() => {
        alertDangerModal.classList.remove("alert-modal-danger-active");
    }, 3000)
}