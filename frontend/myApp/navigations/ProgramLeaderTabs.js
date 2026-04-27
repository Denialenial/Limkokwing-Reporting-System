import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useThemeMode } from "../context/ThemeContext";

import Dashboard from "../screens/ProgramLeader/Dashboard";
import Classes from "../screens/ProgramLeader/Classes";
import Courses from "../screens/ProgramLeader/Courses";
import Lectures from "../screens/ProgramLeader/Lectures";
import Reports from "../screens/ProgramLeader/Reports";
import Ratings from "../screens/ProgramLeader/Rating";
import Profile from "../screens/ProgramLeader/Profile";

const Tab = createBottomTabNavigator();

function ProgramLeaderTabs() {
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
          else if (route.name === "Lectures") iconName = "people";
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
      <Tab.Screen name="Lectures" component={Lectures} />
      <Tab.Screen name="Reports" component={Reports} />
      <Tab.Screen name="Rating" component={Ratings} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default ProgramLeaderTabs;