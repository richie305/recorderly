import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { startRecording, stopRecording, setCurrentRecording, addRecording, setTranscription } from '../store/recordingSlice';

const RecordingScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [waveform, setWaveform] = useState([]);
  const waveformInterval = React.useRef(null);
  const { currentRecording } = useSelector((state) => state.recording);

  // Start recording
  const startRecordingHandler = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      dispatch(startRecording());
      startWaveformAnimation();
      
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording
  const stopRecordingHandler = async () => {
    if (!recording) return;
    
    try {
      console.log('Stopping recording..');
      clearInterval(waveformInterval.current);
      setWaveform([]);
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      const info = await FileSystem.getInfoAsync(uri);
      
      const newRecording = {
        uri,
        duration: Math.floor(recordingDuration),
        size: info.size,
        title: `Recording ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
      };
      
      dispatch(setCurrentRecording(newRecording));
      dispatch(addRecording(newRecording));
      
      console.log('Recording stopped and saved at', uri);
      
      // Navigate to playback screen
      navigation.navigate('Playback', { recording: newRecording });
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    } finally {
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
      dispatch(stopRecording());
    }
  };

  // Start waveform animation
  const startWaveformAnimation = () => {
    clearInterval(waveformInterval.current);
    
    waveformInterval.current = setInterval(() => {
      setRecordingDuration(prev => prev + 0.1);
      
      // Generate random waveform data for visualization
      setWaveform(prev => {
        const newWaveform = [...prev, Math.random() * 40 + 10];
        return newWaveform.slice(-50); // Keep only the last 50 data points
      });
    }, 100);
  };

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
      clearInterval(waveformInterval.current);
    };
  }, [recording]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Recording</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.waveformContainer}>
          {waveform.length > 0 ? (
            <View style={styles.waveform}>
              {waveform.map((height, index) => (
                <View 
                  key={index} 
                  style={[styles.waveformBar, { height }]} 
                />
              ))}
            </View>
          ) : (
            <View style={styles.placeholderWaveform}>
              <Ionicons name="mic" size={80} color="#E1E1E1" />
              <Text style={styles.placeholderText}>Tap the record button to start</Text>
            </View>
          )}
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {isRecording ? formatTime(recordingDuration) : '00:00'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordingButton]}
          onPress={isRecording ? stopRecordingHandler : startRecordingHandler}
          activeOpacity={0.8}
        >
          {isRecording ? (
            <View style={styles.stopIcon} />
          ) : (
            <Ionicons name="mic" size={32} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  waveformContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: '100%',
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  placeholderWaveform: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  placeholderText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  timerContainer: {
    marginVertical: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
    color: '#000',
  },
  controls: {
    padding: 40,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 4,
  },
});

export default RecordingScreen;
