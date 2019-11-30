#include <stdint.h>

// Header file for VGM file handling
typedef struct _vgm_file_header
{
	uint32_t fccVGM;
	uint32_t lngEOFOffset;
	uint32_t lngVersion;
	uint32_t lngHzPSG;
	uint32_t lngHzYM2413;
	uint32_t lngGD3Offset;
	uint32_t lngTotalSamples;
	uint32_t lngLoopOffset;
	uint32_t lngLoopSamples;
	uint32_t lngRate;
	uint16_t shtPSG_Feedback;
	uint8_t bytPSG_SRWidth;
	uint8_t bytPSG_Flags;
	uint32_t lngHzYM2612;
	uint32_t lngHzYM2151;
	uint32_t lngDataOffset;
} VGM_HEADER;
