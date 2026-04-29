import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getLecturesByLecturer, createReport, getStudentsByProgram } from "../../services/dataService";

function Reports() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liveTotalStudents, setLiveTotalStudents] = useState(0);

  const [week, setWeek] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [studentsPresent, setStudentsPresent] = useState("");
  const [studentError, setStudentError] = useState("");

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    setLoading(true);
    const res = await getLecturesByLecturer(user.id);
    if (res.success) setLectures(res.lectures);
    setLoading(false);
  };

  const fetchLiveStudentCount = async (programName) => {
    if (!programName) return;
    const res = await getStudentsByProgram(programName);
    if (res.success) {
      const count = res.students?.length || 0;
      setLiveTotalStudents(count);
      return count;
    }
    return 0;
  };

  const handleSelectLecture = async (lecture) => {
    setSelectedLecture(lecture);
    setStudentsPresent("");
    setStudentError("");
    
    if (lecture?.programName) {
      await fetchLiveStudentCount(lecture.programName);
    }
  };

  const resetForm = () => {
    setWeek("");
    setDate("");
    setVenue("");
    setTime("");
    setTopic("");
    setOutcomes("");
    setRecommendations("");
    setStudentsPresent("");
    setStudentError("");
    setSelectedLecture(null);
    setLiveTotalStudents(0);
  };

  const submit = async () => {
    const total = liveTotalStudents || selectedLecture?.totalStudents || 0;

    if (!selectedLecture || !week || !date || !topic) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (Number(studentsPresent) > Number(total)) {
      Alert.alert("Error", `Students present cannot exceed ${total} students`);
      return;
    }

    setSubmitting(true);

    const payload = {
      lecturerId: user.id,
      lecturerName: user.name,
      courseId: selectedLecture.courseId,
      courseName: selectedLecture.courseName,
      courseCode: selectedLecture.courseCode,
      programName: selectedLecture.programName,
      facultyName: selectedLecture.facultyName,
      totalStudents: total,
      week,
      date,
      venue,
      scheduledTime: time,
      topic,
      learningOutcomes: outcomes,
      recommendations,
      studentsPresent: studentsPresent || "0"
    };

    const res = await createReport(payload);

    if (res.success) {
      Alert.alert("Success", "Report submitted successfully");
      resetForm();
    } else {
      Alert.alert("Error", res.error);
    }
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Lecture Report</Text>
          <Text style={[styles.headerSubtitle, { color: colors.text + "60" }]}>Submit your weekly lecture report</Text>
        </View>

        <Text style={[styles.label, { color: colors.text + "80" }]}>Select Course</Text>
        <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.pickerLoading} />
          ) : (
            <Picker
              selectedValue={selectedLecture}
              onValueChange={handleSelectLecture}
              dropdownIconColor={colors.text}
              style={{ color: colors.text }}
            >
              <Picker.Item label="Select a course" value={null} />
              {lectures.map((l) => (
                <Picker.Item
                  key={l.id}
                  label={`${l.courseName} (${l.courseCode})`}
                  value={l}
                />
              ))}
            </Picker>
          )}
        </View>

        {selectedLecture && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="book-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoTitle, { color: colors.primary }]}>{selectedLecture.courseName}</Text>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Course Code</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{selectedLecture.courseCode}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Program</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{selectedLecture.programName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Faculty</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{selectedLecture.facultyName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Total Students</Text>
              <Text style={[styles.infoValue, { color: liveTotalStudents > 0 ? "#10b981" : colors.text, fontWeight: "bold" }]}>
                {liveTotalStudents || selectedLecture.totalStudents || 0}
                {liveTotalStudents > 0 && liveTotalStudents !== selectedLecture?.totalStudents && (
                  <Text style={{ fontSize: 10, color: "#10b981" }}> (live)</Text>
                )}
              </Text>
            </View>
            
            {liveTotalStudents > 0 && liveTotalStudents !== selectedLecture?.totalStudents && (
              <View style={styles.updateHint}>
                <Ionicons name="refresh-circle" size={14} color="#10b981" />
                <Text style={[styles.hintText, { color: "#10b981" }]}>
                  Student count updated automatically
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedLecture && (
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Report Details</Text>

            <View style={styles.rowInput}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: colors.text + "60" }]}>Week</Text>
                <TextInput
                  placeholder="e.g., Week 1"
                  placeholderTextColor={colors.text + "60"}
                  value={week}
                  onChangeText={setWeek}
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: colors.text + "60" }]}>Date</Text>
                <TextInput
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.text + "60"}
                  value={date}
                  onChangeText={setDate}
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
                />
              </View>
            </View>

            <View style={styles.rowInput}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: colors.text + "60" }]}>Venue</Text>
                <TextInput
                  placeholder="Room number"
                  placeholderTextColor={colors.text + "60"}
                  value={venue}
                  onChangeText={setVenue}
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: colors.text + "60" }]}>Time</Text>
                <TextInput
                  placeholder="e.g., 09:00 - 11:00"
                  placeholderTextColor={colors.text + "60"}
                  value={time}
                  onChangeText={setTime}
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text + "60" }]}>Topic Taught</Text>
            <TextInput
              placeholder="Enter the topic covered"
              placeholderTextColor={colors.text + "60"}
              value={topic}
              onChangeText={setTopic}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
            />

            <Text style={[styles.inputLabel, { color: colors.text + "60" }]}>Learning Outcomes</Text>
            <TextInput
              placeholder="What students learned"
              placeholderTextColor={colors.text + "60"}
              value={outcomes}
              onChangeText={setOutcomes}
              style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, { color: colors.text + "60" }]}>Recommendations</Text>
            <TextInput
              placeholder="Suggestions for improvement"
              placeholderTextColor={colors.text + "60"}
              value={recommendations}
              onChangeText={setRecommendations}
              style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
              multiline
              numberOfLines={2}
            />

            <Text style={[styles.inputLabel, { color: colors.text + "60" }]}>Students Present</Text>
            <TextInput
              placeholder="Number of students present"
              placeholderTextColor={colors.text + "60"}
              value={studentsPresent}
              onChangeText={(text) => {
                setStudentsPresent(text);
                const total = liveTotalStudents || selectedLecture?.totalStudents || 0;
                if (Number(text) > total) {
                  setStudentError(`Cannot exceed ${total} students`);
                } else {
                  setStudentError("");
                }
              }}
              keyboardType="numeric"
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.card },
                studentError && styles.inputError
              ]}
            />
            {studentError && (
              <Text style={styles.errorText}>
                <Ionicons name="alert-circle" size={12} color="#ef4444" /> {studentError}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={submit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Submit Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default Reports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15
  },
  header: {
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold"
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8
  },
  pickerBox: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden"
  },
  pickerLoading: {
    padding: 12
  },
  infoCard: {
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold"
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 10
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4
  },
  infoLabel: {
    fontSize: 12
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "500"
  },
  updateHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb"
  },
  hintText: {
    fontSize: 11,
  },
  formSection: {
    marginTop: 5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15
  },
  rowInput: {
    flexDirection: "row",
    gap: 10
  },
  halfInput: {
    flex: 1
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
    marginTop: 8
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 80
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2
  },
  errorText: {
    color: "#ef4444",
    fontSize: 11,
    marginTop: 4,
    marginBottom: 8
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    gap: 8
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16
  }
});