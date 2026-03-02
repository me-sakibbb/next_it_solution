const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'node_modules', 'react-document-crop', 'dist');

const modernFile = path.join(dir, 'index.modern.js');
let modernContent = fs.readFileSync(modernFile, 'utf8');

modernContent = modernContent.replace(
    'var s=function(t){var e=t.cropPoints',
    'var s=function(t){var ref=o.useRef(null);var e=t.cropPoints'
);

modernContent = modernContent.replace(
    'return o.createElement(h,{bounds:m,',
    'return o.createElement(h,{nodeRef:ref,bounds:m,'
);

modernContent = modernContent.replace(
    'o.createElement("div",{style:["top","bottom","left","right"].includes(n)',
    'o.createElement("div",{ref:ref,style:["top","bottom","left","right"].includes(n)'
);

fs.writeFileSync(modernFile, modernContent);

const cjsFile = path.join(dir, 'index.js');
let cjsContent = fs.readFileSync(cjsFile, 'utf8');

cjsContent = cjsContent.replace(
    'var c=function(t){var e=t.cropPoints',
    'var c=function(t){var ref=o.useRef(null);var e=t.cropPoints'
);

cjsContent = cjsContent.replace(
    'return r.createElement(n,{bounds:g,',
    'return r.createElement(n,{nodeRef:ref,bounds:g,'
);

cjsContent = cjsContent.replace(
    'r.createElement("div",{style:["top","bottom","left","right"].includes(c)',
    'r.createElement("div",{ref:ref,style:["top","bottom","left","right"].includes(c)'
);

fs.writeFileSync(cjsFile, cjsContent);

console.log("Patched 2 successfully");
