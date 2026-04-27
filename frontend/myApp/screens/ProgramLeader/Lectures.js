import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput, Modal, ScrollView, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeContext";
import { getLecturers, assignLecture, getLectures, getCourses } from "../../services/dataService";
import SearchBar from "../../components/SearchBar";

export default function Lectures() {
  const { colors } = useTheme();
  const { dark } = useThemeMode();
  const { user } = useAuth();

  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [className, setClassName] = useState("");
  const [venue, setVenue] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");

  const timeSlots = ["08:30 - 10:30", "10:30 - 12:30", "12:30 - 14:30", "14:30 - 16:30"];
  const venues = ["Room 1", "Room 2", "Room 3", "Room 4", "Hall 1", "Hall 2"];

  useFocusEffect(
    useCallback(() => {
      if (user) loadData();
    }, [user])
  );

  const loadData = async () => {
    setLoading(true);
    const [lecRes, courseRes, assignRes] = await Promise.all([
      getLecturers(user.faculty),
      getCourses(user.faculty),
      getLectures(user.faculty)
    ]);

    if (lecRes.success) setLecturers(lecRes.lecturers);
    if (courseRes.success) setCourses(courseRes.courses);
    if (assignRes.success) setLectures(assignRes.lectures);
    setLoading(false);
  };

  const filteredLectures = lectures.filter(item => {
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      item.courseName?.toLowerCase().includes(query) ||
      item.courseCode?.toLowerCase().includes(query) ||
      item.lecturerName?.toLowerCase().includes(query) ||
      item.className?.toLowerCase().includes(query) ||
      item.venue?.toLowerCase().includes(query)
    );
  });

  const resetForm = () => {
    setSelectedLecturer("");
    setSelectedCourse("");
    setClassName("");
    setVenue("");
    setDay("");
    setTime("");
  };

  const handleAssign = async () => {
    if (!selectedLecturer || !selectedCourse || !className || !venue || !day || !time) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const lecturer = lecturers.find(l => l.id === selectedLecturer);
    const course = courses.find(c => c.id === selectedCourse);

    if (!lecturer || !course) {
      Alert.alert("Error", "Invalid selection");
      return;
    }

    setLoading(true);
    const res = await assignLecture({
      lecturerId: lecturer.id,
      lecturerName: lecturer.name,
      courseId: course.id,
      className,
      venue,
      day,
      time
    });

    if (res.success) {
      Alert.alert("Success", "Lecture assigned successfully");
      resetForm();
      setModalVisible(false);
      loadData();
    } else {
      Alert.alert("Error", res.error);
    }
    setLoading(false);
  };

  const getDayName = (day) => {
    const days = {
      "Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed", "Thursday": "Thu", "Friday": "Fri"
    };
    return days[day] || day;
  };

  const renderLectureCard = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.courseBadge}>
          <Text style={styles.courseCode}>
            {item.courseCode}
          </Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {item.courseName}
        </Text>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color={colors.text} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.lecturerName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={14} color={colors.text} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.className}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={colors.text} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.venue}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.text} />
          <Text style={[styles.detailText, { color: colors.text }]}>{getDayName(item.day)} at {item.time}</Text>
        </View>
      </View>
    </View>
  );

  if (loading && lectures.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Lecture Assignments</Text>
        <TouchableOpacity
          style={[styles.assignButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.assignButtonText}>Assign</Text>
        </TouchableOpacity>
      </View>

      <SearchBar onSearch={setSearchQuery} placeholder="Search by course, lecturer, class or venue..." />

      <FlatList
        data={filteredLectures}
        keyExtractor={item => item.id}
        renderItem={renderLectureCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color={colors.text + "40"} />
            <Text style={[styles.emptyText, { color: colors.text + "80" }]}>
              {searchQuery ? "No matching lectures found" : "No lectures assigned"}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text + "60" }]}>
              {searchQuery ? "Try a different search term" : "Tap Assign to add your first lecture"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filteredLectures.length === 0 && styles.emptyContent}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Assign New Lecture</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Lecturer</Text>
              <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}>
                <Picker selectedValue={selectedLecturer} onValueChange={setSelectedLecturer} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                  <Picker.Item label="Select Lecturer" value="" />
                  {lecturers.map(l => <Picker.Item key={l.id} label={l.name} value={l.id} />)}
                </Picker>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Course</Text>
              <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}>
                <Picker selectedValue={selectedCourse} onValueChange={setSelectedCourse} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                  <Picker.Item label="Select Course" value="" />
                  {courses.map(c => <Picker.Item key={c.id} label={`${c.name} (${c.courseCode})`} value={c.id} />)}
                </Picker>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Class Name</Text>
              <TextInput placeholder="Enter class name" placeholderTextColor={colors.text + "60"} value={className} onChangeText={setClassName} style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]} />

              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Venue</Text>
              <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}>
                <Picker selectedValue={venue} onValueChange={setVenue} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                  <Picker.Item label="Select Venue" value="" />
                  {venues.map(v => <Picker.Item key={v} label={v} value={v} />)}
                </Picker>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Day</Text>
              <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}>
                <Picker selectedValue={day} onValueChange={setDay} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                  <Picker.Item label="Select Day" value="" />
                  <Picker.Item label="Monday" value="Monday" />
                  <Picker.Item label="Tuesday" value="Tuesday" />
                  <Picker.Item label="Wednesday" value="Wednesday" />
                  <Picker.Item label="Thursday" value="Thursday" />
                  <Picker.Item label="Friday" value="Friday" />
                </Picker>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text + "CC" }]}>Time</Text>
              <View style={[styles.pickerWrapper, { borderColor: colors.border, backgroundColor: dark ? "#1c1c1e" : "#f5f5f5" }]}>
                <Picker selectedValue={time} onValueChange={setTime} dropdownIconColor={colors.text} style={{ color: colors.text }}>
                  <Picker.Item label="Select Time" value="" />
                  {timeSlots.map(t => <Picker.Item key={t} label={t} value={t} />)}
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleAssign} disabled={loading}>
                  <Text style={styles.submitButtonText}>{loading ? "Assigning..." : "Assign"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  
  title: { fontSize: 22, fontWeight: "bold" },
  
  assignButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  
  assignButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  
  card: { marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 12, borderWidth: 1, elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
 
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  
  courseBadge: { backgroundColor: "#2563eb20", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  
  courseCode: { color: "#2563eb", fontWeight: "bold", fontSize: 11 },
  
  cardTitle: { fontSize: 16, fontWeight: "600", flex: 1 },
  
  cardDetails: { gap: 6 },
  
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  
  detailText: { fontSize: 13 },
  
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  
  emptyText: { fontSize: 16, fontWeight: "500", marginTop: 12 },
  
  emptySubtext: { fontSize: 13, marginTop: 6, textAlign: "center" },
  
  emptyContent: { flexGrow: 1, justifyContent: "center" },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30, maxHeight: "90%" },
  
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  
  inputLabel: { fontSize: 13, marginBottom: 6, marginTop: 12 },
  
  pickerWrapper: { borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
  
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 10 },
  
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  
  cancelButtonText: { fontWeight: "600" },
 
  submitButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  
  submitButtonText: { color: "#fff", fontWeight: "bold" },
});