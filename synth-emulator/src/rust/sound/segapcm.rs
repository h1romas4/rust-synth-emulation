// license:BSD-3-Clause
/**
 * Rust SEGAPCM emulation
 *  Hiromasa Tanaka <h1romas4@gmail.com>
 *  https://github.com/h1romas4/rust-synth-emulation
 *
 * Converted from:
 *  MAME
 *  copyright-holders:Hiromitsu Shioya, Olivier Galibert
 *  https://github.com/mamedev/mame/blob/master/src/devices/sound/segapcm.cpp
 *  rev. 70743c6fb2602a5c2666c679b618706eabfca2ad
 */

 use std::convert::TryInto;
 use crate::sound::{Device, DeviceName, convert_sample_i32f32};

pub struct SEGAPCM<'a> {
    clock: u32,
    ram: [u8; 0x800],
    rom: Option<&'a[u8]>,
    bankshift: u8,
    bankmask: u8,
    low: [u8; 16],
}

impl<'a> SEGAPCM<'a> {
    fn new() -> Self {
        Self {
            clock: 0,
            bankshift: 12,
            bankmask: 0x70,
            ram: [0xff; 0x800],
            rom: None,
            low: [0; 16],
        }
    }

    fn init(&mut self, clock: u32, rom: Option<&'a[u8]>) {
        self.clock = clock;
        self.rom = rom;
    }

    fn reset(&mut self) {
        self.ram = [0xff; 0x800];
        self.low = [0; 16];
    }

    fn update(&mut self,  buffer_l: &mut [f32], buffer_r: &mut [f32], numsamples: usize, buffer_pos: usize) {
        // reg      function
        // ------------------------------------------------
        // 0x00     ?
        // 0x01     ?
        // 0x02     volume left
        // 0x03     volume right
        // 0x04     loop address (08-15)
        // 0x05     loop address (16-23)
        // 0x06     end address
        // 0x07     address delta
        // 0x80     ?
        // 0x81     ?
        // 0x82     ?
        // 0x83     ?
        // 0x84     current address (08-15), 00-07 is internal?
        // 0x85     current address (16-23)
        // 0x86     bit 0: channel disable?
        //          bit 1: loop disable
        //          other bits: bank
        // 0x87     ?
        for ch in 0..16 {
            let len = self.ram.len();
            let regs = &mut self.ram[ch * 8..len];

            /* only process active channels */
            if regs[0x86] & 1 == 0 {
                let offset: usize = ((regs[0x86] & self.bankmask) << self.bankshift).into();
                let mut addr: u32 = u32::from(regs[0x85]) << 16 | u32::from(regs[0x84]) << 8 | u32::from(self.low[ch]);
                let loops: u32 = u32::from(regs[0x05]) << 16 | u32::from(regs[0x04]) << 8;
                let end: u8 = regs[6] + 1;

                for i in 0..numsamples {
                    let v: i8;
                    /* handle looping if we've hit the end */
                    if (addr >> 16) as u8 == end {
                        if regs[0x86] & 2 != 0 {
                            regs[0x86] |= 1;
                            break;
                        } else {
                            addr = loops;
                        }
                    }
                    /* fetch the sample */
                    v = (self.rom.unwrap()[offset + (addr >> 8) as usize] - 0x80).try_into().unwrap();
                    /* apply panning and advance */
                    buffer_l[buffer_pos + i] += convert_sample_i32f32((v * (regs[2] & 0x7f) as i8).into());
                    buffer_r[buffer_pos + i] += convert_sample_i32f32((v * (regs[3] & 0x7f) as i8).into());
                    addr = (addr + regs[7] as u32) & 0xffffff;
                }
                /* store back the updated address */
                regs[0x84] = (addr >> 8) as u8;
                regs[0x85] = (addr >> 16) as u8;
                self.low[ch] = if regs[0x86] & 1 != 0 { 0 } else { addr as u8 };
            }
        }
    }

    fn write(&mut self, offset: u32, data: u8) {
        self.ram[offset as usize & 0x07ff] = data;
    }
}

impl<'a> Device<'a, u8> for SEGAPCM<'a> {
    fn new() -> Self {
        SEGAPCM::new()
    }

    fn init(&mut self, _: u32, clock: u32, rom: Option<&'a[u8]>) {
        self.init(clock, rom);
    }

    fn get_device_name(&self) -> DeviceName {
        DeviceName::SEGAPCM
    }

    fn reset(&mut self) {
        self.reset();
    }

    fn write(&mut self, offset: u32, data: u8) {
        self.write(offset, data);
    }

    fn update(&mut self, buffer_l: &mut [f32], buffer_r: &mut [f32], numsamples: usize, buffer_pos: usize) {
        self.update(buffer_l, buffer_r, numsamples, buffer_pos);
    }
}
