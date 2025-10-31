const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const themeToggle = document.getElementById("theme-toggle");
const sections = document.querySelectorAll(".section");

menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});
themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = link.dataset.target;
    sections.forEach(s => s.classList.remove("active"));
    document.getElementById(target)?.classList.add("active");
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    navLinks.classList.remove("show");
  });
});

// -------- Upload + Fetch + Delete ----------
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const clearBtn = document.getElementById("clearSelection");
const clientPreview = document.getElementById("clientPreview");

let selectedFiles = [];

fileInput?.addEventListener("change", (e) => {
  clientPreview.innerHTML = "";
  selectedFiles = Array.from(e.target.files);
  selectedFiles.forEach(f => {
    const url = URL.createObjectURL(f);
    if (f.type.startsWith("image/")) {
      const img = document.createElement("img"); img.src = url; clientPreview.appendChild(img);
    } else if (f.type.startsWith("video/")) {
      const v = document.createElement("video"); v.src = url; v.controls = true; v.width = 160;
      clientPreview.appendChild(v);
    } else if (f.type.startsWith("audio/")) {
      const a = document.createElement("audio"); a.src = url; a.controls = true;
      clientPreview.appendChild(a);
    }
  });
});

clearBtn?.addEventListener("click", () => {
  fileInput.value = "";
  clientPreview.innerHTML = "";
  selectedFiles = [];
});

uploadBtn?.addEventListener("click", async () => {
  if (!selectedFiles.length) return alert("Select files first!");
  const fd = new FormData();
  selectedFiles.forEach(f => fd.append("files", f));
  uploadBtn.disabled = true; uploadBtn.textContent = "Uploading...";
  try {
    const res = await fetch("/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) loadFiles();
  } catch {
    alert("Upload failed!");
  } finally {
    uploadBtn.disabled = false; uploadBtn.textContent = "Upload";
  }
});

async function loadFiles() {
  const res = await fetch("/files");
  const json = await res.json();
  render("imagesGrid", json.images, "image");
  render("videosGrid", json.videos, "video");
  render("audioGrid", json.audios, "audio");
}

function render(containerId, items, type) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = "";
  items.forEach(it => {
    const card = document.createElement("div");
    card.className = "card";
    if (type === "image") {
      const img = document.createElement("img"); img.src = it.url; card.appendChild(img);
    } else if (type === "video") {
      const v = document.createElement("video"); v.src = it.url; v.controls = true; card.appendChild(v);
    } else {
      const a = document.createElement("audio"); a.src = it.url; a.controls = true; card.appendChild(a);
    }
    const del = document.createElement("button");
    del.className = "icon-btn"; del.textContent = "🗑️";
    del.onclick = async () => {
      if (!confirm("Delete this file?")) return;
      await fetch("/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: it.url }) });
      loadFiles();
    };
    card.appendChild(del);
    wrap.appendChild(card);
  });
}

loadFiles();
