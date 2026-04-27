import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getCourseById } from "../../services/attendanceService";
import { getLectures } from "../../services/dataService";
import { getDayName } from "../../components/WorkingDays";

function Classes() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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

    const lectureRes = await getLectures(user.faculty);
    if (lectureRes.success) {
      const filteredLectures = lectureRes.lectures.filter(l =>
        validCourses.some(c => c.id === l.courseId)
      );
      setLectures(filteredLectures);
    }

    setLoading(false);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCourseLectures = (courseId) => {
    return lectures.filter(l => l.courseId === courseId);
  };

  const renderLecture = (item) => (
    <View style={[styles.lectureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.lectureHeader}>
        <Text style={[styles.lectureDay, { color: colors.text + "80" }]}>{getDayName(item.day)}</Text>
        <Text style={[styles.lectureTime, { color: colors.text + "60" }]}>{item.time}</Text>
      </View>
      <View style={styles.lectureDetails}>
        <View style={styles.lectureRow}>
          <Ionicons name="location-outline" size={12} color={colors.text + "60"} />
          <Text style={[styles.lectureText, { color: colors.text + "70" }]}>{item.venue}</Text>
        </View>
        <View style={styles.lectureRow}>
          <Ionicons name="person-outline" size={12} color={colors.text + "60"} />
          <Text style={[styles.lectureText, { color: colors.text + "70" }]}>{item.lecturerName}</Text>
        </View>
        <View style={styles.lectureRow}>
          <Ionicons name="people-outline" size={12} color={colors.text + "60"} />
          <Text style={[styles.lectureText, { color: colors.text + "70" }]}>{item.className}</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const courseLectures = getCourseLectures(item.id);
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.id)}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.courseInfo}>
            <Text style={[styles.courseName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.courseCode, { color: colors.text + "60" }]}>{item.code}</Text>
          </View>
          <View style={styles.rightInfo}>
            <View style={styles.lectureCount}>
              <Ionicons name="book-outline" size={14} color={colors.text + "60"} />
              <Text style={[styles.countText, { color: colors.text + "60" }]}>{courseLectures.length}</Text>
            </View>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.text + "60"}
            />
          </View>
        </View>

        <View style={styles.courseFooter}>
          <View style={styles.courseRow}>
            <Ionicons name="time-outline" size={14} color={colors.text + "60"} />
            <Text style={[styles.courseText, { color: colors.text + "70" }]}>
              {courseLectures.length > 0 ? courseLectures[0].time : "TBA"}
            </Text>
          </View>
          <View style={styles.courseRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.text + "60"} />
            <Text style={[styles.courseText, { color: colors.text + "70" }]}>
              {courseLectures.length > 0 ? courseLectures[0].day : "TBA"}
            </Text>
          </View>
        </View>

        {isExpanded && courseLectures.length > 0 && (
          <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text + "70" }]}>Schedule</Text>
            {courseLectures.map((l) => (
              <View key={l.id}>{renderLecture(l)}</View>
            ))}
          </View>
        )}

        {isExpanded && courseLectures.length === 0 && (
          <View style={[styles.emptyLectures, { borderTopColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.text + "40"} />
            <Text style={[styles.emptyText, { color: colors.text + "60" }]}>No lectures scheduled</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Courses</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text + "60" }]}>
          {courses.length} {courses.length === 1 ? "course" : "courses"} enrolled
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={colors.text + "30"} />
              <Text style={[styles.emptyTitle, { color: colors.text + "60" }]}>No Courses Enrolled</Text>
              <Text style={[styles.emptySubtitle, { color: colors.text + "40" }]}>
                You are not enrolled in any courses yet
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={courses.length === 0 && styles.emptyContent}
        />
      )}
    </View>
  );
}

export default Classes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  courseInfo: {
    flex: 1,
    gap: 4,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  courseCode: {
    fontSize: 11,
  },
  rightInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lectureCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: "500",
  },
  courseFooter: {
    flexDirection: "row",
    gap: 20,
    marginTop: 6,
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  courseText: {
    fontSize: 12,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  lectureCard: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  lectureHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  lectureDay: {
    fontSize: 12,
    fontWeight: "500",
  },
  lectureTime: {
    fontSize: 11,
  },
  lectureDetails: {
    gap: 4,
  },
  lectureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lectureText: {
    fontSize: 11,
  },
  emptyLectures: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 12,
    marginTop: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
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
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});