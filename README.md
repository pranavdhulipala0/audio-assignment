# Assement Eksaq

A description of your project and its primary features, specifically focusing on the tab-based navigation setup.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Navigation Structure](#navigation-structure)
- [License](#license)

---

## Installation

Follow these steps to set up the project locally.

### 1. Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v14 or above) – [Download Node.js](https://nodejs.org/)
- **Git** – [Download Git](https://git-scm.com/)
- **Expo CLI** – Install globally using npm:

```bash
npm install -g expo-cli

2. Clone the Repository
Clone this repository to your local machine:

git clone https://github.com/your-username/your-repository.git


Replace your-username and your-repository with the actual GitHub username and repository name.

3. Navigate to the Project Directory
Move into the project folder:


cd your-repository

4. Install Dependencies
Install the dependencies by running:

npm install


This installs all necessary packages, including react-navigation and expo-router for tab-based navigation.

Getting Started

Starting the Development Server
Run the following to start the Expo development server:

expo start

This opens the Expo Developer Tools in your browser, letting you choose to run the app on an emulator or a physical device.

Running on a Physical Device
Install the Expo Go app on your iOS or Android device:
Expo Go for iOS
Expo Go for Android
Connect to the Same Network – Ensure your device and computer are on the same Wi-Fi network.
Scan the QR Code – After running expo start, scan the QR code in the Expo Developer Tools to open the app on your device.
Running on an Emulator
iOS – If you're on a Mac with Xcode installed, select Run on iOS simulator in the Expo Developer Tools.
Android – Use an Android emulator from Android Studio. Select Run on Android device/emulator in the Expo Developer Tools.
Project Structure

An overview of the project’s file structure, focusing on tabs:

project-root/
├── assets/           # Static assets like images and fonts
├── app/              # Main folder for Expo Router setup
│   ├── (tabs)/       # Tab navigation screens and layout
│   │   ├── _layout.js  # Tab layout configuration
│   │   ├── audio.js    # Audio tab screen
│   │   ├── files.js    # Files tab screen
│   │   └── index.js    # Home screen for initial tab
│   └── App.js        # Main entry point
├── components/       # Reusable components
├── navigation/       # Navigation setup and custom configurations
├── package.json      # Node.js dependencies and scripts
└── README.md         # Project documentation