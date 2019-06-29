import { VgmPlay } from "synth-emulation";
import { memory } from "synth-emulation/synth_emulation_bg";

// vgm setting
const MAX_SAMPLING_BUFFER = 4096;
const SAMPLING_RATE = 44100;
// canvas settings
const CANVAS_WIDTH = 768;
const CANVAS_HEIGHT = 576;

// vgm member
let vgmplay = new VgmPlay();
let vgmdata;
let sampling_buffer;

/**
 * audio context
 */
let audio_context;
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
canvas_context.font = "48px serif";
canvas_context.fillStyle = "#fff";
canvas_context.fillText("Click Here", 260, 300);

/**
 * load vgm data
 */
fetch('./vgm/vgmsample.vgm')
    .then(response => response.arrayBuffer())
    .then(bytes => {
        // create buffer from wasm
        vgmdata = new Uint8Array(memory.buffer, vgmplay.get_vgmdata_ref(), bytes.byteLength);
        vgmdata.set(new Uint8Array(bytes))
        sampling_buffer = new Float32Array(memory.buffer, vgmplay.get_sampling_ref(), MAX_SAMPLING_BUFFER);
        // init player
        vgmplay.init(SAMPLING_RATE);
    })
    .then(results => {
        canvas.addEventListener('click', play, false);
    });

/**
 * play
 */
let play = function() {
    // init audio
    audio_context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLING_RATE });
    audio_node = audio_context.createScriptProcessor(MAX_SAMPLING_BUFFER, 1, 1);
    audio_node.onaudioprocess = function(ev) {
        let sample = vgmplay.play();
        ev.outputBuffer.getChannelData(0).set(sampling_buffer);
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
    var x = 0;

    for(var i = 0; i < audio_analyser_buffer_length; i++) {
        var v = audio_analyser_buffer[i] / 255;
        var y = v * CANVAS_HEIGHT / 2;
        canvas_context.rect(width * i, CANVAS_HEIGHT, width, -y * 1.5);
    }
    canvas_context.stroke();
}
