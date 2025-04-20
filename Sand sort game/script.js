// script.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gameContainer = document.querySelector(".game-container");
    const levelNumberSpan = document.getElementById("level-number");
    const coinCountSpan = document.getElementById("coin-count");
    const restartButton = document.getElementById("restart-button");
    const restartCostSpan = document.getElementById("restart-cost-val");
    const levelUpArrow = document.getElementById("level-up-arrow");
    const coinInfoRight = document.querySelector(".info-right");
    const body = document.body; // Reference to body for class toggling

    // Base Game Constants
    const baseColors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#F1C40F", "#8E44AD", "#1ABC9C", "#E74C3C", "#3498DB", "#F39C12", "#2ECC71", "#9B59B6"];
    const glassCapacity = 4;
    const restartCost = 10;
    const levelWinReward = 10;

    // Game State Variables
    let glasses = [];
    let currentLevel = 1;
    let currentCoins = 20;
    let selectedGlassIndex = null; // For both click and drag source
    let initialLevelState = [];
    let currentLevelConfig = {};
    let isDragging = false; // Track if currently dragging

    // --- Deep Copy Helper ---
    function deepCopy(data) { return JSON.parse(JSON.stringify(data)); }

    // --- Level Configuration (No changes needed) ---
    function getGameConfigForLevel(level) { /* ... no change ... */
        let numGlasses; if (level <= 2) numGlasses = 4; else if (level <= 8) numGlasses = 4 + Math.ceil((level - 2) / 2); else numGlasses = 8 + Math.ceil((level - 8) / 3); const numFilledGlasses = numGlasses - 2; const totalSandUnits = numFilledGlasses * glassCapacity; let numColors = Math.min(baseColors.length, numFilledGlasses); while (numColors > 1 && totalSandUnits % numColors !== 0) numColors--; if (totalSandUnits % numColors !== 0 && numColors === 1 && totalSandUnits > 0) console.warn(`Level ${level}: Only 1 color possible.`); else if (totalSandUnits % numColors !== 0) { console.error(`Level ${level}: Cannot find suitable color count. Defaulting.`); numColors = 2; } const unitsPerColor = totalSandUnits > 0 ? totalSandUnits / numColors : 0; if (!Number.isInteger(unitsPerColor) && totalSandUnits > 0) { console.error(`Level ${level} config error: unitsPerColor (${unitsPerColor}).`); return { numGlasses: 4, numColors: 2, unitsPerColor: 4, numFilledGlasses: 2 }; } const glassesPerRow = Math.max(4, Math.ceil(numGlasses / 2)); const containerWidth = glassesPerRow * (75 + 15) + 15; gameContainer.style.maxWidth = `${containerWidth}px`; document.querySelector('.game-info').style.maxWidth = `${containerWidth}px`; return { numGlasses, numColors, unitsPerColor, numFilledGlasses };
    }

    // --- Initialization (No changes needed) ---
    function generateInitialSand(config) { /* ... no change ... */
        const allSandUnits = []; const colorsForLevel = baseColors.slice(0, config.numColors); if (config.unitsPerColor <= 0 || config.numColors <= 0) return []; for (const color of colorsForLevel) { for (let i = 0; i < config.unitsPerColor; i++) allSandUnits.push(color); } for (let i = allSandUnits.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[allSandUnits[i], allSandUnits[j]] = [allSandUnits[j], allSandUnits[i]]; } return allSandUnits;
    }
    function initializeLevel() { /* ... no change ... */
        currentLevelConfig = getGameConfigForLevel(currentLevel); const config = currentLevelConfig; glasses.length = 0; const sandUnits = generateInitialSand(config); if (sandUnits.length !== config.numFilledGlasses * glassCapacity) { console.error(`Level ${currentLevel} Sand Generation Error.`); alert("Error generating level setup."); return; } for (let i = 0; i < config.numGlasses; i++) { if (i < config.numFilledGlasses) glasses.push(sandUnits.splice(0, glassCapacity)); else glasses.push([]); } initialLevelState = deepCopy(glasses); selectedGlassIndex = null; updateUI(); renderAllGlasses();
    }

    // --- UI Update (No changes needed) ---
    function updateUI() { /* ... no change ... */
        levelNumberSpan.textContent = currentLevel; coinCountSpan.textContent = currentCoins; restartCostSpan.textContent = restartCost; restartButton.disabled = currentCoins < restartCost;
    }

    // --- Rendering (No changes needed) ---
    function renderAllGlasses() { /* ... no change ... */
        gameContainer.innerHTML = ""; const config = currentLevelConfig; glasses.forEach((glassData, index) => { const glassDiv = document.createElement("div"); glassDiv.classList.add("glass"); glassDiv.dataset.index = index; glassData.forEach((color, layerIndex) => { const sandDiv = document.createElement("div"); sandDiv.classList.add("sand-layer"); sandDiv.style.backgroundColor = color; sandDiv.style.bottom = `${layerIndex * 25}%`; glassDiv.appendChild(sandDiv); }); if (index === selectedGlassIndex) glassDiv.classList.add("selected"); gameContainer.appendChild(glassDiv); }); updateUI();
    }

    // --- Game Logic ---
    function getTopColor(glassIndex) { /* ... no change ... */
        const glass = glasses[glassIndex]; return glass.length > 0 ? glass[glass.length - 1] : null;
    }
    function getPourableUnits(glassIndex) { /* ... no change ... */
        const glass = glasses[glassIndex]; if (glass.length === 0) return { color: null, count: 0 }; const topColor = glass[glass.length - 1]; let count = 0; for (let i = glass.length - 1; i >= 0; i--) { if (glass[i] === topColor) count++; else break; } return { color: topColor, count: count };
    }
    function canPour(fromIndex, toIndex) { /* ... no change ... */
        if (fromIndex === null || toIndex === null || fromIndex === toIndex) return false; const fromGlass = glasses[fromIndex]; const toGlass = glasses[toIndex]; if (!fromGlass || !toGlass || fromGlass.length === 0) return false; if (toGlass.length >= glassCapacity) return false; const fromTopColor = getTopColor(fromIndex); const toTopColor = getTopColor(toIndex); return toGlass.length === 0 || fromTopColor === toTopColor;
    }
    function pourSand(fromIndex, toIndex) { /* ... no change ... */
        const fromGlass = glasses[fromIndex]; const toGlass = glasses[toIndex]; const { count: pourCount } = getPourableUnits(fromIndex); const availableSpace = glassCapacity - toGlass.length; const unitsToMove = Math.min(pourCount, availableSpace); for (let i = 0; i < unitsToMove; i++) toGlass.push(fromGlass.pop()); selectedGlassIndex = null; renderAllGlasses(); checkWinCondition();
    }

    // --- Win Condition and Animation (No changes needed) ---
    function checkWinCondition() { /* ... no change ... */
        const config = currentLevelConfig; let sortedGlassCount = 0; let emptyGlassCount = 0; for (const glass of glasses) { if (glass.length === 0) emptyGlassCount++; else if (glass.length === glassCapacity && glass.every(color => color === glass[0])) sortedGlassCount++; } if (sortedGlassCount === config.numFilledGlasses && emptyGlassCount === 2) { currentCoins += levelWinReward; currentLevel++; levelUpArrow.classList.add('animate'); coinInfoRight.classList.add('coin-flash'); setTimeout(() => { levelUpArrow.classList.remove('animate'); }, 1800); setTimeout(() => { coinInfoRight.classList.remove('coin-flash'); }, 1200); updateUI(); setTimeout(initializeLevel, 50); }
    }

    // --- Button Handlers (No changes needed) ---
    function handleRestartClick() { /* ... no change ... */
        if (currentCoins < restartCost) return; currentCoins -= restartCost; glasses = deepCopy(initialLevelState); selectedGlassIndex = null; renderAllGlasses();
    }

    // --- Event Handling (UPDATED for Drag and Drop) ---

    // Mousedown: Start potential drag or selection
    gameContainer.addEventListener('mousedown', (event) => {
        const clickedGlassDiv = event.target.closest('.glass');
        if (!clickedGlassDiv) return; // Ignore clicks not on a glass

        const clickedIndex = parseInt(clickedGlassDiv.dataset.index);

        // If clicking an empty glass, do nothing on mousedown
        if (glasses[clickedIndex].length === 0) {
            // If a glass was previously selected, deselect it
            if (selectedGlassIndex !== null) {
                selectedGlassIndex = null;
                renderAllGlasses();
            }
            return;
        }

        // Select the non-empty glass as potential source
        isDragging = true; // Assume drag might start
        selectedGlassIndex = clickedIndex;
        renderAllGlasses(); // Show selection immediately
        body.classList.add('dragging'); // Change cursor immediately

        // Prevent default text selection/drag behavior
        event.preventDefault();
    });

    // Mousemove: Track dragging state (currently just for cursor)
    // No specific action needed here unless implementing a visual drag element

    // Mouseup: End drag, attempt pour or handle click logic
    document.addEventListener('mouseup', (event) => {
        if (!isDragging) return; // Only act if a drag was initiated

        isDragging = false;
        body.classList.remove('dragging'); // Reset cursor

        const sourceIndex = selectedGlassIndex; // Keep track of the source

        // Find the element under the cursor *at mouseup*
        // Use elementFromPoint, requires clientX/clientY
        const targetElement = document.elementFromPoint(event.clientX, event.clientY);
        const targetGlassDiv = targetElement ? targetElement.closest('.glass') : null;
        let targetIndex = null;

        if (targetGlassDiv) {
            targetIndex = parseInt(targetGlassDiv.dataset.index);
        }

        // Attempt pour if a valid target glass was found under cursor
        if (targetIndex !== null && sourceIndex !== targetIndex && canPour(sourceIndex, targetIndex)) {
            pourSand(sourceIndex, targetIndex); // pourSand handles deselecting and rendering
        } else {
            // If mouseup wasn't on a valid pour target (or same glass, or outside)
            // simply deselect the source glass without pouring
            selectedGlassIndex = null;
            renderAllGlasses();
        }
    });

    // Prevent context menu during drag
    gameContainer.addEventListener('contextmenu', (event) => {
        if (isDragging) {
            event.preventDefault();
        }
    });


    // --- Attach Button Listeners ---
    restartButton.addEventListener('click', handleRestartClick);

    // --- Start Game ---
    initializeLevel(); // Start the first level
});
