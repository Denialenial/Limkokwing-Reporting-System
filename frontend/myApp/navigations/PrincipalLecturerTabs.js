import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useThemeMode } from "../context/ThemeContext";

import Dashboard from "../screens/PrincipalLecturer/Dashboard";
import Classes from "../screens/PrincipalLecturer/Classes";
import Courses from "../screens/PrincipalLecturer/Courses";
import Ratings from "../screens/PrincipalLecturer/Rating";
import Reports from "../screens/PrincipalLecturer/Reports";
import Profile from "../screens/PrincipalLecturer/Profile";

const Tab = createBottomTabNavigator();

function PrincipalLecturerTabs() {
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
          else if (route.name === "Courses") iconName = "book-outline";
          else if (route.name === "Reports") iconName = "bar-chart";
          else if (route.name === "Rating") iconName = "star";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Classes" component={Classes} />
      <Tab.Screen name="Courses" component={Courses} />
      <Tab.Screen name="Reports" component={Reports} />
      <Tab.Screen name="Rating" component={Ratings} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default PrincipalLecturerTabs;

