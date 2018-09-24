#[macro_use]
extern crate lazy_static;

mod sn76489;

use std::sync::Mutex;
use sn76489::SN76489;

const MAX_BUFFRE_SIZE : usize = 4096;

lazy_static! {
    static ref DATA: Mutex<VgmPlay> = Mutex::new(VgmPlay::from());
}

struct VgmPlay {
    sn76489: SN76489,
    vgmpos: usize,
    remain_frame_size: usize,
    vgmend: bool,
    buffer: [f32; MAX_BUFFRE_SIZE],
    vgmdata: [u8; 65536]
}

impl VgmPlay {
    pub fn from() -> VgmPlay {
        VgmPlay {
            sn76489: SN76489::default(),
            vgmpos: 0,
            remain_frame_size: 0,
            vgmend: false,
            buffer: [0_f32; MAX_BUFFRE_SIZE],
            vgmdata: [0; 65536]
        }
    }

    pub fn init(&mut self, sample_rate: f32) {
        let mut clock_sn76489 : u32;

        self.vgmpos = 0x0c; clock_sn76489 = self.get_vgm_u32();
        self.vgmpos = 0x34; self.vgmpos = (0x34 + self.get_vgm_u32()) as usize;

        if clock_sn76489 == 0 {
            clock_sn76489 = 3579545;
        }

        self.sn76489.init(clock_sn76489 as i32, sample_rate as i32);
        self.sn76489.reset();

        self.vgmpos = 0;
        self.remain_frame_size = 0;
        self.vgmend = false;
    }

    pub fn play(&mut self) -> f32 {
        let mut frame_size: usize;
        let mut update_frame_size: usize;
        let mut buffer_pos: usize;

        buffer_pos = 0;
        while {
            if self.remain_frame_size > 0 {
                frame_size = self.remain_frame_size;
            } else {
                frame_size = self.parse_vgm() as usize;
            }
            if buffer_pos + frame_size < MAX_BUFFRE_SIZE {
                update_frame_size = frame_size;
            } else {
                update_frame_size = MAX_BUFFRE_SIZE - buffer_pos;
            }
            self.sn76489.update(&mut self.buffer, update_frame_size, buffer_pos);
            if self.remain_frame_size > 0 {
                self.remain_frame_size -= update_frame_size;
            }
            buffer_pos += update_frame_size;
            buffer_pos < MAX_BUFFRE_SIZE && !self.vgmend
        } {}
        // audio_output();
        self.remain_frame_size = frame_size - update_frame_size;

        buffer_pos as f32
    }

    fn get_vgm_u8(&mut self) -> u8 {
        let ret = self.vgmdata[self.vgmpos];
        self.vgmpos += 1;
        ret
    }

    fn get_vgm_u16(&mut self) -> u16 {
        self.get_vgm_u8() as u16 + ((self.get_vgm_u8() as u16) << 8)
    }

    fn get_vgm_u32(&mut self) -> u32 {
        self.get_vgm_u8() as u32
            + ((self.get_vgm_u8() as u32) << 8)
            + ((self.get_vgm_u8() as u32) << 16)
            + ((self.get_vgm_u8() as u32) << 24)
    }

    fn parse_vgm(&mut self) -> u16 {
        let command: u8;
        let dat: u8;
        let mut wait: u16 = 0;

        command = self.get_vgm_u8();
        match command {
            0x50 => {
                dat = self.get_vgm_u8();
                self.sn76489.write(dat);
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
                self.vgmend = true;
            }
            0x70...0x7f => {
                wait = ((command & 0x0f) + 1).into();
            }
            _ => {
                // panic!("unknown cmd at {:x}: {:x}", self.vgmpos, self.vgmdata[self.vgmpos]);
            }
        }
        wait
    }
}

#[allow(dead_code)]
extern "C" {
    fn console_log(value: u32);
}

#[no_mangle]
pub unsafe extern "C" fn get_audio_buffer() -> *const f32 {
    let vgmplay = &mut DATA.lock().unwrap();
    &(vgmplay.buffer[0])
}

#[no_mangle]
pub unsafe extern "C" fn get_vgm_data() -> *const u8 {
    let vgmplay = &mut DATA.lock().unwrap();
    &(vgmplay.vgmdata[0])
}

#[no_mangle]
pub unsafe extern "C" fn init(sample_rate: f32) {
    let vgmplay = &mut DATA.lock().unwrap();
    vgmplay.init(sample_rate);
}

#[no_mangle]
pub unsafe extern "C" fn play() -> f32 {
    let vgmplay = &mut DATA.lock().unwrap();
    vgmplay.play() as f32
}
