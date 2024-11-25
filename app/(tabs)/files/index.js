import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

export default function FilesScreen() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Progress percentage
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false); // Error modal state
  const [errorMessage, setErrorMessage] = useState("Max file size limit is 10 MB."); // Error message
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDiscarded, setIsDiscarded] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const storedDocs = await AsyncStorage.getItem('documents');
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } catch (error) {
      console.error('Failed to load documents', error);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const document = result.assets[0];
        if (document.size > 10 * 1024 * 1024) {
          setErrorMessage("Max file size limit is 10 MB.");
          setErrorModalVisible(true); // Show error modal
          return;
        }

        const documentName = `Document ${documents.length + 1}`;
        const newDocument = {
          id: Date.now().toString(),
          name: documentName,
          uri: document.uri,
        };

        setSelectedDocument(newDocument);
        setProgress(0);
        setLoading(true);
        setModalVisible(true);
        setIsDiscarded(false);

        const interval = setInterval(() => {
          setProgress((prevProgress) => {
            if (prevProgress >= 100) {
              clearInterval(interval);
              if (!isDiscarded) {
                saveDocumentToStorage(newDocument);
              }
              setLoading(false);
              setModalVisible(false);
              return 100;
            }
            return prevProgress + 10;
          });
        }, 200);
      } else {
        console.log("Document selection was canceled or no document found.");
      }
    } catch (error) {
      console.error('Failed to pick document:', error);
    }
  };

  const saveDocumentToStorage = async (newDocument) => {
    if (!newDocument) {
      console.error('No document to save');
      return;
    }

    try {
      const updatedDocs = [...documents, newDocument];
      setDocuments(updatedDocs);
      await AsyncStorage.setItem('documents', JSON.stringify(updatedDocs));
      console.log('Document saved to storage');
    } catch (error) {
      console.error('Failed to save document', error);
    }
  };

  const handleDiscard = () => {
    setIsDiscarded(true);
    setModalVisible(false);
  };

  const handleDocumentClick = async (document) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(document.uri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Failed to share document:', error);
      Alert.alert('Error', 'Unable to share document');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.libraryContainer}>
        <Text style={styles.libraryTitle}>Your Documents</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}> 
          <View style={styles.headerRow}>
            <Text style={styles.title}>Documents</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handlePickDocument}>
              <Image
                source={require("../../../assets/images/audioplus.png")}
                style={styles.addBtnImage}
              />
            </TouchableOpacity>
          </View>

          {documents.map((doc, index) => (
            <TouchableOpacity key={doc.id} onPress={() => handleDocumentClick(doc)}>
              <View style={styles.audioItem}>
                <View style={styles.micBtn}>
                  <Image
                    source={require("../../../assets/images/document_icon.png")}
                    style={styles.micBtnImage}
                  />
                </View>
                <View style={styles.audioInfo}>
                  <Text style={styles.audioTitle}>{doc.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Modal for Document Upload */}
        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Image
                source={require("../../../assets/images/alert_modal.png")}
                style={styles.image}
              />
              <Text style={styles.uploadingText}>
                Uploading <Text style={styles.fileName}>"{selectedDocument?.name}"</Text>
              </Text>

              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${progress}%` }]} />
              </View>
              <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
                <Text style={styles.discardButtonText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Error Modal for File Size Exceed */}
        <Modal visible={errorModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.errorModalContainer}>
              <Image
                source={require("../../../assets/images/alert_modal.png")}
                style={styles.image}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setErrorModalVisible(false)}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingTop: 80,
    backgroundColor: '#FDFCFF',
  },
  libraryContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  libraryTitle: {
    fontSize: 15,
    fontWeight: "300",
    fontFamily: "RubikRegular",
    lineHeight: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "400",
    fontFamily: "RubikRegular",
    marginBottom: 20,
    lineHeight: 34,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  addBtn: {
    backgroundColor: "transparent",
    marginBottom: 20,
  },
  audioItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FDFCFF",
    borderRadius: 10,
    width: "100%",
  },
  micBtn: {
    marginRight: 10,
  },
  micBtnImage: {
    width: 48,
    height: 56,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 17,
    fontWeight: "400",
    fontFamily: "RubikRegular",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 280,
    height: 250,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  errorModalContainer: {
    width: 250,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  uploadingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  fileName: {
    fontWeight: 'bold',
  },
  progressBar: {
    width: '90%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 15,
  },
  progress: {
    height: '100%',
    backgroundColor: '#7572B7',
  },
  discardButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#6B5B95',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#FDFCFF',
    fontWeight: "500",
    fontFamily: "RubikRegular",
    fontSize: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#50564D',
    fontWeight: "400",
    fontFamily: "RubikRegular",
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#333',
  },
});
