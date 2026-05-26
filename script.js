document.addEventListener("DOMContentLoaded", function () {
  function byAny(ids) {
    var i;
    for (i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) return el;
    }
    return null;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function safeStorage() {
    try {
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(function (x) {
          return x.toString(16).padStart(2, "0");
        })
        .join("")
        .toUpperCase()
    );
  }

  function rgbToHsl(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var s = 0;
    var l = (max + min) / 2;

    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }

      h = h / 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  function hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    var r;
    var g;
    var b;

    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    if (s === 0) {
      r = l;
      g = l;
      b = l;
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  function hsvToRgb(h, s, v) {
    s = s / 100;
    v = v / 100;

    var c = v * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = v - c;

    var r = 0;
    var g = 0;
    var b = 0;

    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  function getContrastText(r, g, b) {
    var score = (r * 299 + g * 587 + b * 114) / 1000;
    if (score > 125) {
      return "#111827";
    }
    return "#ffffff";
  }

  function vibrate(kind) {
    if (!navigator.vibrate) return;
    if (kind === "heavy") navigator.vibrate(35);
    else if (kind === "medium") navigator.vibrate(20);
    else navigator.vibrate(10);
  }

  function springAnimate(el, scale) {
    if (!el) return;
    if (typeof scale !== "number") scale = 1.03;
    el.style.transition = "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "scale(" + scale + ")";
    window.setTimeout(function () {
      el.style.transform = "";
    }, 120);
  }

  var storage = safeStorage();

  var els = {
    screens: document.querySelectorAll(".screen"),
    splashScreen: byAny(["splashScreen"]),
    mainApp: byAny(["mainApp"]),
    uploadScreen: byAny(["uploadScreen"]),
    startBtn: byAny(["startBtn"]),
    openUploadBtn: byAny(["openUploadBtn"]),
    openUploadBtn2: byAny(["openUploadBtn2"]),
    backHomeBtn: byAny(["backHomeBtn"]),
    pickerArea: byAny(["pickerArea"]),
    pickerPointer: byAny(["pickerPointer"]),
    hueSlider: byAny(["hueSlider"]),
    opacitySlider: byAny(["opacitySlider"]),
    previewCard: byAny(["previewCard"]),
    hexValue: byAny(["hexValue"]),
    hexText: byAny(["hexText"]),
    rgbText: byAny(["rgbText"]),
    rgbValueText: byAny(["rgbValueText"]),
    hslText: byAny(["hslText"]),
    hslValueText: byAny(["hslValueText"]),
    paletteActive: byAny(["paletteActive"]),
    imagePalette: byAny(["imagePalette"]),
    imageUpload: byAny(["imageUpload"]),
    canvas: byAny(["canvas"]),
    canvasInfo: byAny(["canvasInfo"]),
    lens: byAny(["lens"]),
    toast: byAny(["toast"]),
    randomColorBtn: byAny(["randomColorBtn"]),
    copyColorBtn: byAny(["copyColorBtn"]),
    exportCssBtn: byAny(["exportCssBtn"]),
    copyHexBtn: byAny(["copyHexBtn"]),
    copyRgbBtn: byAny(["copyRgbBtn"]),
    copyHslBtn: byAny(["copyHslBtn"]),
    monoBtn: byAny(["monoBtn"]),
    compBtn: byAny(["compBtn"]),
    analogBtn: byAny(["analogBtn"]),
  };

  var ctx = els.canvas ? els.canvas.getContext("2d") : null;

  var state = {
    hue: 260,
    saturation: 100,
    brightness: 100,
    alpha: 1,
    mode: "mono",
    imageLoaded: false,
    activeScreen: "splashScreen",
  };

  var draggingPicker = false;
  var draggingCanvas = false;
  var pointerSize = 36;
  var lensSource = "";
  var toastTimer = null;
  var paletteScheduled = false;
  var startTouchX = 0;
  var startTouchY = 0;
  var swipeLocked = false;
  var topBar = document.querySelector(".top-bar");

  function showToast(message) {
    if (!els.toast) return;

    els.toast.textContent = message;
    els.toast.classList.add("show");

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(function () {
      els.toast.classList.remove("show");
    }, 1400);
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("Copied");
    vibrate("light");
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          showToast("Copied");
          vibrate("light");
        })
        .catch(function () {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  }

  function saveState() {
    if (!storage) return;
    try {
      storage.setItem(
        "color-forge-state",
        JSON.stringify({
          hue: state.hue,
          saturation: state.saturation,
          brightness: state.brightness,
          alpha: state.alpha,
          mode: state.mode,
        })
      );
    } catch (e) {}
  }

  function loadState() {
    if (!storage) return;
    try {
      var raw = storage.getItem("color-forge-state");
      if (!raw) return;
      var data = JSON.parse(raw);

      if (typeof data.hue === "number") state.hue = data.hue;
      if (typeof data.saturation === "number")
        state.saturation = data.saturation;
      if (typeof data.brightness === "number")
        state.brightness = data.brightness;
      if (typeof data.alpha === "number") state.alpha = data.alpha;
      if (typeof data.mode === "string") state.mode = data.mode;
    } catch (e) {}
  }

  function updatePickerBackground() {
    if (els.pickerArea) {
      els.pickerArea.style.background = "hsl(" + state.hue + ",100%,50%)";
    }
  }

  function updatePointerFromState() {
    if (!els.pickerArea || !els.pickerPointer) return;

    var rect = els.pickerArea.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var half = pointerSize / 2;
    var x = (state.saturation / 100) * (rect.width - pointerSize) + half;
    var y =
      ((100 - state.brightness) / 100) * (rect.height - pointerSize) + half;

    els.pickerPointer.style.left = x + "px";
    els.pickerPointer.style.top = y + "px";
  }

  function updateModeButtons() {
    var buttons = [els.monoBtn, els.compBtn, els.analogBtn];
    var i;

    for (i = 0; i < buttons.length; i++) {
      if (buttons[i]) {
        buttons[i].classList.remove("active");
      }
    }

    if (state.mode === "mono" && els.monoBtn)
      els.monoBtn.classList.add("active");
    if (state.mode === "comp" && els.compBtn)
      els.compBtn.classList.add("active");
    if (state.mode === "analog" && els.analogBtn)
      els.analogBtn.classList.add("active");
  }

  function renderSmartPalette() {
    if (!els.paletteActive) return;

    var colors = [];
    var i;
    var j;

    if (state.mode === "mono") {
      for (i = 0; i < 6; i++) {
        var v1 = 100 - i * 14;
        var rgb1 = hsvToRgb(state.hue, state.saturation, v1);
        colors.push(rgbToHex(rgb1.r, rgb1.g, rgb1.b));
      }
    } else if (state.mode === "comp") {
      var compHue = (state.hue + 180) % 360;
      for (i = 0; i < 6; i++) {
        var v2 = 100 - i * 14;
        var rgb2 = hsvToRgb(compHue, state.saturation, v2);
        colors.push(rgbToHex(rgb2.r, rgb2.g, rgb2.b));
      }
    } else {
      var hues = [
        (state.hue - 30 + 360) % 360,
        state.hue,
        (state.hue + 30) % 360,
      ];
      var values = [100, 88, 76, 64];

      for (i = 0; i < hues.length; i++) {
        for (j = 0; j < values.length; j++) {
          var rgb3 = hsvToRgb(hues[i], state.saturation, values[j]);
          colors.push(rgbToHex(rgb3.r, rgb3.g, rgb3.b));
        }
      }
    }

    els.paletteActive.innerHTML = "";

    function createSmartPaletteBox(hexColor) {
      var box = document.createElement("div");
      var label = document.createElement("span");

      box.className = "color-box";
      box.style.background = hexColor;
      box.dataset.hex = hexColor;

      label.textContent = hexColor;
      box.appendChild(label);

      box.addEventListener("click", function () {
        copyText(hexColor);
        springAnimate(box, 0.96);
      });

      els.paletteActive.appendChild(box);
    }

    for (i = 0; i < colors.length; i++) {
      createSmartPaletteBox(colors[i]);
    }

    updateModeButtons();
  }

  function updateColor() {
    var rgb = hsvToRgb(state.hue, state.saturation, state.brightness);
    var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    var contrast = getContrastText(rgb.r, rgb.g, rgb.b);

    if (els.previewCard) {
      var mixAlpha = 0.45 + state.alpha * 0.35;
      var dynamicBackground =
        "linear-gradient(135deg, " +
        hex +
        ", rgba(" +
        rgb.r +
        ", " +
        rgb.g +
        ", " +
        rgb.b +
        ", " +
        mixAlpha +
        "))";

      els.previewCard.style.background = dynamicBackground;
      els.previewCard.style.boxShadow =
        "0 20px 60px rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.45)";
      els.previewCard.style.color = contrast;
      springAnimate(els.previewCard, 1.01);
    }

    if (els.hexValue) els.hexValue.textContent = hex;
    if (els.hexText) els.hexText.textContent = hex;
    if (els.rgbText)
      els.rgbText.textContent =
        "RGB(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    if (els.rgbValueText)
      els.rgbValueText.textContent =
        "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    if (els.hslText)
      els.hslText.textContent =
        "HSL(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
    if (els.hslValueText)
      els.hslValueText.textContent =
        "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";

    if (els.pickerArea) {
      els.pickerArea.style.background = "hsl(" + state.hue + ",100%,50%)";
    }

    if (els.hueSlider) els.hueSlider.value = state.hue;
    if (els.opacitySlider)
      els.opacitySlider.value = Math.round(state.alpha * 100);

    document.documentElement.style.setProperty("--accent", hex);
    saveState();
    scheduleRenderPalettes();
  }

  function scheduleRenderPalettes() {
    if (paletteScheduled) return;
    paletteScheduled = true;
    window.requestAnimationFrame(function () {
      paletteScheduled = false;
      renderSmartPalette();
    });
  }

  function showScreen(screenId) {
    var i;
    for (i = 0; i < els.screens.length; i++) {
      els.screens[i].classList.remove("active");
    }

    var target = byAny([screenId]);
    if (target) {
      target.classList.add("active");
    }

    state.activeScreen = screenId;
    window.scrollTo(0, 0);

    if (screenId === "mainApp") {
      window.setTimeout(function () {
        updatePointerFromState();
      }, 0);
    }
  }

  function exportCSS() {
    var rgb = hsvToRgb(state.hue, state.saturation, state.brightness);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    var hex = els.hexText? els.hexText.textContent
      : rgbToHex(rgb.r, rgb.g, rgb.b);

    var shadeLevels = [92, 80, 68, 56, 44, 32];
    var shades = [];
    var i;

    for (i = 0; i < shadeLevels.length; i++) {
      var shadeRgb = hslToRgb(state.hue, state.saturation, shadeLevels[i]);
      shades.push(rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b));
    }

    var css =
      ":root{\n" +
      "  --primary: " +
      hex +
      ";\n" +
      "  --primary-rgb: " +
      rgb.r +
      ", " +
      rgb.g +
      ", " +
      rgb.b +
      ";\n" +
      "  --primary-hsl: " +
      hsl.h +
      ", " +
      hsl.s +
      "%, " +
      hsl.l +
      "%;\n" +
      "  --primary-alpha: rgba(" +
      rgb.r +
      ", " +
      rgb.g +
      ", " +
      rgb.b +
      ", " +
      state.alpha +
      ");\n" +
      "  --gradient: linear-gradient(135deg, " +
      hex +
      ", rgba(" +
      rgb.r +
      ", " +
      rgb.g +
      ", " +
      rgb.b +
      ", 0.58));\n" +
      "  --primary-100: " +
      shades[0] +
      ";\n" +
      "  --primary-200: " +
      shades[1] +
      ";\n" +
      "  --primary-300: " +
      shades[2] +
      ";\n" +
      "  --primary-400: " +
      shades[3] +
      ";\n" +
      "  --primary-500: " +
      shades[4] +
      ";\n" +
      "  --primary-600: " +
      shades[5] +
      ";\n" +
      "}";

    copyText(css);
  }

  function randomColor() {
    state.hue = Math.floor(Math.random() * 360);
    state.saturation = 70 + Math.random() * 30;
    state.brightness = 70 + Math.random() * 30;
    state.alpha = 1;

    if (els.hueSlider) els.hueSlider.value = state.hue;
    if (els.opacitySlider) els.opacitySlider.value = 100;

    updatePickerBackground();
    updatePointerFromState();
    updateColor();
    showToast("Randomized");
    vibrate("medium");
  }

  function setMode(mode) {
    state.mode = mode;
    updateModeButtons();
    renderSmartPalette();
    vibrate("light");
  }

  function createImageBox(hex, target) {
    var box = document.createElement("div");
    var label = document.createElement("span");

    box.className = "color-box";
    box.style.background = hex;
    box.dataset.hex = hex;

    label.textContent = hex;
    box.appendChild(label);

    box.addEventListener("click", function () {
      copyText(hex);
      springAnimate(this, 0.96);
    });

    target.appendChild(box);
  }

  function renderImagePalette(colors) {
    if (!els.imagePalette) return;

    els.imagePalette.innerHTML = "";

    if (!colors.length) {
      els.imagePalette.innerHTML =
        "<div class='canvas-info'>No strong colors found. Try another photo.</div>";
      return;
    }

    var i;
    for (i = 0; i < colors.length; i++) {
      createImageBox(colors[i], els.imagePalette);
    }
  }

  function extractColors() {
    if (
      !ctx ||
      !els.canvas ||
      !els.imagePalette ||
      !els.canvas.width ||
      !els.canvas.height
    ) {
      return;
    }

    var data = ctx.getImageData(0, 0, els.canvas.width, els.canvas.height).data;
    var map = {};
    var i;
    var r;
    var g;
    var b;
    var a;
    var key;
    var sorted = [];
    var colorKeys = [];
    var item;
    var parts;
    var rr;
    var gg;
    var bb;

    for (i = 0; i < data.length; i += 16) {
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];
      a = data[i + 3];

      if (
        typeof r === "undefined" ||
        typeof g === "undefined" ||
        typeof b === "undefined"
      ) {
        continue;
      }

      if (a < 50) {
        continue;
      }

      if (r > 245 && g > 245 && b > 245) {
        continue;
      }
      if (r < 18 && g < 18 && b < 18) {
        continue;
      }

      key =
        Math.round(r / 24) * 24 +
        "," +
        Math.round(g / 24) * 24 +
        "," +
        Math.round(b / 24) * 24;

      if (map[key]) {
        map[key]++;
      } else {
        map[key] = 1;
      }
    }

    for (key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        sorted.push([key, map[key]]);
      }
    }

    sorted.sort(function (a, b) {
      return b[1] - a[1];
    });

    sorted = sorted.slice(0, 12);

    for (i = 0; i < sorted.length; i++) {
      item = sorted[i];
      parts = item[0].split(",");
      rr = parseInt(parts[0], 10);
      gg = parseInt(parts[1], 10);
      bb = parseInt(parts[2], 10);
      colorKeys.push(rgbToHex(rr, gg, bb));
    }

    renderImagePalette(colorKeys);
  }

  function updateLensBackground() {
    if (!els.lens || !state.imageLoaded || !els.canvas) return;

    try {
      lensSource = els.canvas.toDataURL();
      els.lens.style.backgroundImage = "url(" + lensSource + ")";
      els.lens.style.backgroundRepeat = "no-repeat";
    } catch (e) {}
  }

  function updateLens(e) {
    if (!els.lens || !state.imageLoaded || !els.canvas) return;

    var rect = els.canvas.getBoundingClientRect();
    var scaleX = els.canvas.width / rect.width;
    var scaleY = els.canvas.height / rect.height;

    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    var realX = Math.floor(x * scaleX);
    var realY = Math.floor(y * scaleY);

    if (
      realX < 0 ||
      realY < 0 ||
      realX >= els.canvas.width ||
      realY >= els.canvas.height
    ) {
      els.lens.style.display = "none";
      return;
    }

    els.lens.style.display = "block";
    els.lens.style.left = x + "px";
    els.lens.style.top = y + "px";

    var zoom = 3;
    if (lensSource) {
      els.lens.style.backgroundImage = "url(" + lensSource + ")";
    }

    els.lens.style.backgroundSize =
      els.canvas.width * zoom + "px " + els.canvas.height * zoom + "px";
    els.lens.style.backgroundPosition =
      "-" + (realX * zoom - 46) + "px -" + (realY * zoom - 46) + "px";
  }

  function setColorFromRgb(r, g, b, syncPointer) {
    var hsl = rgbToHsl(r, g, b);

    state.hue = hsl.h;
    state.saturation = hsl.s;
    state.brightness = hsl.l;

    if (els.hueSlider) els.hueSlider.value = state.hue;
    updatePickerBackground();

    if (syncPointer) {
      updatePointerFromState();
    }

    updateColor();
  }

  function inspectCanvasPixel(e) {
    if (
      !state.imageLoaded ||
      !els.canvas ||
      !ctx ||
      !els.canvas.width ||
      !els.canvas.height
    ) {
      return;
    }

    var rect = els.canvas.getBoundingClientRect();
    var scaleX = els.canvas.width / rect.width;
    var scaleY = els.canvas.height / rect.height;

    var x = Math.floor((e.clientX - rect.left) * scaleX);
    var y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || y < 0 || x >= els.canvas.width || y >= els.canvas.height) {
      return;
    }

    var px = ctx.getImageData(x, y, 1, 1).data;
    var r = px[0];
    var g = px[1];
    var b = px[2];

    var hex = rgbToHex(r, g, b);
    var hsl = rgbToHsl(r, g, b);
    var contrast = getContrastText(r, g, b);

    if (els.canvasInfo) {
      els.canvasInfo.innerHTML =
        "<div style='background:" +
        hex +
        ";color:" +
        contrast +
        ";padding:14px;border-radius:14px;text-align:center'>" +
        "<b>" +
        hex +
        "</b><br>" +
        "RGB(" +
        r +
        ", " +
        g +
        ", " +
        b +
        ")<br>" +
        "HSL(" +
        hsl.h +
        ", " +
        hsl.s +
        "%, " +
        hsl.l +
        "%)" +
        "</div>";
    }

    setColorFromRgb(r, g, b, true);
    updateLens(e);
  }

  function loadImageFile(file) {
    if (!file || !els.canvas || !ctx) return;

    var reader = new FileReader();

    reader.onload = function (ev) {
      var img = new Image();

      img.onload = function () {
        var maxWidth = 520;
        var width = img.width;
        var height = img.height;

        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }

        els.canvas.width = width;
        els.canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        state.imageLoaded = true;
        extractColors();

        if (els.canvasInfo) {
          els.canvasInfo.textContent =
            "Tap the image to inspect a pixel color.";
        }

        showToast("Image Loaded");
        updateLensBackground();
      };

      img.src = ev.target.result;
    };

    reader.readAsDataURL(file);
  }

  function updatePickerPosition(e) {
    if (!els.pickerArea || !els.pickerPointer) return;

    var rect = els.pickerArea.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var x = clamp(e.clientX - rect.left, 0, rect.width);
    var y = clamp(e.clientY - rect.top, 0, rect.height);

    state.saturation = Math.round((x / rect.width) * 100);
    state.brightness = Math.round(100 - (y / rect.height) * 100);

    els.pickerPointer.style.left = x + "px";
    els.pickerPointer.style.top = y + "px";

    updateColor();
    vibrate("light");
  }

  function copyCurrentHex() {
    if (els.hexText) copyText(els.hexText.textContent);
  }

  function copyCurrentRgb() {
    if (els.rgbValueText) copyText(els.rgbValueText.textContent);
  }

  function copyCurrentHsl() {
    if (els.hslValueText) copyText(els.hslValueText.textContent);
  }

  function applyCardTilt() {
    if ("ontouchstart" in window) return;

    var cards = document.querySelectorAll(".card, .hero-card");
    var i;

    function addTiltHandlers(el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var rotateX = -(y / rect.height - 0.5) * 6;
        var rotateY = (x / rect.width - 0.5) * 6;

        el.style.transform =
          "perspective(700px) rotateX(" +
          rotateX +
          "deg) rotateY(" +
          rotateY +
          "deg) translateY(-2px)";
      });

      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    }

    for (i = 0; i < cards.length; i++) {
      addTiltHandlers(cards[i]);
    }
  }

  function handleNavSwipe(diffX, diffY) {
    if (Math.abs(diffX) <= 90) return;
    if (Math.abs(diffX) <= Math.abs(diffY)) return;

    if (diffX > 0) {
      if (state.activeScreen === "uploadScreen") {
        showScreen("mainApp");
      }
    } else {
      if (state.activeScreen === "mainApp") {
        showScreen("uploadScreen");
      }
    }
  }

  function initEvents() {
    if (els.startBtn) {
      els.startBtn.addEventListener("click", function () {
        els.startBtn.textContent = "Loading...";
        vibrate("medium");
        springAnimate(els.startBtn, 0.96);

        window.setTimeout(function () {
          showScreen("mainApp");
          els.startBtn.textContent = "Enter Studio";
          updateColor();
        }, 380);
      });
    }

    if (els.openUploadBtn) {
      els.openUploadBtn.addEventListener("click", function () {
        showScreen("uploadScreen");
        vibrate("light");
        springAnimate(els.openUploadBtn, 0.97);
      });
    }

    if (els.openUploadBtn2) {
      els.openUploadBtn2.addEventListener("click", function () {
        showScreen("uploadScreen");
        vibrate("light");
        springAnimate(els.openUploadBtn2, 0.97);
      });
    }

    if (els.backHomeBtn) {
      els.backHomeBtn.addEventListener("click", function () {
        showScreen("mainApp");
        vibrate("light");
      });
    }

    if (els.randomColorBtn) {
      els.randomColorBtn.addEventListener("click", function () {
        randomColor();
        springAnimate(els.randomColorBtn, 0.95);
      });
    }

    if (els.copyColorBtn) {
      els.copyColorBtn.addEventListener("click", function () {
        copyCurrentHex();
        springAnimate(els.copyColorBtn, 0.95);
      });
    }

    if (els.exportCssBtn) {
      els.exportCssBtn.addEventListener("click", function () {
        exportCSS();
        springAnimate(els.exportCssBtn, 0.95);
      });
    }

    if (els.copyHexBtn) {
      els.copyHexBtn.addEventListener("click", copyCurrentHex);
    }

    if (els.copyRgbBtn) {
      els.copyRgbBtn.addEventListener("click", copyCurrentRgb);
    }

    if (els.copyHslBtn) {
      els.copyHslBtn.addEventListener("click", copyCurrentHsl);
    }

    if (els.monoBtn) {
      els.monoBtn.addEventListener("click", function () {
        setMode("mono");
      });
    }

    if (els.compBtn) {
      els.compBtn.addEventListener("click", function () {
        setMode("comp");
      });
    }

    if (els.analogBtn) {
      els.analogBtn.addEventListener("click", function () {
        setMode("analog");
      });
    }

    if (els.pickerArea) {
      els.pickerArea.addEventListener("pointerdown", function (e) {
        draggingPicker = true;
        swipeLocked = true;
        updatePickerPosition(e);
      });
    }

    window.addEventListener("pointermove", function (e) {
      if (draggingPicker) {
        updatePickerPosition(e);
      }

      if (draggingCanvas) {
        inspectCanvasPixel(e);
      }

      if (state.imageLoaded) {
        updateLens(e);
      }
    });

    window.addEventListener("pointerup", function () {
      draggingPicker = false;
      draggingCanvas = false;
      swipeLocked = false;
      if (els.lens) {
        els.lens.style.display = "none";
      }
    });

    if (els.hueSlider) {
      els.hueSlider.addEventListener("input", function () {
        state.hue = parseInt(els.hueSlider.value, 10);
        updatePickerBackground();
        updateColor();
      });
    }

    if (els.opacitySlider) {
      els.opacitySlider.addEventListener("input", function () {
        state.alpha = parseInt(els.opacitySlider.value, 10) / 100;
        updateColor();
      });
    }

    if (els.imageUpload) {
      els.imageUpload.addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        loadImageFile(file);
      });
    }

    if (els.canvas) {
      els.canvas.addEventListener("pointerdown", function (e) {
        draggingCanvas = true;
        inspectCanvasPixel(e);
      });

      els.canvas.addEventListener("pointermove", function (e) {
        if (draggingCanvas) {
          inspectCanvasPixel(e);
        }
        updateLens(e);
      });

      els.canvas.addEventListener("pointerleave", function () {
        draggingCanvas = false;
        if (els.lens) {
          els.lens.style.display = "none";
        }
      });
    }

    document.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches && e.touches[0]) {
          startTouchX = e.touches[0].clientX;
          startTouchY = e.touches[0].clientY;
        }
      },
      {
        passive: true,
      }
    );

    document.addEventListener(
      "touchend",
      function (e) {
        var endX;
        var endY;
        var diffX;
        var diffY;

        if (swipeLocked) return;
        if (!e.changedTouches || !e.changedTouches[0]) return;

        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        diffX = endX - startTouchX;
        diffY = endY - startTouchY;

        handleNavSwipe(diffX, diffY);
      },
      { passive: true }
    );

    window.addEventListener("scroll", function () {
      if (!topBar) return;
      if (window.scrollY > 20) topBar.classList.add("scrolled");
      else topBar.classList.remove("scrolled");
    });

    window.generatePalette = function () {
      renderSmartPalette();
      showToast("Palette Generated");
    };

    window.randomColor = randomColor;
    window.exportCSS = exportCSS;
    window.copyColor = copyCurrentHex;
    window.openPhotoLab = function () {
      showScreen("uploadScreen");
    };
  }

  function init() {
    loadState();

    if (els.hueSlider) els.hueSlider.value = state.hue;
    if (els.opacitySlider)
      els.opacitySlider.value = Math.round(state.alpha * 100);

    updatePickerBackground();
    updateModeButtons();
    showScreen("splashScreen");
    updateColor();
    applyCardTilt();
  }

  initEvents();
  init();
});
       
