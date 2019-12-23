mod ym3438;
mod sn76489;
mod pwm;

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
    PWM
}

///
/// Device common interface
///
pub trait Device<T> {
    fn new() -> Self;
    fn get_device_name(&self) -> DeviceName;
    fn init(&mut self, sample_rate: u32, clock: u32);
    fn reset(&mut self);
    fn write(&mut self, port: u32, data: T);
    fn update(&mut self, buffer_l: &mut [f32], buffer_r: &mut [f32], numsamples: usize, buffer_pos: usize);
}
