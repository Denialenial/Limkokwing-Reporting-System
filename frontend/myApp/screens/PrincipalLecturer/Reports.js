import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getReports, addPRLFeedback } from "../../services/dataService";

function Reports() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    setLoading(true);
    const res = await getReports(user.faculty);
    if (res.success) {
      setReports(res.reports);
    } else {
      Alert.alert("Error", res.error || "Failed to load reports");
    }
    setLoading(false);
  };

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

  const submitFeedback = async (status) => {
    if (!selected) return;
    if (!feedback.trim()) {
      Alert.alert("Error", "Please enter feedback first");
      return;
    }

    setLoading(true);
    const res = await addPRLFeedback({
      reportId: selected.id,
      prlId: user.id,
      prlFeedback: feedback.trim(),
      status,
    });

    if (res.success) {
      Alert.alert("Success", `Report ${status}`);
      setModalVisible(false);
      setSelected(null);
      setFeedback("");
      loadReports();
    } else {
      Alert.alert("Error", res.error || "Request failed");
    }
    setLoading(false);
  };

  const openModal = (item) => {
    setSelected(item);
    setFeedback(item.prlFeedback || "");
    setModalVisible(true);
  };

  const pendingCount = reports.filter(r => r.status === "submitted").length;
  const approvedCount = reports.filter(r => r.status === "approved").length;
  const rejectedCount = reports.filter(r => r.status === "rejected").length;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openModal(item)}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: getStatusColor(item.status) },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.courseInfo}>
          <Text style={[styles.title, { color: colors.text }]}>{item.courseName}</Text>
          <Text style={[styles.courseCode, { color: colors.text + "60" }]}>{item.courseCode}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Ionicons name={getStatusIcon(item.status)} size={12} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color={colors.text + "60"} />
          <Text style={[styles.meta, { color: colors.text + "80" }]}>{item.lecturerName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.text + "60"} />
          <Text style={[styles.meta, { color: colors.text + "80" }]}>Week {item.week}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={14} color={colors.text + "60"} />
          <Text style={[styles.meta, { color: colors.text + "80" }]}>{item.studentsPresent}/{item.totalStudents} present</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>Report Reviews</Text>
        <Text style={[styles.subheading, { color: colors.text + "60" }]}>Review and provide feedback on lecture reports</Text>
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

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.text + "30"} />
            <Text style={[styles.emptyTitle, { color: colors.text + "60" }]}>No Reports</Text>
            <Text style={[styles.emptySubtitle, { color: colors.text + "40" }]}>No lecture reports available for review</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Review Report</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selected && (
                <>
                  <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Course</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selected.courseName} ({selected.courseCode})</Text>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Lecturer</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selected.lecturerName}</Text>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Program & Faculty</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selected.programName} • {selected.facultyName}</Text>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Week & Topic</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>Week {selected.week} - {selected.topic}</Text>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Attendance</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{selected.studentsPresent} / {selected.totalStudents} students present</Text>
                  </View>

                  {selected.venue && (
                    <View style={styles.infoSection}>
                      <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Venue</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{selected.venue}</Text>
                    </View>
                  )}

                  {selected.learningOutcomes && (
                    <View style={styles.infoSection}>
                      <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Learning Outcomes</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{selected.learningOutcomes}</Text>
                    </View>
                  )}

                  {selected.recommendations && (
                    <View style={styles.infoSection}>
                      <Text style={[styles.infoLabel, { color: colors.text + "60" }]}>Recommendations</Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{selected.recommendations}</Text>
                    </View>
                  )}

                  <Text style={[styles.inputLabel, { color: colors.text + "60" }]}>Your Feedback</Text>
                  <TextInput
                    placeholder="Write your feedback here..."
                    placeholderTextColor={colors.text + "60"}
                    value={feedback}
                    onChangeText={setFeedback}
                    style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                    multiline
                    numberOfLines={4}
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: "#e74c3c" }]}
                      onPress={() => submitFeedback("rejected")}
                      disabled={loading}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="#fff" />
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: "#2ecc71" }]}
                      onPress={() => submitFeedback("approved")}
                      disabled={loading}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                      <Text style={styles.btnText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  heading: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subheading: {
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
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  courseInfo: {
    flex: 1,
  },
  title: {
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
  cardDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meta: {
    fontSize: 13,
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
    maxHeight: "85%",
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
  infoSection: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});