use std::io::prelude::*;
use flate2::read::GzDecoder;

use super::sn76489::SN76489;
use super::ym3438::YM3438;
use super::pwm::PWM;

pub struct VgmPlay {
    ym3438: YM3438,
    sn76489: SN76489,
    pwm: PWM,
    sample_rate: f32,
    vgmpos: usize,
    datpos: usize,
    pcmpos: usize,
    pcmoffset: usize,
    pcm_stream_sample_count: f32,
    pcm_stream_sampling_pos: f32,
    pcm_stream_length: usize,
    pcm_stream_pos_init: usize,
    pcm_stream_pos: usize,
    pcm_stream_offset: usize,
    remain_frame_size: usize,
    vgm_loop: usize,
    vgm_loop_offset: usize,
    vgm_loop_count: usize,
    vgmend: bool,
    vgmfile: Vec<u8>,
    vgmdata: Vec<u8>,
    max_sampling_size: usize,
    sampling_l: Vec<f32>,
    sampling_r: Vec<f32>
}

impl VgmPlay {
    ///
    /// Create sound driver.
    ///
    /// # Arguments
    /// max_sampling_size
    /// vgm_size
    ///
    #[allow(clippy::new_without_default)]
    pub fn new(max_sampling_size: usize, vgm_file_size: usize) -> Self {
        VgmPlay {
            ym3438: YM3438::default(),
            sn76489: SN76489::default(),
            pwm: PWM::new(),
            sample_rate: 0_f32,
            vgmpos: 0,
            datpos: 0,
            pcmpos: 0,
            pcmoffset: 0,
            pcm_stream_sample_count: 0_f32,
            pcm_stream_sampling_pos: 0_f32,
            pcm_stream_length: 0,
            pcm_stream_pos_init: 0,
            pcm_stream_pos: 0,
            pcm_stream_offset: 0,
            remain_frame_size: 0,
            vgm_loop: 0,
            vgm_loop_offset: 0,
            vgm_loop_count: 0,
            vgmend: false,
            vgmfile: vec![0; vgm_file_size],
            vgmdata: Vec::new(),
            max_sampling_size: max_sampling_size,
            sampling_l: vec![0_f32; max_sampling_size],
            sampling_r: vec![0_f32; max_sampling_size]
        }
    }

    ///
    /// Return vgmdata buffer referance.
    ///
    pub fn get_vgmdata_ref(&mut self) -> *mut u8 {
        self.vgmfile.as_mut_ptr()
    }

    ///
    /// Return sampling_l buffer referance.
    ///
    pub fn get_sampling_l_ref(&mut self) -> *mut f32 {
        self.sampling_l.as_mut_ptr()
    }

    ///
    /// Return sampling buffer referance.
    ///
    pub fn get_sampling_r_ref(&mut self) -> *mut f32 {
        self.sampling_r.as_mut_ptr()
    }

    ///
    /// extract vgz and initialize sound driver.
    ///
    /// # Arguments
    /// sample_rate - WebAudio sampling rate
    ///
    pub fn init(&mut self, sample_rate: f32) {
        self.sample_rate = sample_rate;

        self.extract();

        let mut clock_sn76489 : u32;
        let mut clock_ym2612 : u32;
        let mut clock_pwm: u32;

        self.vgmpos = 0x0c; clock_sn76489 = self.get_vgm_u32();
        self.vgmpos = 0x2C; clock_ym2612 = self.get_vgm_u32();
        self.vgmpos = 0x70; clock_pwm = self.get_vgm_u32();
        self.vgmpos = 0x1c; self.vgm_loop = self.get_vgm_u32() as usize;
        self.vgmpos = 0x34; self.vgmpos = (0x34 + self.get_vgm_u32()) as usize;

        self.vgm_loop_offset = self.vgm_loop + 0x1c;

        if clock_sn76489 == 0 {
            clock_sn76489 = 3_579_545;
        }
        if clock_ym2612 == 0 {
            clock_ym2612 = 7_670_453;
        }
        if clock_pwm == 0 {
            clock_pwm = 23011360;
        }

        self.ym3438.reset(clock_ym2612, sample_rate as u32);

        self.sn76489.init(clock_sn76489 as i32, sample_rate as i32);
        self.sn76489.reset();

        self.pwm.device_start_pwm(0, clock_pwm as i32);
    }

