console.log("BEYOND‑OS is running");

document.addEventListener("DOMContentLoaded", () => {
    const boot = document.getElementById("boot-screen");

    setTimeout(() => {
        boot.innerHTML = "<h1>System Ready</h1><p>Welcome, Gavin.</p>";
    }, 1500);
});
