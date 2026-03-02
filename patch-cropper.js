const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'node_modules', 'react-document-crop', 'dist');

const modernFile = path.join(dir, 'index.modern.js');
let modernContent = fs.readFileSync(modernFile, 'utf8');

// Replace in modern:
// var s=function(t){var e=t.cropPoints,n=t.pointArea ...
// o.createElement(h,{bounds:m,
modernContent = modernContent.replace(
    /var s=function\(t\){var e=t\.cropPoints,n=t\.pointArea,i=t\.defaultPosition,a=t\.pointSize,l=t\.pointBgColor,c=t\.pointBorder,s=t\.onStop,p=t\.onDrag,m=t\.bounds,g=r\(function\(t,o\){p\(u\(\{\},o,\{x:o\.x\+a\/2,y:o\.y\+a\/2\}\),n,e\)},\[p\]\),y=r\(function\(t,o\){s\(u\(\{\},o,\{x:o\.x\+a\/2,y:o\.y\+a\/2\}\),n,e\)},\[p,e\]\);return o\.createElement\(h,\{bounds:m,/g,
    'var s=function(t){var ref=o.useRef(null);var e=t.cropPoints,n=t.pointArea,i=t.defaultPosition,a=t.pointSize,l=t.pointBgColor,c=t.pointBorder,s=t.onStop,p=t.onDrag,m=t.bounds,g=r(function(t,o){p(u({},o,{x:o.x+a/2,y:o.y+a/2}),n,e)},[p]),y=r(function(t,o){s(u({},o,{x:o.x+a/2,y:o.y+a/2}),n,e)},[p,e]);return o.createElement(h,{nodeRef:ref, bounds:m,'
);

// also inject ref into the div:
modernContent = modernContent.replace(
    /o\.createElement\("div",\{style:\["top","bottom","left","right"\]\.includes\(n\)\?d\(a,l,c,"left"===n\|\|"right"===n\):f\(a,l,c\)\}\)/g,
    'o.createElement("div",{ref:ref, style:["top","bottom","left","right"].includes(n)?d(a,l,c,"left"===n||"right"===n):f(a,l,c)})'
);

fs.writeFileSync(modernFile, modernContent);


const cjsFile = path.join(dir, 'index.js');
let cjsContent = fs.readFileSync(cjsFile, 'utf8');

cjsContent = cjsContent.replace(
    /var c=function\(t\){var e=t\.cropPoints,c=t\.pointArea,u=t\.defaultPosition,h=t\.pointSize,f=t\.pointBgColor,s=t\.pointBorder,d=t\.onStop,p=t\.onDrag,g=t\.bounds,m=o\.useCallback\(function\(t,o\){p\(i\(\{\},o,\{x:o\.x\+h\/2,y:o\.y\+h\/2\}\),c,e\)},\[p\]\),y=o\.useCallback\(function\(t,o\){d\(i\(\{\},o,\{x:o\.x\+h\/2,y:o\.y\+h\/2\}\),c,e\)},\[p,e\]\);return r\.createElement\(n,\{bounds:g,/g,
    'var c=function(t){var ref=o.useRef(null);var e=t.cropPoints,c=t.pointArea,u=t.defaultPosition,h=t.pointSize,f=t.pointBgColor,s=t.pointBorder,d=t.onStop,p=t.onDrag,g=t.bounds,m=o.useCallback(function(t,o){p(i({},o,{x:o.x+h/2,y:o.y+h/2}),c,e)},[p]),y=o.useCallback(function(t,o){d(i({},o,{x:o.x+h/2,y:o.y+h/2}),c,e)},[p,e]);return r.createElement(n,{nodeRef:ref, bounds:g,'
);

cjsContent = cjsContent.replace(
    /r\.createElement\("div",\{style:\["top","bottom","left","right"\]\.includes\(c\)\?l\(h,f,s,"left"===c\|\|"right"===c\):a\(h,f,s\)\}\)/g,
    'r.createElement("div",{ref:ref, style:["top","bottom","left","right"].includes(c)?l(h,f,s,"left"===c||"right"===c):a(h,f,s)})'
);

fs.writeFileSync(cjsFile, cjsContent);

console.log("Patched successfully");
