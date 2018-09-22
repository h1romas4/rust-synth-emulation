mod sn76489;

use std::iter;
use std::fs;
use std::io::{Write, Read, BufWriter, BufReader};

use sn76489::SN76489;

const MAX_BUFFRE_SIZE : usize = 2048;
const SAMPLING_RATE : i32 = 44100;

struct VgmPlay<'a> {
    sn76489: SN76489,
    vgmdata: &'a mut Vec<u8>,
    vgmpos: usize,
    vgmend: bool,
    buffer: Vec<Vec<i32>>
}

impl<'a> VgmPlay<'a> {
    pub fn from(vgmdata: &mut Vec<u8>) -> VgmPlay {
        VgmPlay {
            sn76489: SN76489::default(),
            vgmdata: vgmdata,
            vgmpos: 0,
            vgmend: false,
            buffer: Vec::new()
        }
    }

    pub fn init(&mut self) {
        let mut l: Vec<i32> = Vec::with_capacity(MAX_BUFFRE_SIZE);
        let mut r: Vec<i32> = Vec::with_capacity(MAX_BUFFRE_SIZE);

        l.extend(iter::repeat(0x00).take(MAX_BUFFRE_SIZE));
        r.extend(iter::repeat(0x00).take(MAX_BUFFRE_SIZE));
        self.buffer.push(l);
        self.buffer.push(r);

        let mut clock_sn76489 : u32;

        self.vgmpos = 0x0c; clock_sn76489 = self.get_vgm_u32();
        self.vgmpos = 0x34; self.vgmpos = (0x34 + self.get_vgm_u32()) as usize;

        if clock_sn76489 == 0 {
            clock_sn76489 = 3579545;
        }

        self.sn76489.init(clock_sn76489 as i32, SAMPLING_RATE);
        self.sn76489.reset();
    }

    pub fn play(&mut self) {
        self.init();

        // for testing
        let mut f = BufWriter::new(fs::File::create("./vgm/test_s16le.pcm").unwrap());

        let mut frame_size: usize;
        let mut update_frame_size: usize;
        let mut remain_frame_size: usize;
        let mut buffer_pos: usize;

        remain_frame_size = 0;
        while {
            buffer_pos = 0;
            while {
                if remain_frame_size > 0 {
                    frame_size = remain_frame_size;
                } else {
                    frame_size = self.parse_vgm() as usize;
                }
                if buffer_pos + frame_size < MAX_BUFFRE_SIZE {
                    update_frame_size = frame_size;
                } else {
                    update_frame_size = MAX_BUFFRE_SIZE - buffer_pos;
                }
                self.sn76489.update(&mut self.buffer, update_frame_size, buffer_pos);
                if remain_frame_size > 0 {
                    remain_frame_size -= update_frame_size;
                }
                buffer_pos += update_frame_size;
                buffer_pos < MAX_BUFFRE_SIZE && !self.vgmend
            } {}
            // audio_output();
            remain_frame_size = frame_size - update_frame_size;

            for i in 0..MAX_BUFFRE_SIZE {
                let l = self.limit_sampling(self.buffer[0][i as usize]);
                let r = self.limit_sampling(self.buffer[1][i as usize]);
                // signed 16bit little endian
                let write: [u8; 4] = [
                    ((l as u16 & 0x00ff)     ) as u8,
                    ((l as u16 & 0xff00) >> 8) as u8,
                    ((r as u16 & 0x00ff)     ) as u8,
                    ((r as u16 & 0xff00) >> 8) as u8,
                ];
                f.write(&write).unwrap();
            }
            // do while loop
            !self.vgmend
        } {}
    }

    fn limit_sampling(&self, sample32: i32) -> i16 {
        if sample32 < -0x7fff {
            return std::i16::MIN;
        } else if sample32 > 0x7fff {
            return std::i16::MAX;
        }
        return sample32 as i16;
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
            + ((self.get_vgm_u8() as u32) << 16 )
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
                panic!("unknown cmd at {:x}: {:x}", self.vgmpos, self.vgmdata[self.vgmpos]);
            }
        }
        wait
    }
}

fn main() {
    // vgm file read (for testing)
    let mut f = BufReader::new(fs::File::open("vgm/03.vgm").unwrap());
    let mut vgmdata = vec![];
    f.read_to_end(&mut vgmdata).unwrap();

    let mut vgmplay = VgmPlay::from(&mut vgmdata);
    vgmplay.play();
}
