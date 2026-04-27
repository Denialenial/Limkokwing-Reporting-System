import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getStudentAttendance, getCourseById } from "../../services/attendanceService";
import { getRatings } from "../../services/ratingService";

function Dashboard({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [ratings, setRatings] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const loadData = async () => {
    setLoading(true);

    const courseIds = user?.courses || [];
    const courseResults = await Promise.all(
      courseIds.map(async (id) => {
        const res = await getCourseById(id);
        if (res.success) {
          return {
            id,
            name: res.courseName || res.name,
            code: res.courseCode
          };
        }
        return null;
      })
    );
    const validCourses = courseResults.filter(Boolean);
    setCourses(validCourses);

    let allAttendance = [];
    for (const course of validCourses) {
      const res = await getStudentAttendance(user.id, course.id);
      if (res.success && res.records) {
        allAttendance.push(...res.records.map(r => ({ ...r, courseName: course.name, courseCode: course.code })));
      }
    }
    setAttendanceRecords(allAttendance);

    const ratingRes = await getRatings();
    if (ratingRes.success) {
      const myRatings = ratingRes.ratings.filter(r => r.studentId === user.id);
      setRatings(myRatings);
    }

    setLoading(false);
  };

  const calculateAttendanceStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.present).length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, percentage };
  };

  const attendanceStats = calculateAttendanceStats();

  const getAttendanceColor = () => {
    const percent = attendanceStats.percentage;
    if (percent >= 80) return "#10b981";
    if (percent >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : 0;

  const StatCard = ({ title, value, icon, color, onPress, subtext }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.text + "70" }]}>{title}</Text>
      {subtext && <Text style={[styles.statSubtext, { color: colors.text + "50" }]}>{subtext}</Text>}
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Hello,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name?.split(' ')[0] || 'Student'}</Text>
          <Text style={[styles.programText, { color: colors.text + "60" }]}>{user?.program || user?.faculty}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Attendance Rate"
          value={`${attendanceStats.percentage}%`}
          icon="calendar-outline"
          color="#2563eb"
          onPress={() => navigation.navigate("Attendance")}
          subtext={`${attendanceStats.present} present / ${attendanceStats.total} total`}
        />
        <StatCard
          title="Courses"
          value={courses.length}
          icon="book-outline"
          color="#10b981"
          onPress={() => navigation.navigate("Classes")}
        />
        <StatCard
          title="Ratings Given"
          value={totalRatings}
          icon="star-outline"
          color="#f59e0b"
          onPress={() => navigation.navigate("Rating")}
        />
        <StatCard
          title="Avg Rating"
          value={averageRating}
          icon="star"
          color="#8b5cf6"
          onPress={() => navigation.navigate("Rating")}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Attendance Overview</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Attendance")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {attendanceStats.total === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.text + "40"} />
            <Text style={[styles.emptyText, { color: colors.text + "60" }]}>No attendance records yet</Text>
          </View>
        ) : (
          <View style={[styles.attendanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.attendanceHeader}>
              <Text style={[styles.attendanceTitle, { color: colors.text }]}>Overall Progress</Text>
              <Text style={[styles.attendancePercent, { color: getAttendanceColor() }]}>{attendanceStats.percentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${attendanceStats.percentage}%`, backgroundColor: getAttendanceColor() }]} />
            </View>
            <View style={styles.attendanceStats}>
              <View style={styles.attendanceStat}>
                <View style={[styles.dot, { backgroundColor: "#10b981" }]} />
                <Text style={[styles.attendanceStatText, { color: colors.text + "70" }]}>Present: {attendanceStats.present}</Text>
              </View>
              <View style={styles.attendanceStat}>
                <View style={[styles.dot, { backgroundColor: "#ef4444" }]} />
                <Text style={[styles.attendanceStatText, { color: colors.text + "70" }]}>Absent: {attendanceStats.absent}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            title="View Attendance"
            icon="calendar-outline"
            color="#2563eb"
            onPress={() => navigation.navigate("Attendance")}
          />
          <QuickAction
            title="Rate Lecturer"
            icon="star-outline"
            color="#f59e0b"
            onPress={() => navigation.navigate("Rating")}
          />
          <QuickAction
            title="My Courses"
            icon="book-outline"
            color="#10b981"
            onPress={() => navigation.navigate("Classes")}
          />
          <QuickAction
            title="My Profile"
            icon="person-outline"
            color="#8b5cf6"
            onPress={() => navigation.navigate("Profile")}
          />
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

export default Dashboard;

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
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.7,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 2,
  },
  programText: {
    fontSize: 12,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: "45%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 11,
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 9,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
  },
  attendanceCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  attendanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  attendanceTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  attendancePercent: {
    fontSize: 20,
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  attendanceStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  attendanceStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  attendanceStatText: {
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "45%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  footer: {
    height: 30,
  },
});