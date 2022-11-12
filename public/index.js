const socket = io();

const submitButton = document.querySelector("form")
const productsContainer = document.querySelector("#productsContainer")
const chatButton = document.querySelector("#chatButton")
const chatPopover = document.querySelector("#popover")
const closeChatButton = document.querySelector("#closeChatButton")
const accountForm = document.querySelector("#accountForm")
const accountFormContainer = document.querySelector("#registerForm")
const chat = document.querySelector("#chat")
const chatProfilePicture = document.querySelector("#chatProfilePicture")
const chatUsername = document.querySelector("#chatUsername")
const messagesContainer = document.querySelector("#messagesContainer")
const sendMessageButton = document.querySelector("#sendMessageButton")

let username
let imageURL

const createAccount = (event) => {
    event.preventDefault()
    username = document.querySelector("#accountForm #name").value
    imageURL = document.querySelector("#accountForm #profileImage").value
    chatProfilePicture.src = imageURL
    chatUsername.innerHTML = `<p>${username}</p>`
    loadMessages()
    accountFormContainer.classList.add("hidden")
    chat.classList.remove("hidden")
} 

const createMessage = ({username, profile_picture, message, datestamp}, isCurrentUser) => {
    console.log(isCurrentUser)
    const messageContainer = document.createElement("div")
    let messageStyles, messageDirection
    isCurrentUser 
    ? messageStyles = "rounded-br-none bg-blue-600 text-white"
    : messageStyles = "rounded-bl-none bg-gray-300 text-gray-600"
    isCurrentUser 
    ? messageDirection = ""
    : messageDirection = "flex-row-reverse"

    messageContainer.innerHTML = `
        <div class="flex items-end justify-end ${messageDirection}">
            <div class="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
                <div>
                    <span class="px-4 py-2 rounded-lg inline-block ${messageStyles}">
                        <span class="block"><b class="mr-1">${username}</b>${datestamp}</span>
                        ${message}
                    </span>
                </div>
            </div>
            <img src="${profile_picture}" alt="My profile" class="w-6 h-6 rounded-full order-2 object-cover">
        </div>
    `
   return messageContainer
}

const loadMessages = async () => {
    const res = await fetch("/messages")
    const data = await res.json()
    if (data.length > 0) {
        loadMessage(data)
    }
}

const loadMessage = (messages) => {
    const messagesArray = messages.map( message => createMessage(message, Boolean(message.username === username)))
    messagesContainer.append(...messagesArray)
}

sendMessageButton.addEventListener("click", () => {
    const messageText = document.querySelector("#messageInput")
    if (messageText.value.length > 0) {
        socket.emit("messageAdded", {
            username: username,
            message: messageText.value,
            profile_picture: imageURL,
            datestamp: Date.now()
        })
    }
    messageText.value = ""
})

accountForm.addEventListener("submit", createAccount)

chatButton.addEventListener("click", () => {
    chatButton.classList.add("hidden")
    chatPopover.classList.remove("hidden")
    document.querySelector("body").classList.add("overflow-hidden")
})

closeChatButton.addEventListener("click", () => {
    chatPopover.classList.add("hidden")
    chatButton.classList.remove("hidden")
    document.querySelector("body").classList.remove("overflow-hidden")
})

const deleteProduct = async (id) => {
    const product = document.querySelector(`#product${id}`)
    const res = await fetch(`/products/${id}`, {
        method: "DELETE"
    })
    if (res.status === 200) {
        product.remove()
    }
}

const createProduct = ({title, image, price, id}) => {
    const productImage = document.createElement("img")
    productImage.src = image
    productImage.className = "h-40 w-full object-cover rounded-2xl"

    const buttonIcon = `
        <svg class="w-full h-full" fill="#fff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/>
        </svg> 
    `
    const buttonContainer = document.createElement("div")
    buttonContainer.className = "flex justify-end"
    const button = document.createElement("button")
    button.className = "w-8 h-8 p-2 rounded-full bg-slate-400 flex items-center justify-center"
    button.addEventListener("click", () => socket.emit("productDeleted", id))
    button.innerHTML = buttonIcon
    buttonContainer.append(button)

    const productTitle = document.createElement("h2")
    productTitle.className = "text-xl font-semibold px-4"
    const titleText = document.createTextNode(title)
    productTitle.append(titleText)

    const productPrice = document.createElement("h2")
    productPrice.className = "px-4"
    const priceText = document.createTextNode(`$${price}`)
    productPrice.append(priceText)
        
    const productDescription = document.createElement("div")
    productDescription.append(buttonContainer, productTitle, productPrice)
    
    const productContainer = document.createElement("div")
    productContainer.className = "bg-white grid grid-cols-2 hover:shadow-2xl rounded-2xl overflow-hidden duration-150 cursor-pointer" 
    productContainer.append(productImage, productDescription)
    productContainer.id = `product${id}`

    return productContainer
}

const onClickButton = async (event) => {
    event.preventDefault()

    const productData = {
        title: document.querySelector("#title").value,
        price: parseInt(document.querySelector("#price").value),
        image: document.querySelector("#image").value
    }

    const res = await fetch("/products", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(productData)
    })

    const product = await res.json()

    if (product.id) {
        socket.emit("productAdded", product)
    }
}

const getProducts = async () => {
    const res = await fetch("/products")
    const data = await res.json()
    const elementsArray = data.map(product => createProduct(product))
    productsContainer.append(...elementsArray)
}

getProducts()


submitButton.addEventListener("submit",  onClickButton)

socket.on("addProduct", product => productsContainer.append(createProduct(product)))
socket.on("deleteProduct", id => deleteProduct(id))
socket.on("addMessage", message => loadMessage(message))

