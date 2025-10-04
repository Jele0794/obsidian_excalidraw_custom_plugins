/*
Cycle Through Colors: Quickly cycle through a predefined set of colors for drawing in Excalidraw. Perfect for quick color switching while sketching or annotating without opening the color picker.

Features:
- Cycles through 4 colors: Black → Blue → Green → Orange
- Smart behavior: Changes pencil color when freedraw tool is active, or changes stroke color of selected elements
- Remembers your position in the color cycle between uses
- Keyboard shortcut friendly - assign a hotkey for one-tap color switching
- No UI clutter - works instantly with visual feedback via notification
- Ideal for rapid sketching workflows where you frequently switch between a few key colors

Usage:
- With pencil tool active (no selection): Cycles the drawing color for new strokes
- With elements selected: Changes the stroke color of all selected elements
- With other tools active (no selection): Shows a reminder to switch to pencil tool

```js
*/

if(!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("2.14.2")) {
  new Notice("This script requires a newer version of Excalidraw. Please install the latest version.");
  return;
}

// Shared color cycling logic
const cycleColors = async (ea, direction = 1) => {
  const excalidrawAPI = ea.getExcalidrawAPI();
  
  // Define the color cycle
  const colors = ["#1e1e1e", "#1971c2", "#2f9e44", "#f08c00"]; // black, blue, green, orange
  const colorNames = ["Black", "Blue", "Green", "Orange"];
  
  // Get selected elements
  const selectedElements = ea.getViewSelectedElements();
  
  // Check conditions before cycling color
  if (selectedElements.length === 0) {
    // Check if current tool is pencil (freedraw)
    const appState = excalidrawAPI.getAppState();
    const currentTool = appState?.activeTool?.type;
    
    if (currentTool !== 'freedraw') {
      new Notice(`No elements selected. Switch to pencil tool to change drawing color.`);
      return; // Exit without changing color if tool is not pencil
    }
  }
  
  // Get current color index from shared object
  const currentIndex = window.cycleColorsShared.currentColorIndex || 0;
  let nextIndex;
  
  if (direction === 1) {
    // Cycle forward (left to right)
    nextIndex = (currentIndex + 1) % colors.length;
  } else {
    // Cycle backward (right to left)
    nextIndex = (currentIndex - 1 + colors.length) % colors.length;
  }
  
  const nextColor = colors[nextIndex];
  const nextColorName = colorNames[nextIndex];
  
  // Update shared color index
  window.cycleColorsShared.currentColorIndex = nextIndex;
  
  if (selectedElements.length === 0) {
    // If no elements are selected and pencil tool is active, update the stroke color
    excalidrawAPI.updateScene({
      appState: {
        currentItemStrokeColor: nextColor
      }
    });
    new Notice(`Pencil color changed to ${nextColorName}`);
  } else {
    // If elements are selected, update their stroke color
    const updatedElements = selectedElements.map(element => ({
      ...element,
      strokeColor: nextColor
    }));
    
    excalidrawAPI.updateScene({
      elements: excalidrawAPI.getSceneElements().map(element => {
        const updatedElement = updatedElements.find(updated => updated.id === element.id);
        return updatedElement || element;
      })
    });
    
    new Notice(`${selectedElements.length} element(s) changed to ${nextColorName}`);
  }
};

// Export functions to window for use by other scripts
// Check if functions don't exist yet (not just the object)
if (!window.cycleColorsShared || !window.cycleColorsShared.forward) {
  const skipExecution = window.cycleColorsShared?.skipExecution || false;
  const currentColorIndex = window.cycleColorsShared?.currentColorIndex ?? 0;
  
  window.cycleColorsShared = {
    forward: async (ea) => {
      await cycleColors(ea, 1);
    },
    backward: async (ea) => {
      await cycleColors(ea, -1);
    },
    skipExecution: skipExecution,
    currentColorIndex: currentColorIndex
  };
}

// Execute forward cycling (only if this script was called directly, not as a library)
const shouldExecute = !window.cycleColorsShared.skipExecution;

// Reset the flag for future calls
window.cycleColorsShared.skipExecution = false;

if (shouldExecute) {
  await window.cycleColorsShared.forward(ea);
}