document.addEventListener("DOMContentLoaded", () => {
  // ============== 1) SELECT DOM ELEMENTS ==============
  const zoneElements = document.querySelectorAll(".zone");
  const shotButtons = document.querySelectorAll(".shot-btn");
  const keeperButtons = document.querySelectorAll(".keeper-btn");

  const keeper1TotalsEl = document.getElementById("keeper1-totals");
  const keeper1Last10El = document.getElementById("keeper1-last10");
  const keeper2TotalsEl = document.getElementById("keeper2-totals");
  const keeper2Last10El = document.getElementById("keeper2-last10");
  
  // Ny: Hämta knappen för att lägga till målvakter
  const addKeeperBtn = document.getElementById("add-keeper-btn");

  // ============== 2) ACTIVE SELECTIONS ==============
  let activeKeeperId = null;  
  let activeZoneId   = null;  
  let activeShot     = null;  

  // ============== 3) DATA STRUCTURES ==============
  const keepers = {
    keeper1: {
      name: "Målvakt 1",  // Standardnamn
      totalShots: 0,
      savedShots: 0,
      lastShots: [] 
    },
    keeper2: {
      name: "Målvakt 2",  // Standardnamn
      totalShots: 0,
      savedShots: 0,
      lastShots: []
    }
  };

  const zoneStats = {
    "court-left":       { goals: 0, total: 0 },
    "court-middle":     { goals: 0, total: 0 },
    "court-right":      { goals: 0, total: 0 },
    "nine-meter-left":  { goals: 0, total: 0 },
    "nine-meter-middle":{ goals: 0, total: 0 },
    "nine-meter-right": { goals: 0, total: 0 },
    "six-meter-left":   { goals: 0, total: 0 },
    "six-meter-middle": { goals: 0, total: 0 },
    "six-meter-right":  { goals: 0, total: 0 }
  };

  // ============== 4) EVENT LISTENERS ==============
  keeperButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (activeKeeperId) {
        document.getElementById(activeKeeperId).classList.remove("active");
      }
      activeKeeperId = btn.id;
      btn.classList.add("active");
      attemptRegisterShot();
    });
  });

  zoneElements.forEach(zoneEl => {
    zoneEl.addEventListener("click", () => {
      if (activeZoneId && activeZoneId !== zoneEl.id) {
        document.getElementById(activeZoneId).classList.remove("active");
      }
      activeZoneId = zoneEl.id;
      zoneEl.classList.add("active");
      attemptRegisterShot();
    });
  });

  shotButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (activeShot && activeShot !== btn.dataset.shot) {
        const oldBtn = [...shotButtons].find(b => b.dataset.shot === activeShot);
        if (oldBtn) oldBtn.classList.remove("active");
      }
      activeShot = btn.dataset.shot;
      btn.classList.add("active");
      attemptRegisterShot();
    });
  });

  // NY: Lägg till lyssnare för "Add Keeper"-knappen
  addKeeperBtn.addEventListener("click", () => {
    // Exempel: Be användaren skriva in två namn separerade med komma
    const input = prompt("Ange två målvaktsnamn, separerade med komma (ex: Erik, Anna):");
    if (input) {
      const names = input.split(/[,]+/).map(n => n.trim()).filter(n => n.length > 0);
      if (names.length >= 2) {
        // Uppdatera keeper-objektet
        keepers.keeper1.name = names[0];
        keepers.keeper2.name = names[1];
        // Uppdatera knapptexten
        document.getElementById("keeper1").textContent = names[0];
        document.getElementById("keeper2").textContent = names[1];
      } else {
        alert("Du måste ange minst två namn separerade med ett komma.");
      }
    }
  });

  // ============== 5) REGISTER SHOT LOGIC ==============
  function attemptRegisterShot() {
    if (!activeKeeperId || !activeZoneId || !activeShot) return;
    registerShot(activeKeeperId, activeZoneId, activeShot);
    unselectZone();
    unselectShot();
  }

  function registerShot(keeperId, zoneId, shotType) {
    if (shotType === "Mål") {
      zoneStats[zoneId].goals++;
      zoneStats[zoneId].total++;
    } else if (shotType === "Missat") {
      zoneStats[zoneId].total++;
    } else if (shotType === "Räddning") {
      zoneStats[zoneId].total++;
    }

    if (shotType === "Mål") {
      keepers[keeperId].totalShots++;
      keepers[keeperId].lastShots.push("conceded");
      if (keepers[keeperId].lastShots.length > 10) {
        keepers[keeperId].lastShots.shift();
      }
    } else if (shotType === "Räddning") {
      keepers[keeperId].totalShots++;
      keepers[keeperId].savedShots++;
      keepers[keeperId].lastShots.push("saved");
      if (keepers[keeperId].lastShots.length > 10) {
        keepers[keeperId].lastShots.shift();
      }
    }
    updateZoneUI(zoneId);
    updateKeeperUI(keeperId);
  }

  function updateZoneUI(zoneId) {
    const z = zoneStats[zoneId];
    const zoneEl = document.getElementById(zoneId);
    const p = zoneEl.querySelector("p");
    p.textContent = `${z.goals}/${z.total}`;
    zoneEl.style.backgroundColor = getRatioColor(z.goals, z.total);
  }

  function updateKeeperUI(keeperId) {
    const keeper = keepers[keeperId];
    const totalP = calculateSavePercentage(keeper.totalShots, keeper.savedShots);
    const last10P = calculateLastTenPercentage(keeper.lastShots);
    const ratioText = `${keeper.savedShots}/${keeper.totalShots}`;
    
    if (keeperId === "keeper1") {
      keeper1TotalsEl.innerHTML = `<strong>${totalP}% totalt</strong><br /><span class="ratio-text">${ratioText}</span>`;
      keeper1Last10El.innerHTML = `<strong>${last10P}%</strong> <span class="ratio-text-info">senaste 10 skotten</span><div class="dot-container"></div>`;
      const dotContainer = keeper1Last10El.querySelector(".dot-container");
      renderLastFiveShots(keeper.lastShots, dotContainer);
    } else {
      keeper2TotalsEl.innerHTML = `<strong>${totalP}% totalt</strong><br /><span class="ratio-text">${ratioText}</span>`;
      keeper2Last10El.innerHTML = `<strong>${last10P}%</strong> <span class="ratio-text-info">senaste 10 skotten</span><div class="dot-container"></div>`;
      const dotContainer = keeper2Last10El.querySelector(".dot-container");
      renderLastFiveShots(keeper.lastShots, dotContainer);
    }
  }

  function calculateSavePercentage(totalShots, savedShots) {
    return totalShots === 0 ? 0 : Math.round((savedShots / totalShots) * 100);
  }

  function calculateLastTenPercentage(lastShots) {
    if (!lastShots.length) return 0;
    const savedCount = lastShots.filter(s => s === "saved").length;
    return Math.round((savedCount / lastShots.length) * 100);
  }

  function unselectZone() {
    if (activeZoneId) {
      const oldZone = document.getElementById(activeZoneId);
      if (oldZone) oldZone.classList.remove("active");
    }
    activeZoneId = null;
  }

  function unselectShot() {
    if (activeShot) {
      const oldBtn = [...shotButtons].find(b => b.dataset.shot === activeShot);
      if (oldBtn) oldBtn.classList.remove("active");
    }
    activeShot = null;
  }

  function renderLastFiveShots(lastShots, containerEl) {
    containerEl.innerHTML = "";
    const shotsToShow = lastShots.slice(-5);
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement("div");
      dot.classList.add("shot-dot");
      if (i < shotsToShow.length) {
        if (shotsToShow[i] === "saved") {
          dot.classList.add("saved-dot");
        } else if (shotsToShow[i] === "conceded") {
          dot.classList.add("conceded-dot");
        } else {
          dot.classList.add("empty-dot");
        }
      } else {
        dot.classList.add("empty-dot");
      }
      containerEl.appendChild(dot);
    }
  }

  /**
   * Returns a background color baserat på mål-/skottsförhållandet med diskreta tröskelvärden.
   */
  function getRatioColor(goals, totalShots) {
    if (totalShots === 0) return "#aaa";
    const ratio = goals / totalShots;
    if (ratio < 0.2) {
      return "#74dc6f";
    } else if (ratio < 0.35) {
      return "#74b46f";
    } else if (ratio < 0.4) {
      return "#96a063";
    } else if (ratio < 0.5) {
      return "#c8c863";
    } else if (ratio < 0.7) {
      return "#da6e63";
    } else {
      return "#D05663";
    }
  }
});
