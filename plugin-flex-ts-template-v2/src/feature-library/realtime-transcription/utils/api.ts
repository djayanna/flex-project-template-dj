import axios from 'axios';

export const callAIAgent = async (transcription: any) => {
  // if (!process.env.NEXT_PUBLIC_LOGGING_ENDPOINT) return;

  console.log(transcription);

  try {
    const response = await axios.post(`https://innocent-wahoo-extremely.ngrok-free.app/invoke-agent`, {
      data: transcription,
    });

    console.log(response.data);

    return response?.data;
  } catch (error) {
    console.log(error);
  }
};

export const summarizeConversation = async (transcription: any) => {
  // if (!process.env.NEXT_PUBLIC_LOGGING_ENDPOINT) return;

  console.log(transcription);

  try {
    const response = await axios.post(`https://innocent-wahoo-extremely.ngrok-free.app/summarize-conversation`, {
      data: transcription,
    });

    console.log(response.data);

    return response?.data;
  } catch (error) {
    console.log(error);
  }
};
