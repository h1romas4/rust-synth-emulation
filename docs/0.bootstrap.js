(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{

/***/ "./node_modules/webpack/buildin/harmony-module.js":
/*!*******************************************!*\
  !*** (webpack)/buildin/harmony-module.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = function(originalModule) {\n\tif (!originalModule.webpackPolyfill) {\n\t\tvar module = Object.create(originalModule);\n\t\t// module.parent = undefined by default\n\t\tif (!module.children) module.children = [];\n\t\tObject.defineProperty(module, \"loaded\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.l;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, \"id\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.i;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, \"exports\", {\n\t\t\tenumerable: true\n\t\t});\n\t\tmodule.webpackPolyfill = 1;\n\t}\n\treturn module;\n};\n\n\n//# sourceURL=webpack:///(webpack)/buildin/harmony-module.js?");

/***/ }),

/***/ "./pkg/chiptune.js":
/*!*************************!*\
  !*** ./pkg/chiptune.js ***!
  \*************************/
/*! exports provided: WgmPlay, __wbg_new_59cb74e423758ede, __wbg_stack_558ba5917b466edd, __wbg_error_4bb6c2a97407129a, __wbindgen_object_drop_ref, __wbindgen_throw */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chiptune_bg.wasm */ \"./pkg/chiptune_bg.wasm\");\n/* harmony import */ var _chiptune_bg_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chiptune_bg.js */ \"./pkg/chiptune_bg.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"WgmPlay\", function() { return _chiptune_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"WgmPlay\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_new_59cb74e423758ede\", function() { return _chiptune_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_new_59cb74e423758ede\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_stack_558ba5917b466edd\", function() { return _chiptune_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_stack_558ba5917b466edd\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_error_4bb6c2a97407129a\", function() { return _chiptune_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_error_4bb6c2a97407129a\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_object_drop_ref\", function() { return _chiptune_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_object_drop_ref\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_throw\", function() { return _chiptune_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_throw\"]; });\n\n\n\n\n//# sourceURL=webpack:///./pkg/chiptune.js?");

/***/ }),

/***/ "./pkg/chiptune_bg.js":
/*!****************************!*\
  !*** ./pkg/chiptune_bg.js ***!
  \****************************/
