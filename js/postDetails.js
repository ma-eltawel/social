// variables
let baseUrl = 'https://tarmeezacademy.com/api/v1', logOpen = document.querySelector('#login-open'), regOpen = 
    document.querySelector('#reg-open'), profile = document.querySelector('.profile'), urlParams = 
    new URLSearchParams(window.location.search), id = urlParams.get('postId'), addCom = 
    document.querySelector('.add-com'), loader = document.querySelector('.loader');

changeProfile();

// login
document.querySelector('#login-but').onclick = () => {
    let params = {
        "username" : document.querySelector('#username').value,
        "password" : document.querySelector('#password').value
    };
    toggleLoader();
    axios.post(`${baseUrl}/login`, params)
    .then(response => {
        localStorage.token = response.data.token;
        localStorage.user = JSON.stringify(response.data.user);
        bootstrap.Modal.getInstance(document.querySelector('#loginForm')).hide();
        showAlert('Logged in successfully');
        changeProfile();
    })
    .catch(error => {
        showAlert(error.response.data.message, 'warning');
    })
    .finally(() => {
        toggleLoader(false);
    })
}

// alert
function showAlert(alertMessage, alertType = 'success') {
    const alertPlaceholder = document.getElementById('alert');
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
            wrapper.innerHTML = [
                `<div class="alert alert-${type} alert-dismissible" role="alert">
                    <div>${message}</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`
            ].join('')
            alertPlaceholder.append(wrapper);
    }
    appendAlert(alertMessage, alertType);
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance('#alert');
        //alert.close();
    }, 2000);
}

// change profile
function changeProfile() {
    if (localStorage.token == null) {
        logOpen.style.display = 'block';
        regOpen.style.display = 'block';
        profile.style.display = 'none';
        addCom.style.display = 'none';
    }
    else{
        logOpen.style.display = 'none';
        regOpen.style.display = 'none';
        profile.style.display = 'block';
        document.querySelector('.prof-image').src = showUser().profile_image;
        document.querySelector('.prof-name').innerHTML =  showUser().username;
        addCom.style.display = 'flex';
    }
}

// logout
document.querySelector('#logout-but').onclick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAlert('Logged out successfully', 'danger');
    changeProfile();
}

// register
document.querySelector('#reg-but').onclick = () => {
    let formData = new FormData;
    formData.append("name", document.querySelector('#name').value);
    formData.append("image", document.querySelector('#user-image').files[0]);
    formData.append("username", document.querySelector('#reg-username').value);
    formData.append("password", document.querySelector('#reg-password').value);
    toggleLoader();
    axios.post(`${baseUrl}/register`, formData)
    .then(response => {
        localStorage.token = response.data.token;
        localStorage.user = JSON.stringify(response.data.user);
        bootstrap.Modal.getInstance(document.querySelector('#regForm')).hide();
        showAlert('New account created successfully');
        changeProfile();
    })
    .catch(error => {
        showAlert(error.response.data.message, 'warning');
    })
    .finally(() => {
        toggleLoader(false);
    })
}

// user data
function showUser() {
    let user = null;
    if (localStorage.user != null) {
        user = JSON.parse(localStorage.user);
    }
    return user;
}

// post Details
function showPost() {
    toggleLoader();
    axios.get(`${baseUrl}/posts/${id}`)
    .then(response => {
        toggleLoader(false);
        let post = response.data.data, author = post.author, postContainer = document.querySelector('.card'),
            comContainer = '';
        document.querySelector('#post-author').innerHTML = author.name;

        for (comment of post.comments) {
            comContainer += `
                <div class="comment px-4 pt-4">
                    <div class="com-info">
                        <img src="${comment.author.profile_image}" alt="" class="rounded-circle">
                        @<b>${comment.author.username}</b>
                    </div>
                    <p>${comment.body}</p>
                </div>
            `
        }
        postContainer.innerHTML = `
            <div class="card-header d-flex align-items-center justify-content-between">
                <div class="info" style="cursor: pointer;" onclick="showInfo(${post.author.id})">
                    <img src="${author.profile_image}" alt="" class="rounded-circle border border-2">
                    @<b>${author.username}</b>
                </div>
                <div class="time">${post.created_at}</div>
            </div>
            <div class="card-body">
                <img src="${post.image}" alt="" class="w-100">
                <h4 class="my-2">${post.title != null ? post.title : 'Free Palestine'}</h4>
                <p>${post.body}</p>
                <hr>
                <div class="bottom d-flex justify-content-between">
                    <div class="react">
                        <i class="fas fa-comments"></i>
                        <span>(${post.comments_count}) Comments</span>
                    </div>
                    <div class="tags-${post.id}">
                        <button class="btn btn-sm rounded-5"></button>
                    </div>
                </div>
            </div>
            <div class="comments">
                ${comContainer}
            </div>
            <div class="add-com input-group">
                <input type="text" placeholder="add your comment here.." class="form-control mx-2">
                <button class="btn btn-outline-primary" onclick="saveCom()">Send <i class="fas fa-paper-plane"></i></button>
            </div>
            `
    })
}
showPost();

// add comment
function saveCom() {
    let params = {
        "body": document.querySelector('.add-com input').value
    }
    let headers = {
        "authorization": `Bearer ${localStorage.token}`
    }
    toggleLoader();
    axios.post(`${baseUrl}/posts/${id}/comments`, params, {
        headers: headers
    })
    .then(response => {
        showAlert('Comment added successfully');
        showPost();
    })
    .catch(error => {
        showAlert(error.response.data.message, 'danger');
    })
    .finally(() => {
        toggleLoader(false);
    })
}

// user info
function showInfo(userId) {
    window.location = `profile.html?userid=${userId}`;
}

function myProfile() {
    window.location = `profile.html?userid=${showUser().id}`;
}

// control loading
function toggleLoader(show = true) {
    if (show) {
        loader.style.visibility = 'visible';   
    }
    else {
        loader.style.visibility = 'hidden'; 
    }
}