    ///
    /// play
    ///
    pub fn play(&mut self, repeat: bool) -> usize {
        let mut frame_size: usize;
        let mut update_frame_size: usize;
        let mut buffer_pos: usize;

        buffer_pos = 0;
        while {
            if self.remain_frame_size > 0 {
                frame_size = self.remain_frame_size;
            } else {
                frame_size = self.parse_vgm(repeat) as usize;
            }
            if buffer_pos + frame_size < self.max_sampling_size {
                update_frame_size = frame_size;
            } else {
                update_frame_size = self.max_sampling_size - buffer_pos;
            }
            if self.pcm_stream_pos_init == self.pcm_stream_pos && self.pcm_stream_length > 0 {
                self.pcm_stream_sampling_pos = 0_f32;
            }
            for _ in 0..update_frame_size {
                if self.pcm_stream_length > 0 && (self.pcm_stream_sampling_pos % self.pcm_stream_sample_count) as usize == 0 {
                    self.update_dac();
                }
                self.sn76489.update(&mut self.sampling_l, &mut self.sampling_r, 1, buffer_pos);
                self.ym3438.opn2_generate_stream(&mut self.sampling_l, &mut self.sampling_r, 1, buffer_pos);
                if self.remain_frame_size > 0 {
                    self.remain_frame_size -= 1;
                }
                buffer_pos += 1;
                self.pcm_stream_sampling_pos += 1_f32;
            }
            buffer_pos < self.max_sampling_size && !self.vgmend
        } {}
        self.remain_frame_size = frame_size - update_frame_size;

        if self.vgm_loop_count == std::usize::MAX {
            self.vgm_loop_count = 0;
        }
        if self.vgmend {
            std::usize::MAX
        } else {
            self.vgm_loop_count
        }
    }

    fn extract(&mut self) {
        let mut d = GzDecoder::new(self.vgmfile.as_slice());
        if let Err(_) = d.read_to_end(&mut self.vgmdata) {
            self.vgmdata = self.vgmfile.clone();
        }
    }

    fn get_vgm_u8(&mut self) -> u8 {
        let ret = self.vgmdata[self.vgmpos];
        self.vgmpos += 1;
        ret
    }

    fn get_vgm_u16(&mut self) -> u16 {
        u16::from(self.get_vgm_u8()) + (u16::from(self.get_vgm_u8()) << 8)
    }

    fn get_vgm_u32(&mut self) -> u32 {
        u32::from(self.get_vgm_u8())
            + (u32::from(self.get_vgm_u8()) << 8)
            + (u32::from(self.get_vgm_u8()) << 16)
            + (u32::from(self.get_vgm_u8()) << 24)
    }

