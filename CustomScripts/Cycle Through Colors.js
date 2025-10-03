if(!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("2.14.2")) {
  new Notice("This script requires a newer version of Excalidraw. Please install the latest version.");
  return;
}

async function run() {
  const excalidrawAPI = ea.getExcalidrawAPI();
  
  // Define the color cycle
  const colors = ["#1e1e1e", "#1971c2", "#2f9e44", "#f08c00"]; // black, blue, green, 
  const colorNames = ["Black", "Blue", "Green", "Orange"];
  
  // Get current settings
  const CURRENT_COLOR_INDEX = "Current Color Index";
  let settings = ea.getScriptSettings() || {};
  
  // Initialize color index if not set
  if(!settings[CURRENT_COLOR_INDEX]) {
    settings[CURRENT_COLOR_INDEX] = { value: 0 };
    await ea.setScriptSettings(settings);
  }
  
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
  
  // Get current color index and cycle to next
  let currentIndex = settings[CURRENT_COLOR_INDEX].value;
  const nextIndex = (currentIndex + 1) % colors.length;
  const nextColor = colors[nextIndex];
  const nextColorName = colorNames[nextIndex];
  
  // Update settings with new color index
  settings[CURRENT_COLOR_INDEX].value = nextIndex;
  await ea.setScriptSettings(settings);
  
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
}

run();