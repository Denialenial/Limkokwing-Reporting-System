import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, Switch, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getLecturesByLecturer } from "../../services/dataService";
import { getStudentsByCourse, markAttendance } from "../../services/attendanceService";

function Attendance() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [lectures, setLectures] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [date] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    const res = await getLecturesByLecturer(user.id);
    if (res.success) setLectures(res.lectures);
  };

  const loadStudents = async (id) => {
    if (!id) return;

    setLoading(true);
    setStudents([]);

    try {
      const res = await getStudentsByCourse(id);

      if (res.success) {
        setStudents(
          res.students.map(s => ({
            ...s,
            present: false
          }))
        );
      } else {
        Alert.alert("Error", res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === id ? { ...s, present: !s.present } : s
      )
    );
  };

  const markAllPresent = () => {
    setStudents(prev =>
      prev.map(s => ({
        ...s,
        present: true
      }))
    );
  };

  const markAllAbsent = () => {
    setStudents(prev =>
      prev.map(s => ({
        ...s,
        present: false
      }))
    );
  };

  const submit = async () => {
    if (students.length === 0) {
      Alert.alert("Error", "No students to mark attendance");
      return;
    }

    setSubmitting(true);
    const res = await markAttendance({
      courseId,
      lecturerId: user.id,
      date,
      students
    });

    if (res.success) {
      Alert.alert("Success", "Attendance saved successfully");
      setStudents([]);
      setCourseId("");
      setCourseName("");
    } else {
      Alert.alert("Error", res.error);
    }
    setSubmitting(false);
  };

  const presentCount = students.filter(s => s.present).length;
  const absentCount = students.length - presentCount;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Mark Attendance</Text>
        <Text style={[styles.subtitle, { color: colors.text + "60" }]}>Record student attendance for your classes</Text>
      </View>

      <View style={[styles.picker, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Picker
          selectedValue={courseId}
          onValueChange={(value) => {
            if (!value) return;
            const selected = lectures.find(l => l.courseId === value);
            setCourseId(value);
            setCourseName(selected?.courseName || "");
            loadStudents(value);
          }}
          dropdownIconColor={colors.text}
          style={{ color: colors.text }}
        >
          <Picker.Item label="Select Course" value="" />
          {lectures.map(l => (
            <Picker.Item
              key={l.id}
              label={l.courseName}
              value={l.courseId}
            />
          ))}
        </Picker>
      </View>

      {courseName !== "" && (
        <View style={[styles.courseBox, { backgroundColor: colors.primary + "10" }]}>
          <View style={styles.courseBoxHeader}>
            <Ionicons name="book-outline" size={18} color={colors.primary} />
            <Text style={[styles.courseText, { color: colors.text }]}>{courseName}</Text>
          </View>
          <View style={styles.courseBoxFooter}>
            <Ionicons name="calendar-outline" size={14} color={colors.text + "60"} />
            <Text style={[styles.date, { color: colors.text + "60" }]}>{date}</Text>
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && students.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#10b981" }]}>{presentCount}</Text>
            <Text style={[styles.statLabel, { color: colors.text + "60" }]}>Present</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: "#ef4444" }]}>{absentCount}</Text>
            <Text style={[styles.statLabel, { color: colors.text + "60" }]}>Absent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{students.length}</Text>
            <Text style={[styles.statLabel, { color: colors.text + "60" }]}>Total</Text>
          </View>
        </View>
      )}

      {!loading && students.length === 0 && courseId !== "" && (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={colors.text + "40"} />
          <Text style={[styles.empty, { color: colors.text + "60" }]}>No students found</Text>
        </View>
      )}

      {students.length > 0 && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={markAllAbsent} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: colors.text + "60" }]}>Mark All Absent</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={markAllPresent} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: colors.primary }]}>Mark All Present</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.studentInfo}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{item.name?.charAt(0)}</Text>
              </View>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            </View>

            <View style={styles.switchBox}>
              <Text style={[item.present ? styles.presentText : styles.absentText, { color: item.present ? "#10b981" : "#ef4444" }]}>
                {item.present ? "Present" : "Absent"}
              </Text>
              <Switch
                value={item.present}
                onValueChange={() => toggle(item.id)}
                trackColor={{ false: "#e5e7eb", true: colors.primary + "80" }}
                thumbColor={item.present ? colors.primary : "#f4f3f4"}
              />
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {students.length > 0 && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>Submit Attendance</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default Attendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15
  },
  header: {
    marginBottom: 15
  },
  title: {
    fontSize: 24,
    fontWeight: "bold"
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2
  },
  picker: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden"
  },
  courseBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  courseBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  courseBoxFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  courseText: {
    fontWeight: "600",
    fontSize: 14
  },
  date: {
    fontSize: 12
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#f8f9fa"
  },
  statItem: {
    alignItems: "center"
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold"
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e5e7eb"
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
    gap: 15
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  actionText: {
    fontSize: 13,
    fontWeight: "500"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  name: {
    fontWeight: "500",
    fontSize: 15
  },
  switchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  presentText: {
    fontWeight: "bold",
    fontSize: 13
  },
  absentText: {
    fontWeight: "bold",
    fontSize: 13
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60
  },
  empty: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14
  },
  btn: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15
  }
});