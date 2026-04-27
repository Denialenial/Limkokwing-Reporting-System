import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getLecturesByLecturer } from "../../services/dataService";
import { getDayName } from "../../components/WorkingDays";

function Classes() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadClasses();
    }, [user])
  );

  const loadClasses = async () => {
    setLoading(true);
    const res = await getLecturesByLecturer(user.id);
    if (res.success) {
      setClasses(res.lectures || []);
    } else {
      setClasses([]);
    }
    setLoading(false);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.id)}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.leftInfo}>
            <Text style={[styles.courseName, { color: colors.text }]}>{item.courseName}</Text>
            <Text style={[styles.courseCode, { color: colors.text + "60" }]}>{item.courseCode}</Text>
          </View>
          <View style={styles.rightInfo}>
            <Text style={[styles.dayText, { color: colors.text + "60" }]}>{getDayName(item.day)}</Text>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.text + "60"}
            />
          </View>
        </View>

        <View style={styles.basicInfo}>
          <View style={styles.basicRow}>
            <Ionicons name="time-outline" size={14} color={colors.text + "60"} />
            <Text style={[styles.basicText, { color: colors.text + "80" }]}>{item.time}</Text>
          </View>
          <View style={styles.basicRow}>
            <Ionicons name="location-outline" size={14} color={colors.text + "60"} />
            <Text style={[styles.basicText, { color: colors.text + "80" }]} numberOfLines={1}>{item.venue}</Text>
          </View>
          <View style={styles.basicRow}>
            <Ionicons name="people-outline" size={14} color={colors.text + "60"} />
            <Text style={[styles.basicText, { color: colors.text + "80" }]}>{item.totalStudents || 0} students</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={[styles.expandedDetails, { borderTopColor: colors.border }]}>
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.text + "60" }]}>Class Name</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.className}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.text + "60" }]}>Day</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.day}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.text + "60" }]}>Program</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.programName}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.text + "60" }]}>Faculty</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.facultyName}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const totalStudents = classes.reduce((sum, item) => sum + (item.totalStudents || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Classes</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text + "60" }]}>
          {classes.length} {classes.length === 1 ? "class" : "classes"} • {totalStudents} total students
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color={colors.text + "30"} />
              <Text style={[styles.emptyTitle, { color: colors.text + "60" }]}>No Classes Assigned</Text>
              <Text style={[styles.emptySubtitle, { color: colors.text + "40" }]}>
                You haven't been assigned to any classes yet
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={classes.length === 0 && styles.emptyContent}
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
    alignItems: "center",
    marginBottom: 10,
  },
  leftInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  courseCode: {
    fontSize: 11,
    marginTop: 2,
  },
  rightInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
  },
  basicInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 4,
  },
  basicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  basicText: {
    fontSize: 12,
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  detailSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
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