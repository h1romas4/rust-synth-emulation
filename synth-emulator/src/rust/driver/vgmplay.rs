use flate2::read::GzDecoder;
use std::cell::RefCell;
use std::collections::HashMap;
use std::convert::TryInto;
use std::io::prelude::*;
use std::rc::Rc;

use crate::driver::metadata::parse_vgm_meta;
use crate::driver::metadata::Gd3;
use crate::driver::metadata::Jsonlize;
use crate::driver::metadata::VgmHeader;

use crate::sound::{RomDevice, RomSet, SoundDevice, PWM, SEGAPCM, SN76489, YM3438};

pub struct VgmPlay {
    ym3438: YM3438,
    sn76489: SN76489,
    pwm: PWM,
    segapcm: SEGAPCM,
    sound_chip_romset: HashMap<usize, Rc<RefCell<RomSet>>>,
    sample_rate: u32,
    vgmpos: usize,
    data_pos: usize,
    pcmpos: usize,
    pcmoffset: usize,
    pcm_stream_sample_count: u32,
    pcm_stream_sampling_pos: u32,
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
    sampling_r: Vec<f32>,
    vgm_header: VgmHeader,
    vgm_gd3: Gd3,
}

#[allow(dead_code)]
impl VgmPlay {
    ///
    /// Create sound driver.
    ///
    pub fn new(sample_rate: u32, max_sampling_size: usize, vgm_file_size: usize) -> Self {
        VgmPlay {
            // TODO: vectorize sound device
            ym3438: YM3438::new(),
            sn76489: SN76489::new(),
            pwm: PWM::new(),
            segapcm: SEGAPCM::new(),
            sound_chip_romset: HashMap::new(),
            sample_rate,
            vgmpos: 0,
            data_pos: 0,
            pcmpos: 0,
            pcmoffset: 0,
            pcm_stream_sample_count: 0,
            pcm_stream_sampling_pos: 0,
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
            max_sampling_size,
            sampling_l: vec![0_f32; max_sampling_size],
            sampling_r: vec![0_f32; max_sampling_size],
            vgm_header: VgmHeader::default(),
            vgm_gd3: Gd3::default(),
        }
    }

    ///
    /// Return vgmfile buffer referance.
    ///
    pub fn get_vgmfile_ref(&mut self) -> *mut u8 {
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
    /// get_vgm_meta
    ///
    pub fn get_vgm_meta(&self) -> (&VgmHeader, &Gd3) {
        (&self.vgm_header, &self.vgm_gd3)
    }

    ///
    /// get_vgm_header_json
    ///
    pub fn get_vgm_header_json(&self) -> String {
        self.vgm_header.get_json()
    }

    ///
    /// get_vgm_header_json
    ///
    pub fn get_vgm_gd3_json(&self) -> String {
        self.vgm_gd3.get_json()
    }

    ///
    /// extract vgz and initialize sound driver.
    ///
    pub fn init(&mut self) -> Result<(), &'static str> {
        // try vgz extract
        self.extract();

        match parse_vgm_meta(&self.vgmdata) {
            Ok((header, gd3)) => {
                self.vgm_header = header;
                self.vgm_gd3 = gd3;
            }
            Err(message) => return Err(message),
        };

        self.vgm_loop = self.vgm_header.offset_loop as usize;
        self.vgm_loop_offset = (0x1c + self.vgm_header.offset_loop) as usize;
        self.vgmpos = (0x34 + self.vgm_header.vgm_data_offset) as usize;

        // TODO: vectorize sound device
        if self.vgm_header.clock_sn76489 != 0 {
            // 3_579_545
            SoundDevice::init(
                &mut self.sn76489,
                self.sample_rate,
                self.vgm_header.clock_sn76489,
            );
        }
        if self.vgm_header.clock_ym2612 != 0 {
            // 7_670_453
            SoundDevice::init(
                &mut self.ym3438,
                self.sample_rate,
                self.vgm_header.clock_ym2612,
            );
        }
        if self.vgm_header.clock_pwm != 0 {
            // 23_011_360
            SoundDevice::init(&mut self.pwm, self.sample_rate, self.vgm_header.clock_pwm);
        }
        if self.vgm_header.sega_pcm_clock != 0 {
            // 4_000_000
            SoundDevice::init(
                &mut self.segapcm,
                self.sample_rate,
                self.vgm_header.sega_pcm_clock,
            );
            // init romset
            let romset = Rc::new(RefCell::new(RomSet::new()));
            RomDevice::set_rom(&mut self.segapcm, Some(romset.clone()));
            self.sound_chip_romset.insert(0x80, romset); // 0x80 segapcm
        }

        Ok(())
    }

