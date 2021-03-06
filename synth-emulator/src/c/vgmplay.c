// for vgm testing
// mkdir build && cd build
// make && bin/vgmplay && ffplay -f u16le -ar 44100 -ac 2 ../vgm/s16le.pcm
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <assert.h>
#include <stdbool.h>
#include "mamedef.h"
#include "ym3438.h"
#include "sn76489.h"
#include "pwm.h"
#include "vgmplay.h"

#define SAMPLING_RATE 44100
#define FRAME_SIZE_MAX 4096

#define STEREO 2
#define MONO 0

VGM_HEADER *vgmheader;
uint8_t *vgm;
uint32_t vgmpos = 0x40;
uint32_t datpos;
uint32_t pcmpos;
uint32_t pcmoffset;

bool vgmend = false;

uint32_t clock_sn76489;
uint32_t clock_ym2612;
uint32_t clock_pwm;

SN76489_Context *sn76489;
ym3438_t *ym3438;

void vgm_load(void) {
    vgm = (unsigned char *) malloc(30000000);
    int fd = open("../../docs/vgm/pwm.vgm", O_RDONLY);
    assert(fd != -1);
    read(fd, vgm, 30000000);
    close(fd);

    vgmheader = (VGM_HEADER *)vgm;
    printf("version %x\n", vgmheader->lngVersion);
    if(vgmheader->lngVersion >= 0x150) {
        vgmheader->lngDataOffset += 0x00000034;
    }

    clock_sn76489 = vgmheader->lngHzPSG;
    clock_ym2612 = vgmheader->lngHzYM2612;
    clock_pwm = 23011360;
    if(clock_ym2612 == 0) clock_ym2612 = 7670453;
    if(clock_sn76489 == 0) clock_sn76489 = 3579545;

    vgmpos = vgmheader->lngDataOffset;

    printf("vgmpos %x\n", vgmheader->lngDataOffset);
    printf("clock_sn76489 %d\n", clock_sn76489);
    printf("clock_ym2612 %d\n", clock_ym2612);
}

uint8_t get_vgm_u8()
{
    return vgm[vgmpos++];
}

uint16_t get_vgm_u16()
{
    return get_vgm_u8() + (get_vgm_u8() << 8);
}

uint32_t get_vgm_u32()
{
    return get_vgm_u8() + (get_vgm_u8() << 8) + (get_vgm_u8() << 16) + (get_vgm_u8() << 24);
}

uint16_t parse_vgm()
{
    uint8_t command;
    uint16_t wait = 0;
    uint8_t reg;
    uint8_t dat;
    uint8_t raw1;
    uint8_t raw2;
    uint8_t channel;
    uint16_t data;

    command = get_vgm_u8();

    switch (command) {
        case 0x50:
            dat = get_vgm_u8();
            SN76489_Write(sn76489, dat);
            break;
        case 0x52:
        case 0x53:
            reg = get_vgm_u8();
            dat = get_vgm_u8();
            OPN2_WriteBuffered(ym3438, 0 + ((command & 1) << 1), reg);
            OPN2_WriteBuffered(ym3438, 1 + ((command & 1) << 1), dat);
            break;
        case 0x61:
            wait = get_vgm_u16();
            break;
        case 0x62:
            wait = 735;
            break;
        case 0x63:
            wait = 882;
            break;
        case 0x66:
            vgmend = true;
            break;
        case 0x67:
            get_vgm_u8(); // 0x66
            get_vgm_u8(); // 0x00 data type
            datpos = vgmpos + 4;
            vgmpos += get_vgm_u32(); // size of data, in bytes
            break;
        case 0x70: case 0x71: case 0x72: case 0x73: case 0x74: case 0x75: case 0x76: case 0x77:
        case 0x78: case 0x79: case 0x7a: case 0x7b: case 0x7c: case 0x7d: case 0x7e: case 0x7f:
            wait = (command & 0x0f) + 1;
            break;
        case 0x80: case 0x81: case 0x82: case 0x83: case 0x84: case 0x85: case 0x86: case 0x87:
        case 0x88: case 0x89: case 0x8a: case 0x8b: case 0x8c: case 0x8d: case 0x8e: case 0x8f:
            wait = (command & 0x0f);
            OPN2_WriteBuffered(ym3438, 0, 0x2a);
            OPN2_WriteBuffered(ym3438, 1, vgm[datpos + pcmpos + pcmoffset]);
            pcmoffset++;
            break;
        case 0x90:
            // Setup Stream Control
            get_vgm_u32();
            break;
        case 0x91:
            // Set Stream Data
            get_vgm_u32();
            break;
        case 0x92:
            // Set Stream Frequency
            get_vgm_u8();
            get_vgm_u32();
        case 0x93:
            // Start Stream
            get_vgm_u8();
            get_vgm_u32();
            get_vgm_u8();
            get_vgm_u32();
        case 0xb2:
            raw1 = get_vgm_u8();
            raw2 = get_vgm_u8();
            channel = (raw1 & 0xf0) >> 4;
            data = (raw1 & 0x0f) << 8 | raw2;
            pwm_chn_w(0, channel, data);
            break;
        case 0xe0:
            pcmpos = get_vgm_u32();
            pcmoffset = 0;
            break;
        default:
            printf("unknown cmd at 0x%x: 0x%x\n", vgmpos, vgm[vgmpos]);
            vgmpos++;
            break;
    }

	return wait;
}

