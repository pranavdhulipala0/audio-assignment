// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';

import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false, // Globally hide tab labels
        headerShown: false, // Hide header for all screens
      }}
    >
      {/* Home Screen with Tab Hidden */}
      <Tabs.Screen
        name="index"
        options={{
          title: '', // Set empty title to avoid displaying it in header
          tabBarLabel: '', 
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide tab bar for Home screen
        }}
      />

      {/* Audio Tab with Custom Icon Only */}
      <Tabs.Screen
        name="audio"
        options={{
          title: '', // Ensure no header title is shown
          tabBarLabel: '', // Ensure no tab label is shown
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={28}
              style={{ marginBottom: -3 }}
              name="home"
              color={color}
            />
          ),
        }}
      />
      
      {/* Files Tab with Custom Icon Only */}
      <Tabs.Screen
        name="files"
        options={{
          title: '', // Ensure no header title is shown
          tabBarLabel: '', // Ensure no tab label is shown
         
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,

        }}
      />
    </Tabs>
  );
}
