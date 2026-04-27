import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getLecturesByLecturer } from "../../services/dataService";
import { getRatings } from "../../services/ratingService";

function Dashboard({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const loadData = async () => {
    setLoading(true);
    const [lectureRes, ratingRes] = await Promise.all([
      getLecturesByLecturer(user.id),
      getRatings(user.id)
    ]);

    if (lectureRes.success) {
      setLectures(lectureRes.lectures || []);
      filterTodayClasses(lectureRes.lectures || []);
    }
    if (ratingRes.success) {
      setRatings(ratingRes.ratings || []);
    }
    setLoading(false);
  };

  const filterTodayClasses = (allLectures) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayList = allLectures.filter(l => l.day === today);
    setTodayClasses(todayList);
  };

  const totalClasses = lectures.length;
  const totalStudents = lectures.reduce((sum, item) => sum + (item.totalStudents || 0), 0);
  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : 0;

  const getTodayName = () => {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
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
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name?.split(' ')[0] || 'Lecturer'}</Text>
          <Text style={[styles.dateText, { color: colors.text + "60" }]}>{getTodayName()}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="My Classes"
          value={totalClasses}
          icon="book-outline"
          color="#2563eb"
          onPress={() => navigation.navigate("Classes")}
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon="people-outline"
          color="#10b981"
          onPress={() => navigation.navigate("Classes")}
        />
        <StatCard
          title="Ratings"
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Classes</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Classes")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {todayClasses.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={40} color={colors.text + "40"} />
            <Text style={[styles.emptyText, { color: colors.text + "60" }]}>No classes scheduled for today</Text>
            <Text style={[styles.emptySubtext, { color: colors.text + "40" }]}>Enjoy your day off!</Text>
          </View>
        ) : (
          todayClasses.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate("Attendance")}
            >
              <View style={styles.classHeader}>
                <Text style={[styles.className, { color: colors.text }]}>{item.courseName}</Text>
                <View style={[styles.timeBadge, { backgroundColor: colors.background }]}>
                  <Ionicons name="time-outline" size={12} color={colors.text + "60"} />
                  <Text style={[styles.timeText, { color: colors.text + "70" }]}>{item.time}</Text>
                </View>
              </View>
              <Text style={[styles.classVenue, { color: colors.text + "60" }]}>
                <Ionicons name="location-outline" size={12} color={colors.text + "60"} /> {item.venue}
              </Text>
              <View style={styles.classFooter}>
                <Text style={[styles.classProgram, { color: colors.text + "60" }]}>{item.programName}</Text>
                <Text style={[styles.classStudents, { color: colors.text + "60" }]}>{item.totalStudents} students</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            title="Mark Attendance"
            icon="checkbox-outline"
            color="#2563eb"
            onPress={() => navigation.navigate("Attendance")}
          />
          <QuickAction
            title="Submit Report"
            icon="document-text-outline"
            color="#10b981"
            onPress={() => navigation.navigate("Report")}
          />
          <QuickAction
            title="View Ratings"
            icon="star-outline"
            color="#f59e0b"
            onPress={() => navigation.navigate("Rating")}
          />
          <QuickAction
            title="My Classes"
            icon="school-outline"
            color="#8b5cf6"
            onPress={() => navigation.navigate("Classes")}
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
  dateText: {
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
    paddingVertical: 40,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  classCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  classVenue: {
    fontSize: 13,
    marginBottom: 8,
  },
  classFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  classProgram: {
    fontSize: 11,
  },
  classStudents: {
    fontSize: 11,
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