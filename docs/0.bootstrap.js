(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{

/***/ "./pkg/wasm_vgm_player.js":
/*!********************************!*\
  !*** ./pkg/wasm_vgm_player.js ***!
  \********************************/
/*! exports provided: WasmVgmPlay, __wbg_new_59cb74e423758ede, __wbg_stack_558ba5917b466edd, __wbg_error_4bb6c2a97407129a, __wbindgen_object_drop_ref, __wbindgen_throw */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"WasmVgmPlay\", function() { return WasmVgmPlay; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_new_59cb74e423758ede\", function() { return __wbg_new_59cb74e423758ede; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_stack_558ba5917b466edd\", function() { return __wbg_stack_558ba5917b466edd; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_error_4bb6c2a97407129a\", function() { return __wbg_error_4bb6c2a97407129a; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_object_drop_ref\", function() { return __wbindgen_object_drop_ref; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_throw\", function() { return __wbindgen_throw; });\n/* harmony import */ var _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./wasm_vgm_player_bg.wasm */ \"./pkg/wasm_vgm_player_bg.wasm\");\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\nvar heap = new Array(32);\nheap.fill(undefined);\nheap.push(undefined, null, true, false);\nvar heap_next = heap.length;\n\nfunction addHeapObject(obj) {\n  if (heap_next === heap.length) heap.push(heap.length + 1);\n  var idx = heap_next;\n  heap_next = heap[idx];\n  heap[idx] = obj;\n  return idx;\n}\n\nfunction getObject(idx) {\n  return heap[idx];\n}\n\nvar WASM_VECTOR_LEN = 0;\nvar cachedTextEncoder = new TextEncoder('utf-8');\nvar encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? function (arg, view) {\n  return cachedTextEncoder.encodeInto(arg, view);\n} : function (arg, view) {\n  var buf = cachedTextEncoder.encode(arg);\n  view.set(buf);\n  return {\n    read: arg.length,\n    written: buf.length\n  };\n};\nvar cachegetUint8Memory = null;\n\nfunction getUint8Memory() {\n  if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer) {\n    cachegetUint8Memory = new Uint8Array(_wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer);\n  }\n\n  return cachegetUint8Memory;\n}\n\nfunction passStringToWasm(arg) {\n  var len = arg.length;\n\n  var ptr = _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_malloc\"](len);\n\n  var mem = getUint8Memory();\n  var offset = 0;\n\n  for (; offset < len; offset++) {\n    var code = arg.charCodeAt(offset);\n    if (code > 0x7F) break;\n    mem[ptr + offset] = code;\n  }\n\n  if (offset !== len) {\n    if (offset !== 0) {\n      arg = arg.slice(offset);\n    }\n\n    ptr = _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_realloc\"](ptr, len, len = offset + arg.length * 3);\n    var view = getUint8Memory().subarray(ptr + offset, ptr + len);\n    var ret = encodeString(arg, view);\n    offset += ret.written;\n  }\n\n  WASM_VECTOR_LEN = offset;\n  return ptr;\n}\n\nvar cachegetInt32Memory = null;\n\nfunction getInt32Memory() {\n  if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer) {\n    cachegetInt32Memory = new Int32Array(_wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer);\n  }\n\n  return cachegetInt32Memory;\n}\n\nvar cachedTextDecoder = new TextDecoder('utf-8', {\n  ignoreBOM: true,\n  fatal: true\n});\ncachedTextDecoder.decode();\n\nfunction getStringFromWasm(ptr, len) {\n  return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));\n}\n\nfunction dropObject(idx) {\n  if (idx < 36) return;\n  heap[idx] = heap_next;\n  heap_next = idx;\n}\n\nfunction takeObject(idx) {\n  var ret = getObject(idx);\n  dropObject(idx);\n  return ret;\n}\n/**\n*/\n\n\nvar WasmVgmPlay =\n/*#__PURE__*/\nfunction () {\n  _createClass(WasmVgmPlay, [{\n    key: \"free\",\n    value: function free() {\n      var ptr = this.ptr;\n      this.ptr = 0;\n\n      _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbg_wasmvgmplay_free\"](ptr);\n    }\n    /**\n    *\n    * constructor\n    * @param {number} max_sampling_size\n    * @param {number} vgm_size\n    * @returns {WasmVgmPlay}\n    */\n\n  }], [{\n    key: \"__wrap\",\n    value: function __wrap(ptr) {\n      var obj = Object.create(WasmVgmPlay.prototype);\n      obj.ptr = ptr;\n      return obj;\n    }\n  }]);\n\n  function WasmVgmPlay(max_sampling_size, vgm_size) {\n    _classCallCheck(this, WasmVgmPlay);\n\n    var ret = _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wasmvgmplay_from\"](max_sampling_size, vgm_size);\n    return WasmVgmPlay.__wrap(ret);\n  }\n  /**\n  *\n  * Return vgmdata buffer referance.\n  * @returns {number}\n  */\n\n\n  _createClass(WasmVgmPlay, [{\n    key: \"get_vgmdata_ref\",\n    value: function get_vgmdata_ref() {\n      var ret = _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wasmvgmplay_get_vgmdata_ref\"](this.ptr);\n      return ret;\n    }\n    /**\n    *\n    * Return sampling_l buffer referance.\n    * @returns {number}\n    */\n\n  }, {\n    key: \"get_sampling_l_ref\",\n    value: function get_sampling_l_ref() {\n      var ret = _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wasmvgmplay_get_sampling_l_ref\"](this.ptr);\n      return ret;\n    }\n    /**\n    *\n    * Return sampling_r buffer referance.\n    * @returns {number}\n    */\n\n  }, {\n    key: \"get_sampling_r_ref\",\n    value: function get_sampling_r_ref() {\n      var ret = _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wasmvgmplay_get_sampling_r_ref\"](this.ptr);\n      return ret;\n    }\n    /**\n    *\n    * Initialize sound driver.\n    *\n    * # Arguments\n    * sample_rate - WebAudio sampling rate\n    * @param {number} sample_rate\n    */\n\n  }, {\n    key: \"init\",\n    value: function init(sample_rate) {\n      _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wasmvgmplay_init\"](this.ptr, sample_rate);\n    }\n    /**\n    *\n    * play\n    * @returns {number}\n    */\n\n  }, {\n    key: \"play\",\n    value: function play() {\n      var ret = _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wasmvgmplay_play\"](this.ptr);\n      return ret >>> 0;\n    }\n  }]);\n\n  return WasmVgmPlay;\n}();\nvar __wbg_new_59cb74e423758ede = function __wbg_new_59cb74e423758ede() {\n  var ret = new Error();\n  return addHeapObject(ret);\n};\nvar __wbg_stack_558ba5917b466edd = function __wbg_stack_558ba5917b466edd(arg0, arg1) {\n  var ret = getObject(arg1).stack;\n  var ret0 = passStringToWasm(ret);\n  var ret1 = WASM_VECTOR_LEN;\n  getInt32Memory()[arg0 / 4 + 0] = ret0;\n  getInt32Memory()[arg0 / 4 + 1] = ret1;\n};\nvar __wbg_error_4bb6c2a97407129a = function __wbg_error_4bb6c2a97407129a(arg0, arg1) {\n  var v0 = getStringFromWasm(arg0, arg1).slice();\n\n  _wasm_vgm_player_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_free\"](arg0, arg1 * 1);\n\n  console.error(v0);\n};\nvar __wbindgen_object_drop_ref = function __wbindgen_object_drop_ref(arg0) {\n  takeObject(arg0);\n};\nvar __wbindgen_throw = function __wbindgen_throw(arg0, arg1) {\n  throw new Error(getStringFromWasm(arg0, arg1));\n};\n\n//# sourceURL=webpack:///./pkg/wasm_vgm_player.js?");

/***/ }),

