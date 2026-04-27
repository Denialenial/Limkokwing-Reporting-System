import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getRatings } from "../../services/ratingService";

function Ratings() {
  const { colors } = useTheme();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("latest");

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    setLoading(true);
    const res = await getRatings();
    if (res.success) {
      setRatings(res.ratings);
    }
    setLoading(false);
  };

  const average = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0;

  const getSortedRatings = () => {
    if (sortBy === "highest") {
      return [...ratings].sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === "lowest") {
      return [...ratings].sort((a, b) => a.rating - b.rating);
    }
    return [...ratings].reverse();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Recent";
    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString();
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    return "Recent";
  };

  const renderStars = (value) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <Text key={i} style={{ fontSize: 14 }}>
        {i <= value ? "⭐" : "☆"}
      </Text>
    ));
  };

  const getBadgeColor = (rating) => {
    if (rating >= 4) return "#2ecc71";
    if (rating >= 3) return "#f39c12";
    return "#e74c3c";
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4) return "Excellent";
    if (rating >= 3) return "Good";
    if (rating >= 2) return "Average";
    return "Poor";
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.courseInfo}>
          <Text style={[styles.courseName, { color: colors.text }]}>{item.courseName}</Text>
          <Text style={[styles.lecturerName, { color: colors.text + "80" }]}>{item.lecturerName}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getBadgeColor(item.rating) }]}>
          <Text style={styles.badgeText}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.starsRow}>
        {renderStars(item.rating)}
        <Text style={[styles.ratingLabel, { color: colors.text + "80" }]}>
          {getRatingLabel(item.rating)}
        </Text>
      </View>

      {item.comment ? (
        <View style={styles.commentBox}>
          <Ionicons name="chatbubble-outline" size={14} color={colors.text + "60"} />
          <Text style={[styles.comment, { color: colors.text + "80" }]}>"{item.comment}"</Text>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={12} color={colors.text + "60"} />
          <Text style={[styles.meta, { color: colors.text + "60" }]}>{item.studentName}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={12} color={colors.text + "60"} />
          <Text style={[styles.meta, { color: colors.text + "60" }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );

  const sortedRatings = getSortedRatings();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Lecturer Ratings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text + "60" }]}>
          Student feedback and evaluations
        </Text>
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>Overall Average</Text>
          <Text style={styles.summaryValue}>{average}</Text>
          <View style={styles.summaryStars}>{renderStars(Math.round(average))}</View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRight}>
          <Text style={styles.summaryLabel}>Total Feedback</Text>
          <Text style={styles.summaryCount}>{ratings.length}</Text>
          <Text style={styles.summarySubtext}>reviews</Text>
        </View>
      </View>

      <View style={styles.sortContainer}>
        <Text style={[styles.sortLabel, { color: colors.text + "60" }]}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy("latest")}
          >
            <Text style={[styles.sortButtonText, { color: sortBy === "latest" ? colors.primary : colors.text + "60" }]}>Latest</Text>
            {sortBy === "latest" && (
              <Ionicons name="checkmark" size={14} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy("highest")}
          >
            <Text style={[styles.sortButtonText, { color: sortBy === "highest" ? colors.primary : colors.text + "60" }]}>Highest</Text>
            {sortBy === "highest" && (
              <Ionicons name="checkmark" size={14} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy("lowest")}
          >
            <Text style={[styles.sortButtonText, { color: sortBy === "lowest" ? colors.primary : colors.text + "60" }]}>Lowest</Text>
            {sortBy === "lowest" && (
              <Ionicons name="checkmark" size={14} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sortedRatings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="star-outline" size={64} color={colors.text + "30"} />
              <Text style={[styles.emptyTitle, { color: colors.text + "60" }]}>No Ratings Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.text + "40" }]}>
                Students haven't submitted any ratings yet
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export default Ratings;

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
  summaryBox: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#2563eb",
  },
  summaryLeft: {
    flex: 1,
    alignItems: "center",
  },
  summaryRight: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#ffffff30",
    marginHorizontal: 16,
  },
  summaryLabel: {
    color: "#ffffff80",
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  summaryCount: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  summaryStars: {
    flexDirection: "row",
    marginTop: 4,
  },
  summarySubtext: {
    color: "#ffffff80",
    fontSize: 11,
    marginTop: 2,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  sortLabel: {
    fontSize: 13,
  },
  sortButtons: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "500",
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
    marginBottom: 8,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lecturerName: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 11,
    marginLeft: 4,
  },
  commentBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 10,
  },
  comment: {
    fontSize: 13,
    flex: 1,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  meta: {
    fontSize: 11,
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