// ===== MENU TOGGLE =====
const toggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".links");
toggle.onclick = () => navLinks.classList.toggle("active");

// ===== SECTION SWITCH (no overlap) =====
const links = document.querySelectorAll(".links a");
const sections = document.querySelectorAll(".section");

function showSection(id) {
  // sab section hide karo
  sections.forEach(sec => sec.classList.remove("active"));
  
  // thoda delay ke sath selected section dikhana (smooth transition)
  setTimeout(() => {
    document.getElementById(id).classList.add("active");
  }, 100);
  
  // mobile menu close
  navLinks.classList.remove("active");
}

// sab link par event listener lagao
links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    showSection(targetId);
  });
});

// Default: home dikhaye
showSection("home");
