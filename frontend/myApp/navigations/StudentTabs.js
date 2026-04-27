import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useThemeMode } from "../context/ThemeContext";

import Dashboard from "../screens/Student/Dashboard";
import Attendance from "../screens/Student/Attendance";
import Rating from "../screens/Student/Rating";
import Profile from "../screens/Student/Profile";
import Classes from "../screens/Student/Classes";

const Tab = createBottomTabNavigator();

function StudentTabs() {
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
          else if (route.name === "Attendance") iconName = "clipboard";
          else if (route.name === "Rating") iconName = "star";
          else if (route.name === "Profile") iconName = "person";
          else if (route.name === "Classes") iconName = "people";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Attendance" component={Attendance} />   
      <Tab.Screen name="Rating" component={Rating} />
      <Tab.Screen name="Classes" component={Classes}/>
      <Tab.Screen name="Profile" component={Profile} />     
    </Tab.Navigator>
  );
}

export default StudentTabs;