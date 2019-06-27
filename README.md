# rust-synth-emulation

PSG(SN76489) VGM player by Rust

## WebAssembly demo

[Synth emurator by Rust/WebAssembly](https://h1romas4.github.io/rust-synth-emulation/index.html)

## Build

Rust and [wasm-pack](https://rustwasm.github.io/wasm-pack) setup

```
rustup target add wasm32-unknown-unknown
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

Compile

```
git clone git@github.com:h1romas4/rust-synth-emulation.git
cd rust-synth-emulation
wasm-pack build
cd www
npm install
npm run start
```

## Play

```
http://localhost:8080/
```

## Thanks!

* [sn76489.c](https://github.com/vgmrips/vgmplay/blob/master/VGMPlay/chips/sn76489.c)