    ///
    /// play
    ///
    pub fn play(&mut self, repeat: bool) -> usize {
        let mut frame_size: usize;
        let mut update_frame_size: usize;
        let mut buffer_pos: usize;

        // clear buffer
        for i in 0..self.max_sampling_size {
            self.sampling_l[i] = 0_f32;
            self.sampling_r[i] = 0_f32;
        }

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
                self.pcm_stream_sampling_pos = 0;
            }
            for _ in 0..update_frame_size {
                // straming pcm update
                if self.pcm_stream_length > 0
                    && (self.pcm_stream_sampling_pos % self.pcm_stream_sample_count) as usize == 0
                {
                    self.update_dac();
                }
                // mix each device 1 sampling
                // TODO: vectorize sound device
                if self.vgm_header.clock_sn76489 != 0 {
                    SoundDevice::update(
                        &mut self.sn76489,
                        &mut self.sampling_l,
                        &mut self.sampling_r,
                        1,
                        buffer_pos,
                    );
                }
                if self.vgm_header.clock_ym2612 != 0 {
                    SoundDevice::update(
                        &mut self.ym3438,
                        &mut self.sampling_l,
                        &mut self.sampling_r,
                        1,
                        buffer_pos,
                    );
                }
                if self.vgm_header.clock_pwm != 0 {
                    SoundDevice::update(
                        &mut self.pwm,
                        &mut self.sampling_l,
                        &mut self.sampling_r,
                        1,
                        buffer_pos,
                    );
                }
                if self.vgm_header.sega_pcm_clock != 0 {
                    SoundDevice::update(
                        &mut self.segapcm,
                        &mut self.sampling_l,
                        &mut self.sampling_r,
                        1,
                        buffer_pos,
                    );
                }
                if self.remain_frame_size > 0 {
                    self.remain_frame_size -= 1;
                }
                buffer_pos += 1;
                self.pcm_stream_sampling_pos += 1;
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
        if d.read_to_end(&mut self.vgmdata).is_err() {
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
                SoundDevice::write(&mut self.sn76489, 0, dat);
            }
            0x52 | 0x53 => {
                reg = self.get_vgm_u8();
                dat = self.get_vgm_u8();
                let port = u32::from(command & 0x01) << 1;
                SoundDevice::write(&mut self.ym3438, port, reg);
                SoundDevice::write(&mut self.ym3438, port + 1, dat);
            }
            0x54 => {
                // TODO: YM2151 write
                self.get_vgm_u8(); // reg
                self.get_vgm_u8(); // dat
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
                // 0x66 compatibility command to make older players stop parsing the stream
                self.get_vgm_u8();
                let data_type = self.get_vgm_u8();
                let size = self.get_vgm_u32();
                let data_pos = self.vgmpos;
                self.vgmpos += size as usize;
                // handle data block
                if (0x00..=0x3f).contains(&data_type) {
                    // data of recorded streams (uncompressed) (for ym2612)
                    self.data_pos = data_pos;
                } else if (0x80..=0xbf).contains(&data_type) {
                    // ROM/RAM Image dumps (0x80 segapcm)
                    let rom_size = u32::from_le_bytes(
                        self.vgmdata[data_pos..(data_pos + 4)].try_into().unwrap(),
                    );
                    let start_address = u32::from_le_bytes(
                        self.vgmdata[(data_pos + 4)..(data_pos + 8)]
                            .try_into()
                            .unwrap(),
                    );
                    let mut data_size: usize = 0;
                    if start_address < rom_size {
                        data_size = u32::min(size - 8, rom_size - start_address) as usize;
                    }
                    let start_address = start_address as usize;
                    self.add_rom(
                        data_type as usize,
                        &self.vgmdata[(data_pos + 8)..(data_pos + 8) + data_size],
                        start_address,
                        start_address + data_size - 1,
                    );
                }
            }
            0x70..=0x7f => {
                wait = ((command & 0x0f) + 1).into();
            }
            0x80..=0x8f => {
                // YM2612 PCM
                wait = (command & 0x0f).into();
                SoundDevice::write(&mut self.ym3438, 0, 0x2a);
                SoundDevice::write(
                    &mut self.ym3438,
                    1,
                    self.vgmdata[self.data_pos + self.pcmpos + self.pcmoffset],
                );
                self.pcmoffset += 1;
            }
            0x90 => {
                // TODO: respect stream no
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
                self.pcm_stream_sample_count = self.sample_rate / self.get_vgm_u32();
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
            0xb2 => {
                // 0xB2 ad dd
                // PWM, write value ddd to register a (d is MSB, dd is LSB)
                let raw1 = self.get_vgm_u8();
                let raw2 = self.get_vgm_u8();
                let channel = (raw1 & 0xf0) >> 4_u8;
                let data: u16 = (raw1 as u16 & 0x0f) << 8 | raw2 as u16;
                SoundDevice::write(&mut self.pwm, channel as u32, data);
            }
            0xc0 => {
                let offset = self.get_vgm_u16();
                let dat = self.get_vgm_u8();
                SoundDevice::write(&mut self.segapcm, u32::from(offset), dat);
            }
            0xe0 => {
                self.pcmpos = self.get_vgm_u32() as usize;
                self.pcmoffset = 0;
            }
            _ => {
                #[cfg(feature = "console_error_panic_hook")]
                console_log!(
                    "unknown cmd at {:x}: {:x}",
                    self.vgmpos - 1,
                    self.vgmdata[self.vgmpos - 1]
                );
                #[cfg(not(feature = "console_error_panic_hook"))]
                println!(
                    "unknown cmd at {:x}: {:x}",
                    self.vgmpos - 1,
                    self.vgmdata[self.vgmpos - 1]
                );
            }
        }
        wait
    }

