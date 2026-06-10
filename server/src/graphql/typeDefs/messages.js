import gql from 'graphql-tag';

const typeDefs = gql`
  enum MessageType {
    TEXT
    HUG
    KISS
    HEART
    SYSTEM
  }

  type Message {
    id: String
    sender: User
    body: String
    attachment: String
    type: MessageType
    createdAt: Date
  }

  type Query {
    messages(conversationId: String): [Message]
  }

  type Mutation {
    sendMessage(
      id: String
      conversationId: String
      senderId: String
      body: String
      attachment: String
      type: MessageType
    ): Boolean
    deleteMessage(messageId: String!): Boolean
  }

  type Subscription {
    messageSent(conversationId: String): Message
    messageDeleted(conversationId: String): Message
  }
`;

export default typeDefs;
