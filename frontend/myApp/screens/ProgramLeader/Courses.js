import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeContext";
import { getCourses, addCourse, getPrograms, updateCourse, deleteCourse, getLectures } from "../../services/dataService";
import SearchBar from "../../components/SearchBar";

export default function Courses() {
  const { colors } = useTheme();
  const { dark } = useThemeMode();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [program, setProgram] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadCourses();
        loadPrograms();
        loadLectures();
      }
    }, [user])
  );

  const loadCourses = async () => {
    setLoading(true);
    const res = await getCourses(user.faculty);
    if (res.success) setCourses(res.courses);
    else Alert.alert("Error", res.error);
    setLoading(false);
  };

  const loadPrograms = async () => {
    const res = await getPrograms(user.faculty);
    if (res.success) setPrograms(res.programs);
    else Alert.alert("Error", res.error);
  };

  const loadLectures = async () => {
    const res = await getLectures(user.faculty);
    if (res.success) setLectures(res.lectures || []);
  };

  const filteredCourses = courses.filter(course => {
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      course.name?.toLowerCase().includes(query) ||
      course.courseCode?.toLowerCase().includes(query) ||
      course.programName?.toLowerCase().includes(query)
    );
  });

  const resetForm = () => {
    setName("");
    setCode("");
    setProgram("");
  };

  const isCourseAssigned = (courseId) => {
    return lectures.some(lecture => lecture.courseId === courseId);
  };

  const handleAddCourse = async () => {
    if (!name || !code || !program) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    const res = await addCourse({
      name,
      courseCode: code,
      facultyName: user.faculty,
      programName: program,
    });

    if (res.success) {
      Alert.alert("Success", "Course added successfully");
      resetForm();
      setModalVisible(false);
      loadCourses();
    } else {
      Alert.alert("Error", res.error);
    }
    setLoading(false);
  };

  const handleEditCourse = async () => {
    if (!name || !code || !program) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    const res = await updateCourse(selectedCourse.id, {
      name,
      courseCode: code,
      programName: program,
    });

    if (res.success) {
      Alert.alert("Success", "Course updated successfully");
      resetForm();
      setEditModalVisible(false);
      setSelectedCourse(null);
      loadCourses();
    } else {
      Alert.alert("Error", res.error);
    }
    setLoading(false);
  };

  const handleDeleteCourse = async () => {
    if (isCourseAssigned(selectedCourse.id)) {
      Alert.alert(
        "Cannot Delete",
        "This course is currently assigned to a lecturer. you cannot delete it."
      );
      return;
    }

    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${selectedCourse.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const res = await deleteCourse(selectedCourse.id);
            if (res.success) {
              Alert.alert("Success", "Course deleted successfully");
              setEditModalVisible(false);
              setSelectedCourse(null);
              loadCourses();
            } else {
              Alert.alert("Error", res.error);
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setName(course.name);
    setCode(course.courseCode);
    setProgram(course.programName);
    setEditModalVisible(true);
  };

  const renderCourseCard = ({ item }) => {
    const isAssigned = isCourseAssigned(item.id);

    return (
      <TouchableOpacity
        onPress={() => openEditModal(item)}
        activeOpacity={0.7}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.courseBadge}>
            <Text style={styles.courseCode}>{item.courseCode}</Text>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
          {isAssigned && (
            <View style={styles.assignedBadge}>
              <Text style={styles.assignedText}>Assigned</Text>
            </View>
          )}
        </View>
        <Text style={[styles.programText, { color: colors.text + "80" }]}>{item.programName}</Text>
      </TouchableOpacity>
    );
  };

  if (loading && courses.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Courses</Text>
          <Text style={[styles.subtitle, { color: colors.text + "80" }]}>{user?.faculty}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <SearchBar onSearch={setSearchQuery} placeholder="Search by name, code or program..." />

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourseCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color={colors.text + "40"} />
            <Text style={[styles.emptyText, { color: colors.text + "80" }]}>
              {searchQuery ? "No matching courses found" : "No courses found"}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text + "60" }]}>
              {searchQuery ? "Try a different search term" : "Tap Add to create your first course"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add Course Modal with KeyboardAvoidingView */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Course</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Course Name</Text>
              <TextInput
                placeholder="e.g., Software Engineering"
                placeholderTextColor={colors.text + "60"}
                value={name}
                onChangeText={setName}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Course Code</Text>
              <TextInput
                placeholder="e.g., SE401"
                placeholderTextColor={colors.text + "60"}
                value={code}
                onChangeText={setCode}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Program</Text>
              <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}>
                <Picker selectedValue={program} onValueChange={setProgram} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                  <Picker.Item label="Select Program" value="" />
                  {programs.map((p) => (
                    <Picker.Item key={p.id} label={p.name} value={p.name} />
                  ))}
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleAddCourse} disabled={loading}>
                  <Text style={styles.submitButtonText}>{loading ? "Adding..." : "Add Course"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Course Modal with KeyboardAvoidingView */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Course</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Course Name</Text>
              <TextInput
                placeholderTextColor={colors.text + "60"}
                value={name}
                onChangeText={setName}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Course Code</Text>
              <TextInput
                placeholderTextColor={colors.text + "60"}
                value={code}
                onChangeText={setCode}
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Program</Text>
              <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}>
                <Picker selectedValue={program} onValueChange={setProgram} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                  <Picker.Item label="Select Program" value="" />
                  {programs.map((p) => (
                    <Picker.Item key={p.id} label={p.name} value={p.name} />
                  ))}
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: "#ef4444" }]}
                  onPress={handleDeleteCourse}
                  disabled={loading}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={[styles.deleteButtonText, { color: "#ef4444" }]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleEditCourse} disabled={loading}>
                  <Text style={styles.submitButtonText}>{loading ? "Saving..." : "Save Changes"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 10,
    flexWrap: "wrap",
  },
  courseBadge: {
    backgroundColor: "#2563eb20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  courseCode: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 11,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  assignedBadge: {
    backgroundColor: "#f59e0b20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  assignedText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "bold",
  },
  programText: {
    fontSize: 12,
    marginLeft: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  deleteButtonText: {
    fontWeight: "bold",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});