    fn parse_vgm(&mut self, repeat: bool) -> u16 {
        let command: u8;
        let reg: u8;
        let dat: u8;
        let mut wait: u16 = 0;

        command = self.get_vgm_u8();
        match command {
            0x50 => {
                dat = self.get_vgm_u8();
                self.sn76489.write(dat);
            }
            0x52 | 0x53 => {
                reg = self.get_vgm_u8();
                dat = self.get_vgm_u8();
                let port = u32::from(command & 0x01) << 1;
                self.ym3438.opn2_write_bufferd(port, reg);
                self.ym3438.opn2_write_bufferd(port + 1, dat);
            }
            0x61 => {
                wait = self.get_vgm_u16();
            }
            0x62 => {
                wait = 735;
            }
            0x63 => {
                wait = 882;
            }
            0x66 => {
                if self.vgm_loop == 0 {
                    self.vgmend = true;
                } else if repeat {
                    self.vgmpos = self.vgm_loop_offset;
                    self.vgm_loop_count += 1;
                } else {
                    self.vgmend = true;
                }
            }
            0x67 => {
                self.get_vgm_u8(); // 0x66
                self.get_vgm_u8(); // 0x00 data type
                self.datpos = self.vgmpos + 4;
                self.vgmpos += self.get_vgm_u32() as usize;
            }
            0x70..=0x7f => {
                wait = ((command & 0x0f) + 1).into();
            }
            0x80..=0x8f => {
                wait = (command & 0x0f).into();
                self.ym3438.opn2_write_bufferd(0, 0x2a);
                self.ym3438.opn2_write_bufferd(1, self.vgmdata[self.datpos + self.pcmpos + self.pcmoffset]);
                self.pcmoffset += 1;
            }
            0x90 => {
                // Setup Stream Control
                // 0x90 ss tt pp cc
                // 0x90 00 02 00 2a
                self.get_vgm_u32();
            }
            0x91 => {
                // Set Stream Data
                // 0x91 ss dd ll bb
                // 0x91 00 00 01 2a
                self.get_vgm_u32();
            }
            0x92 => {
                // Set Stream Frequency
                // 0x92 ss ff ff ff ff
                // 0x92 00 40 1f 00 00 (8KHz)
                self.get_vgm_u8();
                self.pcm_stream_sample_count = self.sample_rate / self.get_vgm_u32() as f32;
            }
            0x93 => {
                // Start Stream
                // 0x93 ss aa aa aa aa mm ll ll ll ll
                // 0x93 00 aa aa aa aa 01 ll ll ll ll
                self.get_vgm_u8();
                self.pcm_stream_pos_init = self.get_vgm_u32() as usize;
                self.pcm_stream_pos = self.pcm_stream_pos_init;
                self.get_vgm_u8();
                self.pcm_stream_length = self.get_vgm_u32() as usize;
                self.pcm_stream_offset = 0;
            }
            0x94 => {
                // Stop Stream
                // 0x94 ss
                self.get_vgm_u8();
                self.pcm_stream_length = 0;
            }
            0x95 => {
                // Start Stream (fast call)
                // 0x95 ss bb bb ff
                self.get_vgm_u8();
                self.get_vgm_u16();
                self.get_vgm_u8();
            }
            0xe0 => {
                self.pcmpos = self.get_vgm_u32() as usize;
                self.pcmoffset = 0;
            }
            0xb2 => {
                // 0xB2 ad dd
                // PWM, write value ddd to register a (d is MSB, dd is LSB)
                let raw1 = self.get_vgm_u8();
                let raw2 = self.get_vgm_u8();
                let channel = (raw1 & 0xf0 >> 4) as u8;
                let data: u16 = (raw1 as u16 & 0x0f) << 8 | raw2 as u16;
                self.pwm.pwm_chn_w(0, channel, data);
            }
            _ => {
                #[cfg(feature = "console_error_panic_hook")]
                console_log!("unknown cmd at {:x}: {:x}", self.vgmpos - 1, self.vgmdata[self.vgmpos - 1]);
                #[cfg(not(feature = "console_error_panic_hook"))]
                println!("unknown cmd at {:x}: {:x}", self.vgmpos - 1, self.vgmdata[self.vgmpos - 1]);
            }
        }
        wait
    }

    fn update_dac(&mut self) {
        self.ym3438.opn2_write_bufferd(0, 0x2a);
        self.ym3438.opn2_write_bufferd(1, self.vgmdata[self.datpos + self.pcm_stream_pos + self.pcm_stream_offset]);
        self.pcm_stream_length -= 1;
        self.pcm_stream_pos += 1;
    }
}

///
/// cargo test -- --nocapture
///
#[cfg(test)]
mod tests {
    use super::VgmPlay;
    use std::fs::File;
    use std::io::Read;

    const MAX_SAMPLING_SIZE: usize = 4096;

    // #[test]
    // fn sn76489_1() -> Result<(), Box<dyn std::error::Error>> {
    //     play("../docs/vgm/sn76489.vgm")
    // }

    #[test]
    fn ym2612_1() -> Result<(), Box<dyn std::error::Error>> {
        play("../docs/vgm/03 - Final Take Off.vgz")
    }

    fn play(filepath: &str) -> Result<(), Box<dyn std::error::Error>> {
        // load sn76489 vgm file
        let mut file = File::open(filepath)?;
        let mut buffer = Vec::new();
        let _ = file.read_to_end(&mut buffer)?;

        let mut vgmplay = VgmPlay::new(MAX_SAMPLING_SIZE, file.metadata().unwrap().len() as usize);
        // set vgmdata
        let vgmdata_ref = vgmplay.get_vgmdata_ref();
        let mut i: usize = 0;
        for buf in buffer.iter() {
            unsafe { *vgmdata_ref.add(i) = *buf; }
            i += 1;
        }

        // init & sample
        vgmplay.init(44100_f32);
        // play
        while vgmplay.play(false) <= 0 {}

        Ok(())
    }
}
