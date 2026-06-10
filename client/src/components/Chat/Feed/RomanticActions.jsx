import React, { useState } from 'react';
import { Box, Flex, IconButton, Tooltip } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaHeart, FaKiss, FaHandsHelping } from 'react-icons/fa';

const bounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const hugBounce = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  30% { transform: scale(1.3) rotate(-10deg); }
  60% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const kissFloat = keyframes`
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.2); }
  100% { transform: translateY(0) scale(1); }
`;

const heartBeat = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(0.9); }
  75% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const RomanticActions = ({ isMobile, isOpen, onToggle, onSendAction }) => {
  const [animatingAction, setAnimatingAction] = useState(null);

  const getAnimation = (actionId) => {
    if (animatingAction !== actionId) return 'none';
    
    switch (actionId) {
      case 'hug': return `${hugBounce} 0.5s ease`;
      case 'kiss': return `${kissFloat} 0.4s ease`;
      case 'heart': return `${heartBeat} 0.5s ease`;
      default: return 'none';
    }
  };

  const actions = [
    { 
      id: 'hug', 
      emoji: '🤗', 
      label: 'Hug', 
      icon: FaHandsHelping, 
      color: '#FFB347',
      gradient: 'linear-gradient(135deg, #FFB34720, #FF8C0020)',
      borderColor: '#FFB347',
      actionMessage: '🤗 Hugs you warmly',
      animation: hugBounce
    },
    { 
      id: 'kiss', 
      emoji: '💋', 
      label: 'Kiss', 
      icon: FaKiss, 
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B20, #FF444420)',
      borderColor: '#FF6B6B',
      actionMessage: '💋 Kisses you tenderly',
      animation: kissFloat
    },
    { 
      id: 'heart', 
      emoji: '💝', 
      label: 'Heart', 
      icon: FaHeart, 
      color: '#FF1493',
      gradient: 'linear-gradient(135deg, #FF149320, #FF69B420)',
      borderColor: '#FF1493',
      actionMessage: '💝 Gives you their heart',
      animation: heartBeat
    }
  ];

  const handleAction = async (action) => {
    setIsAnimating(true);

    await onSendAction(action);

    setTimeout(() => setIsAnimating(false), 500);
    
    onToggle();
  };

  return (
    <Box position='relative'>
      <IconButton
        icon={<FaHeart color={isOpen ? '#FF1493' : 'white'} />}
        onClick={onToggle}
        variant='ghost'
        size='sm'
        isRound
        aria-label='Romantic actions'
        bg={isOpen ? 'rgba(255,20,147,0.2)' : 'transparent'}
        transition='all 0.2s ease'
        minW='32px'
        w='32px'
        h='32px'
      />

      {isOpen && (
        <Flex
          position='fixed'
          bottom={isMobile ? '100px' : '80px'}
          left={isMobile ? '50%' : 'auto'}
          right={isMobile ? 'auto' : '70px'}
          transform={isMobile ? 'translateX(-50%)' : 'none'}
          direction='column'
          gap={2}
          animation={`${slideIn} 0.2s ease-out`}
          bg='rgba(0,0,0,0.85)'
          backdropFilter='blur(12px)'
          p={2}
          borderRadius='2xl'
          border='1px solid'
          borderColor='whiteAlpha.200'
          boxShadow='0 10px 25px -5px rgba(0,0,0,0.3)'
          zIndex={99999}
        >
          {actions.map((action) => (
            <Tooltip
              key={action.id}
              label={action.label}
              placement='left'
              hasArrow
              isDisabled={isMobile}
            >
              <IconButton
                icon={
                  <Box
                    as='span'
                    fontSize={isMobile ? '28px' : '22px'}
                    animation={getAnimation(action.id)}
                    display='inline-block'
                  >
                    {action.emoji}
                  </Box>
                }
                onClick={() => handleAction(action)}
                variant='solid'
                bg='transparent'
                color={action.color}
                border='1px solid'
                borderColor={`${action.color}60`}
                size='sm'
                isRound
                aria-label={action.label}
                _hover={{
                  transform: 'scale(1.1)',
                  bg: `${action.color}20`,
                  borderColor: action.color
                }}
                transition='all 0.2s ease'
                w='48px'
                h='48px'
              />
            </Tooltip>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default RomanticActions;
