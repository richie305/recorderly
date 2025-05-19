import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { clearCurrentRecording } from '../store/recordingSlice';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { recordings } = useSelector((state) => state.recording);

  useEffect(() => {
    // Clear any existing recording data when the home screen mounts
    dispatch(clearCurrentRecording());
  }, [dispatch]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recordingItem}
      onPress={() => navigation.navigate('Playback', { recording: item })}
    >
      <View style={styles.recordingInfo}>
        <Text style={styles.recordingTitle} numberOfLines={1}>
          {item.title || 'Untitled Recording'}
        </Text>
        <Text style={styles.recordingDate}>
          {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recordings</Text>
      </View>
      
      {recordings.length > 0 ? (
        <FlatList
          data={recordings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="mic-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No recordings yet</Text>
          <Text style={styles.emptyStateSubtext}>Tap the button below to start your first recording</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.recordButton}
        onPress={() => navigation.navigate('Recording')}
      >
        <Ionicons name="mic" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 10,
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordingInfo: {
    flex: 1,
    marginRight: 10,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  recordButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
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
});

export default HomeScreen;
