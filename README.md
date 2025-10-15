# medicine-reminder-app
MedTracker - An Intelligent Medication Adherence App 
The Problem
Medication non-adherence is a critical barrier to effective healthcare, particularly for the elderly, those with low literacy, or patients managing complex schedules. Traditional reminder apps often fail to address the core accessibility and support system challenges these users face. MedTracker was built to bridge this gap.
Key Features
1.Customizable Schedules: Easily add medications, dosages, and complex schedules (e.g., multiple times a day, every other day) through a simple, user-friendly form.
Biometric Security: Secure the app with on-device Fingerprint or Face Lock for privacy.
2.Adherence Dashboard: Visualize progress with a clean calendar view and charts that show adherence rates over time, providing motivation and insight.
3.Offline-First Operation: All core features—scheduling, reminders, logging, and voice prompts—are designed to work perfectly without an internet connection. Data syncs when the device is back online.
 Tech Stack & Architecture
Framework: React Native with Expo

Language: TypeScript

State Management: React Context API / useState

Local Storage: @react-native-async-storage/async-storage for robust offline data persistence.

Notifications: expo-notifications for scheduling and managing local reminders.

Biometrics: expo-local-authentication for secure access.

UI: Custom-built components with a focus on accessibility (large fonts, high contrast).
Getting Started

1.Clone the repository:

2.Navigate to the project directory

3.Install dependencies:
  npm install
  
4.Run the application:
  npx expo start

This will start the Metro bundler. You can then run the app on an emulator or scan the QR code with the Expo Go app on your physical device.

