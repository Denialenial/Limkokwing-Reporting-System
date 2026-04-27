import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getReports } from "../../services/dataService";
import SearchBar from "../../components/SearchBar";

function Reports() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    setLoading(true);
    const res = await getReports(user.faculty);
    if (res.success) {
      const filtered = (res.reports || []).filter(r => r.status !== "submitted");
      setReports(filtered);
    }
    setLoading(false);
  };

  const filteredReports = reports.filter(item => {
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      item.courseName?.toLowerCase().includes(query) ||
      item.courseCode?.toLowerCase().includes(query) ||
      item.lecturerName?.toLowerCase().includes(query) ||
      item.topic?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status) => {
    if (status === "approved") return "#2ecc71";
    if (status === "rejected") return "#e74c3c";
    return "#f39c12";
  };

  const getStatusIcon = (status) => {
    if (status === "approved") return "checkmark-circle";
    if (status === "rejected") return "close-circle";
    return "time-outline";
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.id)}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.courseInfo}>
            <Text style={[styles.courseName, { color: colors.text }]}>{item.courseName}</Text>
            <Text style={[styles.courseCode, { color: colors.text + "80" }]}>{item.courseCode}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <Ionicons name={statusIcon} size={12} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.basicInfo}>
          <View style={styles.basicRow}>
            <Ionicons name="person-outline" size={14} color={colors.text + "60"} />
            <Text style={[styles.basicText, { color: colors.text + "80" }]}>{item.lecturerName}</Text>
          </View>
          <View style={styles.basicRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.text + "60"} />
            <Text style={[styles.basicText, { color: colors.text + "80" }]}>Week {item.week}</Text>
          </View>
          <View style={styles.basicRow}>
            <Ionicons name="people-outline" size={14} color={colors.text + "60"} />
            <Text style={[styles.basicText, { color: colors.text + "80" }]}>{item.studentsPresent}/{item.totalStudents} present</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={[styles.expandedDetails, { borderTopColor: colors.border }]}>
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.text + "60" }]}>Topic</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.topic}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.text + "60" }]}>Venue</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.venue || "N/A"}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.text + "60" }]}>Date</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.date || "N/A"}</Text>
            </View>

            {item.learningOutcomes && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: colors.text + "60" }]}>Learning Outcomes</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{item.learningOutcomes}</Text>
              </View>
            )}

            {item.recommendations && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: colors.text + "60" }]}>Recommendations</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{item.recommendations}</Text>
              </View>
            )}

            <View style={[styles.feedbackBox, { backgroundColor: colors.background }]}>
              <Text style={[styles.feedbackTitle, { color: colors.text + "80" }]}>PRL Feedback</Text>
              <Text style={[styles.feedbackText, { color: colors.text }]}>
                {item.prlFeedback || "No feedback yet"}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.expandIcon}>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.text + "60"} />
        </View>
      </TouchableOpacity>
    );
  };

  const pendingCount = reports.filter(r => r.status === "submitted").length;
  const approvedCount = reports.filter(r => r.status === "approved").length;
  const rejectedCount = reports.filter(r => r.status === "rejected").length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Lecture Reports</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text + "60" }]}>
          Reports ready for your review
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: "#f39c12" }]}>{pendingCount}</Text>
          <Text style={[styles.statLabel, { color: colors.text + "60" }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: "#2ecc71" }]}>{approvedCount}</Text>
          <Text style={[styles.statLabel, { color: colors.text + "60" }]}>Approved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: "#e74c3c" }]}>{rejectedCount}</Text>
          <Text style={[styles.statLabel, { color: colors.text + "60" }]}>Rejected</Text>
        </View>
      </View>

      <SearchBar onSearch={setSearchQuery} placeholder="Search by course, lecturer, topic or status..." />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.text + "30"} />
              <Text style={[styles.emptyTitle, { color: colors.text + "60" }]}>
                {searchQuery ? "No Matching Reports" : "No Reports"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.text + "40" }]}>
                {searchQuery 
                  ? "Try a different search term" 
                  : "No lecture reports available for review"}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export default Reports;

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
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 11,
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
  courseInfo: {
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  basicInfo: {
    gap: 6,
  },
  basicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  basicText: {
    fontSize: 13,
  },
  expandIcon: {
    alignItems: "center",
    marginTop: 8,
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  detailSection: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  feedbackBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
  },
  feedbackTitle: {
    fontSize: 11,
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 13,
    fontStyle: "italic",
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
});