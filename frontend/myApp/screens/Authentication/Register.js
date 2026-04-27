import React, { useState, useEffect } from "react";
import { Text, ScrollView, View, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { getFaculties, getPrograms } from "../../services/dataService";

function Register({ navigation }) {
  const { colors } = useTheme();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [faculty, setFaculty] = useState("");
  const [program, setProgram] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [faculties, setFaculties] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  useEffect(() => {
    loadFaculties();
  }, []);

  const loadFaculties = async () => {
    setLoadingFaculties(true);
    const res = await getFaculties();
    if (res.success) {
      setFaculties(res.faculties);
    }
    setLoadingFaculties(false);
  };

  useEffect(() => {
    if (faculty) {
      loadPrograms(faculty);
    }
  }, [faculty]);

  const loadPrograms = async (facultyName) => {
    const res = await getPrograms(facultyName);
    if (res.success) {
      setPrograms(res.programs);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setGender("");
    setRole("");
    setFaculty("");
    setProgram("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !role || !faculty) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (role === "student" && !program) {
      Alert.alert("Error", "Please select a program");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const result = await registerUser({
      name,
      email,
      phone,
      gender,
      role,
      faculty,
      program: role === "student" ? program : null,
      password,
    });

    setLoading(false);

    if (!result.success) {
      Alert.alert("Registration Failed", result.error);
      return;
    }

    login(result.user);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Image
        source={require("../../assets/Audii.jpeg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: colors.text + "60" }]}>Join the learning community</Text>
            </View>

            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
              placeholder="Full Name"
              placeholderTextColor={colors.text + "60"}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
              placeholder="Email Address"
              placeholderTextColor={colors.text + "60"}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
              placeholder="Phone Number"
              placeholderTextColor={colors.text + "60"}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Picker selectedValue={gender} onValueChange={setGender} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
              </Picker>
            </View>

            <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Picker selectedValue={role} onValueChange={setRole} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                <Picker.Item label="Select Role" value="" />
                <Picker.Item label="Student" value="student" />
                <Picker.Item label="Lecturer" value="lecturer" />
                <Picker.Item label="Program Leader" value="pl" />
                <Picker.Item label="Principal Lecturer" value="prl" />
              </Picker>
            </View>

            <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
              {loadingFaculties ? (
                <ActivityIndicator size="small" color={colors.primary} style={styles.pickerLoading} />
              ) : (
                <Picker
                  selectedValue={faculty}
                  onValueChange={(value) => {
                    setFaculty(value);
                    setProgram("");
                  }}
                  dropdownIconColor={colors.text}
                  style={{ color: colors.text }}
                >
                  <Picker.Item label="Select Faculty" value="" />
                  {faculties.map((f, index) => (
                    <Picker.Item key={index} label={f.name} value={f.name} />
                  ))}
                </Picker>
              )}
            </View>

            {role === "student" && (
              <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Picker selectedValue={program} onValueChange={setProgram} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                  <Picker.Item label="Select Program" value="" />
                  {programs.map((p, index) => (
                    <Picker.Item key={index} label={p.name} value={p.name} />
                  ))}
                </Picker>
              </View>
            )}

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                placeholder="Password"
                placeholderTextColor={colors.text + "60"}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text + "60"} />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.text + "60"}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text + "60"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={[styles.link, { color: colors.primary }]}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  pickerLoading: {
    padding: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
  },
  button: {
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    marginTop: 15,
    fontWeight: "600",
  },
});