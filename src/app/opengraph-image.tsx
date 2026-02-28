import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt =
  'FormBridge GP — AI-powered medical form automation for Australian GP clinics';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [plusJakartaBold, dmSansRegular] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/PlusJakartaSans-Bold.ttf')),
    readFile(join(process.cwd(), 'assets/fonts/DMSans-Regular.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A6A57 0%, #0E7C66 50%, #10896F 100%)',
          padding: '60px',
        }}
      >
        {/* Bridge icon */}
        <svg
          width="120"
          height="100"
          viewBox="0 0 152 132"
          fill="none"
        >
          {/* Arch */}
          <path
            d="M16 52Q76 14 136 52L136 70Q76 42 16 70Z"
            fill="rgba(255,255,255,0.95)"
          />
          {/* Road */}
          <path
            d="M16 78Q76 66 136 78L136 87Q76 75 16 87Z"
            fill="#86C9BD"
          />
          {/* Left pillar */}
          <rect x="36" y="94" width="20" height="36" rx="4" fill="rgba(255,255,255,0.95)" />
          {/* Right pillar */}
          <rect x="96" y="94" width="20" height="36" rx="4" fill="rgba(255,255,255,0.95)" />
        </svg>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            marginTop: '24px',
            gap: '16px',
          }}
        >
          <span
            style={{
              fontFamily: 'Plus Jakarta Sans',
              fontSize: '72px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1,
            }}
          >
            FormBridge
          </span>
          <span
            style={{
              fontFamily: 'Plus Jakarta Sans',
              fontSize: '56px',
              fontWeight: 700,
              color: '#F4B400',
              lineHeight: 1,
            }}
          >
            GP
          </span>
        </div>

        {/* Amber accent divider */}
        <div
          style={{
            width: '80px',
            height: '4px',
            background: '#F4B400',
            borderRadius: '2px',
            marginTop: '28px',
            marginBottom: '28px',
          }}
        />

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'DM Sans',
              fontSize: '32px',
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.3,
            }}
          >
            Dictate. Don&apos;t type.
          </span>
          <span
            style={{
              fontFamily: 'DM Sans',
              fontSize: '24px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.3,
            }}
          >
            AI-powered medical form automation for Australian GP clinics
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Plus Jakarta Sans',
          data: plusJakartaBold,
          weight: 700 as const,
          style: 'normal' as const,
        },
        {
          name: 'DM Sans',
          data: dmSansRegular,
          weight: 400 as const,
          style: 'normal' as const,
        },
      ],
    }
  );
}