/*! exports provided: WgmPlay, __wbg_new_59cb74e423758ede, __wbg_stack_558ba5917b466edd, __wbg_error_4bb6c2a97407129a, __wbindgen_object_drop_ref, __wbindgen_throw */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"WgmPlay\", function() { return WgmPlay; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_new_59cb74e423758ede\", function() { return __wbg_new_59cb74e423758ede; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_stack_558ba5917b466edd\", function() { return __wbg_stack_558ba5917b466edd; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_error_4bb6c2a97407129a\", function() { return __wbg_error_4bb6c2a97407129a; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_object_drop_ref\", function() { return __wbindgen_object_drop_ref; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_throw\", function() { return __wbindgen_throw; });\n/* harmony import */ var _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chiptune_bg.wasm */ \"./pkg/chiptune_bg.wasm\");\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\nvar heap = new Array(32).fill(undefined);\nheap.push(undefined, null, true, false);\n\nfunction getObject(idx) {\n  return heap[idx];\n}\n\nvar heap_next = heap.length;\n\nfunction dropObject(idx) {\n  if (idx < 36) return;\n  heap[idx] = heap_next;\n  heap_next = idx;\n}\n\nfunction takeObject(idx) {\n  var ret = getObject(idx);\n  dropObject(idx);\n  return ret;\n}\n\nvar lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;\nvar cachedTextDecoder = new lTextDecoder('utf-8', {\n  ignoreBOM: true,\n  fatal: true\n});\ncachedTextDecoder.decode();\nvar cachegetUint8Memory0 = null;\n\nfunction getUint8Memory0() {\n  if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer) {\n    cachegetUint8Memory0 = new Uint8Array(_chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer);\n  }\n\n  return cachegetUint8Memory0;\n}\n\nfunction getStringFromWasm0(ptr, len) {\n  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));\n}\n\nvar cachegetInt32Memory0 = null;\n\nfunction getInt32Memory0() {\n  if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer) {\n    cachegetInt32Memory0 = new Int32Array(_chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"memory\"].buffer);\n  }\n\n  return cachegetInt32Memory0;\n}\n\nfunction addHeapObject(obj) {\n  if (heap_next === heap.length) heap.push(heap.length + 1);\n  var idx = heap_next;\n  heap_next = heap[idx];\n  heap[idx] = obj;\n  return idx;\n}\n\nvar WASM_VECTOR_LEN = 0;\nvar lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;\nvar cachedTextEncoder = new lTextEncoder('utf-8');\nvar encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? function (arg, view) {\n  return cachedTextEncoder.encodeInto(arg, view);\n} : function (arg, view) {\n  var buf = cachedTextEncoder.encode(arg);\n  view.set(buf);\n  return {\n    read: arg.length,\n    written: buf.length\n  };\n};\n\nfunction passStringToWasm0(arg, malloc, realloc) {\n  if (realloc === undefined) {\n    var buf = cachedTextEncoder.encode(arg);\n\n    var _ptr = malloc(buf.length);\n\n    getUint8Memory0().subarray(_ptr, _ptr + buf.length).set(buf);\n    WASM_VECTOR_LEN = buf.length;\n    return _ptr;\n  }\n\n  var len = arg.length;\n  var ptr = malloc(len);\n  var mem = getUint8Memory0();\n  var offset = 0;\n\n  for (; offset < len; offset++) {\n    var code = arg.charCodeAt(offset);\n    if (code > 0x7F) break;\n    mem[ptr + offset] = code;\n  }\n\n  if (offset !== len) {\n    if (offset !== 0) {\n      arg = arg.slice(offset);\n    }\n\n    ptr = realloc(ptr, len, len = offset + arg.length * 3);\n    var view = getUint8Memory0().subarray(ptr + offset, ptr + len);\n    var ret = encodeString(arg, view);\n    offset += ret.written;\n  }\n\n  WASM_VECTOR_LEN = offset;\n  return ptr;\n}\n/**\n*/\n\n\nvar WgmPlay = /*#__PURE__*/function () {\n  _createClass(WgmPlay, [{\n    key: \"__destroy_into_raw\",\n    value: function __destroy_into_raw() {\n      var ptr = this.ptr;\n      this.ptr = 0;\n      return ptr;\n    }\n  }, {\n    key: \"free\",\n    value: function free() {\n      var ptr = this.__destroy_into_raw();\n\n      _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbg_wgmplay_free\"](ptr);\n    }\n    /**\n    *\n    * constructor\n    * @param {number} sample_rate\n    * @param {number} max_sampling_size\n    * @param {number} data_length\n    */\n\n  }], [{\n    key: \"__wrap\",\n    value: function __wrap(ptr) {\n      var obj = Object.create(WgmPlay.prototype);\n      obj.ptr = ptr;\n      return obj;\n    }\n  }]);\n\n  function WgmPlay(sample_rate, max_sampling_size, data_length) {\n    _classCallCheck(this, WgmPlay);\n\n    var ret = _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wgmplay_from\"](sample_rate, max_sampling_size, data_length);\n    return WgmPlay.__wrap(ret);\n  }\n  /**\n  *\n  * Return vgmdata buffer referance.\n  * @returns {number}\n  */\n\n\n  _createClass(WgmPlay, [{\n    key: \"get_seq_data_ref\",\n    value: function get_seq_data_ref() {\n      var ret = _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wgmplay_get_seq_data_ref\"](this.ptr);\n      return ret;\n    }\n    /**\n    *\n    * Return sampling_l buffer referance.\n    * @returns {number}\n    */\n\n  }, {\n    key: \"get_sampling_l_ref\",\n    value: function get_sampling_l_ref() {\n      var ret = _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wgmplay_get_sampling_l_ref\"](this.ptr);\n      return ret;\n    }\n    /**\n    *\n    * Return sampling_r buffer referance.\n    * @returns {number}\n    */\n\n  }, {\n    key: \"get_sampling_r_ref\",\n    value: function get_sampling_r_ref() {\n      var ret = _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wgmplay_get_sampling_r_ref\"](this.ptr);\n      return ret;\n    }\n    /**\n    *\n    * get_header\n    * @returns {string}\n    */\n\n  }, {\n    key: \"get_seq_header\",\n    value: function get_seq_header() {\n      try {\n        var retptr = _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_add_to_stack_pointer\"](-16);\n\n        _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wgmplay_get_seq_header\"](retptr, this.ptr);\n        var r0 = getInt32Memory0()[retptr / 4 + 0];\n        var r1 = getInt32Memory0()[retptr / 4 + 1];\n        return getStringFromWasm0(r0, r1);\n      } finally {\n        _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_add_to_stack_pointer\"](16);\n\n        _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_free\"](r0, r1);\n      }\n    }\n    /**\n    *\n    * get_gd3\n    * @returns {string}\n    */\n\n  }, {\n    key: \"get_seq_gd3\",\n    value: function get_seq_gd3() {\n      try {\n        var retptr = _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_add_to_stack_pointer\"](-16);\n\n        _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wgmplay_get_seq_gd3\"](retptr, this.ptr);\n        var r0 = getInt32Memory0()[retptr / 4 + 0];\n        var r1 = getInt32Memory0()[retptr / 4 + 1];\n        return getStringFromWasm0(r0, r1);\n      } finally {\n        _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_add_to_stack_pointer\"](16);\n\n        _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_free\"](r0, r1);\n      }\n    }\n    /**\n    *\n    * Initialize sound driver.\n    *\n    * # Arguments\n    * sample_rate - WebAudio sampling rate\n    * @returns {boolean}\n    */\n\n  }, {\n    key: \"init\",\n    value: function init() {\n      var ret = _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wgmplay_init\"](this.ptr);\n      return ret !== 0;\n    }\n    /**\n    *\n    * play\n    * @returns {number}\n    */\n\n  }, {\n    key: \"play\",\n    value: function play() {\n      var ret = _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"wgmplay_play\"](this.ptr);\n      return ret >>> 0;\n    }\n  }]);\n\n  return WgmPlay;\n}();\nfunction __wbg_new_59cb74e423758ede() {\n  var ret = new Error();\n  return addHeapObject(ret);\n}\n;\nfunction __wbg_stack_558ba5917b466edd(arg0, arg1) {\n  var ret = getObject(arg1).stack;\n  var ptr0 = passStringToWasm0(ret, _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_malloc\"], _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_realloc\"]);\n  var len0 = WASM_VECTOR_LEN;\n  getInt32Memory0()[arg0 / 4 + 1] = len0;\n  getInt32Memory0()[arg0 / 4 + 0] = ptr0;\n}\n;\nfunction __wbg_error_4bb6c2a97407129a(arg0, arg1) {\n  try {\n    console.error(getStringFromWasm0(arg0, arg1));\n  } finally {\n    _chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[\"__wbindgen_free\"](arg0, arg1);\n  }\n}\n;\nfunction __wbindgen_object_drop_ref(arg0) {\n  takeObject(arg0);\n}\n;\nfunction __wbindgen_throw(arg0, arg1) {\n  throw new Error(getStringFromWasm0(arg0, arg1));\n}\n;\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))\n\n//# sourceURL=webpack:///./pkg/chiptune_bg.js?");

