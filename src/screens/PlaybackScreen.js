import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as Speech from 'expo-speech';
import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import { setTranscription, setRewrittenText, setSelectedRewriteOption } from '../store/recordingSlice';

const PlaybackScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { recording: recordingFromRoute } = route.params || {};
  
  const { currentRecording, transcription, rewrittenText, selectedRewriteOption } = useSelector(
    (state) => state.recording
  );
  
  const recording = currentRecording || recordingFromRoute;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(recording?.duration || 0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const positionInterval = useRef(null);

  // Load the recording when the component mounts
  useEffect(() => {
    if (!recording) {
      navigation.goBack();
      return;
    }

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: recording.uri },
          { shouldPlay: false }
        );
        
        sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setSound(sound);
        
        // Get the duration if not provided
        if (!recording.duration) {
          const status = await sound.getStatusAsync();
          setDuration(status.durationMillis / 1000);
        }
      } catch (error) {
        console.error('Error loading sound', error);
      }
    };
    
    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
      clearInterval(positionInterval.current);
    };
  }, [recording?.uri]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        clearInterval(positionInterval.current);
      }
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        clearInterval(positionInterval.current);
      } else {
        await sound.playAsync();
        startPositionUpdate();
      }
    } catch (error) {
      console.error('Error toggling playback', error);
    }
  };

  const startPositionUpdate = () => {
    clearInterval(positionInterval.current);
    positionInterval.current = setInterval(() => {
      sound.getStatusAsync().then((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis / 1000);
        }
      });
    }, 100);
  };

  const handleSeek = async (newPosition) => {
    if (!sound) return;
    
    try {
      await sound.setPositionAsync(newPosition * 1000);
      setPosition(newPosition);
    } catch (error) {
      console.error('Error seeking', error);
    }
  };

  const transcribeRecording = async () => {
    if (!recording?.uri || isTranscribing) return;
    
    setIsTranscribing(true);
    
    try {
      // In a real app, you would send the audio to a speech-to-text API here
      // For this example, we'll simulate a transcription after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTranscription = "This is a simulated transcription of your recording. In a real app, this would be the actual transcribed text from your audio recording using a speech-to-text service like Google Cloud Speech-to-Text or AWS Transcribe.";
      
      dispatch(setTranscription(mockTranscription));
    } catch (error) {
      console.error('Error transcribing', error);
      alert('Failed to transcribe the recording. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleRewrite = (option) => {
    if (!transcription || isRewriting) return;
    
    setIsRewriting(true);
    dispatch(setSelectedRewriteOption(option));
    
    // In a real app, you would send the transcription to an AI API for rewriting
    // For this example, we'll simulate a response after a delay
    setTimeout(() => {
      let rewrittenText = '';
      
      switch (option.id) {
        case 'formal':
          rewrittenText = `Dear Sir/Madam,\n\nI am writing to provide you with a formal transcription of the recorded content. The following text has been transcribed from the audio recording for your reference.\n\n"${transcription}"\n\nShould you require any further assistance or have any questions, please do not hesitate to contact me.\n\nYours faithfully,\n[Your Name]`;
          break;
          
        case 'bullet-points':
          rewrittenText = `• This is a simulated transcription of your recording\n• In a real app, this would be the actual transcribed text\n• The text would be formatted with bullet points\n• Making it easier to scan and read quickly`;
          break;
          
        case 'email':
          rewrittenText = `Subject: Follow-up on our recent recording\n\nHi [Recipient's Name],\n\nI hope this email finds you well. I wanted to follow up with the transcription of our recent recording. Here's what was discussed:\n\n${transcription}\n\nPlease let me know if you have any questions or need any clarification.\n\nBest regards,\n[Your Name]`;
          break;
          
        case 'summary':
          rewrittenText = `Summary of Recording:\n\nThe recording contains the following key points:\n\n1. This is a simulated transcription\n2. The content would be summarized\n3. Highlighting the main points\n4. For quick reference\n\nTotal Duration: ${Math.floor(duration)} seconds`;
          break;
          
        case 'to-do':
          rewrittenText = `TODO List from Recording:\n\n☐ Review the simulated transcription\n☐ Implement actual speech-to-text integration\n☐ Test with different audio qualities\n☐ Add more rewrite options\n☐ Improve error handling`;
          break;
          
        case 'journal':
          const today = new Date();
          rewrittenText = `${format(today, 'EEEE, MMMM d, yyyy')}\n\nToday's thoughts:\n\n${transcription}\n\nReflection: [Add your personal reflections here]`;
          break;
          
        default:
          rewrittenText = transcription;
      }
      
      dispatch(setRewrittenText(rewrittenText));
      setIsRewriting(false);
      navigation.navigate('Rewrite');
    }, 1500);
  };

  const shareRecording = async () => {
    try {
      await Share.share({
        message: `Check out this recording: ${recording.title}\n\n${transcription || 'No transcription available'}`,
        title: recording.title,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!recording) {
    return null;
  }

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const rewriteOptions = [
    { id: 'formal', label: 'Formal', icon: 'document-text' },
    { id: 'bullet-points', label: 'Bullet Points', icon: 'list' },
    { id: 'email', label: 'Email', icon: 'mail' },
    { id: 'summary', label: 'Summary', icon: 'file-tray' },
    { id: 'to-do', label: 'To-Do', icon: 'checkbox' },
    { id: 'journal', label: 'Journal', icon: 'journal' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {recording.title || 'Playback'}
        </Text>
        <TouchableOpacity onPress={shareRecording} style={styles.shareButton}>
          <Ionicons name="share-social" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.waveformContainer}>
          <View style={styles.waveformPlaceholder}>
            <Ionicons name="musical-notes" size={80} color="#E1E1E1" />
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progress}%` }]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.playbackControls}>
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={togglePlayback}
            disabled={!sound}
          >
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={36} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, !transcription && styles.actionButtonDisabled]}
            onPress={() => navigation.navigate('Rewrite')}
            disabled={!transcription}
          >
            <Ionicons 
              name="create" 
              size={24} 
              color={transcription ? '#007AFF' : '#999'} 
            />
            <Text style={[styles.actionButtonText, !transcription && styles.actionButtonTextDisabled]}>
              Edit Text
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, transcription && styles.actionButtonDisabled]}
            onPress={transcribeRecording}
            disabled={!!transcription || isTranscribing}
          >
            <Ionicons 
              name={isTranscribing ? 'hourglass' : 'text'}
              size={24} 
              color={!transcription && !isTranscribing ? '#007AFF' : '#999'} 
            />
            <Text style={[styles.actionButtonText, (!transcription && !isTranscribing) || styles.actionButtonTextDisabled]}>
              {isTranscribing ? 'Transcribing...' : 'Transcribe'}
            </Text>
          </TouchableOpacity>
        </View>

        {transcription ? (
          <View style={styles.transcriptionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transcription</Text>
            </View>
            <View style={styles.transcriptionContent}>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.rewriteOptionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rewrite As</Text>
          </View>
          <View style={styles.rewriteOptions}>
            {rewriteOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.rewriteOption,
                  selectedRewriteOption?.id === option.id && styles.rewriteOptionSelected
                ]}
                onPress={() => handleRewrite(option)}
                disabled={!transcription || isRewriting}
              >
                <View style={[
                  styles.rewriteOptionIcon,
                  selectedRewriteOption?.id === option.id && styles.rewriteOptionIconSelected
                ]}>
                  <Ionicons 
                    name={option.icon} 
                    size={20} 
                    color={selectedRewriteOption?.id === option.id ? 'white' : '#007AFF'} 
                  />
                </View>
                <Text 
                  style={[
                    styles.rewriteOptionText,
                    selectedRewriteOption?.id === option.id && styles.rewriteOptionTextSelected
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 10,
    textAlign: 'center',
  },
  shareButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  waveformContainer: {
    padding: 20,
    alignItems: 'center',
  },
  waveformPlaceholder: {
    width: 200,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E1E1E1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  playbackControls: {
    alignItems: 'center',
    marginVertical: 20,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    minWidth: 120,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    marginTop: 5,
    color: '#007AFF',
    fontWeight: '500',
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  transcriptionContainer: {
    marginBottom: 20,
  },
  transcriptionContent: {
    padding: 20,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  rewriteOptionsContainer: {
    marginBottom: 20,
  },
  rewriteOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  rewriteOption: {
    width: '33.33%',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    margin: 5,
    backgroundColor: '#F5F5F7',
  },
  rewriteOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  rewriteOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewriteOptionIconSelected: {
    backgroundColor: '#007AFF',
  },
  rewriteOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
    textAlign: 'center',
  },
  rewriteOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default PlaybackScreen;
