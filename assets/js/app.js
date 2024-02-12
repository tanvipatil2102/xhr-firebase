let cl = console.log;

const postContainer = document.getElementById("postContainer");
const titleControl = document.getElementById("title");
const contentControl = document.getElementById("content");
const addPostBtn = document.getElementById("addPostBtn");
const updatePostBtn = document.getElementById("updatePostBtn");
const postsForm = document.getElementById("postsForm");
const userId = document.getElementById("userId");
const loader = document.getElementById("loader");



let baseUrl = `https://xhr-firebase-default-rtdb.asia-southeast1.firebasedatabase.app`;

let postsUrl = `${baseUrl}/posts.json`;

const onDeleteBtn = (eve) => {
    let getId = eve.closest(".card").id;
    let deleteUrl = `${baseUrl}/posts/${getId}.json`;
    makeApiCall("DELETE", deleteUrl)
        .then(res => {
            let card = document.getElementById(getId);
            Swal.fire({
                title: "Are you sure?",
                text: "You want to delete this post!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
              }).then((result) => {
                if (result.isConfirmed) {
                    card.remove();
                  Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                  });
                }
            });
        })
        .catch(err => cl(err))
        .finally(()=> {
            loader.classList.add("d-none");
        })
        

}

const onEditBtn = (eve) => {
    let getId = eve.closest(".card").id;
    let editUrl = `${baseUrl}/posts/${getId}.json`;
    localStorage.setItem("editId", getId);
    let getScrollValue = window.scrollY;
    if(getScrollValue > 150){
        window.scrollTo(0,0);
    }
    makeApiCall("GET", editUrl)
        .then(res => {
            let obj = JSON.parse(res);
            titleControl.value = obj.title;
            contentControl.value = obj.content;
            userId.value = obj.userId;
            updatePostBtn.classList.remove("d-none");
            addPostBtn.classList.add("d-none")
        })
        .catch(err => cl(err))
        .finally(()=> {
            loader.classList.add("d-none");
        })
        
}


const makeApiCall = (method, apiURL, msgBody = null) => {
    return new Promise((resolve, reject) => {
        loader.classList.remove("d-none");
        let xhr = new XMLHttpRequest();

        xhr.open(method, apiURL);

        xhr.send(JSON.stringify(msgBody));

        xhr.onload = function(){
            if(xhr.status >= 200 && xhr.status < 300){
                resolve(xhr.response);
            }else{
                reject(`Something went wrong !!!`)
            }
        }
    })
}


const createCards = (arr) => {
    postContainer.innerHTML = arr.map(obj => {
        return `
        <div class="card mb-4 text-capitalize" id ="${obj.id}">
            <div class="card-header">
                 <h4 class="m-0">${obj.title}</h4>
            </div>
            <div class="card-body">
                    <p class="m-0">${obj.content}</p>
                    </div>
            <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-primary" onclick="onEditBtn(this)">Edit</button>
                <button class="btn btn-danger" onclick="onDeleteBtn(this)">Delete</button>
            </div>
        </div>
        `
    }).join("");
}

makeApiCall("GET", postsUrl)
    .then(res => {
        let object = JSON.parse(res);
        let postsArr = [];
        for (const key in object) {
            let obj = {...object[key], id : key};
            postsArr.push(obj);
            createCards(postsArr);
        }
    })
    .catch(err => cl(err))
    .finally(()=> {
        loader.classList.add("d-none");
    })
    




const sendDataInDB = (eve) => {
    eve.preventDefault();
    let obj = {
        title : titleControl.value,
        content : contentControl.value,
        userId : userId.value
    }
    makeApiCall("POST", postsUrl, obj)
        .then(res => {
            obj.id = res;
            let card = document.createElement("div");
            card.className = "card mb-4 text-capitalize";
            card.id = obj.id;
            card.innerHTML = `
            <div class="card-header">
                <h4 class="m-0">${obj.title}</h4>
            </div>
            <div class="card-body">
                    <p class="m-0">${obj.content}</p>
            </div>
            <div class="card-footer d-flex justify-content-between">
                <button class="btn btn-primary" onclick="onEditBtn(this)">Edit</button>
                <button class="btn btn-danger" onclick="onDeleteBtn(this)">Delete</button>
            </div>
            `
            postContainer.prepend(card);
            Swal.fire({
                title : "Post Added Successfully !!",
                icon : "success"
            })
        })
        .catch(err => cl(err))
        .finally(()=> {
            postsForm.reset();
            loader.classList.add("d-none");
        })
}

const onUpdateHandler = (eve) => {
    let getId = localStorage.getItem("editId");
    let card = [...document.getElementById(getId).children];
    cl(card);
    let updateUrl = `${baseUrl}/posts/${getId}.json`;
    let obj = {
        title : titleControl.value,
        content : contentControl.value,
        userId : userId.value
    }
    makeApiCall("PATCH", updateUrl, obj)
        .then(res => {
            let response = JSON.parse(res);
            card[0].innerHTML = `<h4 class="m-0">${response.title}</h4>`
            card[1].innerHTML = `<p class="m-0">${response.content}</p>`
            Swal.fire({
                title : "Post Updated Successfully !!",
                icon : "success"
            })
        })
        .catch(err => cl(err))
        .finally(()=> {
            loader.classList.add("d-none");
        })
        
}

postsForm.addEventListener("submit", sendDataInDB);
updatePostBtn.addEventListener("click", onUpdateHandler);