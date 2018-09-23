# rust-synth-emulation

PSG(SN76489) VGM player by Rust

## WebAssembly demo

[Synth emurator by Rust/WebAssembly](https://h1romas4.github.io/rust-synth-emulation/index.html)

## Build

Rust setup

```
rustup install nightly
rustup target add wasm32-unknown-unknown
cargo install --git https://github.com/alexcrichton/wasm-gc
```

Compile

```
git remote add origin git@github.com:h1romas4/rust-synth-emulation.git
cd rust-synth-emulation
./build.sh
```

## Play

```
docs/index.html
```

## Thanks!

* [sn76489.c](https://github.com/vgmrips/vgmplay/blob/master/VGMPlay/chips/sn76489.c)
