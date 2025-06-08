// src/App.tsx
import React, { useState } from 'react';
import { Volume2, Wand2, AlertTriangle, CheckCircle } from 'lucide-react';
import TextInput from './components/TextInput';
import VoiceSelector from './components/VoiceSelector';
import SpeechControls from './components/SpeechControls';
import AudioPlayer from './components/AudioPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import { convertTextToSpeech, TTSApiError } from './utils/api';
import type { Voice, TTSRequest, AudioPlayerState } from './types';

// Demo voices to fall back on – we’re not calling /voices anymore
const DEMO_VOICES: Voice[] = [
  { id: 'Joanna',  name: 'Joanna',  gender: 'Female', language: 'English (US)', languageCode: 'en-US' },
  { id: 'Matthew', name: 'Matthew', gender: 'Male',   language: 'English (US)', languageCode: 'en-US' },
  { id: 'Amy',     name: 'Amy',     gender: 'Female', language: 'English (UK)', languageCode: 'en-GB' },
  { id: 'Brian',   name: 'Brian',   gender: 'Male',   language: 'English (UK)', languageCode: 'en-GB' },
  { id: 'Céline',  name: 'Céline',  gender: 'Female', language: 'French',        languageCode: 'fr-FR' },
  { id: 'Mathieu', name: 'Mathieu', gender: 'Male',   language: 'French',        languageCode: 'fr-FR' },
];

export default function App() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice['id']>('Joanna');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [engine, setEngine] = useState<'standard'|'neural'>('standard');
  const [voices] = useState<Voice[]>(DEMO_VOICES);
  const [audioUrl, setAudioUrl] = useState<string|null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  const handleGenerate = async () => {
    setError(null);
    setSuccess(null);

    if (!text.trim()) {
      setError('Please enter some text to convert.');
      return;
    }
    if (text.length > 3000) {
      setError('Text exceeds maximum length of 3,000 characters.');
      return;
    }

    setIsGenerating(true);
    const req: TTSRequest = {
      text:         text.trim(),
      voiceId:      selectedVoice,
      engine,
      outputFormat: 'mp3',
      speechRate:   speechRate.toString(),
      pitch:        pitch.toString()
    };

    try {
      const { audioUrl: url } = await convertTextToSpeech(req);
      setAudioUrl(url);
      setSuccess('Audio generated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      if (e instanceof TTSApiError) {
        setError(e.message);
      } else {
        console.error(e);
        setError('Unexpected error — see console.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleAudioStateChange = (state: AudioPlayerState) => {
    console.log('Audio state:', state);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Text to Speech
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform your text into natural-sounding speech using AWS Polly.
          </p>
        </div>

        {/* Alerts */}
        {(error || success) && (
          <div className="mb-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
                <button onClick={clearMessages} className="text-red-400 hover:text-red-600">
                  ×
                </button>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-800 font-medium">Success</p>
                  <p className="text-green-700 text-sm mt-1">{success}</p>
                </div>
                <button onClick={clearMessages} className="text-green-400 hover:text-green-600">
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <TextInput value={text} onChange={setText} error={error && text.length > 3000 ? error : undefined} />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <VoiceSelector
                voices={voices}
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
                loading={false}
              />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <SpeechControls
                speechRate={speechRate}
                onSpeechRateChange={setSpeechRate}
                pitch={pitch}
                onPitchChange={setPitch}
                engine={engine}
                onEngineChange={setEngine}
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim() || text.length > 3000}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" /> Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" /> Generate Speech
                  </>
                )}
              </button>
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Characters: {text.length.toLocaleString()}/3,000</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Audio Player</h3>
              <AudioPlayer audioUrl={audioUrl} onStateChange={handleAudioStateChange} />
            </div>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by AWS Polly • Maximum 3,000 characters per request. Made by <a href="https://github.com/lsafonso">Leandro</a></p>
        </div>
      </div>
    </div>
  );
}
