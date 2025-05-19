import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { setRewrittenText } from '../store/recordingSlice';

const RewriteScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { rewrittenText, selectedRewriteOption } = useSelector((state) => state.recording);
  const [text, setText] = useState(rewrittenText || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    dispatch(setRewrittenText(text));
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    alert('Copied to clipboard!');
  };

  const handleShare = async () => {
    try {
      await Sharing.shareAsync(
        {
          message: text,
          dialogTitle: 'Share Text',
          UTI: 'public.plain-text',
        },
        {
          mimeType: 'text/plain',
          dialogTitle: 'Share Text',
        }
      );
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Error sharing text. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedRewriteOption?.label || 'Rewrite'}
        </Text>
        <View style={styles.headerActions}>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView style={styles.textContainer}>
          {isEditing ? (
            <TextInput
              style={[styles.text, styles.textInput]}
              multiline
              value={text}
              onChangeText={setText}
              autoFocus
              selectionColor="#007AFF"
            />
          ) : (
            <Text style={styles.text}>
              {text || 'No text available'}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {!isEditing && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={handleCopy}>
            <Ionicons name="copy" size={22} color="#007AFF" />
            <Text style={styles.footerButtonText}>Copy</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.footerButton} onPress={handleShare}>
            <Ionicons name="share-social" size={22} color="#007AFF" />
            <Text style={styles.footerButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginTop: Platform.OS === 'ios' ? 30 : 0,
  },
  backButton: {
    padding: 5,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 15,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 5,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  textInput: {
    padding: 0,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  divider: {
    width: 1,
    backgroundColor: '#ddd',
    marginVertical: 5,
  },
});

export default RewriteScreen;
