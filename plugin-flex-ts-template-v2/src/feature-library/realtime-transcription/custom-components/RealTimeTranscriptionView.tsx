import React, { useState, useEffect } from 'react';
import { Box } from '@twilio-paste/core/box';
import { Text } from '@twilio-paste/text';
import { SkeletonLoader } from '@twilio-paste/core/skeleton-loader';
import { Avatar } from '@twilio-paste/core/avatar';
import { Stack } from '@twilio-paste/stack';
import { LogoTwilioIcon } from '@twilio-paste/icons/esm/LogoTwilioIcon';
import {
  ChatBubble,
  ChatLog,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  ChatBookend,
  ChatBookendItem,
} from '@twilio-paste/core/chat-log';
// import { Template, templates } from '@twilio/flex-ui';

// import { CannedResponseCategories, ResponseCategory } from '../../types/CannedResponses';
// import Category from './Category';
// import CannedResponsesService from '../../utils/CannedResponsesService';
// import { StringTemplates } from '../../flex-hooks/strings';

import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { AgentIcon } from '@twilio-paste/icons/esm/AgentIcon';
import { InformationIcon } from '@twilio-paste/icons/esm/InformationIcon';
import { Button } from '@twilio-paste/core';

import client from '../../../utils/sdk-clients/sync/SyncClient';
import { callAIAgent, summarizeConversation } from '../utils/api';

const ComponentName = () => <LogoTwilioIcon decorative={false} title="Description of icon" />;

const RealTimeTranscriptionView: React.FunctionComponent = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isWaitingAIResponse, setIsWaitingAIResponse] = useState(false);
  const [isWaitingSummarizationResponse, setIsWaitingSummarizationResponse] = useState(false);

  const [transcript, setTranscript] = useState<any[]>([]);
  // const [responseCategories, setResponseCategories] = useState<undefined | CannedResponseCategories>(undefined);

  useEffect(() => {
    // async function getResponses() {
    //   try {
    //     // const responses = await CannedResponsesService.fetchCannedResponses();
    //     // setResponseCategories(responses.data);
    //     setIsLoading(false);
    //   } catch (e) {
    //     setIsLoading(false);
    //     setError(true);
    //   }
    // }

    // getResponses();

    console.log('RealTimeTranscriptionView:', props);

    // Function to handle incoming messages on the stream
    const handleStreamMessage = (message: any) => {
      console.log('Stream message received:', message.data);
      setTranscript((prevData) => [...prevData, message.data]);
      console.log('trans', transcript);
    };

    // Subscribe to a Sync Stream
    const subscribeToStream = async function subscribeToStream() {
      const stream = await client.stream(`RT_${props.task.attributes.call_sid}`);
      console.log('Subscribed to Sync stream:', `RT_${props.task.attributes.call_sid}`);

      // Handle incoming stream messages
      stream.on('messagePublished', (event: any) => {
        if (!handleStreamMessage) return;
        console.log('Stream message received:', event);
        handleStreamMessage(event.message);
      });
    };

    subscribeToStream();
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  const askAIAgent = async () => {
    setIsWaitingAIResponse(true);
    const result = await callAIAgent(transcript[transcript.length - 1]);
    setTranscript((prevData) => [
      ...prevData,
      { actor: 'ai-agent', transcriptionText: result.completion, citations: result.citations },
    ]);
    console.log('result:', result);
    setIsWaitingAIResponse(false);
  };

  const summarize = async () => {
    setIsWaitingSummarizationResponse(true);
    const result = await summarizeConversation(transcript);
    setTranscript((prevData) => [
      ...prevData,
      { actor: 'ai-agent', transcriptionText: result.result, citations: result.citations },
    ]);
    console.log('result:', result);
    setIsWaitingSummarizationResponse(false);
  };

  return (
    <>
      <Box as="div" padding="space50">
        <Stack orientation="horizontal" spacing="space30">
          <Text
            as="h1"
            fontSize="fontSize60"
            fontWeight="fontWeightSemibold"
            marginBottom="space40"
            marginTop="space30"
          >
            Realtime Transcription - Powered by
          </Text>
          <LogoTwilioIcon size="sizeIcon60" decorative={false} title="twilio" />
        </Stack>
        {isLoading && <SkeletonLoader />}
        {/* {Boolean(responseCategories) && !isLoading && (
      <>
        {responseCategories?.categories.map((category: ResponseCategory) => (
          <Grid gutter="space30" vertical key={category.section}>
            <Column>
              <Category {...category} />
            </Column>
          </Grid>
        ))}
      </>
    )}
    {error && (
      <Text as="p">
        <Template source={templates[StringTemplates.ErrorFetching]} />
      </Text>
    )} */}

        {
          <ChatLog>
            {transcript &&
              transcript.map(
                (item: any) => (
                  console.log('item:', transcript),
                  (
                    <ChatMessage variant={item.actor === 'inbound' ? 'inbound' : 'outbound'}>
                      <Box
                        width="425px"
                        paddingTop="space50"
                        borderTopColor="colorBorder"
                        borderTopStyle="solid"
                        borderTopWidth="borderWidth10"
                      >
                        <ChatBubble>{item.transcriptionText}</ChatBubble>
                        <ChatMessageMetaItem>
                          <Avatar
                            name={item.actor === 'inbound' || item.actor === 'ai-agent' ? 'inbound' : 'outbound'}
                            color={item.actor === 'inbound' ? 'decorative40' : 'default'}
                            size="sizeIcon20"
                            icon={
                              item.actor === 'outbound'
                                ? AgentIcon
                                : item.actor === 'inbound'
                                ? UserIcon
                                : InformationIcon
                            }
                          />
                        </ChatMessageMetaItem>
                      </Box>
                      {/* <ChatMessageMeta aria-label={direction}>
                          <Tooltip text={direction}>
                            <ChatMessageMetaItem>
                              <Avatar
                                name={direction}
                                color={item.actor === Actor.assistant ? 'decorative40' : 'default'}
                                size="sizeIcon20"
                                icon={getIconForActor(item.actor)}
                              />
                              {item.actor === Actor.outbound ? 'You' : item.actor === Actor.assistant ? 'Assistant' : 'Customer'}
                            </ChatMessageMetaItem>
                          </Tooltip>
                        </ChatMessageMeta> */}
                    </ChatMessage>
                  )
                ),
              )}
            {/* <ChatMessage variant='inbound'>
          <ChatBubble>
            Hello, what can I help you with?
          </ChatBubble>
          <ChatMessageMeta aria-label="said by Gibby Radki at 3:35 PM">
            <ChatMessageMetaItem>
              
              Gibby Radki ・ 3:35 PM
            </ChatMessageMetaItem>
          </ChatMessageMeta>
        </ChatMessage>
        <ChatMessage variant='outbound'>
          <ChatBubble>
            Hi! What is your return policy?
          </ChatBubble>
          <ChatMessageMeta aria-label="said by you at 3:35 PM">
            <ChatMessageMetaItem>3:35 PM</ChatMessageMetaItem>
          </ChatMessageMeta>
        </ChatMessage> */}
          </ChatLog>
        }
      </Box>
      <Box as="div" padding="space50">
        <Stack orientation="horizontal" spacing="space30">
          <Button variant="primary" onClick={askAIAgent} disabled={isWaitingAIResponse}>
            Ask AI for help
          </Button>

          <Button variant="primary" onClick={summarize} disabled={isWaitingSummarizationResponse}>
            Summarize Conversation
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default RealTimeTranscriptionView;
