import { gql } from '@apollo/client';

export const MessageFields = `
  id
  sender {
    id
    username
    image
  }
  body
  attachment
  type
  createdAt
`;

const MessageOperations = {
  Query: {
    messages: gql`
      query Messages($conversationId: String!) {
        messages(conversationId: $conversationId) {
          ${MessageFields}
        }
      }
    `
  },
  Mutations: {
    sendMessage: gql`
      mutation SendMessage(
        $id: String!
        $conversationId: String!
        $senderId: String!
        $body: String!
        $attachment: String!
        $type: MessageType
      ) {
        sendMessage(
          id: $id
          conversationId: $conversationId
          senderId: $senderId
          body: $body
          attachment: $attachment
          type: $type
        )
      }
    `,
    deleteMessage: gql`
      mutation DeleteMessage($messageId: String!) {
        deleteMessage(messageId: $messageId)
      }
    `
  },
  Subscriptions: {
    messageSent: gql`
      subscription MessageSent($conversationId: String!) {
        messageSent(conversationId: $conversationId) {
          ${MessageFields}
        }
      }
    `,
    messageDeleted: gql`
      subscription MessageDeleted($conversationId: String!) {
        messageDeleted(conversationId: $conversationId) {
          ${MessageFields}
        }
      }
    `
  }
};

export default MessageOperations;