short audio_write_sound_stereo(int sample32)
{
    short sample16;

    if (sample32 < -0x7FFF) {
        sample16 = -0x7FFF;
    } else if (sample32 > 0x7FFF) {
        sample16 = 0x7FFF;
    } else {
        sample16 = (short)(sample32);
    }

    // for I2S_MODE_DAC_BUILT_IN
    sample16 = sample16 ^ 0x8000U;

    return sample16;
}

// The loop routine runs over and over again forever
int main(void)
{
    vgm_load();

    // // Reset for NTSC Genesis/Megadrive
    sn76489 = SN76489_Init(clock_sn76489, SAMPLING_RATE);
    SN76489_Reset(sn76489);

    ym3438 = (ym3438_t *)malloc(sizeof(ym3438_t));
    OPN2_Reset(ym3438, SAMPLING_RATE, clock_ym2612);
    OPN2_SetChipType(ym3438_mode_ym2612);

    device_start_pwm(0, clock_pwm);

    // malloc sound buffer
    int **buflr;

    buflr = (int **)malloc(sizeof(int) * STEREO);
    assert(buflr != NULL);
    buflr[0] = (int *)malloc(sizeof(int) * FRAME_SIZE_MAX);
    assert(buflr[0] != NULL);
    buflr[1] = (int *)malloc(sizeof(int) * FRAME_SIZE_MAX);
    assert(buflr[1] != NULL);

    size_t bytes_written = 0;
    uint16_t frame_size = 0;
    uint16_t frame_size_count = 0;
    uint32_t frame_all = 0;

    int fd = open("../../docs/vgm/s16le.pcm", O_CREAT | O_WRONLY | O_TRUNC, 0666);
    assert(fd != -1);

    do {
        frame_size = parse_vgm();
        // get sampling
        for(uint32_t i = 0; i < frame_size; i++) {
            SN76489_Update(sn76489, (int **)buflr, 1);
            pwm_update(0, (int **)buflr, 1);
            OPN2_GenerateStream(ym3438, (int **)buflr, 1);
            short d[STEREO];
            d[0] = audio_write_sound_stereo(buflr[0][0]);
            d[1] = audio_write_sound_stereo(buflr[1][0]);
            write(fd, d, sizeof(short) * STEREO);
        }
        frame_all += frame_size;
    } while(!vgmend);

    close(fd);

    free(buflr[0]);
    free(buflr[1]);
    free(buflr);

    free(ym3438);
    SN76489_Shutdown(sn76489);

    printf("end!\n");

    return 0;
}
