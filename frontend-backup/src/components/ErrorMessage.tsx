import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  style?: any;
}

export function ErrorMessage({ message, retry, style }: ErrorMessageProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message}>{message}</Text>
      {retry && (
        <TouchableOpacity style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffebeb',
    borderRadius: 8,
    marginVertical: 8,
  },
  message: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'center',
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});