if (!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("2.14.2")) {
  new Notice("This script requires a newer version of Excalidraw. Please install the latest version.");
  return;
}

// Duplicate selected elements
const excalidrawAPI = ea.getExcalidrawAPI();
const selectedElements = ea.getViewSelectedElements();

if (!selectedElements || selectedElements.length === 0) {
  new Notice("No elements selected to duplicate. Select one or more elements and run the script again.");
  return;
}

// Offset for the duplicated elements (so they don't overlap originals)
const OFFSET_X = 20;
const OFFSET_Y = 20;

// Map original id -> cloned element id (used to remap references like arrow endpoints)
const idMap = {};

// Create clones
const clones = selectedElements.map(orig => {
  // ea.cloneElement will return a copy with a new id (if supported by EA API)
  const clone = ea.cloneElement(orig);

  // Guarantee a new id if cloneElement didn't (defensive)
  if (!clone.id || clone.id === orig.id) {
    clone.id = ea.generateElementId();
  }

  // Record mapping
  idMap[orig.id] = clone.id;

  // Remove grouping so clones don't stay in original groups
  if (Array.isArray(clone.groupIds)) {
    clone.groupIds = [];
  }

  // Offset position so duplicates are visible
  if (typeof clone.x === 'number') clone.x = clone.x + OFFSET_X;
  if (typeof clone.y === 'number') clone.y = clone.y + OFFSET_Y;

  // Clear binding to original objects if present (we will remap arrows below)
  if (clone.boundElements) clone.boundElements = undefined;

  return clone;
});

// Remap common references inside cloned elements (arrows/lines that reference object ids)
for (const clone of clones) {
  // remap arrow endpoints if they referenced selected originals
  if (clone.startObjectId && idMap[clone.startObjectId]) {
    clone.startObjectId = idMap[clone.startObjectId];
  }
  if (clone.endObjectId && idMap[clone.endObjectId]) {
    clone.endObjectId = idMap[clone.endObjectId];
  }

  // remap binding info if any (text bound to element)
  if (Array.isArray(clone.boundElements)) {
    clone.boundElements = clone.boundElements.map(b => {
      if (b && b.id && idMap[b.id]) {
        return { ...b, id: idMap[b.id] };
      }
      return b;
    });
  }
}

// Add clones to the scene
const sceneElements = excalidrawAPI.getSceneElements();
const newSceneElements = [...sceneElements, ...clones];

excalidrawAPI.updateScene({ elements: newSceneElements, commitToHistory: true });

// Select the newly created elements in the view
const newIds = clones.map(c => c.id);
ea.selectElementsInView(newIds);

new Notice(`Duplicated ${clones.length} element(s)`);

