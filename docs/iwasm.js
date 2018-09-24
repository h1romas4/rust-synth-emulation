/**
 * WebAssembly interface
 */
let wasm_exports;
let wasm_memory;

/**
 * WebAssembly imports (for testing)
 */
const imports = {
    env: {
        console_log: console_log
    }
};

/**
 * audio sampling settings
 */
const SAMPLING_RATE = 44100;
const SAMPLE_LENGTH = 4096;
const SAMPLE_CHANNELS = 1;

const MAX_VGM_DATA = 65535;

/**
 * canvas settings
 */
const CANVAS_WIDTH = 768;
const CANVAS_HEIGHT = 576;

/**
 * audio context
 */
let audio_context;
let audio_buffer;
let audio_node;
let audit_playing = false;
let wasm_audio_buffer;
let wasm_vgm_data;

/**
 * main
 */
function main() {
    if(audit_playing) return;
    audit_playing = true;

    // audio setting
    audio_context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLING_RATE });
    audio_node = audio_context.createScriptProcessor(SAMPLE_LENGTH, 1, 1);

    // init synth
    wasm_exports.init(audio_context.sampleRate);

    // export sampling buffer
    wasm_audio_buffer = new Float32Array(
        wasm_memory.buffer, wasm_exports.get_audio_buffer(), SAMPLE_LENGTH);
    wasm_vgm_data = new Uint8Array(
        wasm_memory.buffer, wasm_exports.get_vgm_data(), MAX_VGM_DATA);

    // load vgm data
    fetch('./vgm/vgmsample.vgm')
        .then(response => response.arrayBuffer())
        .then(bytes => wasm_vgm_data.set(new Uint8Array(bytes)))
        .then(results => {
            audio_node.onaudioprocess = vgmplay;
            audio_node.connect(audio_context.destination);
        });
}

function vgmplay(ev) {
    let sample = wasm_exports.play();
    ev.outputBuffer.getChannelData(0).set(wasm_audio_buffer);

    if(sample < SAMPLE_LENGTH) {
        audio_node.disconnect();
        audit_playing = false;
    }
}

/**
 * initialize.
 */
addEventListener('load', () => {
    // canvas setting
    let canvas = document.getElementById('screen');
    canvas.setAttribute('width', CANVAS_WIDTH);
    canvas.setAttribute('height', CANVAS_HEIGHT);
    let pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    if(pixelRatio > 1 && window.screen.width < CANVAS_WIDTH) {
        canvas.style.width = 320 + "px";
        canvas.style.heigth = 240 + "px";
    }
    let canvas_context = canvas.getContext('2d');
    canvas_context.font = "48px serif";
    canvas_context.fillStyle = "#fff";
    canvas_context.fillText("Click Here", 260, 280);

    // load WebAssembly
    fetch('synth.wasm')
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes, imports))
        .then(results => {
            wasm_exports = results.instance.exports;
            wasm_memory = results.instance.exports.memory;
            canvas.addEventListener('click', main, false);
        });
});

function console_log(value) {
    console.log("rust output(u32): " + value);
}
