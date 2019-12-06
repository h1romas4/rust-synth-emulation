# rust-synth-emulation

YM2612/SN76489 VGM player by Rust

## WebAssembly demo site

[ym2612.vgm](https://h1romas4.github.io/rust-synth-emulation/index.html)

## Build

![](https://github.com/h1romas4/rust-synth-emulation/workflows/Rust-wasm%20CI/badge.svg)

Rust and [wasm-pack](https://rustwasm.github.io/wasm-pack) setup

```
rustup target add wasm32-unknown-unknown
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

Compile

```
git clone git@github.com:h1romas4/rust-synth-emulation.git
cd wasm-synth-player
wasm-pack build
npm install
npm run start
```

## Play

```
http://localhost:9000/
```

## License

[GNU General Public License v2.0](https://github.com/h1romas4/rust-synth-emulation/blob/master/LICENSE.txt)

## Thanks!

* [Nuked-OPN2](https://github.com/nukeykt/Nuked-OPN2)
* [sn76489.c](https://github.com/vgmrips/vgmplay/blob/master/VGMPlay/chips/sn76489.c)
