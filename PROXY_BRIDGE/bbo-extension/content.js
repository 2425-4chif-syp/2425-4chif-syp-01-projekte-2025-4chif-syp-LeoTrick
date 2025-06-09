function starteKartenscanner() {
  const overlay = erzeugeOverlay();
  const bekannteQuellen = new Set();

  setInterval(() => {
    const karten = document.querySelectorAll("img.gwt-Image");
    karten.forEach(img => {
      const src = img.src;
      if (!bekannteQuellen.has(src)) {
        bekannteQuellen.add(src);

        const clone = img.cloneNode();
        clone.style.width = "40px";
        clone.style.margin = "4px";
        overlay.appendChild(clone);
      }
    });
  }, 500);
}

function erzeugeOverlay() {
  let box = document.getElementById("karten-overlay");
  if (!box) {
    box = document.createElement("div");
    box.id = "karten-overlay";
    box.className = "karten-box";
    box.innerHTML = "<b>Gespielte Karten:</b><br>";
    document.body.appendChild(box);
  }
  return box;
}

window.addEventListener("load", () => {
  setTimeout(starteKartenscanner, 3000);
});
