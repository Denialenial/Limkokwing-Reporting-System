import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getStudentAttendance, getCourseById } from "../../services/attendanceService";

function Attendance() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoadingCourses(true);
    const courseIds = user?.courses || [];

    const results = await Promise.all(
      courseIds.map(async (id) => {
        const res = await getCourseById(id);
        if (res.success) {
          return {
            id,
            courseName: res.courseName || res.name,
            courseCode: res.courseCode
          };
        }
        return null;
      })
    );

    setCourses(results.filter(Boolean));
    setLoadingCourses(false);
  };

  const loadAttendance = async (selectedCourseId, selectedCourseName) => {
    setLoading(true);
    setRecords([]);
    const res = await getStudentAttendance(user.id, selectedCourseId);
    if (res.success) {
      setRecords(res.records || []);
    }
    setLoading(false);
  };

  const calculateStats = () => {
    const total = records.length;
    const present = records.filter(r => r.present).length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, percentage };
  };

  const stats = calculateStats();

  const getAttendanceColor = () => {
    const percent = stats.percentage;
    if (percent >= 80) return "#10b981";
    if (percent >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const renderItem = ({ item }) => {
    const date = item.date?.split("T")[0];
    const isPresent = item.present;

    return (
      <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.recordLeft}>
          <View style={[styles.dateBadge, { backgroundColor: isPresent ? "#10b98120" : "#ef444420" }]}>
            <Text style={[styles.dateDay, { color: isPresent ? "#10b981" : "#ef4444" }]}>
              {date?.split("-")[2]}
            </Text>
            <Text style={[styles.dateMonth, { color: isPresent ? "#10b981" : "#ef4444" }]}>
              {new Date(date).toLocaleString('default', { month: 'short' })}
            </Text>
          </View>
          <View style={styles.recordInfo}>
            <Text style={[styles.recordDate, { color: colors.text }]}>{date}</Text>
            <Text style={[styles.recordDay, { color: colors.text + "60" }]}>
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isPresent ? "#10b98120" : "#ef444420" }]}>
          <Ionicons name={isPresent ? "checkmark-circle" : "close-circle"} size={16} color={isPresent ? "#10b981" : "#ef4444"} />
          <Text style={[styles.statusText, { color: isPresent ? "#10b981" : "#ef4444" }]}>
            {isPresent ? "Present" : "Absent"}
          </Text>
        </View>
      </View>
    );
  };

  const selectedCourse = courses.find(c => c.id === courseId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Attendance</Text>
        <Text style={[styles.subtitle, { color: colors.text + "60" }]}>Track your class attendance records</Text>
      </View>

      {loadingCourses ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Picker
            selectedValue={courseId}
            onValueChange={(value) => {
              setCourseId(value);
              setRecords([]);
              const course = courses.find(c => c.id === value);
              setCourseName(course?.courseName || "");
              if (value) loadAttendance(value, course?.courseName);
            }}
            dropdownIconColor={colors.text}
            style={{ color: colors.text }}
          >
            <Picker.Item label="Select a course" value="" />
            {courses.map((c) => (
              <Picker.Item
                key={c.id}
                label={`${c.courseName} (${c.courseCode})`}
                value={c.id}
              />
            ))}
          </Picker>
        </View>
      )}

      {courseId !== "" && !loading && records.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statsLabel, { color: colors.text + "60" }]}>Attendance Rate</Text>
            <Text style={[styles.statsPercentage, { color: getAttendanceColor() }]}>{stats.percentage}%</Text>
            <View style={styles.statsRow}>
              <View style={styles.statsItem}>
                <Text style={[styles.statsNumber, { color: "#10b981" }]}>{stats.present}</Text>
                <Text style={[styles.statsSmallLabel, { color: colors.text + "60" }]}>Present</Text>
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.statsItem}>
                <Text style={[styles.statsNumber, { color: "#ef4444" }]}>{stats.absent}</Text>
                <Text style={[styles.statsSmallLabel, { color: colors.text + "60" }]}>Absent</Text>
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.statsItem}>
                <Text style={[styles.statsNumber, { color: colors.text }]}>{stats.total}</Text>
                <Text style={[styles.statsSmallLabel, { color: colors.text + "60" }]}>Total</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && courseId !== "" && records.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={colors.text + "30"} />
          <Text style={[styles.emptyTitle, { color: colors.text + "60" }]}>No Attendance Records</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text + "40" }]}>
            No attendance records found for {selectedCourse?.courseName || "this course"}
          </Text>
        </View>
      )}

      {!loading && courseId !== "" && records.length > 0 && (
        <FlatList
          data={records}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

export default Attendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  pickerBox: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsCard: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  statsLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statsPercentage: {
    fontSize: 32,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 12,
  },
  statsItem: {
    alignItems: "center",
    flex: 1,
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statsSmallLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e5e7eb",
  },
  recordCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  recordLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: "500",
  },
  recordInfo: {
    gap: 2,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  recordDay: {
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  listContent: {
    paddingBottom: 20,
  },
});