/***/ "./pkg/wasm_vgm_player_bg.wasm":
/*!*************************************!*\
  !*** ./pkg/wasm_vgm_player_bg.wasm ***!
  \*************************************/
/*! exports provided: memory, __wbg_wasmvgmplay_free, wasmvgmplay_from, wasmvgmplay_get_vgmdata_ref, wasmvgmplay_get_sampling_l_ref, wasmvgmplay_get_sampling_r_ref, wasmvgmplay_init, wasmvgmplay_play, __wbindgen_malloc, __wbindgen_realloc, __wbindgen_free */
/***/ (function(module, exports, __webpack_require__) {

eval("\"use strict\";\n// Instantiate WebAssembly module\nvar wasmExports = __webpack_require__.w[module.i];\n__webpack_require__.r(exports);\n// export exports from WebAssembly module\nfor(var name in wasmExports) if(name != \"__webpack_init__\") exports[name] = wasmExports[name];\n// exec imports from WebAssembly module (for esm order)\n/* harmony import */ var m0 = __webpack_require__(/*! ./wasm_vgm_player.js */ \"./pkg/wasm_vgm_player.js\");\n\n\n// exec wasm module\nwasmExports[\"__webpack_init__\"]()\n\n//# sourceURL=webpack:///./pkg/wasm_vgm_player_bg.wasm?");

/***/ }),

