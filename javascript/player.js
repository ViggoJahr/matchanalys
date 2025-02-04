document.addEventListener("DOMContentLoaded", () => {
  let selectedPlayer = null;      // Det klickade spelarkortet (DOM-element)
  let activePointButton = null;   // Den aktiva knappen i point-system board

  const playerContainer = document.getElementById("player-container");

  function createPlayerCard(name) {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <h3>${name} <span class="point-count score-badge">Score: 0</span></h3>
      <div class="stat" data-type="goal">
        <div class="stat-text">Mål: <span class="count">0</span></div>
      </div>
      <div class="stat" data-type="assist">
        <div class="stat-text">Assist: <span class="count">0</span></div>
      </div>
      <div class="stat" data-type="missed-shot">
        <div class="stat-text">Missat skott: <span class="count">0</span></div>
      </div>
      <div class="stat" data-type="teknisk">
        <div class="stat-text">Tekniska fel: <span class="count">0</span></div>
      </div>
      <div class="stat" data-type="steal">
        <div class="stat-text">Steals: <span class="count">0</span></div>
      </div>
    `;
    card.addEventListener("click", () => {
      if (selectedPlayer === card) {
        card.classList.remove("selected");
        selectedPlayer = null;
      } else {
        if (selectedPlayer) {
          selectedPlayer.classList.remove("selected");
        }
        selectedPlayer = card;
        card.classList.add("selected");
        if (activePointButton) {
          applyPointAction(activePointButton, selectedPlayer);
          activePointButton.classList.remove("active");
          activePointButton = null;
          selectedPlayer.classList.remove("selected");
          selectedPlayer = null;
        }
      }
    });
    return card;
  }

  if (!playerContainer.children.length) {
    const sampleCard = createPlayerCard("Spelare 1");
    playerContainer.appendChild(sampleCard);
  }

  const pointBoard = document.getElementById("point-system-board");
  const pointButtons = pointBoard.querySelectorAll("button");
  pointButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (activePointButton && activePointButton !== btn) {
        activePointButton.classList.remove("active");
      }
      if (btn.classList.contains("active")) {
        if (selectedPlayer) {
          applyPointAction(btn, selectedPlayer);
          btn.classList.remove("active");
          activePointButton = null;
          selectedPlayer.classList.remove("selected");
          selectedPlayer = null;
        } else {
          btn.classList.remove("active");
          activePointButton = null;
        }
      } else {
        btn.classList.add("active");
        activePointButton = btn;
        if (selectedPlayer) {
          applyPointAction(btn, selectedPlayer);
          btn.classList.remove("active");
          activePointButton = null;
          selectedPlayer.classList.remove("selected");
          selectedPlayer = null;
        }
      }
    });
  });

  function applyPointAction(btn, card) {
    const statType = btn.getAttribute("data-type");
    const isAdd = btn.classList.contains("add");
    const statCountEl = card.querySelector(`.stat[data-type="${statType}"] .count`);
    let count = parseInt(statCountEl.textContent, 10);
    if (isAdd) {
      count++;
    } else {
      if (count > 0) count--;
    }
    statCountEl.textContent = count;
    updateScore(card);
  }

  function updateScore(card) {
    let score = 0;
    card.querySelectorAll('.stat').forEach(stat => {
      const type = stat.getAttribute('data-type');
      const count = parseInt(stat.querySelector('.count').textContent, 10);
      if (type === 'goal' || type === 'assist' || type === 'steal') {
        score += count;
      }
      if (type === 'missed-shot' || type === 'teknisk') {
        score -= count;
      }
    });
    const scoreBadge = card.querySelector('.point-count');
    scoreBadge.textContent = 'Score: ' + score;
  }

  document.getElementById("add-players-btn").addEventListener("click", () => {
    const input = prompt("Klistra in en lista med spelarnamn, separerade med komma, semikolon, punkt eller radbrytning:");
    if (input) {
      const names = input.split(/[,.;\n]+/).map(name => name.trim()).filter(name => name.length > 0);
      names.forEach(name => {
        const newCard = createPlayerCard(name);
        playerContainer.appendChild(newCard);
      });
    }
  });
});
