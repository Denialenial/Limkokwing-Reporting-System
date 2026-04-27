import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Image, TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemeMode } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

import Login from "../screens/Authentication/Login";
import Register from "../screens/Authentication/Register";

import StudentTabs from "./StudentTabs";
import LecturerTabs from "./LecturerTabs";
import PrincipalLecturerTabs from "./PrincipalLecturerTabs";
import ProgramLeaderTabs from "./ProgramLeaderTabs";

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme, dark, toggleTheme } = useThemeMode();
  const { user, logout } = useAuth();

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: theme.colors.card,
          },
          headerTintColor: theme.colors.text,

          headerRight: () => (
            <View style={{ flexDirection: "row", marginRight: 10 }}>
              <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
                <Ionicons
                  name={dark ? "moon" : "sunny"}
                  size={22}
                  color={theme.colors.text}
                />
              </TouchableOpacity>

              {user && (
                <TouchableOpacity
                  onPress={() => {
                    logout();
                  }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              )}
            </View>
          ),
        })}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                headerTitle: () => (
                  <View style={{ flexDirection: "column", marginLeft: 10 }}>
                    <Image
                      source={require("../assets/university-logo.jpg")}
                      style={{ width: 40, height: 40, borderRadius: 20, }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: theme.colors.text,
                        marginTop: 2,
                      }}
                    >
                      LIMKOKWING
                    </Text>
                  </View>
                ),
              }}
            />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : (
          <>
            {user.role === "student" && (
              <Stack.Screen name="Student" component={StudentTabs} />
            )}
            {user.role === "lecturer" && (
              <Stack.Screen name="Lecturer" component={LecturerTabs} />
            )}
            {user.role === "pl" && (
              <Stack.Screen name="Program Leader" component={ProgramLeaderTabs} />
            )}
            {user.role === "prl" && (
              <Stack.Screen name="Principal Lecturer" component={PrincipalLecturerTabs} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;