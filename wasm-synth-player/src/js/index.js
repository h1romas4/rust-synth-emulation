import { WasmVgmPlay } from "wasm-vgm-player";
import { memory } from "wasm-vgm-player/wasm_vgm_player_bg";

// vgm setting
const MAX_SAMPLING_BUFFER = 4096;
const SAMPLING_RATE = 44100;
const LOOP_MAX_COUNT = 2;
const FEED_OUT_SECOND = 2;
const FEED_OUT_REMAIN = (SAMPLING_RATE * FEED_OUT_SECOND) / MAX_SAMPLING_BUFFER;
// canvas settings
const CANVAS_WIDTH = 768;
const CANVAS_HEIGHT = 576;

// vgm member
let vgmplay = null;
let vgmdata;
let samplingBufferL;
let samplingBufferR;
let feedOutCount = 0;

/**
 * audio context
 */
let audioContext = null;
let audioNode = null;
let audioGain;

let audioAnalyser;
let audioAnalyserBuffer;
let audioAnalyserBufferLength;

// canvas member
let canvas;
let canvasContext;

// canvas setting
canvas = document.getElementById('screen');
canvas.setAttribute('width', CANVAS_WIDTH);
canvas.setAttribute('height', CANVAS_HEIGHT);
let pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
if(pixelRatio > 1 && window.screen.width < CANVAS_WIDTH) {
    canvas.style.width = 320 + "px";
    canvas.style.heigth = 240 + "px";
}
canvasContext = canvas.getContext('2d');

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
        canvasContext.font = "24px monospace";
        canvasContext.fillStyle = "#fff";
        canvasContext.fillText("DRAG AND DROP MEGADRIVE/GENESIS VGM(vgm/vgz) HEAR!", 80, 300);
        canvasContext.fillText("OR CLICK TO PLAY SAMPLE VGM.", 200, 332);
    });

/**
 * Drag and Drop
 */
let onDrop = function(ev) {
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
    samplingBufferL = new Float32Array(memory.buffer, vgmplay.get_sampling_l_ref(), MAX_SAMPLING_BUFFER);
    samplingBufferR = new Float32Array(memory.buffer, vgmplay.get_sampling_r_ref(), MAX_SAMPLING_BUFFER);
}

/**
 * play
 */
let play = function() {
    canvas.removeEventListener('click', play, false);
    // init audio
    if(audioNode != null) audioNode.disconnect();
    if(audioContext != null) audioContext.close();
    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLING_RATE });
    audioNode = audioContext.createScriptProcessor(MAX_SAMPLING_BUFFER, 2, 2);
    feedOutCount = 0;
    audioNode.onaudioprocess = function(ev) {
        let loop = vgmplay.play();
        ev.outputBuffer.getChannelData(0).set(samplingBufferL);
        ev.outputBuffer.getChannelData(1).set(samplingBufferR);
        if(loop >= LOOP_MAX_COUNT) {
            if(feedOutCount == 0 && loop > LOOP_MAX_COUNT) {
                // no loop track
                audioNode.disconnect();
            } else {
                // feedout loop track
                if(feedOutCount == 0 ) {
                    audioGain.gain.setValueAtTime(1, audioContext.currentTime);
                    audioGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + FEED_OUT_SECOND);
                }
                feedOutCount++;
                if(feedOutCount > FEED_OUT_REMAIN) {
                    audioNode.disconnect();
                }
            }
        }
    };
    // connect gain
    audioGain = audioContext.createGain();
    audioNode.connect(audioGain);
    audioGain.connect(audioContext.destination);
    audioGain.gain.setValueAtTime(1, audioContext.currentTime);
    // connect fft
    audioAnalyser = audioContext.createAnalyser();
    audioAnalyserBufferLength = audioAnalyser.frequencyBinCount;
    audioAnalyserBuffer = new Uint8Array(audioAnalyserBufferLength);
    audioAnalyser.getByteTimeDomainData(audioAnalyserBuffer);
    audioGain.connect(audioAnalyser);
    draw();
};

let draw = function() {
    requestAnimationFrame(draw);

    audioAnalyser.getByteFrequencyData(audioAnalyserBuffer);

    canvasContext.fillStyle = 'rgb(0, 0, 0)';
    canvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    canvasContext.lineWidth = 1;
    canvasContext.beginPath();
    canvasContext.strokeStyle = 'rgb(0, 0, 255)';

    var width = CANVAS_WIDTH * 1.0 / audioAnalyserBufferLength;

    for(var i = 0; i < audioAnalyserBufferLength; i++) {
        var v = audioAnalyserBuffer[i] / 255;
        var y = v * CANVAS_HEIGHT / 2;
        canvasContext.rect(width * i, CANVAS_HEIGHT, width, -y * 1.5);
    }
    canvasContext.stroke();
}
