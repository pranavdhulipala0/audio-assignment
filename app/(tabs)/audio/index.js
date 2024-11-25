// app/audio/index.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
export default function AudioScreen() {
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isRecordingStartedMode, setIsRecordingStartedMode] = useState(false);
  const [recording, setRecording] = useState(null);
  const [timer, setTimer] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [sound, setSound] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [storedRecordings, setStoredRecordings] = useState([]);
  const [isPlayIcon, setIsPlayIcon] = useState(true); // Controls play/pause icon and state

  // Load recordings from AsyncStorage
  useEffect(() => {
    const loadRecordings = async () => {
      try {
        const recordings = await AsyncStorage.getItem("recordings");
        setStoredRecordings(recordings ? JSON.parse(recordings) : []);
        console.log(recordings, "recordings");
      } catch (err) {
        console.error("Failed to load recordings", err);
      }
    };
    loadRecordings();
  }, []);
  // Start the recording and timer
  const handleStartRecording = async () => {
    try {
      // Stop any existing recording before starting a new one
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null); // Reset recording state
      }

      // Request permissions and set audio mode for recording
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start a new recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecordingStartedMode(true);
      setTimer(0);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // Stop recording and open modal
  const handleStopRecording = async () => {
    setIsRecordingStartedMode(false);
    setModalVisible(true);
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null); // Free up the recording object
    }
  };

  const saveRecordingToStorage = async () => {
    const newRecording = {
      id: Date.now().toString(),
      uri: recordingUri,
      duration: formatTime(timer),
      timestamp: new Date().toLocaleString(),
    };

    try {
      const storedRecordings = await AsyncStorage.getItem("recordings");
      const updatedRecordings = storedRecordings
        ? JSON.parse(storedRecordings)
        : [];
      updatedRecordings.push(newRecording);
      await AsyncStorage.setItem(
        "recordings",
        JSON.stringify(updatedRecordings)
      );
      console.log("Recording saved to storage");
      closeModal(); // Close modal after saving
      setIsRecordingMode(false);
      setIsPlayIcon(true);
      // Reload recordings in the list by updating the state
      setStoredRecordings(updatedRecordings);
    } catch (err) {
      console.error("Failed to save recording", err);
    }
  };

  // Timer for recording
  useEffect(() => {
    let interval;
    if (isRecordingStartedMode) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } else if (timer > 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecordingStartedMode]);

  // Convert seconds to HH:MM:SS format
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ""}${mins < 10 ? "0" : ""}${mins}:${
      secs < 10 ? "0" : ""
    }${secs}`;
  };

  // Play audio in modal

  const playAudio = async () => {
    setIsPlayIcon(false);

    try {
      // Set audio to play through the speaker
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // Playback mode
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({
        uri: recordingUri,
      });
      setSound(newSound);
      setPlaybackTime(0);
      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isPlaying) {
          setPlaybackTime(status.positionMillis / 1000);
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };
  const playPause = async () => {
    setIsPlayIcon(true);
    await sound.pauseAsync();
  };

  const playAudioinList = async (url) => {
    console.log("recordingUri", url);
    try {
      // Set audio to play through the speaker
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // Playback mode
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });

      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      setPlaybackTime(0);
      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isPlaying) {
          setPlaybackTime(status.positionMillis / 1000);
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Close modal and stop playback
  const closeModal = async () => {
    console.log("sound", sound);
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    setModalVisible(false);
    setPlaybackTime(0);
    setTimer(0);
    setRecordingUri(null);
    setIsPlayIcon(true);
  };

  const handleAudioplusPress = () => {
    setIsRecordingMode(true); // Activate recording mode and hide the list
  };

  const handleBackPress = () => {
    setIsRecordingMode(false); // Go back to the list
    setIsRecordingStartedMode(false);
  };

  return (
    <View style={styles.container}>
      {isRecordingMode ? (
        // Recording Mode Container
        <View style={styles.recordingContainer}>
          {/* Back Button with Arrow Icon */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Image
              source={require("../../../assets/images/back_arrow.png")} // Replace with your arrow image path
              style={styles.backButtonImage}
            />
          </TouchableOpacity>
          {/* "Your Library" positioned at the top */}
          <Text style={styles.topLibraryTitle}>Your Library</Text>
          {/* Centered Recording UI */}
          {isRecordingStartedMode ? (
            <View>
              <View style={styles.centeredContent}>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleStopRecording}
                >
                  <Text>Stop Recording</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.centeredContent}>
              <TouchableOpacity onPress={handleStartRecording}>
                <Text>Start Recording</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.libraryContainer}>
          <ScrollView>
            <View style={styles.headerRow}>
              <Text style={styles.title}>EkSAQ Library</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAudioplusPress}
              >
                <Image
                  source={require("../../../assets/images/audioplus.png")}
                  style={styles.addBtnImage}
                />
              </TouchableOpacity>
            </View>

            {storedRecordings.map((file, index) => (
              <View style={styles.audioItem} key={index}>
                <View style={styles.micBtn}>
                  <Image
                    source={require("../../../assets/images/miclist.png")}
                    style={styles.micBtnImage}
                  />
                </View>
                <View style={styles.audioInfo}>
                  <Text style={styles.audioTitle}>{`Audio ${index + 1}`}</Text>
                  <Text style={styles.audioDetails}>{file.duration}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => playAudioinList(file.uri)}
                  style={styles.playBtn}
                >
                  <Text>Play</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      {/* Modal for playback */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>Audio recorded!</Text>
          {isPlayIcon ? (
            <TouchableOpacity
              onPress={playAudio}
              style={styles.playPauseButton}
            >
              <Text style={styles.buttonText}>{"Listen"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={playPause}
              style={styles.playPauseButton}
            >
              <Text style={styles.buttonText}>{"Pause"}</Text>
            </TouchableOpacity>
          )}
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={timer}
            value={playbackTime}
            onValueChange={(value) => setPlaybackTime(value)}
          />

          <Text style={styles.timer}>
            {`${Math.floor(playbackTime / 60)}:${String(
              Math.floor(playbackTime % 60)
            ).padStart(2, "0")} / ${Math.floor(timer / 60)}:${String(
              Math.floor(timer % 60)
            ).padStart(2, "0")}`}
          </Text>

          <TouchableOpacity
            onPress={saveRecordingToStorage}
            style={styles.saveButton}
          >
            <Text style={styles.buttonText}>Download Audio</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    backgroundColor: "#FDFCFF",
  },
  topLibraryTitle: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    fontSize: 15,
    fontFamily: "RubikRegular",
    textAlign: "center",
  },
  libraryContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  recordingContainer: {
    flex: 1,
    justifyContent: "center", // Center content vertically
    alignItems: "center",
    width: "100%",
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
    backgroundColor: "#f2f2f2",
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
  audioDetails: {
    fontSize: 12,
    color: "gray",
  },
  playBtn: {
    marginLeft: 10,
  },
  playBtnImage: {
    width: 30,
    height: 30,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },

  text: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10, // Space between text and button
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  backButtonImage: {
    width: 24,
    height: 24,
  },
  timer: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8F978B",
    lineHeight: 39,
    marginBottom: 16,
  },

  doneButton: {
    padding: 10,
    borderRadius: 5,
  },

  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modaltitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 30,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  artworkContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  artwork: {
    width: 150,
    height: 150,
    backgroundColor: "#e0e0e0",
    borderRadius: 75,
  },
  playPauseButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 50,
    marginVertical: 20,
    alignItems: "center",
    width: 100,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "RubikSemiBold",
    textAlign: "center",
  },
  slider: {
    width: "80%",
    height: 40,
  },
  timer: {
    fontSize: 16,
    color: "#333",
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#0447A8",
    padding: 22,
    borderRadius: 12,
    marginTop: 20,
    border: 1,
    width: 319,
    height: 64,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "500",
    fontFamily: "RubikSemiBold",
    lineHeight: 34,
  },
});
