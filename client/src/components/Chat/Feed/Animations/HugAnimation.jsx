import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React, { useEffect, useState } from 'react';

const float = keyframes`
  0% { transform: translateY(100vh) scale(0.5) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(-20vh) scale(1.2) rotate(360deg); opacity: 0; }
`;

const hugEmojis = ['🤗', '🫂', '💕', '🤝', '💗', '🌸', '🌺', '💮'];

const HugAnimation = ({ onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const items = [];

    for (let i = 0; i < 40; i++)
      items.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random() * 2,
        size: 20 + Math.random() * 35,
        emoji: hugEmojis[Math.floor(Math.random() * hugEmojis.length)]
      });

    setParticles(items);

    setTimeout(() => onComplete?.(), 2800);
  }, [onComplete]);

  return (
    <Box
      position='fixed'
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents='none'
      zIndex={9999}
      overflow='hidden'
      sx={{
        '&::before': {
          content: '\'\'',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '300px',
          height: '300px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,180,71,0.15) 0%, rgba(255,140,0,0) 70%)',
          borderRadius: '50%',
          animation: 'pulseGlow 0.8s ease-out'
        },
        '@keyframes pulseGlow': {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.8 },
          '100%': { transform: 'translate(-50%, -50%) scale(3)', opacity: 0 }
        }
      }}
    >
      {particles.map(p => (
        <Box
          key={p.id}
          position='absolute'
          bottom='-50px'
          left={`${p.left}%`}
          fontSize={`${p.size}px`}
          animation={`${float} ${p.duration}s ease-out forwards`}
          animationDelay={`${p.delay}s`}
          sx={{
            filter: 'drop-shadow(0 0 8px rgba(255,180,71,0.6))'
          }}
        >
          {p.emoji}
        </Box>
      ))}
    </Box>
  );
};

export default HugAnimation;
