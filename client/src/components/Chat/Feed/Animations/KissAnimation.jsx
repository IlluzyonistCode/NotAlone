import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import useSound from 'use-sound';

const floatUp = keyframes `
  0% {
    transform: translateY(100vh) rotate(0deg) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: translateY(-20vh) rotate(360deg) scale(1.5);
    opacity: 0;
  }
`;

const floatSide = keyframes `
  0% {
    transform: translate(0, 100vh) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(${Math.random() * 200 - 100}px, -30vh) rotate(720deg);
    opacity: 0;
  }
`;

const glow = keyframes `
  0% { text-shadow: 0 0 0px rgba(255,255,255,0); }
  50% { text-shadow: 0 0 20px rgba(255,105,180,0.8); }
  100% { text-shadow: 0 0 0px rgba(255,255,255,0); }
`;

const KissAnimation = ({ onComplete }) => {
    const [particles, setParticles] = useState([]);

    const [playKiss] = useSound('http://localhost:4000/sounds/kiss.mp3', { volume: 0.3 });

    useEffect(() => {
        const emojis = ['💋', '💕', '❤️', '😘', '💖', '💗', '💓', '💝'];
        const newParticles = [];

        for (let i = 0; i < 60; i++)
            newParticles.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 0.8,
                duration: 1.5 + Math.random() * 2,
                size: 15 + Math.random() * 35,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                rotation: Math.random() * 360,
                isAlternate: Math.random() > 0.7
            });

        setParticles(newParticles);

        playKiss();

        const timer = setTimeout(() => {
            onComplete?.();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete, playKiss]);

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
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, rgba(255,105,180,0.1) 0%, rgba(255,20,147,0) 70%)',
          animation: `${glow} 2s ease-out`
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
          animation={`${p.isAlternate ? floatSide : floatUp} ${p.duration}s ease-out forwards`}
          animationDelay={`${p.delay}s`}
          transform={`rotate(${p.rotation}deg)`}
          filter='drop-shadow(0 0 5px rgba(255,105,180,0.5))'
          sx={{
            '&:hover': {
              animationPlayState: 'paused'
            }
          }}
        >
          {p.emoji}
        </Box>
      ))}
    </Box>
    );
};

export default KissAnimation;
