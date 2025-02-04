document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById('slider');
  const playerContainer = document.getElementById('player-container');
  const main = document.querySelector('.main');
  const toggleScoreboardBtn = document.getElementById("toggle-scoreboard-btn");
  const pointBoard = document.getElementById("point-system-board");

  // Gör pointBoard dragbar – detta gäller endast om den är unpinnad
  makeDraggable(pointBoard);

  // Slider för att justera bredden på playerContainer
  let isDragging = false;
  slider.addEventListener('mousedown', function(e) {
    isDragging = true;
    document.body.style.cursor = 'col-resize';
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const mainRect = main.getBoundingClientRect();
    let newPlayerWidth = e.clientX - mainRect.left;
    const minPlayerWidth = 100;
    const maxPlayerWidth = mainRect.width - 100;
    if (newPlayerWidth < minPlayerWidth) newPlayerWidth = minPlayerWidth;
    if (newPlayerWidth > maxPlayerWidth) newPlayerWidth = maxPlayerWidth;
    const newPlayerWidthPercent = (newPlayerWidth / mainRect.width) * 100;
    playerContainer.style.width = `${newPlayerWidthPercent}%`;
  });

  document.addEventListener('mouseup', function(e) {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = 'default';
    }
  });

  slider.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });

  // Toggle Scoreboard: Om inte pinned – flytta den in i playerContainer (och gör den statisk),
  // annars flytta den till main (absolut positionerad och draggbar).
  toggleScoreboardBtn.addEventListener("click", () => {
    if (!pointBoard.classList.contains("pinned")) {
      // PIN: Lägg scoreboarden inuti playerContainer med klassen "pinned"
      pointBoard.classList.add("pinned");
      // Gör den statisk så att den inte går att dra
      pointBoard.style.position = "static";
      playerContainer.appendChild(pointBoard);
      toggleScoreboardBtn.textContent = "Unpin Scoreboard";
    } else {
      // UNPIN: Ta bort pinned-klassen, sätt absolut positionering och flytta scoreboarden till main
      pointBoard.classList.remove("pinned");
      pointBoard.style.position = "absolute";
      pointBoard.style.top = "20px";
      pointBoard.style.right = "20px";
      main.appendChild(pointBoard);
      toggleScoreboardBtn.textContent = "Pin Scoreboard";
    }
  });

  // Enkel funktion för att göra ett element draggbart – fungerar endast om elementet INTE har klassen "pinned"
  function makeDraggable(el) {
    let offsetX = 0, offsetY = 0;
    let isDraggingEl = false;
    el.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) return; // Undvik klick på knappar
      if (el.classList.contains("pinned")) return; // Om pinned, tillåt ej drag
      isDraggingEl = true;
      offsetX = e.clientX - el.getBoundingClientRect().left;
      offsetY = e.clientY - el.getBoundingClientRect().top;
      el.style.zIndex = 1000;
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDraggingEl) return;
      el.style.left = (e.clientX - offsetX) + "px";
      el.style.top = (e.clientY - offsetY) + "px";
    });
    document.addEventListener("mouseup", () => {
      if (isDraggingEl) {
        isDraggingEl = false;
      }
    });
  }
});
