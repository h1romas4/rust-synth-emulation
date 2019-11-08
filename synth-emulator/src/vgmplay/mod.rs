use super::sn76489::SN76489;
use super::ym3438::YM3438;

const MAX_VGM_SIZE: usize = 524_280;
const MAX_SAMPLING_SIZE: usize = 4096;

pub struct VgmPlay {
    ym3438: YM3438,
    sn76489: SN76489,
    vgmpos: usize,
    remain_frame_size: usize,
    vgm_loop_offset: usize,
    vgmend: bool,
    vgmdata: [u8; MAX_VGM_SIZE],
    sampling: [f32; MAX_SAMPLING_SIZE]
}

impl VgmPlay {
    ///
    /// Create sound driver.
    ///
    /// # Arguments
    /// vgmdata - music data
    /// sampling - WebAudio sampling buffer
    ///
    #[allow(clippy::new_without_default)]
    pub fn new() -> Self {
        VgmPlay {
            ym3438: YM3438::default(),
            sn76489: SN76489::default(),
            vgmpos: 0,
            remain_frame_size: 0,
            vgm_loop_offset: 0,
            vgmend: false,
            vgmdata: [0; MAX_VGM_SIZE],
            sampling: [0_f32; MAX_SAMPLING_SIZE]
        }
    }

    ///
    /// Return vgmdata buffer referance.
    ///
    pub fn get_vgmdata_ref(&mut self) -> *mut u8 {
        self.vgmdata.as_mut_ptr()
    }

    ///
    /// Return sampling buffer referance.
    ///
    pub fn get_sampling_ref(&mut self) -> *mut f32 {
        self.sampling.as_mut_ptr()
    }

    ///
    /// Initialize sound driver.
    ///
    /// # Arguments
    /// sample_rate - WebAudio sampling rate
    ///
    pub fn init(&mut self, sample_rate: f32) {
        let mut clock_sn76489 : u32;

        self.vgmpos = 0x0c; clock_sn76489 = self.get_vgm_u32();
        self.vgmpos = 0x1c; self.vgm_loop_offset = (0x1c + self.get_vgm_u32()) as usize;
        self.vgmpos = 0x34; self.vgmpos = (0x34 + self.get_vgm_u32()) as usize;

        if clock_sn76489 == 0 {
            clock_sn76489 = 3_579_545;
        }

        self.ym3438.reset();

        self.sn76489.init(clock_sn76489 as i32, sample_rate as i32);
        self.sn76489.reset();
    }

    ///
    /// play
    ///
    pub fn play(&mut self, repeat: bool) -> f32 {
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
            if buffer_pos + frame_size < MAX_SAMPLING_SIZE {
                update_frame_size = frame_size;
            } else {
                update_frame_size = MAX_SAMPLING_SIZE - buffer_pos;
            }
            self.sn76489.update(&mut self.sampling, update_frame_size, buffer_pos);
            if self.remain_frame_size > 0 {
                self.remain_frame_size -= update_frame_size;
            }
            buffer_pos += update_frame_size;
            buffer_pos < MAX_SAMPLING_SIZE && !self.vgmend
        } {}
        self.remain_frame_size = frame_size - update_frame_size;

        buffer_pos as f32
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
                self.ym3438.opn2_write_bufferd(u32::from((command & 1) << 1), reg);
                self.ym3438.opn2_write_bufferd(u32::from(1 + ((command & 1) << 1)), dat);
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
                if self.vgm_loop_offset == 0 {
                    self.vgmend = true;
                } else if repeat {
                    self.vgmpos = self.vgm_loop_offset;
                } else {
                    self.vgmend = true;
                }
            }
            0x70..=0x7f => {
                wait = ((command & 0x0f) + 1).into();
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
}

///
/// cargo test -- --nocapture
///
#[cfg(test)]
mod tests {
    use super::VgmPlay;
    use super::MAX_SAMPLING_SIZE;
    use std::fs::File;
    use std::io::Read;

    #[test]
    fn sn76489_1() -> Result<(), Box<dyn std::error::Error>> {
        play("../www/vgm/sn76489.vgm")
    }

    #[test]
    fn ym2612_1() -> Result<(), Box<dyn std::error::Error>> {
        play("../www/vgm/ym2612.vgm")
    }

    fn play(filepath: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut vgmplay = VgmPlay::new();

        // load sn76489 vgm file
        let mut file = File::open(filepath)?;
        let mut buffer = Vec::new();
        let _ = file.read_to_end(&mut buffer)?;

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
        while vgmplay.play(false) >= MAX_SAMPLING_SIZE as f32 {}

        Ok(())
    }
}
