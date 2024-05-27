const dropZone=document.querySelector(".drop-zone");
const browseBtn=document.querySelector(".browseBtn");
const fileInput=document.querySelector("#fileInput");

const progressContainer=document.querySelector(".progress-container");
const bgProgress=document.querySelector(".bg-progress");
const percentDiv=document.querySelector("#percent");
const progressBar=document.querySelector(".progress-bar");


const sharingContainer=document.querySelector(".sharing-container")
const fileURL=document.querySelector("#fileURL");
const copyBtn=document.querySelector("#copyBtn");

const emailForm=document.querySelector("#emailForm")


const toast=document.querySelector(".toast");

const host="https://file-sharing-mmqq.onrender.com/"
//const host = "http://127.0.0.1:10000/"
const uploadURL=`${host}api/files`
const emailURL=`${host}api/files/send`
//console.log(`emailURL= ${emailURL}`);
//const uploadURL=`${host}+api/files`

const maxAllowedSize=100*1024*1024;//100mb


dropZone.addEventListener("dragover",(e)=>{
    e.preventDefault()

    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged")
    }
});

dropZone.addEventListener("dragleave",()=>{
    dropZone.classList.remove("dragged")
})

dropZone.addEventListener("drop",(e)=>{
    e.preventDefault()
    dropZone.classList.remove("dragged");
    const files=e.dataTransfer.files
    console.log(e)
    if(files.length){
        fileInput.files=files;
        uploadFile();
    }
    
    
})

//if there is any chg in the input file then we will file the the upload event
fileInput.addEventListener("change",()=>{
    uploadFile();
})

browseBtn.addEventListener("click",()=>{
    fileInput.click();
})

copyBtn.addEventListener("click",()=>{
    fileURL.select()
    navigator.clipboard.writeText(fileURL.value);
    showToast("copied to the clipboard");
})

const resetFileInput=()=>{
    fileInput.value="";
}

const uploadFile=()=>{
    
    if(fileInput.files.length>1){
        resetFileInput();
        showToast("only upload 1 file!");
        return;
    }
    
    progressContainer.style.display="block";

    const files=fileInput.files[0]; 

    if(files.size>maxAllowedSize){
        resetFileInput();
        showToast("can't upload more than 100MB");
        return;
    }
    //gets the first file from an HTML file input that the user has selected
    const formData=new FormData()
    //FormData is a special object in JavaScript that allows you to construct key/value pairs to send via an HTTP request, typically when uploading files.
    formData.append("myFile",files)

//XMLHttpRequest is a built-in browser object that allows you to make HTTP requests in JavaScript.
    const xhr=new XMLHttpRequest();
//xhr.readyState represents the state of the request (e.g., unsent, opened, headers received, loading, done).
//XMLHttpRequest.DONE is a constant with a value of 4, meaning the operation is complete.
xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                showLink(response);
            } catch (e) {
                console.error('Failed to parse response:', e);
            }
        } else {
            console.error('Upload failed:', xhr.statusText);
        }
    }
};

xhr.upload.onprogress = updateProgress;
//if the file fails to upload then the following alert will be displayed and the input field=empty
xhr.upload.onerror=()=>{
    fileInput.value="";
    showToast(`failed to upload: ${xhr.statusText}`);
}

xhr.open("POST", uploadURL);
xhr.send(formData);
};

const updateProgress=(e)=>{
    const percent=Math.round((e.loaded/e.total)*100)
    //monitor progress
    //console.log(percent);
    bgProgress.style.width=`${percent}%`
    percentDiv.innerText=`${percent}`;
    progressBar.style.transform=`scaleX(${percent/100})`
}

const showLink=({files:url})=>{
    console.log(url);
    fileInput.value=""
    emailForm[2].removeAttribute("disabled","true");
    progressContainer.style.display="none";
    sharingContainer.style.display="block";
    fileURL.value=url;
}

emailForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    console.log("submit form");


    const url=fileURL.value;
    console.log("url ",url);

// Extract UUID from URL
// const uuidMatch = url.split("/").pop().match(/[a-f0-9-]+/i);
// const uuid = uuidMatch ? uuidMatch[0] : '';

    const formData={
        uuid: url.split("/").pop().match(/[a-f0-9-]+/i)[0],
        emailTo:emailForm.elements["to-email"].value,
        emailFrom:emailForm.elements["from-email"].value
    };

    console.log(formData);

    emailForm.querySelector("button[type='submit']").setAttribute("disabled", "true");


     fetch(emailURL,{
        method:"POST",
        headers:{
            "content-type":"application/json",
        },
        body:JSON.stringify(formData)
        
     }) 
     .then((res)=>res.json())
     .then((response) => {
        console.log('Response:', response);  // Log the entire response body here
        if (response) {
            sharingContainer.style.display = "none";
            showToast("Email Sent");
        } else {
            console.error('Email sending failed:', response.error);
            emailForm.querySelector("button[type='submit']").removeAttribute("disabled");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        emailForm.querySelector("button[type='submit']").removeAttribute("disabled");
    });
});


let toastTimer;
const showToast=(msg)=>{
    toast.innerText=msg;
    toast.style.transform="translate(-50%,0)";
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>{
        toast.style.transform="translate(-50%,60px)";
    },2000);
}