/***/ "./src/js/index.js":
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var wasm_vgm_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! wasm-vgm-player */ \"./pkg/wasm_vgm_player.js\");\n/* harmony import */ var wasm_vgm_player_wasm_vgm_player_bg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! wasm-vgm-player/wasm_vgm_player_bg */ \"./pkg/wasm_vgm_player_bg.wasm\");\n\n // vgm setting\n\nvar MAX_SAMPLING_BUFFER = 4096;\nvar SAMPLING_RATE = 44100;\nvar LOOP_MAX_COUNT = 2;\nvar FEED_OUT_SECOND = 2;\nvar FEED_OUT_REMAIN = SAMPLING_RATE * FEED_OUT_SECOND / MAX_SAMPLING_BUFFER; // canvas settings\n\nvar CANVAS_WIDTH = 768;\nvar CANVAS_HEIGHT = 576; // vgm member\n\nvar vgmplay = null;\nvar vgmdata;\nvar samplingBufferL;\nvar samplingBufferR;\nvar feedOutCount = 0;\nvar playlist = [];\n/**\n * audio context\n */\n\nvar audioContext = null;\nvar audioNode = null;\nvar audioGain;\nvar audioAnalyser;\nvar audioAnalyserBuffer;\nvar audioAnalyserBufferLength; // canvas member\n\nvar canvas;\nvar canvasContext; // canvas setting\n\ncanvas = document.getElementById('screen');\ncanvas.setAttribute('width', CANVAS_WIDTH);\ncanvas.setAttribute('height', CANVAS_HEIGHT);\nvar pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;\n\nif (pixelRatio > 1 && window.screen.width < CANVAS_WIDTH) {\n  canvas.style.width = 320 + \"px\";\n  canvas.style.heigth = 240 + \"px\";\n}\n\ncanvasContext = canvas.getContext('2d');\n/**\n * load vgm data\n */\n\nfetch('./vgm/ym2612.vgm').then(function (response) {\n  return response.arrayBuffer();\n}).then(function (bytes) {\n  init(bytes);\n}).then(function () {\n  canvas.addEventListener('click', play, false);\n  canvas.addEventListener('dragover', function (e) {\n    prevent(e);\n    canvas.style.border = '4px dotted #333333';\n    return false;\n  }, false);\n  canvas.addEventListener('dragleave', function (e) {\n    prevent(e);\n    canvas.style.border = 'none';\n    return false;\n  });\n  canvas.addEventListener('drop', onDrop, false); // ready to go\n\n  canvasContext.font = \"24px monospace\";\n  canvasContext.fillStyle = \"#fff\";\n  canvasContext.fillText(\"DRAG AND DROP MEGADRIVE/GENESIS VGM(vgm/vgz) HEAR!\", 80, 300);\n  canvasContext.fillText(\"OR CLICK TO PLAY SAMPLE VGM.\", 200, 332);\n});\n/**\n * event prevent\n */\n\nvar prevent = function prevent(e) {\n  e.preventDefault();\n  e.stopPropagation();\n};\n/**\n * Drag and Drop\n */\n\n\nvar onDrop = function onDrop(ev) {\n  prevent(ev);\n  canvas.removeEventListener('drop', onDrop, false);\n  canvas.style.border = 'none';\n  playlist = [];\n  var files = ev.dataTransfer.files;\n\n  var _loop = function _loop(i) {\n    var reader = new FileReader();\n    var number = i;\n\n    reader.onload = function () {\n      playlist[number] = reader.result;\n\n      if (playlist.length >= files.length) {\n        canvas.addEventListener('drop', onDrop, false);\n        next();\n      }\n    };\n\n    reader.readAsArrayBuffer(files[i]);\n  };\n\n  for (var i = 0; i < files.length; i++) {\n    _loop(i);\n  }\n\n  return false;\n};\n/**\n * play next playlist\n */\n\n\nvar next = function next() {\n  if (playlist.length <= 0) return;\n  init(playlist.shift());\n  play();\n};\n/**\n * init\n * @param ArrayBuffer bytes\n */\n\n\nvar init = function init(bytes) {\n  if (vgmplay != null) vgmplay.free(); // create wasm instanse\n\n  vgmplay = new wasm_vgm_player__WEBPACK_IMPORTED_MODULE_0__[\"WasmVgmPlay\"](MAX_SAMPLING_BUFFER, bytes.byteLength); // set vgmdata\n\n  vgmdata = new Uint8Array(wasm_vgm_player_wasm_vgm_player_bg__WEBPACK_IMPORTED_MODULE_1__[\"memory\"].buffer, vgmplay.get_vgmdata_ref(), bytes.byteLength);\n  vgmdata.set(new Uint8Array(bytes)); // init player\n\n  vgmplay.init(SAMPLING_RATE);\n  samplingBufferL = new Float32Array(wasm_vgm_player_wasm_vgm_player_bg__WEBPACK_IMPORTED_MODULE_1__[\"memory\"].buffer, vgmplay.get_sampling_l_ref(), MAX_SAMPLING_BUFFER);\n  samplingBufferR = new Float32Array(wasm_vgm_player_wasm_vgm_player_bg__WEBPACK_IMPORTED_MODULE_1__[\"memory\"].buffer, vgmplay.get_sampling_r_ref(), MAX_SAMPLING_BUFFER);\n};\n/**\n * play\n */\n\n\nvar play = function play() {\n  canvas.removeEventListener('click', play, false); // init audio\n\n  if (audioNode != null) audioNode.disconnect();\n  if (audioContext != null) audioContext.close();\n  audioContext = new (window.AudioContext || window.webkitAudioContext)({\n    sampleRate: SAMPLING_RATE\n  });\n  audioNode = audioContext.createScriptProcessor(MAX_SAMPLING_BUFFER, 2, 2);\n  feedOutCount = 0;\n\n  audioNode.onaudioprocess = function (ev) {\n    var loop = vgmplay.play();\n    ev.outputBuffer.getChannelData(0).set(samplingBufferL);\n    ev.outputBuffer.getChannelData(1).set(samplingBufferR);\n    var stop = false;\n\n    if (loop >= LOOP_MAX_COUNT) {\n      if (feedOutCount == 0 && loop > LOOP_MAX_COUNT) {\n        // no loop track\n        stop = true;\n      } else {\n        // feedout loop track\n        if (feedOutCount == 0) {\n          audioGain.gain.setValueAtTime(1, audioContext.currentTime);\n          audioGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + FEED_OUT_SECOND);\n        }\n\n        feedOutCount++;\n\n        if (feedOutCount > FEED_OUT_REMAIN) {\n          stop = true;\n        }\n      }\n    }\n\n    if (stop) {\n      audioNode.disconnect();\n      next();\n    }\n  }; // connect gain\n\n\n  audioGain = audioContext.createGain();\n  audioNode.connect(audioGain);\n  audioGain.connect(audioContext.destination);\n  audioGain.gain.setValueAtTime(1, audioContext.currentTime); // connect fft\n\n  audioAnalyser = audioContext.createAnalyser();\n  audioAnalyserBufferLength = audioAnalyser.frequencyBinCount;\n  audioAnalyserBuffer = new Uint8Array(audioAnalyserBufferLength);\n  audioAnalyser.getByteTimeDomainData(audioAnalyserBuffer);\n  audioGain.connect(audioAnalyser);\n  draw();\n};\n\nvar draw = function draw() {\n  requestAnimationFrame(draw);\n  audioAnalyser.getByteFrequencyData(audioAnalyserBuffer);\n  canvasContext.fillStyle = 'rgb(0, 0, 0)';\n  canvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);\n  canvasContext.lineWidth = 1;\n  canvasContext.beginPath();\n  canvasContext.strokeStyle = 'rgb(0, 0, 255)';\n  var width = CANVAS_WIDTH * 1.0 / audioAnalyserBufferLength;\n\n  for (var i = 0; i < audioAnalyserBufferLength; i++) {\n    var v = audioAnalyserBuffer[i] / 255;\n    var y = v * CANVAS_HEIGHT / 2;\n    canvasContext.rect(width * i, CANVAS_HEIGHT, width, -y * 1.5);\n  }\n\n  canvasContext.stroke();\n};\n\n//# sourceURL=webpack:///./src/js/index.js?");

/***/ })

}]);