/***/ }),

/***/ "./pkg/chiptune_bg.wasm":
/*!******************************!*\
  !*** ./pkg/chiptune_bg.wasm ***!
  \******************************/
/*! exports provided: memory, __wbg_wgmplay_free, wgmplay_from, wgmplay_get_seq_data_ref, wgmplay_get_sampling_l_ref, wgmplay_get_sampling_r_ref, wgmplay_get_seq_header, wgmplay_get_seq_gd3, wgmplay_init, wgmplay_play, __wbindgen_add_to_stack_pointer, __wbindgen_free, __wbindgen_malloc, __wbindgen_realloc */
/***/ (function(module, exports, __webpack_require__) {

eval("\"use strict\";\n// Instantiate WebAssembly module\nvar wasmExports = __webpack_require__.w[module.i];\n__webpack_require__.r(exports);\n// export exports from WebAssembly module\nfor(var name in wasmExports) if(name != \"__webpack_init__\") exports[name] = wasmExports[name];\n// exec imports from WebAssembly module (for esm order)\n/* harmony import */ var m0 = __webpack_require__(/*! ./chiptune_bg.js */ \"./pkg/chiptune_bg.js\");\n\n\n// exec wasm module\nwasmExports[\"__webpack_init__\"]()\n\n//# sourceURL=webpack:///./pkg/chiptune_bg.wasm?");

/***/ }),

