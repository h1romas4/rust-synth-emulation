# rust-synth-emulation

PSG(SN76489) VGM player by Rust

## WebAssembly demo

[Synth emurator by Rust/WebAssembly](https://h1romas4.github.io/rust-synth-emulation/index.html)

## Build

Rust setup

```
rustup target add wasm32-unknown-unknown
cargo install --git https://github.com/alexcrichton/wasm-gc
```

Compile

```
git clone git@github.com:h1romas4/rust-synth-emulation.git
cd rust-synth-emulation
# Linux/macOS
./build.sh
# Windows
.\build.ps1
```

## Play

```
docs/index.html
```

## Thanks!

* [sn76489.c](https://github.com/vgmrips/vgmplay/blob/master/VGMPlay/chips/sn76489.c)
