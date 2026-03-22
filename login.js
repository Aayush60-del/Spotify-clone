const { createClient } = supabase

const supabaseUrl = 'https://nwqrllqgiagahnooefgu.supabase.co'
const supabaseKey = 'sb_publishable_jfUKvzvC7RGHs9gqlVS_lQ_3a4sKHej'

const client = createClient(supabaseUrl, supabaseKey)



document.getElementById("loginBtn").addEventListener("click", async () => {
    let email = document.getElementById("emailInput").value.trim()
    let pass = document.getElementById("passInput").value.trim()
    let error = document.getElementById("errorMsg")

    if (email === "" || pass === "") {
        error.textContent = "⚠️ Please fill in all fields."
        error.classList.add("show")
        return
    }

    if (pass.length < 6) {
        error.textContent = "⚠️ Password minimum 6 characters hona chahiye!"
        error.classList.add("show")
        return
    }

    const { data, error: authError } = await client.auth.signInWithPassword({
        email: email,
        password: pass
    })


    if (authError) {
        error.textContent = "❌ " + authError.message
        error.classList.add("show")
    } else {
        window.location.replace("index.html")
    }
})

document.getElementById("signupBtn").addEventListener("click", async () => {
    let email = document.getElementById("emailInput").value.trim()
    let pass  = document.getElementById("passInput").value.trim()
    let error = document.getElementById("errorMsg")

    if (email === "" || pass === "") {
        error.textContent = "⚠️ Please fill in all fields."
        error.classList.add("show")
        return
    }

    if (pass.length < 6) {
        error.textContent = "⚠️ Password minimum 6 characters hona chahiye!"
        error.classList.add("show")
        return
    }

    const { data, error: authError } = await client.auth.signUp({
        email: email,
        password: pass
    })

    if (authError) {
        error.textContent = "❌ " + authError.message
        error.classList.add("show")
    } else {
        window.location.replace("index.html")
    }
})