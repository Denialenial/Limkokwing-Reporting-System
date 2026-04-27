import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useThemeMode } from "../context/ThemeContext";

import Dashboard from "../screens/Lecturer/Dashboard";
import Classes from "../screens/Lecturer/Classes";
import Attendance from "../screens/Lecturer/Attendance";
import Ratings from "../screens/Lecturer/Rating";
import Report from "../screens/Lecturer/Report";
import Profile from "../screens/Lecturer/Profile";

const Tab = createBottomTabNavigator();

function LecturerTabs() {
  const { theme } = useThemeMode();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.card },
        tabBarActiveTintColor: "#1e90ff",
        tabBarInactiveTintColor: "#888",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Classes") iconName = "people";
          else if (route.name === "Attendance") iconName = "clipboard";
          else if (route.name === "Rating") iconName = "star";
          else if (route.name === "Report") iconName = "bar-chart";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Classes" component={Classes} />
      <Tab.Screen name="Attendance" component={Attendance} />
      <Tab.Screen name="Rating" component={Ratings} />
      <Tab.Screen name="Report" component={Report} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default LecturerTabs;