import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getCourses, getLectures } from "../../services/dataService";

function Courses() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const loadData = async () => {
    setLoading(true);
    const [courseRes, lectureRes] = await Promise.all([
      getCourses(user.faculty),
      getLectures(user.faculty)
    ]);

    if (courseRes.success) setCourses(courseRes.courses || []);
    if (lectureRes.success) setLectures(lectureRes.lectures || []);
    setLoading(false);
  };

  const toggleCourseExpand = (courseId) => {
    setExpandedCourseId(expandedCourseId === courseId ? null : courseId);
  };

  const getCourseLectures = (courseId) => {
    return lectures.filter((l) => l.courseId === courseId);
  };

  const renderLecture = (item) => (
    <View style={[styles.lectureCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.lectureHeader}>
        <Ionicons name="book-outline" size={14} color={colors.primary} />
        <Text style={[styles.lectureTitle, { color: colors.text }]}>{item.className || item.courseName}</Text>
      </View>
      <View style={styles.lectureDetails}>
        <View style={styles.lectureRow}>
          <Ionicons name="person-outline" size={12} color={colors.text + "60"} />
          <Text style={[styles.lectureText, { color: colors.text + "80" }]}>{item.lecturerName}</Text>
        </View>
        <View style={styles.lectureRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.text + "60"} />
          <Text style={[styles.lectureText, { color: colors.text + "80" }]}>{item.day} | {item.time}</Text>
        </View>
        <View style={styles.lectureRow}>
          <Ionicons name="location-outline" size={12} color={colors.text + "60"} />
          <Text style={[styles.lectureText, { color: colors.text + "80" }]}>{item.venue}</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const courseLectures = getCourseLectures(item.id);
    const isExpanded = expandedCourseId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleCourseExpand(item.id)}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.courseInfo}>
            <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.code, { color: colors.text + "60" }]}>{item.courseCode}</Text>
            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={12} color={colors.text + "60"} />
                <Text style={[styles.statText, { color: colors.text + "60" }]}>{courseLectures.length} lectures</Text>
              </View>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.text + "60"}
          />
        </View>

        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text + "80" }]}>Assigned Lectures</Text>
            {courseLectures.length === 0 ? (
              <View style={styles.emptyLectures}>
                <Ionicons name="alert-circle-outline" size={24} color={colors.text + "40"} />
                <Text style={[styles.emptyText, { color: colors.text + "60" }]}>No lectures assigned yet</Text>
              </View>
            ) : (
              courseLectures.map((l) => <View key={l.id}>{renderLecture(l)}</View>)
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const totalCourses = courses.length;
  const totalLectures = lectures.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Course Management</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text + "60" }]}>
          {totalCourses} courses • {totalLectures} lectures assigned
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
              <Text style={[styles.emptyTitle, { color: colors.text + "60" }]}>No Courses Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.text + "40" }]}>
                No courses have been created for your faculty yet
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

export default Courses;

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
  },
  courseInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  code: {
    fontSize: 12,
    marginBottom: 6,
  },
  courseStats: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
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
    gap: 6,
    marginBottom: 6,
  },
  lectureTitle: {
    fontSize: 13,
    fontWeight: "600",
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
    alignItems: "center",
    paddingVertical: 20,
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