
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
