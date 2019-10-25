use wasm_bindgen::prelude::*;
use synth_emulation::vgmplay::VgmPlay;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[allow(unused_macros)]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub struct WasmVgmPlay {
    vgmplay: VgmPlay
}

#[wasm_bindgen]
impl WasmVgmPlay {
    ///
    /// constructor
    ///
    #[wasm_bindgen(constructor)]
    pub fn from() -> Self {
        set_panic_hook();
        WasmVgmPlay {
            vgmplay: VgmPlay::new()
        }
    }

    ///
    /// Return vgmdata buffer referance.
    ///
    pub fn get_vgmdata_ref(&mut self) -> *mut u8 {
        self.vgmplay.get_vgmdata_ref()
    }

    ///
    /// Return sampling buffer referance.
    ///
    pub fn get_sampling_ref(&mut self) -> *mut f32 {
        self.vgmplay.get_sampling_ref()
    }

    ///
    /// Initialize sound driver.
    ///
    /// # Arguments
    /// sample_rate - WebAudio sampling rate
    ///
    pub fn init(&mut self, sample_rate: f32) {
        self.vgmplay.init(sample_rate);
    }

    ///
    /// play
    ///
    pub fn play(&mut self) -> f32 {
        self.vgmplay.play(true)
    }
}

pub fn set_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
