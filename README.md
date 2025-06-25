
## Link to the page
https://my-tts-app-frontend.s3.eu-north-1.amazonaws.com/index.html


## How It Works

![image](https://github.com/user-attachments/assets/05b825d1-c0a8-4849-a030-9243882ac769)

This is a simple serverless Text-to-Speech (TTS) web app built with:

- **React + Vite** for the frontend UI  
- **AWS API Gateway** (HTTP API) to expose a `/synthesize` endpoint  
- **AWS Lambda** (Node.js) as the backend integration  
- **Amazon Polly** to perform the actual speech synthesis  
- **S3 + CloudFront** to host the React build with CDN  

---

### 1. User Interface (React + Vite)

1. The user types or pastes text into the **TextInput** component.  
2. They pick a voice (Joanna, Matthew, etc.) in the **VoiceSelector**.  
3. They adjust **Speech Rate**, **Pitch**, and choose **Standard** vs **Neural** voices in **SpeechControls**.  
4. Clicking **Generate Speech** fires a `POST /synthesize` call to the deployed API.

---

### 2. HTTP API (API Gateway)

- Receives the JSON payload:
  ```json
  {
    "text": "Hello world!",
    "voiceId": "Joanna",
    "engine": "neural",
    "outputFormat": "mp3",
    "speechRate": "1.0",
    "pitch": "0"
  }

---

### 3. Serverless Function (Lambda)

1. **Parse the event**  
   Extracts `text`, `voiceId`, `engine`, `outputFormat`, `speechRate`, and `pitch` from the incoming payload.

2. **Call Amazon Polly**  
   Uses the AWS SDK v3:
   ```ts
   import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

   const client = new PollyClient({ region: "eu-north-1" });
   const command = new SynthesizeSpeechCommand({
     Text: text,
     VoiceId: voiceId,
     Engine: engine,
     OutputFormat: outputFormat,
     SpeechRate: speechRate,
     Pitch: pitch,
   });
   const pollyResponse = await client.send(command);

3. Return HTTP response
```json
   {
    "statusCode": 200,
    "isBase64Encoded": true,
    "headers": {
      "Content-Type": "audio/mpeg",
      "Access-Control-Allow-Origin": "*"
    },
    "body": "<BASE64_AUDIO_STRING>"
  }
```
---

## Preview
<img width="1363" alt="Screenshot 2025-06-08 at 19 32 12" src="https://github.com/user-attachments/assets/4476e8b5-06e8-418a-a81f-c4ae57ee7a00" />


