import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import MessagesHeader from './Messages/Header';
import Messages from './Messages/Messages';
import MessageInput from './Input';
import NoConversationSelected from './NoConversationSelected';
import HugAnimation from './Animations/HugAnimation';
import KissAnimation from './Animations/KissAnimation';
import HeartAnimation from './Animations/HeartAnimation';

const FeedWrapper = ({ session }) => {
  const router = useRouter();

  const { conversationId } = router.query;

  const [showHug, setShowHug] = useState(false);
  const [showKiss, setShowKiss] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  return (
    <Flex
      display={{ base: conversationId ? 'flex' : 'none', md: 'flex' }}
      direction='column'
      width='100%'
    >
      {conversationId && typeof conversationId === 'string' ? (
        <>
          {showHug && <HugAnimation onComplete={() => setShowHug(false)} />}
          {showKiss && <KissAnimation onComplete={() => setShowKiss(false)} />}
          {showHeart && <HeartAnimation onComplete={() => setShowHeart(false)} />}
          <Flex
            direction='column'
            justify='space-between'
            overflow='hidden'
            flexGrow={1}
          >
            <MessagesHeader
              userId={session.user.id}
              conversationId={conversationId}
            />
            <Messages
              userId={session.user.id}
              conversationId={conversationId}
            />
          </Flex>
          <Box
            position='sticky'
            bottom={0}
            bg='whiteAlpha.50'
            backdropFilter='blur(10px)'
            borderTop='1px solid'
            borderColor='whiteAlpha.200'
            boxShadow='0 -5px 15px rgba(0,0,0,0.3)'
          >
            <MessageInput
              session={session}
              conversationId={conversationId}
              setShowHug={setShowHug}
              setShowKiss={setShowKiss}
              setShowHeart={setShowHeart}
            />
          </Box>
        </>
      ) : (
        <NoConversationSelected />
      )}
    </Flex>
  );
};

export default FeedWrapper;
