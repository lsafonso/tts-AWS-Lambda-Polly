// index.js
const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const polly = new PollyClient();

exports.handler = async (event) => {
  const { text = "", voiceId = "Joanna" } = JSON.parse(event.body || "{}");
  if (!text) {
    return { statusCode: 400, body: 'Missing "text".' };
  }

  try {
    const { AudioStream } = await polly.send(
      new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: "mp3",
        VoiceId: voiceId,
      })
    );

    // Convert the binary stream to a base64 string:
    const base64Audio = Buffer.from(AudioStream).toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
      },
      body: base64Audio,
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Polly synthesis failed." };
  }
};
// Note: Ensure that the Lambda function has the necessary permissions to access Amazon Polly.
// You can set this up in the AWS Management Console or using AWS CLI.