/***/ "./src/js/index.js":
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var chiptune__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! chiptune */ \"./pkg/chiptune.js\");\n/* harmony import */ var chiptune_chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! chiptune/chiptune_bg.wasm */ \"./pkg/chiptune_bg.wasm\");\n\n // vgm setting\n\nvar MAX_SAMPLING_BUFFER = 4096;\nvar SAMPLING_RATE = 44100;\nvar LOOP_MAX_COUNT = 2;\nvar FEED_OUT_SECOND = 2;\nvar FEED_OUT_REMAIN = SAMPLING_RATE * FEED_OUT_SECOND / MAX_SAMPLING_BUFFER; // canvas settings\n\nvar CANVAS_WIDTH = 768;\nvar CANVAS_HEIGHT = 576;\nvar COLOR_MD_GREEN = '#00a040';\nvar COLOR_MD_RED = '#e60012';\nvar FONT_MAIN_STYLE = '16px sans-serif'; // vgm member\n\nvar wgmplay = null;\nvar seqdata;\nvar samplingBufferL;\nvar samplingBufferR;\nvar feedOutCount = 0;\nvar playlist = [];\nvar totalPlaylistCount;\nvar music_meta;\n/**\n * audio context\n */\n\nvar audioContext = null;\nvar audioNode = null;\nvar audioGain;\nvar audioAnalyser;\nvar audioAnalyserBuffer;\nvar audioAnalyserBufferLength; // canvas member\n\nvar canvas;\nvar canvasContext;\nvar animId = null; // canvas setting\n\ncanvas = document.getElementById('screen');\ncanvas.setAttribute('width', CANVAS_WIDTH);\ncanvas.setAttribute('height', CANVAS_HEIGHT);\nvar pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;\n\nif (pixelRatio > 1 && window.screen.width < CANVAS_WIDTH) {\n  canvas.style.width = 320 + \"px\";\n  canvas.style.heigth = 240 + \"px\";\n}\n\ncanvasContext = canvas.getContext('2d');\n/**\n * load sample vgm data\n */\n\nfetch('./vgm/ym2612.vgm').then(function (response) {\n  return response.arrayBuffer();\n}).then(function (bytes) {\n  init(bytes);\n}).then(function () {\n  canvas.addEventListener('click', play, false);\n  canvas.addEventListener('dragover', function (e) {\n    prevent(e);\n    canvas.style.border = '4px dotted #333333';\n    return false;\n  }, false);\n  canvas.addEventListener('dragleave', function (e) {\n    prevent(e);\n    canvas.style.border = 'none';\n    return false;\n  });\n  canvas.addEventListener('drop', onDrop, false); // for sample vgm\n\n  totalPlaylistCount = 1;\n  music_meta = createGd3meta({\n    track_name: \"MEGADRIVE/GENESIS VGM(vgm/vgz) Player\",\n    track_name_j: \"\",\n    game_name: \"\",\n    game_name_j: \"YM2612 sample VGM\",\n    track_author: \"@h1romas4\",\n    track_author_j: \"\"\n  }); // ready to go\n\n  startScreen();\n});\n/**\n * fillTextCenterd\n */\n\nvar fillTextCenterd = function fillTextCenterd(str, height) {\n  var left = (CANVAS_WIDTH - canvasContext.measureText(str).width) / 2;\n  canvasContext.fillText(str, left, height);\n};\n/**\n * startScreen\n */\n\n\nvar startScreen = function startScreen() {\n  canvasContext.fillStyle = 'rgb(0, 0, 0)';\n  canvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);\n  canvasContext.font = '20px sans-serif';\n  canvasContext.fillStyle = COLOR_MD_GREEN;\n  fillTextCenterd(\"DRAG AND DROP MEGADRIVE/GENESIS VGM(vgm/vgz) HEAR!\", CANVAS_HEIGHT / 2 - 64);\n  fillTextCenterd(\"OR CLICK TO PLAY SAMPLE VGM.\", CANVAS_HEIGHT / 2 - 32);\n};\n/**\n * event prevent\n */\n\n\nvar prevent = function prevent(e) {\n  e.preventDefault();\n  e.stopPropagation();\n};\n/**\n * Drag and Drop\n */\n\n\nvar onDrop = function onDrop(ev) {\n  prevent(ev);\n  canvas.removeEventListener('drop', onDrop, false);\n  canvas.style.border = 'none';\n  var filelist = {};\n  var files = ev.dataTransfer.files;\n  [].forEach.call(files, function (file) {\n    var reader = new FileReader();\n\n    reader.onload = function () {\n      filelist[file.name] = reader.result;\n\n      if (Object.keys(filelist).length >= files.length) {\n        canvas.addEventListener('drop', onDrop, false);\n        playlist = [];\n        Object.keys(filelist).sort().forEach(function (key) {\n          playlist.push(filelist[key]);\n        });\n        totalPlaylistCount = playlist.length;\n        next();\n      }\n    };\n\n    reader.readAsArrayBuffer(file);\n  });\n  return false;\n};\n/**\n * play next playlist\n */\n\n\nvar next = function next() {\n  if (playlist.length <= 0) return;\n\n  if (init(playlist.shift())) {\n    play();\n  } else {\n    next();\n  }\n};\n\nvar createGd3meta = function createGd3meta(meta) {\n  meta.game_track_name = [meta.game_name, meta.track_name].filter(function (str) {\n    return str != \"\";\n  }).join(\" | \");\n  meta.game_track_name_j = [meta.game_name_j, meta.track_name_j].filter(function (str) {\n    return str != \"\";\n  }).join(\" / \");\n  meta.track_author_full = [meta.track_author, meta.track_author_j].filter(function (str) {\n    return str != \"\";\n  }).join(\" - \");\n  canvasContext.font = FONT_MAIN_STYLE;\n  meta.game_track_name_left = (CANVAS_WIDTH - canvasContext.measureText(meta.game_track_name).width) / 2;\n  meta.game_track_name_j_left = (CANVAS_WIDTH - canvasContext.measureText(meta.game_track_name_j).width) / 2;\n  meta.track_author_full_left = (CANVAS_WIDTH - canvasContext.measureText(meta.track_author_full).width) / 2;\n  return meta;\n};\n/**\n * init\n * @param ArrayBuffer bytes\n */\n\n\nvar init = function init(bytes) {\n  if (wgmplay != null) wgmplay.free(); // create wasm instanse\n\n  wgmplay = new chiptune__WEBPACK_IMPORTED_MODULE_0__[\"WgmPlay\"](SAMPLING_RATE, MAX_SAMPLING_BUFFER, bytes.byteLength); // set vgmdata\n\n  seqdata = new Uint8Array(chiptune_chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_1__[\"memory\"].buffer, wgmplay.get_seq_data_ref(), bytes.byteLength);\n  seqdata.set(new Uint8Array(bytes)); // init player\n\n  if (!wgmplay.init()) return false;\n  samplingBufferL = new Float32Array(chiptune_chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_1__[\"memory\"].buffer, wgmplay.get_sampling_l_ref(), MAX_SAMPLING_BUFFER);\n  samplingBufferR = new Float32Array(chiptune_chiptune_bg_wasm__WEBPACK_IMPORTED_MODULE_1__[\"memory\"].buffer, wgmplay.get_sampling_r_ref(), MAX_SAMPLING_BUFFER);\n  music_meta = createGd3meta(JSON.parse(wgmplay.get_seq_gd3()));\n  return true;\n};\n/**\n * disconnect\n */\n\n\nvar disconnect = function disconnect() {\n  if (audioAnalyser != null) audioAnalyser.disconnect();\n  if (audioGain != null) audioGain.disconnect();\n  if (audioNode != null) audioNode.disconnect();\n  if (audioContext != null) audioContext.close(); // force GC\n\n  audioAnalyser = null;\n  audioNode = null;\n  audioGain = null;\n  audioContext = null;\n};\n/**\n * play\n */\n\n\nvar play = function play() {\n  canvas.removeEventListener('click', play, false); // recreate audio context for prevent memory leak.\n\n  disconnect();\n  audioContext = new (window.AudioContext || window.webkitAudioContext)({\n    sampleRate: SAMPLING_RATE\n  });\n  audioNode = audioContext.createScriptProcessor(MAX_SAMPLING_BUFFER, 2, 2);\n  feedOutCount = 0;\n  var stop = false;\n\n  audioNode.onaudioprocess = function (ev) {\n    // flash last sampling\n    if (stop) {\n      disconnect();\n      next();\n      return;\n    }\n\n    var loop = wgmplay.play();\n    ev.outputBuffer.getChannelData(0).set(samplingBufferL);\n    ev.outputBuffer.getChannelData(1).set(samplingBufferR);\n\n    if (loop >= LOOP_MAX_COUNT) {\n      if (feedOutCount == 0 && loop > LOOP_MAX_COUNT) {\n        // no loop track\n        stop = true;\n      } else {\n        // feedout loop track\n        if (feedOutCount == 0) {\n          audioGain.gain.setValueAtTime(1, audioContext.currentTime);\n          audioGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + FEED_OUT_SECOND);\n        }\n\n        feedOutCount++;\n\n        if (feedOutCount > FEED_OUT_REMAIN) {\n          stop = true;\n        }\n      }\n    }\n  }; // connect gain\n\n\n  audioGain = audioContext.createGain();\n  audioNode.connect(audioGain);\n  audioGain.connect(audioContext.destination);\n  audioGain.gain.setValueAtTime(1, audioContext.currentTime); // connect fft\n\n  audioAnalyser = audioContext.createAnalyser();\n  audioAnalyserBufferLength = audioAnalyser.frequencyBinCount;\n  audioAnalyserBuffer = new Uint8Array(audioAnalyserBufferLength);\n  audioAnalyser.getByteTimeDomainData(audioAnalyserBuffer);\n  audioGain.connect(audioAnalyser);\n\n  if (animId != null) {\n    window.cancelAnimationFrame(animId);\n    animId = null;\n  }\n\n  draw();\n};\n\nvar draw = function draw() {\n  animId = window.requestAnimationFrame(draw);\n  canvasContext.fillStyle = 'rgb(0, 0, 0)';\n  canvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);\n\n  if (audioAnalyser != null) {\n    audioAnalyser.getByteFrequencyData(audioAnalyserBuffer);\n    canvasContext.lineWidth = 1;\n    canvasContext.beginPath();\n    canvasContext.strokeStyle = COLOR_MD_RED;\n    var width = 4;\n    var step = Math.round(audioAnalyserBufferLength / (CANVAS_WIDTH / width));\n    canvasContext.setLineDash([2, 1]);\n    canvasContext.lineWidth = width;\n\n    for (var i = 0; i < audioAnalyserBufferLength; i += step) {\n      canvasContext.beginPath();\n      canvasContext.moveTo(i + 2, CANVAS_HEIGHT);\n      canvasContext.lineTo(i + 2, CANVAS_HEIGHT - audioAnalyserBuffer[i] * 1.5);\n      canvasContext.stroke();\n    }\n\n    canvasContext.stroke();\n  }\n\n  canvasContext.font = \"12px monospace\";\n  canvasContext.fillStyle = COLOR_MD_GREEN;\n\n  if (totalPlaylistCount >= 1) {\n    fillTextCenterd(\"Track \" + (totalPlaylistCount - playlist.length) + \" / \" + totalPlaylistCount, CANVAS_HEIGHT / 2 - 96);\n  }\n\n  canvasContext.font = FONT_MAIN_STYLE;\n  canvasContext.fillText(music_meta.game_track_name, music_meta.game_track_name_left, CANVAS_HEIGHT / 2 - 64);\n  canvasContext.fillText(music_meta.game_track_name_j, music_meta.game_track_name_j_left, CANVAS_HEIGHT / 2 - 32);\n  canvasContext.fillText(music_meta.track_author_full, music_meta.track_author_full_left, CANVAS_HEIGHT / 2);\n};\n\n//# sourceURL=webpack:///./src/js/index.js?");

/***/ })

}]);