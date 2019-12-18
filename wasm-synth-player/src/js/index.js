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
let playlist = [];
let totalPlaylistCount;
let vgm_gd3;

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
let animId = null;

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
            prevent(e);
            canvas.style.border = '4px dotted #333333';
            return false;
        }, false);
        canvas.addEventListener('dragleave', function(e) {
            prevent(e);
            canvas.style.border = 'none';
            return false;
        });
        canvas.addEventListener('drop', onDrop, false);
        // ready to go
        startScreen();
    });

/**
 * startScreen
 */
let startScreen = function() {
    canvasContext.fillStyle = 'rgb(0, 0, 0)';
    canvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    canvasContext.font = "24px monospace";
    canvasContext.fillStyle = "#fff";
    canvasContext.fillText("DRAG AND DROP MEGADRIVE/GENESIS VGM(vgm/vgz) HEAR!", 80, 300);
    canvasContext.fillText("OR CLICK TO PLAY SAMPLE VGM.", 200, 332);
}

/**
 * event prevent
 */
let prevent = function(e) {
    e.preventDefault();
    e.stopPropagation();
};

/**
 * Drag and Drop
 */
let onDrop = function(ev) {
    prevent(ev);
    canvas.removeEventListener('drop', onDrop, false);
    canvas.style.border = 'none';
    let filelist = {};
    let files = ev.dataTransfer.files;
    [].forEach.call(files, function(file) {
        let reader = new FileReader();
        reader.onload = function() {
            filelist[file.name] = reader.result;
            if(Object.keys(filelist).length >= files.length) {
                canvas.addEventListener('drop', onDrop, false);
                playlist = [];
                Object.keys(filelist).sort().forEach(function(key) {
                    playlist.push(filelist[key]);
                });
                totalPlaylistCount = playlist.length;
                next();
            }
        };
        reader.readAsArrayBuffer(file);
    });
    return false;
};

/**
 * play next playlist
 */
let next = function() {
    if(playlist.length <= 0) return;
    if(init(playlist.shift())) {
        play();
    } else {
        next();
    }
}

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
    if(!vgmplay.init(SAMPLING_RATE)) return false;
    samplingBufferL = new Float32Array(memory.buffer, vgmplay.get_sampling_l_ref(), MAX_SAMPLING_BUFFER);
    samplingBufferR = new Float32Array(memory.buffer, vgmplay.get_sampling_r_ref(), MAX_SAMPLING_BUFFER);

    vgm_gd3 = JSON.parse(vgmplay.get_vgm_gd3());

    vgm_gd3.game_track_name = [vgm_gd3.game_name, vgm_gd3.track_name].filter(str => str != "").join(" | ");
    vgm_gd3.game_track_name_j = [vgm_gd3.game_name_j, vgm_gd3.track_name_j].filter(str => str != "").join(" / ");
    vgm_gd3.track_author_full = [vgm_gd3.track_author, vgm_gd3.track_author_j].filter(str => str != "").join(" - ");
    canvasContext.font = "16px sans-serif";
    vgm_gd3.game_track_name_left = (CANVAS_WIDTH - canvasContext.measureText(vgm_gd3.game_track_name).width) / 2;
    vgm_gd3.game_track_name_j_left = (CANVAS_WIDTH - canvasContext.measureText(vgm_gd3.game_track_name_j).width) / 2;
    vgm_gd3.track_author_full_left = (CANVAS_WIDTH - canvasContext.measureText(vgm_gd3.track_author_full).width) / 2;

    return true;
}

/**
 * disconnect
 */
let disconnect = function() {
    if(audioAnalyser != null) audioAnalyser.disconnect();
    if(audioGain != null) audioGain.disconnect();
    if(audioNode != null) audioNode.disconnect();
    if(audioContext != null) audioContext.close();
    audioAnalyser = null; // GC
    audioNode = null; // GC
    audioGain = null; // GC
    audioContext = null;
}

/**
 * play
 */
let play = function() {
    canvas.removeEventListener('click', play, false);
    // init audio
    disconnect();
    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLING_RATE });
    audioNode = audioContext.createScriptProcessor(MAX_SAMPLING_BUFFER, 2, 2);
    feedOutCount = 0;
    audioNode.onaudioprocess = function(ev) {
        let loop = vgmplay.play();
        ev.outputBuffer.getChannelData(0).set(samplingBufferL);
        ev.outputBuffer.getChannelData(1).set(samplingBufferR);
        let stop = false;
        if(loop >= LOOP_MAX_COUNT) {
            if(feedOutCount == 0 && loop > LOOP_MAX_COUNT) {
                // no loop track
                stop = true;
            } else {
                // feedout loop track
                if(feedOutCount == 0 ) {
                    audioGain.gain.setValueAtTime(1, audioContext.currentTime);
                    audioGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + FEED_OUT_SECOND);
                }
                feedOutCount++;
                if(feedOutCount > FEED_OUT_REMAIN) {
                    stop = true;
                }
            }
        }
        if(stop) {
            disconnect();
            next();
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
    if(animId != null) {
        window.cancelAnimationFrame(animId);
        animId = null;
    }
    draw();
};

let draw = function() {
    animId = window.requestAnimationFrame(draw);
    canvasContext.fillStyle = 'rgb(0, 0, 0)';
    canvasContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if(audioAnalyser != null) {
        audioAnalyser.getByteFrequencyData(audioAnalyserBuffer);

        canvasContext.lineWidth = 1;
        canvasContext.beginPath();
        canvasContext.strokeStyle = '#e60012';

        var width = CANVAS_WIDTH * 1.0 / audioAnalyserBufferLength;

        for(var i = 0; i < audioAnalyserBufferLength; i++) {
            var v = audioAnalyserBuffer[i] / 255;
            var y = v * CANVAS_HEIGHT / 2;
            canvasContext.rect(width * i, CANVAS_HEIGHT, width, -y * 1.5);
        }
        canvasContext.stroke();
    }

    canvasContext.font = "12px sans-serif";
    canvasContext.fillStyle = "#00a040";
    if(totalPlaylistCount >= 1) {
        let counter = "Track " + (totalPlaylistCount - playlist.length) + " / " + totalPlaylistCount;
        let counter_left = (CANVAS_WIDTH - canvasContext.measureText(counter).width) / 2;
        canvasContext.fillText(counter, counter_left, CANVAS_HEIGHT / 2 - 96);
    }
    canvasContext.font = "16px sans-serif";
    canvasContext.fillText(vgm_gd3.game_track_name, vgm_gd3.game_track_name_left, CANVAS_HEIGHT / 2 - 64);
    canvasContext.fillText(vgm_gd3.game_track_name_j, vgm_gd3.game_track_name_j_left, CANVAS_HEIGHT / 2 - 32);
    canvasContext.fillText(vgm_gd3.track_author_full, vgm_gd3.track_author_full_left, CANVAS_HEIGHT / 2);
}
