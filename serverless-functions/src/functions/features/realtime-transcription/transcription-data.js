exports.handler = async function handler(context, event, callback) {
  try {
    const response = new Twilio.Response();

    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST GET');
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

    const client = context.getTwilioClient();

    switch (event.TranscriptionEvent) {
      case 'transcription-started':
        console.log('transcriptionEvent: transcription-started: ', event.CallSid);

        await client.sync.v1
          .services(context.SYNC_SERVICE_SID)
          .syncStreams.create({ uniqueName: `RT_${event.CallSid}`, ttl: 21600 });

        break;
      case 'transcription-content':
        if (event.Track === 'inbound_track') {
          const transcript = JSON.parse(event.TranscriptionData).transcript;
          console.log('transcription: user: ', transcript);
          const data = {
            actor: 'inbound',
            type: 'transcript',
            transcriptionText: transcript,
          };

          await client.sync.v1
            .services(context.SYNC_SERVICE_SID)
            .syncStreams(`RT_${event.CallSid}`)
            .streamMessages.create({ data });

          console.log(streamMessageInboundResult);
        } else if (event.Track === 'outbound_track') {
          console.log('transcription: agent: ', event.TranscriptionData);
          const transcript = JSON.parse(event.TranscriptionData).transcript;
          const data = {
            actor: 'outbound',
            type: 'transcript',
            transcriptionText: transcript,
          };

          await client.sync.v1
            .services(context.SYNC_SERVICE_SID)
            .syncStreams(`RT_${event.CallSid}`)
            .streamMessages.create({ data });
        }
        break;
      case 'transcription-stopped':
        // cleanup the sync artifacts if needed
        break;
      default:
        console.log(`Unknown event type received [${event.TranscriptionEvent}]`);
        break;
    }

    response.setStatusCode(200);
    return callback(null, response);
  } catch (err) {
    console.error('Error', err);
    return callback(err, null);
  }
};
