import { WasmVgmPlay } from "wasm-vgm-player";
import { memory } from "wasm-vgm-player/wasm_vgm_player_bg";

// vgm setting
const MAX_SAMPLING_BUFFER = 4096;
const SAMPLING_RATE = 44100;
// canvas settings
const CANVAS_WIDTH = 768;
const CANVAS_HEIGHT = 576;

// vgm member
let vgmplay = null;
let vgmdata;
let sampling_buffer_l;
let sampling_buffer_r;

/**
 * audio context
 */
let audio_context = null;
let audio_node;

let audio_analyser;
let audio_analyser_buffer;
let audio_analyser_buffer_length;

// canvas member
let canvas;
let canvas_context;

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

/**
 * load vgm data
 */
fetch('./vgm/ym2612.vgm')
    .then(response => response.arrayBuffer())
    .then(bytes => { init(bytes); })
    .then(() => {
        canvas.addEventListener('click', play, false);
        canvas.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, false);
        canvas.addEventListener('drop', onDrop, false);
        // ready to go
        canvas_context.font = "24px monospace";
        canvas_context.fillStyle = "#fff";
        canvas_context.fillText("DRAG AND DROP MEGADRIVE/GENESIS VGM(vgm/vgz) HEAR!", 80, 300);
        canvas_context.fillText("OR CLICK TO PLAY SAMPLE VGM.", 200, 332);
    });

/**
 * Drag and Drop
 */
let onDrop = function(ev) {
    console.log(ev);
    let file = ev.dataTransfer.files[0];
    let reader = new FileReader();
    reader.onload = function() {
        init(reader.result);
        play();
    };
    reader.readAsArrayBuffer(file);
    ev.preventDefault();
    ev.stopPropagation();
    return false;
};

/**
 * init
 * @param ArrayBuffer bytes
 */
let init = function(bytes) {
    if(vgmplay != null) vgmplay.free();
    // create wasm instanse
    vgmplay = new WasmVgmPlay(MAX_SAMPLING_BUFFER, bytes.byteLength);
    // set vgmdata
    vgmdata = new Uint8Array(memory.buffer, vgmplay.get_vgmdata_ref(), bytes.byteLength);
    vgmdata.set(new Uint8Array(bytes));
    // init player
    vgmplay.init(SAMPLING_RATE);
    sampling_buffer_l = new Float32Array(memory.buffer, vgmplay.get_sampling_l_ref(), MAX_SAMPLING_BUFFER);
    sampling_buffer_r = new Float32Array(memory.buffer, vgmplay.get_sampling_r_ref(), MAX_SAMPLING_BUFFER);
}

/**
 * play
 */
let play = function() {
    canvas.removeEventListener('click', play, false);
    // init audio
    if(audio_context != null) audio_context.close();
    audio_context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLING_RATE });
    audio_node = audio_context.createScriptProcessor(MAX_SAMPLING_BUFFER, 2, 2);
    audio_node.onaudioprocess = function(ev) {
        let sample = vgmplay.play();
        ev.outputBuffer.getChannelData(0).set(sampling_buffer_l);
        ev.outputBuffer.getChannelData(1).set(sampling_buffer_r);
        if(sample < MAX_SAMPLING_BUFFER) {
            audio_node.disconnect();
        }
    };
    // connect fft
    audio_analyser = audio_context.createAnalyser();
    audio_analyser_buffer_length = audio_analyser.frequencyBinCount;
    audio_analyser_buffer = new Uint8Array(audio_analyser_buffer_length);
    audio_analyser.getByteTimeDomainData(audio_analyser_buffer);
    audio_node.connect(audio_analyser);
    audio_analyser.connect(audio_context.destination);
    draw();
};

let draw = function() {
    requestAnimationFrame(draw);

    audio_analyser.getByteFrequencyData(audio_analyser_buffer);

    canvas_context.fillStyle = 'rgb(0, 0, 0)';
    canvas_context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    canvas_context.lineWidth = 1;
    canvas_context.beginPath();
    canvas_context.strokeStyle = 'rgb(0, 0, 255)';

    var width = CANVAS_WIDTH * 1.0 / audio_analyser_buffer_length;

    for(var i = 0; i < audio_analyser_buffer_length; i++) {
        var v = audio_analyser_buffer[i] / 255;
        var y = v * CANVAS_HEIGHT / 2;
        canvas_context.rect(width * i, CANVAS_HEIGHT, width, -y * 1.5);
    }
    canvas_context.stroke();
}
