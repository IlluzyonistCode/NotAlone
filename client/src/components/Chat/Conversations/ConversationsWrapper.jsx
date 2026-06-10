import { gql, useMutation, useQuery, useSubscription } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useEffect, useCallback } from 'react';
import { requestNotificationPermission, sendMessageNotification, sendRomanticNotification, isWindowFocused } from '../../../util/notifications';
import useSound from 'use-sound';
import toast from 'react-hot-toast';
import ConversationOperations from '../../../graphql/operations/conversations';
import MessageOperations from '../../../graphql/operations/messages';
import SkeletonLoader from '../../common/SkeletonLoader';
import ConversationList from './ConversationList';

const ConversationsWrapper = ({ session }) => {
  const router = useRouter();

  const { conversationId } = router.query;

  const { user: { id: userId } } = session;

  const [notification] = useSound('http://localhost:4000/sounds/notify.mp3', { volume: 0.5 });

  const {
    data: conversationsData,
    loading: conversationsLoading,
    error: conversationsError,
    subscribeToMore
  } = useQuery(
    ConversationOperations.Queries.conversations,
    {
      onError: ({ message }) => {
        toast.error(message);
      }
    }
  );

  const [markConversationAsRead] = useMutation(ConversationOperations.Mutations.markConversationAsRead);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useSubscription(
    ConversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const {
          conversationUpdated: {
            conversation: updatedConversation,
            addedUserIds,
            removedUserIds
          }
        } = subscriptionData;

        const { id: updatedConversationId, latestMessage } = updatedConversation;

        const isOwnMessage = latestMessage?.sender?.id === userId;
        const isCurrentConversation = conversationId === updatedConversationId;
        const shouldNotify = !isOwnMessage && !isCurrentConversation;

        if (shouldNotify) {
          notification();
          
          if (!isWindowFocused()) {
            const sender = updatedConversation.participants?.find(p => p.user.id === latestMessage?.sender?.id)?.user;
            const senderName = sender?.username || 'Someone';
            const messageBody = latestMessage?.body || '';
            
            if (messageBody.includes('Hugs you warmly'))
              sendRomanticNotification(senderName, 'hug', () => {
                router.push({ query: { conversationId: updatedConversationId } });
              });
            
            else if (messageBody.includes('Kisses you tenderly'))
              sendRomanticNotification(senderName, 'kiss', () => {
                router.push({ query: { conversationId: updatedConversationId } });
              });
            
            else if (messageBody.includes('Gives you their heart'))
              sendRomanticNotification(senderName, 'heart', () => {
                router.push({ query: { conversationId: updatedConversationId } });
              });
            
            else
              sendMessageNotification(senderName, messageBody, updatedConversationId, () => {
                router.push({ query: { conversationId: updatedConversationId } });
              });
          }
        }

        if (removedUserIds?.length) {
          const isBeingRemoved = removedUserIds.find((id) => id === userId);

          if (isBeingRemoved) {
            const conversationsData = client.readQuery({
              query: ConversationOperations.Queries.conversations
            });

            if (!conversationsData) return;

            client.writeQuery({
              query: ConversationOperations.Queries.conversations,
              data: {
                conversations: conversationsData.conversations.filter(
                  (c) => c.id !== updatedConversationId
                )
              }
            });

            if (conversationId === updatedConversationId)
              router.replace(
                typeof process.env.NEXT_PUBLIC_BASE_URL === 'string' ? process.env.NEXT_PUBLIC_BASE_URL : ''
              );

            return;
          }
        }

        if (addedUserIds?.length) {
          const isBeingAdded = addedUserIds.find((id) => id === userId);

          if (isBeingAdded) {
            const conversationsData = client.readQuery({
              query: ConversationOperations.Queries.conversations,
            });

            if (!conversationsData) return;

            client.writeQuery({
              query: ConversationOperations.Queries.conversations,
              data: {
                conversations: [
                  ...(conversationsData.conversations || []),
                  updatedConversation
                ]
              }
            });
          }
        }

        if (updatedConversationId !== conversationId) {
          const conversationsData = client.readQuery({
            query: ConversationOperations.Queries.conversations
          });
          
          if (conversationsData) {
            const updatedConversations = conversationsData.conversations.map(conv => {
              if (conv.id === updatedConversationId) {
                return {
                  ...conv,
                  latestMessage: updatedConversation.latestMessage,
                  updatedAt: updatedConversation.updatedAt,
                  participants: updatedConversation.participants
                };
              }
              return conv;
            });
            
            client.writeQuery({
              query: ConversationOperations.Queries.conversations,
              data: { conversations: updatedConversations }
            });
          }
        }

        if (updatedConversationId === conversationId) {
          onViewConversation(conversationId, false);

          return;
        }

        const existing = client.readQuery({
          query: MessageOperations.Query.messages,
          variables: { conversationId: updatedConversationId }
        });

        if (!existing) return;

        const hasLatestMessage = existing.messages.find(
          (m) => m.id === latestMessage?.id
        );

        if (!hasLatestMessage && latestMessage) {
          client.writeQuery({
            query: MessageOperations.Query.messages,
            variables: { conversationId: updatedConversationId },
            data: {
              ...existing,
              messages: [latestMessage, ...existing.messages]
            }
          });
        }
      }
    }
  );

  useSubscription(
    ConversationOperations.Subscriptions.conversationDeleted,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const existing = client.readQuery({
          query: ConversationOperations.Queries.conversations
        });

        if (!existing) return;

        const { conversations } = existing;
        const { conversationDeleted: { id: deletedConversationId } } = subscriptionData;
        
        client.writeQuery({
          query: ConversationOperations.Queries.conversations,
          data: {
            conversations: conversations.filter(
              (conversation) => conversation.id !== deletedConversationId
            )
          }
        });
      }
    }
  );

  const onViewConversation = useCallback(async (conversationId, hasSeenLatestMessage) => {
    router.push({ query: { conversationId } });
    
    if (hasSeenLatestMessage) return;
    
    try {
      await markConversationAsRead({
        variables: { userId, conversationId },
        optimisticResponse: { markConversationAsRead: true },
        update: (cache) => {
          const participantsFragment = cache.readFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment Participants on Conversation {
                participants {
                  user {
                    id
                    username
                    image
                  }
                  hasSeenLatestMessage
                  unreadCount
                }
              }
            `
          });

          if (!participantsFragment) return;
          
          const participants = [...participantsFragment.participants];
          const userParticipantIdx = participants.findIndex((p) => p.user.id === userId);
          
          if (userParticipantIdx === -1) return;
          
          participants[userParticipantIdx] = {
            ...participants[userParticipantIdx],
            hasSeenLatestMessage: true,
            unreadCount: 0
          };

          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdatedParticipants on Conversation {
                participants
              }
            `,
            data: { participants }
          });
        }
      });
    } catch (error) {
      console.log('onViewConversation error', error);
    }
  }, [markConversationAsRead, userId, router]);

  const subscribeToNewConversations = useCallback(() => {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.conversationCreated,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        
        const newConversation = subscriptionData.data.conversationCreated;
        
        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations]
        });
      }
    });
  }, [subscribeToMore]);

  useEffect(() => {
    subscribeToNewConversations();
  }, [subscribeToNewConversations]);

  if (conversationsError) {
    toast.error('There was an error fetching conversations');

    return;
  }

  return (
    <Box
      display={{ base: conversationId ? 'none' : 'flex', md: 'flex' }}
      width={{ base: '100%', md: '400px' }}
      bg='whiteAlpha.50'
      py={6}
      px={3}
      position='relative'
    >
      {conversationsLoading ? (
        <SkeletonLoader count={7} height='80px' width='360px' />
      ) : (
        <ConversationList
          session={session}
          conversations={conversationsData?.conversations || []}
          onViewConversation={onViewConversation}
        />
      )}
    </Box>
  );
};

export default ConversationsWrapper;
