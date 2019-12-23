use wasm_bindgen::prelude::*;
use synth_emulator::driver::vgmplay::VgmPlay;

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
    pub fn from(sample_rate: u32, max_sampling_size: usize, data_length: usize) -> Self {
        set_panic_hook();
        WasmVgmPlay {
            vgmplay: VgmPlay::new(sample_rate, max_sampling_size, data_length)
        }
    }

    ///
    /// Return vgmdata buffer referance.
    ///
    pub fn get_seq_data_ref(&mut self) -> *mut u8 {
        self.vgmplay.get_vgmdata_ref()
    }

    ///
    /// Return sampling_l buffer referance.
    ///
    pub fn get_sampling_l_ref(&mut self) -> *mut f32 {
        self.vgmplay.get_sampling_l_ref()
    }

    ///
    /// Return sampling_r buffer referance.
    ///
    pub fn get_sampling_r_ref(&mut self) -> *mut f32 {
        self.vgmplay.get_sampling_r_ref()
    }

    ///
    /// get_header
    ///
    pub fn get_seq_header(&self) -> String {
        self.vgmplay.get_vgm_header_json()
    }

    ///
    /// get_gd3
    ///
    pub fn get_seq_gd3(&self) -> String {
        self.vgmplay.get_vgm_gd3_json()
    }

    ///
    /// Initialize sound driver.
    ///
    /// # Arguments
    /// sample_rate - WebAudio sampling rate
    ///
    pub fn init(&mut self) -> bool {
        match self.vgmplay.init() {
            Ok(_) => true,
            Err(_) => false
        }
    }

    ///
    /// play
    ///
    pub fn play(&mut self) -> usize {
        self.vgmplay.play(true)
    }
}

pub fn set_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
