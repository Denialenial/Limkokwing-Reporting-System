import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getRatings } from "../../services/ratingService";

function Ratings() {
  const { colors } = useTheme();
  const { user } = useAuth();
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
    const res = await getRatings(user.id);
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

  const getRatingLabel = (rating) => {
    if (rating >= 4) return "Excellent";
    if (rating >= 3) return "Good";
    if (rating >= 2) return "Average";
    return "Poor";
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "#10b981";
    if (rating >= 3) return "#f59e0b";
    return "#ef4444";
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.courseInfo}>
          <Text style={[styles.courseName, { color: colors.text }]}>{item.courseName}</Text>
          <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(item.rating) + "20" }]}>
            <Text style={[styles.ratingBadgeText, { color: getRatingColor(item.rating) }]}>{item.rating} ⭐</Text>
          </View>
        </View>
        <View style={styles.starsRow}>
          {renderStars(item.rating)}
          <Text style={[styles.ratingLabel, { color: colors.text + "80" }]}>
            {getRatingLabel(item.rating)}
          </Text>
        </View>
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

  const starDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => Math.floor(r.rating) === star).length,
    percentage: ratings.length > 0 ? (ratings.filter(r => Math.floor(r.rating) === star).length / ratings.length) * 100 : 0
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Ratings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text + "60" }]}>
          See how students rate your teaching
        </Text>
      </View>

      <View style={[styles.summaryBox, { backgroundColor: colors.primary }]}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>Your Average Rating</Text>
          <Text style={styles.summaryValue}>{average}</Text>
          <View style={styles.summaryStars}>{renderStars(Math.round(average))}</View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRight}>
          <Text style={styles.summaryLabel}>Total Reviews</Text>
          <Text style={styles.summaryCount}>{ratings.length}</Text>
          <Text style={styles.summarySubtext}>student feedbacks</Text>
        </View>
      </View>

      {ratings.length > 0 && (
        <View style={[styles.distributionBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.distributionTitle, { color: colors.text + "80" }]}>Rating Distribution</Text>
          {starDistribution.map(({ star, count, percentage }) => (
            <View key={star} style={styles.distributionRow}>
              <Text style={[styles.distributionLabel, { color: colors.text + "60" }]}>{star} ⭐</Text>
              <View style={styles.distributionBar}>
                <View style={[styles.distributionFill, { width: `${percentage}%`, backgroundColor: getRatingColor(star) }]} />
              </View>
              <Text style={[styles.distributionCount, { color: colors.text + "60" }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}

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
                Students haven't submitted any ratings for you yet
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
    padding: 20,
    borderRadius: 16,
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
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 16,
  },
  summaryLabel: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
    opacity: 0.9,
  },
  summaryValue: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  summaryCount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  summaryStars: {
    flexDirection: "row",
    marginTop: 6,
  },
  summarySubtext: {
    color: "#fff",
    fontSize: 11,
    marginTop: 2,
    opacity: 0.8,
  },
  distributionBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
  },
  distributionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  distributionLabel: {
    width: 45,
    fontSize: 12,
  },
  distributionBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  distributionFill: {
    height: "100%",
    borderRadius: 3,
  },
  distributionCount: {
    width: 35,
    fontSize: 11,
    textAlign: "right",
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
    marginBottom: 8,
  },
  courseInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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