mod ym3438;
mod sn76489;
mod pwm;
mod segapcm;

pub use crate::sound::ym3438::YM3438 as YM3438;
pub use crate::sound::sn76489::SN76489 as SN76489;
pub use crate::sound::pwm::PWM as PWM;

///
/// Device Name
///
pub enum DeviceName {
    YM3438,
    YM2612,
    SN76489,
    PWM,
    SEGAPCM,
}

///
/// Device common interface
///
pub trait Device<'a, T> {
    fn new() -> Self;
    fn get_device_name(&self) -> DeviceName;
    fn init(&mut self, sample_rate: u32, clock: u32, rom: Option<&'a[u8]>);
    fn reset(&mut self);
    fn write(&mut self, port: u32, data: T);
    fn update(&mut self, buffer_l: &mut [f32], buffer_r: &mut [f32], numsamples: usize, buffer_pos: usize);
}

///
/// convert_sample_i32f32
///
fn convert_sample_i32f32(i32_sample: i32) -> f32 {
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
