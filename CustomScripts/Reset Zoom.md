/*
Reset Zoom: Instantly resets the Excalidraw canvas zoom level to 100% (1:1 scale).

A simple utility script that restores the default zoom level with a single action. Useful when you've zoomed in or out and want to quickly return to the standard view.

```js
*/

// Reset zoom to 100%
ea.getExcalidrawAPI().updateScene({appState:{zoom:{value: 1.0}}});