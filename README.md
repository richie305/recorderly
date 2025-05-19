# Recorderly

Recorderly is an AI-powered mobile app that transforms your spoken words into well-structured, clear text. It serves as your personal AI writing assistant, helping you capture ideas, compose messages, create content, and organize your thoughts simply by speaking.

## Features

- **Voice-to-Text Conversion**: Real-time transcription of your speech
- **AI-Powered Rewriting**: Transform your speech into various formats
- **Multi-Language Support**: Automatic language detection for 90+ languages
- **Cross-Platform**: Works on iOS, Android, and web
- **Offline Recording**: Record without an internet connection
- **Screen-Off Recording**: Continue recording with your screen off
- **Quick Access Widget**: One-tap recording from your home screen
- **Text Input Option**: Type directly when speaking isn't possible
- **Easy Sharing**: Share your text via various platforms
- **Dark & Light Modes**: Customize your interface

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (for testing on mobile devices)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/recorderly.git
   cd recorderly/recorderly-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run the app:
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan the QR code with the Expo Go app (iOS) or Camera app (Android)

## Project Structure

```
recorderly-app/
├── assets/               # Images, fonts, and other static files
├── src/
│   ├── components/      # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # API and other services
│   ├── store/            # Redux store and slices
│   └── utils/            # Utility functions
├── App.js               # Main application component
└── app.json             # Expo configuration
```

## Available Scripts

- `npm start` or `yarn start`: Start the development server
- `npm run android` or `yarn android`: Run on Android device/emulator
- `npm run ios` or `yarn ios`: Run on iOS simulator
- `npm run web` or `yarn web`: Run in web browser
- `npm test` or `yarn test`: Run tests

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React Native](https://reactnative.dev/) and [Expo](https://expo.io/)
- Icons from [Ionicons](https://ionic.io/ionicons)
- State management with [Redux Toolkit](https://redux-toolkit.js.org/)
