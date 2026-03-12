document.getElementById("loginBtn").addEventListener("click", () => {
    let email = document.getElementById("emailInput").value.trim()
    let pass  = document.getElementById("passInput").value.trim()
    let error = document.getElementById("errorMsg")

    if (email === "" || pass === "") {
        error.textContent = "⚠️ Please fill in all fields."
        error.classList.add("show")
        return
    }

    window.location.replace("index.html")
})

document.addEventListener("keydown", (e) => {
    if (e.code === "Enter") {
        document.getElementById("loginBtn").click()
    }
})
