# rustup target add wasm32-unknown-unknown
# cargo install --git https://github.com/alexcrichton/wasm-gc

$ErrorActionPreference = "Stop"

Remove-Item docs\synth*.wasm
& cargo build --release --target wasm32-unknown-unknown
Copy-Item target\wasm32-unknown-unknown\release\synth.wasm docs\synth-nogc.wasm
& wasm-gc docs\synth-nogc.wasm docs\synth.wasm
