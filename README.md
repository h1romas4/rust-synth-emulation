# rust-synth-emulation

PSG(SN76489) VGM player by Rust

## Now testing

`src/main.rs`

```
// vgm file read (for testing)
let mut f = BufReader::new(fs::File::open("vgm/03.vgm").unwrap());
```

```
// for testing
let mut f = BufWriter::new(fs::File::create("./vgm/test_s16le.pcm").unwrap());
```

## Build

```
git remote add origin git@github.com:h1romas4/rust-synth-emulation.git
cd rust-synth-emulation
cargo run
```

## Play

```
ffplay -f s16le -ar 44100 -ac 2 vgm/test_s16le.pcm
```

## Thanks!

* [sn76489.c](https://github.com/vgmrips/vgmplay/blob/master/VGMPlay/chips/sn76489.c)
