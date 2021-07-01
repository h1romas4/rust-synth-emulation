mod ym3438;
mod sn76489;
mod pwm;
mod segapcm;

use std::cell::RefCell;
use std::rc::Rc;

pub use crate::sound::ym3438::YM3438 as YM3438;
pub use crate::sound::sn76489::SN76489 as SN76489;
pub use crate::sound::pwm::PWM as PWM;
pub use crate::sound::segapcm::SEGAPCM as SEGAPCM;

///
/// Device Name
///
pub enum SoundDeviceName {
    YM3438,
    YM2612,
    SN76489,
    PWM,
    SEGAPCM,
}

///
/// Device common interface
///
pub trait SoundDevice<T> {
    fn new() -> Self;
    fn get_name(&self) -> SoundDeviceName;
    fn init(&mut self, sample_rate: u32, clock: u32);
    fn reset(&mut self);
    fn write(&mut self, port: u32, data: T);
    fn update(&mut self, buffer_l: &mut [f32], buffer_r: &mut [f32], numsamples: usize, buffer_pos: usize);
}

pub trait RomDevice {
    fn set_rom(&mut self, romset: Rc<RefCell<RomSet>>);
}

///
/// Sound rom
///
pub struct Rom {
    start_address: usize,
    end_address: usize,
    memory: Vec<u8>,
}

///
/// Sound rom sets
///
#[derive(Default)]
pub struct RomSet {
    rom: Vec<Rom>,
}

impl RomSet {
    pub fn new() -> RomSet {
        RomSet {
            rom: Vec::new()
        }
    }

    pub fn add_rom(&mut self, memory: Vec<u8>, start_address: usize, end_address: usize) {
        println!("rom: {:<08x} - {:<08x}, {:<08x}, {:<02x}", start_address, end_address, memory.len(), memory[0]);
        self.rom.push(Rom {
            start_address,
            end_address,
            memory,
        });
    }

    pub fn read(&self, address: usize) -> u8 {
        for r in self.rom.iter() {
            if r.start_address <= address && r.end_address >= address {
                return r.memory[address - r.start_address];
            }
        }
        0
    }
}

///
/// convert_sample_i2f
///
fn convert_sample_i2f(i32_sample: i32) -> f32 {
    let mut f32_sample: f32;
    if i32_sample < 0 {
        f32_sample = i32_sample as f32 / 32768_f32;
    } else {
        f32_sample = i32_sample as f32 / 32767_f32;
    }
    if f32_sample > 1_f32 {
        f32_sample = 1_f32;
    }
    if f32_sample < -1_f32 {
        f32_sample = -1_f32;
    }
    f32_sample
}
