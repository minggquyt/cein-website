import { postRegisterData } from "../../services/postData.js";

const submitButton = document.querySelector("button");

submitButton.addEventListener('click', (e) => {
    e.preventDefault();

    const inputs = document.querySelectorAll("input");

    let useremail = null;
    let username = null;
    let password = null;

    inputs.forEach(input => {
        if(input.name == "useremail")
            useremail = input.value;
        else if(input.name == "username")
            username = input.value;
        else if(input.name == "password")
            username = input.value;
    })

    postRegisterData(useremail,username,password)


})