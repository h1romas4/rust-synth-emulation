/**
 * WebAssembly interface
 */
let wasm_exports;
let wasm_memory;
let wasm_audio_buffer;
let wasm_vgm_data;

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

let canvas;
let canvas_context;

/**
 * audio context
 */
let audio_context;
let audio_buffer;
let audio_node;
let audit_playing = false;

let audio_analyser;
let audio_analyser_buffer;
let audio_analyser_buffer_length;

/**
 * main
 */
function main() {
    if(audit_playing) return;
    audit_playing = true;

    // audio setting
    audio_context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLING_RATE });
    audio_node = audio_context.createScriptProcessor(SAMPLE_LENGTH, 1, 1);

    // for lazystatic
    wasm_exports.new();

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
            // init synth
            wasm_exports.init(audio_context.sampleRate);
            // connect audio
            audio_node.onaudioprocess = vgmplay;
            // connect fft
            analyser = audio_context.createAnalyser();
            audio_analyser_buffer_length = analyser.frequencyBinCount;
            audio_analyser_buffer = new Uint8Array(audio_analyser_buffer_length);
            analyser.getByteTimeDomainData(audio_analyser_buffer);
            audio_node.connect(analyser);
            analyser.connect(audio_context.destination);
            draw();
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

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(audio_analyser_buffer);

    canvas_context.fillStyle = 'rgb(0, 0, 0)';
    canvas_context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    canvas_context.lineWidth = 1;
    canvas_context.beginPath();
    canvas_context.strokeStyle = 'rgb(0, 0, 255)';

    var width = CANVAS_WIDTH * 1.0 / audio_analyser_buffer_length;
    var x = 0;

    for(var i = 0; i < audio_analyser_buffer_length; i++) {
        var v = audio_analyser_buffer[i] / 255;
        var y = v * CANVAS_HEIGHT / 2;
        canvas_context.rect(width * i, CANVAS_HEIGHT, width, -y * 1.5);
    }
    canvas_context.stroke();
}

/**
 * initialize.
 */
addEventListener('load', () => {
    // canvas setting
    canvas = document.getElementById('screen');
    canvas.setAttribute('width', CANVAS_WIDTH);
    canvas.setAttribute('height', CANVAS_HEIGHT);
    let pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    if(pixelRatio > 1 && window.screen.width < CANVAS_WIDTH) {
        canvas.style.width = 320 + "px";
        canvas.style.heigth = 240 + "px";
    }
    canvas_context = canvas.getContext('2d');
    canvas_context.font = "48px serif";
    canvas_context.fillStyle = "#fff";
    canvas_context.fillText("Click Here", 260, 300);

    // load WebAssembly
    fetch('synth.wasm?v=0.6.0')
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
