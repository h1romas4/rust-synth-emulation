#!/bin/sh

# rustup target add wasm32-unknown-unknown
# cargo install --git https://github.com/alexcrichton/wasm-gc

rm docs/synth*.wasm 2>&1 >/dev/null
cargo build --release --target wasm32-unknown-unknown \
    && cp -p target/wasm32-unknown-unknown/release/synth.wasm docs/synth-nogc.wasm \
    && wasm-gc docs/synth-nogc.wasm docs/synth.wasm
