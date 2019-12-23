pub mod ym3438;
pub mod sn76489;
pub mod pwm;

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
