import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View,Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getCourses, getLectures, getReports, getLecturers } from "../../services/dataService";
import { getRatings } from "../../services/ratingService";

function Monitoring() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [reports, setReports] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const loadData = async () => {
    setLoading(true);
    const [courseRes, lectureRes, reportRes, ratingRes, lecturerRes] = await Promise.all([
      getCourses(user.faculty),
      getLectures(user.faculty),
      getReports(user.faculty),
      getRatings(),
      getLecturers(user.faculty)
    ]);

    if (courseRes.success) setCourses(courseRes.courses || []);
    if (lectureRes.success) setLectures(lectureRes.lectures || []);
    if (reportRes.success) setReports(reportRes.reports || []);
    if (ratingRes.success) setRatings(ratingRes.ratings || []);
    if (lecturerRes.success) setLecturers(lecturerRes.lecturers || []);
    setLoading(false);
  };

  const totalCourses = courses.length;
  const totalLectures = lectures.length;
  const totalLecturers = lecturers.length;
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === "submitted").length;
  const approvedReports = reports.filter(r => r.status === "approved").length;
  const rejectedReports = reports.filter(r => r.status === "rejected").length;

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : 0;

  const getPeriodReports = () => {
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

    if (selectedPeriod === "week") {
      return reports.filter(r => {
        if (!r.createdAt) return false;
        const date = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
        return date >= weekAgo;
      }).length;
    }
    if (selectedPeriod === "month") {
      return reports.filter(r => {
        if (!r.createdAt) return false;
        const date = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
        return date >= monthAgo;
      }).length;
    }
    return totalReports;
  };

  const lecturerPerformance = lecturers.map(lecturer => {
    const lecturerRatings = ratings.filter(r => r.lecturerId === lecturer.id);
    const avg = lecturerRatings.length > 0
      ? (lecturerRatings.reduce((sum, r) => sum + r.rating, 0) / lecturerRatings.length).toFixed(1)
      : 0;
    return {
      ...lecturer,
      avgRating: avg,
      totalRatings: lecturerRatings.length
    };
  }).sort((a, b) => b.avgRating - a.avgRating);

  const topPerformers = lecturerPerformance.slice(0, 3);
  const needsImprovement = lecturerPerformance.filter(l => l.avgRating < 3 && l.totalRatings > 0).slice(0, 3);

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.text + "80" }]}>{title}</Text>
    </View>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Principal Lecturer Dashboard</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text + "60" }]}>
          Faculty of {user?.faculty}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="Courses" value={totalCourses} icon="book-outline" color="#2563eb" />
        <StatCard title="Classes" value={totalLectures} icon="people-outline" color="#10b981" />
        <StatCard title="Lecturers" value={totalLecturers} icon="person-outline" color="#8b5cf6" />
        <StatCard title="Reports" value={totalReports} icon="document-text-outline" color="#f59e0b" />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Report Summary</Text>
        <View style={styles.reportStats}>

          <View style={[styles.reportCard, { backgroundColor: colors.card }]}>
            <View style={[styles.reportIcon, { backgroundColor: "#f59e0b20" }]}>
              <Ionicons name="time-outline" size={20} color="#f59e0b" />
            </View>
            <Text style={[styles.reportNumber, { color: "#f59e0b" }]}>{pendingReports}</Text>
            <Text style={[styles.reportLabel, { color: colors.text + "60" }]}>Pending Review</Text>
          </View>

          <View style={[styles.reportCard, { backgroundColor: colors.card }]}>
            <View style={[styles.reportIcon, { backgroundColor: "#10b98120" }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
            </View>
            <Text style={[styles.reportNumber, { color: "#10b981" }]}>{approvedReports}</Text>
            <Text style={[styles.reportLabel, { color: colors.text + "60" }]}>Approved</Text>
          </View>

          <View style={[styles.reportCard, { backgroundColor: colors.card }]}>
            <View style={[styles.reportIcon, { backgroundColor: "#ef444420" }]}>
              <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.reportNumber, { color: "#ef4444" }]}>{rejectedReports}</Text>
            <Text style={[styles.reportLabel, { color: colors.text + "60" }]}>Rejected</Text>
          </View>

        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rating Overview</Text>
          <View style={styles.ratingSummary}>
            <Text style={[styles.averageRating, { color: colors.text }]}>{averageRating}</Text>
            <Text style={styles.averageStar}>⭐</Text>
          </View>
        </View>
        <View style={[styles.ratingBarContainer, { backgroundColor: colors.card }]}>
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratings.filter(r => Math.floor(r.rating) === star).length;
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            return (
              <View key={star} style={styles.ratingBarRow}>
                <Text style={[styles.ratingBarLabel, { color: colors.text + "60" }]}>{star} ⭐</Text>
                <View style={styles.ratingBarTrack}>
                  <View style={[styles.ratingBarFill, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
                </View>
                <Text style={[styles.ratingBarPercent, { color: colors.text + "60" }]}>{Math.round(percentage)}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {topPerformers.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Performing Lecturers</Text>
          {topPerformers.map((lecturer, index) => (
            <View key={lecturer.id} style={[styles.performerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.performerRank}>
                <Text style={[styles.rankNumber, { color: colors.primary }]}>#{index + 1}</Text>
              </View>
              <View style={styles.performerInfo}>
                <Text style={[styles.performerName, { color: colors.text }]}>{lecturer.name}</Text>
                <Text style={[styles.performerMeta, { color: colors.text + "60" }]}>{lecturer.totalRatings} reviews</Text>
              </View>
              <View style={styles.performerRating}>
                <Text style={[styles.performerScore, { color: "#f59e0b" }]}>{lecturer.avgRating}</Text>
                <Text style={styles.performerStar}>⭐</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {needsImprovement.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Needs Improvement</Text>
          {needsImprovement.map((lecturer) => (
            <View key={lecturer.id} style={[styles.improveCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.improveInfo}>
                <Text style={[styles.improveName, { color: colors.text }]}>{lecturer.name}</Text>
                <Text style={[styles.improveMeta, { color: colors.text + "60" }]}>{lecturer.totalRatings} reviews</Text>
              </View>
              <View style={styles.improveRating}>
                <Text style={[styles.improveScore, { color: "#ef4444" }]}>{lecturer.avgRating}</Text>
                <Text style={styles.improveStar}>⭐</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <View style={styles.periodButtons}>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === "week" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setSelectedPeriod("week")}
            >
              <Text style={[styles.periodText, { color: selectedPeriod === "week" ? colors.primary : colors.text + "60" }]}>Week</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === "month" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setSelectedPeriod("month")}
            >
              <Text style={[styles.periodText, { color: selectedPeriod === "month" ? colors.primary : colors.text + "60" }]}>Month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === "all" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setSelectedPeriod("all")}
            >
              <Text style={[styles.periodText, { color: selectedPeriod === "all" ? colors.primary : colors.text + "60" }]}>All</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={[styles.activityLabel, { color: colors.text + "80" }]}>Reports submitted</Text>
            </View>
            <Text style={[styles.activityNumber, { color: colors.primary }]}>{getPeriodReports()}</Text>
          </View>

          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              <Ionicons name="star-outline" size={20} color="#f59e0b" />
              <Text style={[styles.activityLabel, { color: colors.text + "80" }]}>Total ratings received</Text>
            </View>
            <Text style={[styles.activityNumber, { color: "#f59e0b" }]}>{totalRatings}</Text>
          </View>

          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              <Ionicons name="school-outline" size={20} color="#10b981" />
              <Text style={[styles.activityLabel, { color: colors.text + "80" }]}>Active classes</Text>
            </View>
            <Text style={[styles.activityNumber, { color: "#10b981" }]}>{totalLectures}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

export default Monitoring;

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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    width: "45%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
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
  reportStats: {
    flexDirection: "row",
    gap: 12,
  },
  reportCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  reportNumber: {
    fontSize: 22,
    fontWeight: "bold",
  },
  reportLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  averageRating: {
    fontSize: 24,
    fontWeight: "bold",
  },
  averageStar: {
    fontSize: 20,
  },
  ratingBarContainer: {
    padding: 16,
    borderRadius: 12,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  ratingBarLabel: {
    width: 40,
    fontSize: 12,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  ratingBarPercent: {
    width: 40,
    fontSize: 11,
    textAlign: "right",
  },
  performerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  performerRank: {
    width: 40,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 14,
    fontWeight: "600",
  },
  performerMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  performerRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  performerScore: {
    fontSize: 18,
    fontWeight: "bold",
  },
  performerStar: {
    fontSize: 14,
  },
  improveCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  improveInfo: {
    flex: 1,
  },
  improveName: {
    fontSize: 14,
    fontWeight: "600",
  },
  improveMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  improveRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  improveScore: {
    fontSize: 18,
    fontWeight: "bold",
  },
  improveStar: {
    fontSize: 14,
  },
  periodButtons: {
    flexDirection: "row",
    gap: 12,
  },
  periodButton: {
    paddingBottom: 4,
  },
  periodText: {
    fontSize: 13,
    fontWeight: "500",
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activityLabel: {
    fontSize: 13,
  },
  activityNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    height: 30,
  },
});