    fn update_dac(&mut self) {
        SoundDevice::write(&mut self.ym3438, 0, 0x2a);
        SoundDevice::write(
            &mut self.ym3438,
            1,
            self.vgmdata[self.data_pos + self.pcm_stream_pos + self.pcm_stream_offset],
        );
        self.pcm_stream_length -= 1;
        self.pcm_stream_pos += 1;
    }

    fn add_rom(&self, index: usize, memory: &[u8], start_address: usize, end_address: usize) {
        if self.sound_chip_romset.contains_key(&index) {
            self.sound_chip_romset.get(&index).unwrap().borrow_mut().add_rom(
                memory,
                start_address,
                end_address,
            );
        }
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

    #[test]
    fn sn76489_1() {
        play("../docs/vgm/sn76489.vgm")
    }

    #[test]
    fn ym2612_1() {
        play("../docs/vgm/ym2612.vgm")
    }

    #[test]
    fn segapcm_1() {
        play("../docs/vgm/segapcm.vgm")
    }

    fn play(filepath: &str) {
        // load sn76489 vgm file
        let mut file = File::open(filepath).unwrap();
        let mut buffer = Vec::new();
        let _ = file.read_to_end(&mut buffer).unwrap();

        let mut vgmplay = VgmPlay::new(
            44100,
            MAX_SAMPLING_SIZE,
            file.metadata().unwrap().len() as usize,
        );
        // set vgmdata (Wasm simulation)
        let vgmdata_ref = vgmplay.get_vgmfile_ref();
        for (i, buf) in buffer.iter().enumerate() {
            unsafe {
                *vgmdata_ref.add(i) = *buf;
            }
        }

        // init & sample
        vgmplay.init().unwrap();
        // play
        #[allow(clippy::absurd_extreme_comparisons)]
        while vgmplay.play(false) <= 0 {}
    }
}
