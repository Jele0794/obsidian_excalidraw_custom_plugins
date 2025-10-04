/*
Cycle Through Colors Backward: Cycles backward through a predefined set of colors for drawing in Excalidraw. Companion script to "Cycle Through Colors" that cycles in the opposite direction.

Features:
- Cycles through 4 colors in reverse: Orange → Green → Blue → Black
- Same smart behavior as forward cycling: Changes pencil color when freedraw tool is active, or changes stroke color of selected elements
- Shares color position state with "Cycle Through Colors" script
- Keyboard shortcut friendly - assign a separate hotkey for backward cycling
- Perfect for quickly undoing color changes or going back to a previous color

Usage:
- With pencil tool active (no selection): Cycles the drawing color backward
- With elements selected: Changes the stroke color of all selected elements to the previous color
- With other tools active (no selection): Shows a reminder to switch to pencil tool

Note: This script shares the color cycle state with "Cycle Through Colors", so using both scripts together allows bidirectional color navigation.

```js
*/

if(!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("2.14.2")) {
  new Notice("This script requires a newer version of Excalidraw. Please install the latest version.");
  return;
}

// Check if the shared functions are loaded, if not, load them without executing
const { cycleColorsShared } = window;
if (cycleColorsShared == null || cycleColorsShared.backward == null || cycleColorsShared.forward == null) {
  // Set flag to prevent auto-execution when loading the main script
  window.cycleColorsShared = { skipExecution: true };
  
  // Get the main script file
  const scriptFile = ea.plugin.app.vault.getAbstractFileByPath(
    "Excalidraw/Scripts/CustomScripts/Cycle Through Colors.md"
  );
  
  if (scriptFile instanceof ea.obsidian.TFile) {
    // Read the script content
    const scriptContent = await ea.plugin.app.vault.read(scriptFile);
    
    // Execute the script to load the shared functions
    await ea.plugin.scriptEngine.executeScript(
      ea.targetView,                    // view
      scriptContent,                     // script content
      "Cycle Through Colors",           // title
      scriptFile                         // file
    );
  } else {
    new Notice("Could not find 'Cycle Through Colors' script. Make sure it exists in the CustomScripts folder.");
    return;
  }
}

// Execute backward cycling
await window.cycleColorsShared.backward(ea);
