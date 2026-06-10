import { useQuery } from '@apollo/client';
import { Box, Text, Tooltip } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import MessageOperations from '../../../../graphql/operations/messages';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const DaysCounter = ({ conversationId }) => {
  const [days, setDays] = useState(0);
  const [startDate, setStartDate] = useState(null);

  const { data, loading } = useQuery(MessageOperations.Query.messages, {
    variables: { conversationId }
  });

  useEffect(() => {
    if (data?.messages && data.messages.length > 0) {
      const oldestMessage = [...data.messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0];
      
      const firstMessageDate = new Date(oldestMessage.createdAt);

      setStartDate(firstMessageDate);
      
      const now = new Date();
      const diffTime = Math.abs(now - firstMessageDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setDays(diffDays);
    }
  }, [data]);

  const getDaysText = (days) => {
    if (days === 1) return 'day';

    return 'days';
  };

  if (loading || !startDate)
    return (
      <Box display='flex' alignItems='center' gap='6px' bg='rgba(255,255,255,0.08)' px={2} py={1} borderRadius='md'>
        <Text fontSize='14px'>💕</Text>
        <Text fontSize='12px' color='whiteAlpha.600'>Loading...</Text>
      </Box>
    );

  return (
    <Tooltip label={`Together for ${days} ${getDaysText(days)}`} placement='bottom' hasArrow bg='pink.500'>
      <Box
        display='flex'
        alignItems='center'
        gap='6px'
        bg='linear-gradient(135deg, rgba(255,105,180,0.15), rgba(255,20,147,0.08))'
        px={3}
        py={1}
        borderRadius='full'
        border='1px solid'
        borderColor='pink.400'
        animation={`${pulse} 2s infinite`}
        _hover={{
          transform: 'scale(1.02)',
          bg: 'linear-gradient(135deg, rgba(255,105,180,0.25), rgba(255,20,147,0.15))'
        }}
        transition='all 0.2s ease'
      >
        <Box
          as='span'
          fontSize='14px'
          sx={{
            animation: 'heartbeat 1.5s ease-in-out infinite',
            '@keyframes heartbeat': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.15)' }
            }
          }}
        >
          💕
        </Box>
        <Text fontWeight='600' fontSize='13px' color='pink.200'>
          {days}
        </Text>
        <Text fontSize='10px' color='pink.300' opacity={0.7}>
          {getDaysText(days)}
        </Text>
      </Box>
    </Tooltip>
  );
};

export default DaysCounter;
