import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React, { useEffect, useState } from 'react';

const float = keyframes`
  0% { transform: translateY(100vh) scale(0.3) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(-20vh) scale(1.5) rotate(720deg); opacity: 0; }
`;

const hearts = ['❤️', '💕', '💖', '💗', '💓', '💝', '💞', '💟'];

const HeartAnimation = ({ onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const items = [];

    for (let i = 0; i < 50; i++)
      items.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.5 + Math.random() * 2,
        size: 15 + Math.random() * 35,
        emoji: hearts[Math.floor(Math.random() * hearts.length)]
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
            filter: 'drop-shadow(0 0 5px rgba(255,20,147,0.5))'
          }}
        >
          {p.emoji}
        </Box>
      ))}
    </Box>
  );
};

export default HeartAnimation;
