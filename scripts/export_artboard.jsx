#target illustrator
/*
  Export one Illustrator artboard into transparent PNG layers + editable text metadata.

  Configuration:
  - Edit ARTBOARD_INDEX and OUT_DIR below, or
  - set environment variables AI_TO_PPT_ARTBOARD_INDEX and AI_TO_PPT_OUT_DIR before launching Illustrator.

  OUT_DIR may be absolute or relative. Relative paths are resolved from this JSX file's folder.
*/
(function () {
var ARTBOARD_INDEX = Number($.getenv('AI_TO_PPT_ARTBOARD_INDEX') || 0); // zero-based: first artboard = 0
var OUT_DIR = $.getenv('AI_TO_PPT_OUT_DIR') || 'exports/artboard_001';

function resolvePath(pathValue) {
  var p = String(pathValue || '');
  if (/^[A-Za-z]:[\/\\]/.test(p) || /^[\/\\]/.test(p)) return p.replace(/\\/g, '/');
  var base = File($.fileName).parent.fsName.replace(/\\/g, '/');
  return base + '/' + p.replace(/\\/g, '/');
}

OUT_DIR = resolvePath(OUT_DIR);

try {
  function ensureFolder(p) { var f = new Folder(p); if (!f.exists) f.create(); return f; }
  function esc(s) { var out = String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\n').replace(/\n/g, '\\n').replace(/\t/g, '\\t'); return out.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); }
  function q(s) { return '"' + esc(s) + '"'; }
  function intersects(b, ab) { return !(b[2] <= ab[0] || b[0] >= ab[2] || b[3] >= ab[1] || b[1] <= ab[3]); }
  function clampBounds(b, ab) { return [Math.max(b[0], ab[0]), Math.min(b[1], ab[1]), Math.min(b[2], ab[2]), Math.max(b[3], ab[3])]; }
  function normBounds(b, ab) { return '{"left":' + b[0] + ',"top":' + b[1] + ',"right":' + b[2] + ',"bottom":' + b[3] + ',"x":' + (b[0]-ab[0]) + ',"y":' + (ab[1]-b[1]) + ',"w":' + (b[2]-b[0]) + ',"h":' + (b[1]-b[3]) + '}'; }
  function hasText(item) { if (item.typename == 'TextFrame') return true; if (item.pageItems) { for (var i=0;i<item.pageItems.length;i++) if (hasText(item.pageItems[i])) return true; } return false; }
  function hasNonText(item) { if (item.typename == 'TextFrame') return false; if (item.pageItems && item.pageItems.length > 0) { for (var i=0;i<item.pageItems.length;i++) if (hasNonText(item.pageItems[i])) return true; return false; } return true; }
  function topLevelItems(doc) { var out=[]; for (var i=0;i<doc.pageItems.length;i++) if (doc.pageItems[i].parent && doc.pageItems[i].parent.typename == 'Layer') out.push(doc.pageItems[i]); return out; }
  function hex(n) { n=Math.max(0,Math.min(255,Math.round(n))); var s=n.toString(16).toUpperCase(); return s.length<2?'0'+s:s; }
  function colorToHex(c) {
    try {
      if (!c) return 'FFFFFF';
      if (c.typename == 'RGBColor') return hex(c.red)+hex(c.green)+hex(c.blue);
      if (c.typename == 'GrayColor') return hex(c.gray*2.55)+hex(c.gray*2.55)+hex(c.gray*2.55);
      if (c.typename == 'CMYKColor') {
        var r=255*(1-c.cyan/100)*(1-c.black/100), g=255*(1-c.magenta/100)*(1-c.black/100), b=255*(1-c.yellow/100)*(1-c.black/100);
        return hex(r)+hex(g)+hex(b);
      }
    } catch(e) {}
    return 'FFFFFF';
  }
  function fontInfo(ca) { var fontName=''; var fontFamily=''; var fontFullName=''; var fontStyle=''; try { fontName = ca.textFont.name || ''; fontFamily = ca.textFont.family || ''; fontFullName = ca.textFont.fullName || ''; fontStyle = ca.textFont.style || ''; } catch(e) {} return { name: fontName, family: fontFamily, fullName: fontFullName, style: fontStyle }; }
  function attrsForRange(r) { var ca = r.characterAttributes; var fi = fontInfo(ca); var size = 24; try { size = Number(ca.size || 24); } catch(e) {} var color = 'FFFFFF'; try { color = colorToHex(ca.fillColor); } catch(e2) {} return { fontName: fi.name, fontFamily: fi.family, fontFullName: fi.fullName, fontStyle: fi.style, size: size, fillColor: color }; }
  function attrKey(a) { return a.fontName + '|' + a.fontFamily + '|' + a.fontFullName + '|' + a.fontStyle + '|' + Math.round(a.size*100)/100 + '|' + a.fillColor; }
  function runsJson(tf) {
    var chars = tf.textRange.characters;
    var runs = [];
    var curText = '';
    var curAttrs = null;
    var curKey = '';
    function runObject(t, a) {
      return '{"text":' + q(t) +
        ',"fontName":' + q(a.fontName) +
        ',"fontFamily":' + q(a.fontFamily) +
        ',"fontFullName":' + q(a.fontFullName) +
        ',"fontStyle":' + q(a.fontStyle) +
        ',"size":' + a.size +
        ',"fillColor":' + q(a.fillColor) + '}';
    }
    for (var i=0;i<chars.length;i++) {
      var ch = chars[i];
      var txt = ch.contents;
      var attrs = attrsForRange(ch);
      var key = attrKey(attrs);
      if (curAttrs === null) { curAttrs = attrs; curKey = key; curText = txt; }
      else if (key == curKey) { curText += txt; }
      else {
        runs.push(runObject(curText, curAttrs));
        curAttrs = attrs; curKey = key; curText = txt;
      }
    }
    if (curAttrs !== null) runs.push(runObject(curText, curAttrs));
    return '[' + runs.join(',') + ']';
  }
  function textJson(tf, idx, ab) {
    var vb = tf.visibleBounds;
    var gb = tf.geometricBounds;
    var tr = tf.textRange;
    var ca = tr.characterAttributes;
    var pa = tr.paragraphAttributes;
    var fi = fontInfo(ca);
    var size = 24; try { size = Number(ca.size || 24); } catch(e) {}
    var leading = 0; try { leading = Number(ca.leading || 0); } catch(e2) {}
    var color = 'FFFFFF'; try { color = colorToHex(ca.fillColor); } catch(e3) {}
    return '{"index":' + idx +
      ',"name":' + q(tf.name) +
      ',"kind":' + q(String(tf.kind)) +
      ',"contents":' + q(tf.contents) +
      ',"fontName":' + q(fi.name) +
      ',"fontFamily":' + q(fi.family) +
      ',"fontFullName":' + q(fi.fullName) +
      ',"fontStyle":' + q(fi.style) +
      ',"size":' + size +
      ',"leading":' + leading +
      ',"fillColor":' + q(color) +
      ',"justification":' + q(String(pa.justification)) +
      ',"orientation":' + q(String(tf.orientation)) +
      ',"visibleBounds":' + normBounds(vb, ab) +
      ',"geometricBounds":' + normBounds(gb, ab) +
      ',"runs":' + runsJson(tf) + '}';
  }
  if (app.documents.length < 1) throw new Error('No active document.');
  var doc = app.activeDocument;
  if (ARTBOARD_INDEX < 0 || ARTBOARD_INDEX >= doc.artboards.length) throw new Error('ARTBOARD_INDEX out of range: ' + ARTBOARD_INDEX);
  doc.artboards.setActiveArtboardIndex(ARTBOARD_INDEX);
  var ab = doc.artboards[ARTBOARD_INDEX].artboardRect;
  ensureFolder(OUT_DIR);
  var imgFolder = ensureFolder(OUT_DIR + '/images');

  var tops = topLevelItems(doc);
  var candidates = [];
  for (var i=0;i<tops.length;i++) {
    try { var b=tops[i].visibleBounds; if (intersects(b, ab) && hasNonText(tops[i])) candidates.push({item:tops[i], index:i, bounds:clampBounds(b,ab), hasText:hasText(tops[i])}); } catch(e) {}
  }

  var texts = [];
  for (var t=0;t<doc.textFrames.length;t++) {
    try { if (intersects(doc.textFrames[t].visibleBounds, ab) || intersects(doc.textFrames[t].geometricBounds, ab)) texts.push(textJson(doc.textFrames[t], t, ab)); } catch(e2) {}
  }

  var allItems = []; for (var a=0;a<doc.pageItems.length;a++) allItems.push({item:doc.pageItems[a], hidden:doc.pageItems[a].hidden, locked:doc.pageItems[a].locked});
  var layers = []; for (var l=0;l<doc.layers.length;l++) layers.push({layer:doc.layers[l], visible:doc.layers[l].visible, locked:doc.layers[l].locked});
  for (var l2=0;l2<layers.length;l2++) { try { layers[l2].layer.locked=false; layers[l2].layer.visible=true; } catch(e3) {} }
  for (var a2=0;a2<allItems.length;a2++) { try { allItems[a2].item.locked=false; } catch(e4) {} }

  var imageMeta = [];
  var opts = new ImageCaptureOptions(); opts.resolution = 72; opts.antiAliasing = true; opts.transparency = true;
  for (var c=0;c<candidates.length;c++) {
    for (var h=0;h<tops.length;h++) { try { tops[h].hidden = true; } catch(e5) {} }
    try { candidates[c].item.hidden = false; } catch(e6) {}
    for (var tx=0;tx<doc.textFrames.length;tx++) { try { doc.textFrames[tx].hidden = true; } catch(e7) {} }
    var fileName = 'layer_' + ('000' + (c+1)).slice(-3) + '.png';
    var file = new File(imgFolder.fsName + '/' + fileName);
    doc.imageCapture(file, candidates[c].bounds, opts);
    imageMeta.push('{"file":' + q('images/' + fileName) + ',"sourceIndex":' + candidates[c].index + ',"typename":' + q(candidates[c].item.typename) + ',"hasText":' + (candidates[c].hasText?'true':'false') + ',"bounds":' + normBounds(candidates[c].bounds, ab) + '}');
  }

  for (var r=0;r<allItems.length;r++) { try { allItems[r].item.hidden=allItems[r].hidden; allItems[r].item.locked=allItems[r].locked; } catch(e8) {} }
  for (var lr=0;lr<layers.length;lr++) { try { layers[lr].layer.visible=layers[lr].visible; layers[lr].layer.locked=layers[lr].locked; } catch(e9) {} }

  var json = '{"document":' + q(doc.name) + ',"artboardIndex":' + (ARTBOARD_INDEX+1) + ',"artboardRect":[' + ab.join(',') + '],"imageCandidateCount":' + candidates.length + ',"exportedImageCount":' + imageMeta.length + ',"textCount":' + texts.length + ',"images":[' + imageMeta.join(',') + '],"texts":[' + texts.join(',') + ']}';
  var f = new File(OUT_DIR + '/manifest.json'); f.encoding='UTF-8'; f.open('w'); f.write(json); f.close();
} catch (err) {
  var fallback = Folder.temp.fsName.replace(/\\/g, '/') + '/ai_to_ppt_export_error.txt';
  try { fallback = OUT_DIR + '/export_error.txt'; } catch(e0) {}
  var ef = new File(fallback); ef.encoding='UTF-8'; ef.open('w');
  ef.writeln(String(err));
  try { ef.writeln('line=' + err.line); } catch(e) {}
  try { ef.writeln(err.stack); } catch(e2) {}
  ef.close();
}
})();
