// variables
let baseUrl = 'https://tarmeezacademy.com/api/v1', nowPage = 1, lastPage = 1, logOpen = 
    document.querySelector('#login-open'), regOpen = document.querySelector('#reg-open'), profile = 
    document.querySelector('.profile'), addBut = document.querySelector('.add-but'), loader = 
    document.querySelector('.loader');

// show all posts
window.onscroll = () => {
    let pageEnd = window.innerHeight + window.scrollY >= document.body.scrollHeight;
    if (pageEnd && nowPage < lastPage) {
        showPosts(false, nowPage++);
    }
}
function showPosts(reload = true, page = 1) {
    toggleLoader();
    axios.get(`${baseUrl}/posts?limit=4&page=${page}`)
    .then(response => {
        toggleLoader(false);
        let posts = response.data.data, postContainer = document.querySelector('#posts');
        lastPage = response.data.meta.last_page;
        if (reload) {
            postContainer.innerHTML = '';
        }
        for(post of posts){
            let myPost = showUser() != null && post.author.id == showUser().id;
            postContainer.innerHTML += `
                <div class="card mb-4 shadow">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <div class="info" style="cursor: pointer;" onclick="showInfo(${post.author.id})">
                            <img src="${post.author.profile_image}" alt="" class="rounded-circle border border-2">
                            @<b>${post.author.username}</b>
                        </div>
                        <div class="time">${post.created_at}</div>
                    </div>
                    <div class="card-body" style="cursor: pointer;">
                        <img src="${post.image}" alt="" class="w-100" onclick="postDEt(${post.id})">
                        <div class="title d-flex align-items-center justify-content-between my-3">
                            <h4 onclick="postDEt(${post.id})">${post.title != null ? post.title : 'Free Palestine'}</h4>
                            ${myPost ? `
                                <div class="post-icon">
                                    <button class="btn btn-secondary" onclick="editPost('${encodeURIComponent(JSON.stringify(post))}')">Edit <i class="fas fa-pencil"></i></button>
                                    <button class="btn btn-danger" onclick="delPost(${post.id})">Delete <i class="fas fa-trash-can"></i></button>
                                </div>
                            ` : ''}
                        </div>
                        <p onclick="postDEt(${post.id})">${post.body}</p>
                        <hr>
                        <div class="bottom d-flex justify-content-between" onclick="postDEt(${post.id})">
                            <div class="react">
                                <i class="fas fa-comments"></i>
                                <span>(${post.comments_count}) Comments</span>
                            </div>
                            <div class="tags-${post.id}">
                                <button class="btn btn-sm rounded-5"></button>
                            </div>
                        </div>
                    </div>
                </div>
            `
            let postClass = `.tags-${post.id}`,  postTag = document.querySelector(postClass);
            postTag.innerHTML = '';
            for (tag of post.tags) {
                postTag.innerHTML += `
                    <button class="btn btn-sm rounded-5">${tag.name}</button>
                `
            }
        }
    })
}
showPosts();
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
        showPosts();
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
        if (addBut != null) {
            addBut.style.display = 'none';   
        }
    }
    else{
        logOpen.style.display = 'none';
        regOpen.style.display = 'none';
        profile.style.display = 'block';
        document.querySelector('.prof-image').src = showUser().profile_image;
        document.querySelector('.prof-name').innerHTML =  showUser().username;
        if (addBut != null) {
            addBut.style.display = 'flex';   
        }
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
        showPosts();
    })
    .catch(error => {
        showAlert(error.response.data.message, 'warning');
    })
    .finally(() => {
        toggleLoader(false);
    })
}

// creat post
if (addBut != null) {
    addBut.onclick = () => {
        document.querySelector('#postMod-tit').innerHTML = 'Add a New Post';
        document.querySelector('#title').value = '';
        document.querySelector('#body').value = '';
        document.querySelector('#is-edit').value = '';
    }

    document.querySelector('#save-but').onclick = () => {
        let postId = document.querySelector('#is-edit').value, isCreat = postId == null || postId == '', 
            formData = new FormData;

        formData.append("title", document.querySelector('#title').value);
        formData.append("body", document.querySelector('#body').value);
        formData.append("image", document.querySelector('#post-image').files[0]);
        let headers = {
            "authorization": `Bearer ${localStorage.token}`
        }
        toggleLoader();
        if (isCreat) {
            axios.post(`${baseUrl}/posts`, formData, {
                headers: headers
            })
            .then(response => {
                bootstrap.Modal.getInstance(document.querySelector('#addForm')).hide();
                showPosts();
                showAlert('Post added successfully');
            })
            .catch(error => {
                showAlert(error.response.data.message, 'warning');
            })   
            .finally(() => {
                toggleLoader(false);
            })
        }
        else {
            formData.append("_method", "put");
            axios.post(`${baseUrl}/posts/${postId}`, formData, {
                headers: headers
            })
            .then(response => {
                toggleLoader(false);
                bootstrap.Modal.getInstance(document.querySelector('#addForm')).hide();
                showPosts();
                showAlert('Post edited successfully');
            })
            .catch(error => {
                showAlert(error.response.data.message, 'danger');
            })
            .finally(() => {
                toggleLoader(false);
            })
        }
    }   
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
function postDEt(postId) {
    window.location = `post-details.html?postId=${postId}`;
}

// edit post
function editPost(postObj) {
    let post = JSON.parse(decodeURIComponent(postObj)), postModal = new bootstrap.Modal(document.querySelector('#addForm'), {});
    document.querySelector('#postMod-tit').innerHTML = 'Edit post';
    document.querySelector('#title').value = post.title;
    document.querySelector('#body').value = post.body;
    document.querySelector('#is-edit').value = post.id;
    postModal.toggle();
}

// delete post
function delPost(id) {
    let postModal = new bootstrap.Modal(document.querySelector('#delForm'), {});
    postModal.toggle();
    document.querySelector('#del-id').value = id;
}

document.querySelector('#del-but').onclick = () => {
    let postId = document.querySelector('#del-id').value;
    let headers = {
        "authorization": `Bearer ${localStorage.token}`
    }
    toggleLoader();
    axios.delete(`${baseUrl}/posts/${postId}`, {
        headers: headers
    })
    .then(response => {
        bootstrap.Modal.getInstance(document.querySelector('#delForm')).hide();
        showAlert('Post deleted successfully', 'danger');
        showPosts();
    })
    .catch(error => {
        showAlert(error.response.data.message, 'warning');
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