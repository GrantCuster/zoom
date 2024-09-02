# CSS zoom and pan with a camera

Minimal example of pan and zoom with CSS transforms. Most of it follows https://www.steveruiz.me/posts/zoom-ui, but with some modifications to get the div to start centered. The final key was setting transform-origin to 0 0, which still seems strange to me.

The major effect I'm after is pointer directed zoom.

This is more three.js (and afaik general 3D software)-like with the camera centered on the page at 0, 0. There may still be cleaner ways to go about this. I plan to use this in some projects then hopefully update with the revisions.

The reason I don't just use three.js (sometimes I do) is it's nice to have DOM events for things I put on the canvas.

# React + TypeScript + Vite

`npm install` and `npm run dev` to run locally
