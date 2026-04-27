import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, ScrollView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getCourseById } from "../services/attendanceService";

function ProfileComponent({ user }) {
  const { colors } = useTheme();
  const [coursesWithNames, setCoursesWithNames] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (user?.role === "student" && user?.courses?.length > 0) {
      loadCourseNames();
    }
  }, [user]);

  const loadCourseNames = async () => {
    setLoadingCourses(true);
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
    
    setCoursesWithNames(courseResults.filter(Boolean));
    setLoadingCourses(false);
  };

  if (!user) return null;

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={colors.text + "60"} />
        <Text style={[styles.label, { color: colors.text + "70" }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
        {value || "N/A"}
      </Text>
    </View>
  );

  const renderCourseItem = ({ item }) => (
    <View style={[styles.courseItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.courseIcon}>
        <Ionicons name="book-outline" size={18} color={colors.text + "60"} />
      </View>
      <View style={styles.courseInfo}>
        <Text style={[styles.courseName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.courseCode, { color: colors.text + "60" }]}>{item.code}</Text>
      </View>
    </View>
  );

  const getRoleIcon = () => {
    switch(user.role) {
      case "student": return "school-outline";
      case "lecturer": return "person-outline";
      case "pl": return "people-outline";
      case "prl": return "business-outline";
      default: return "person-circle-outline";
    }
  };

  const getRoleTitle = () => {
    switch(user.role) {
      case "student": return "Student";
      case "lecturer": return "Lecturer";
      case "pl": return "Program Leader";
      case "prl": return "Principal Lecturer";
      default: return "User";
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.background }]}>
          <Ionicons name={getRoleIcon()} size={50} color={colors.text + "80"} />
        </View>
        
        <Text style={[styles.name, { color: colors.text }]}>
          {user.name}
        </Text>
        
        <View style={styles.roleBadge}>
          <Ionicons name={getRoleIcon()} size={14} color={colors.text + "60"} />
          <Text style={[styles.roleText, { color: colors.text + "60" }]}>
            {getRoleTitle()}
          </Text>
        </View>
        
        <Text style={[styles.email, { color: colors.text + "50" }]}>
          {user.email}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={20} color={colors.text + "60"} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
        </View>
        
        <InfoRow icon="call-outline" label="Phone" value={user.phone} />
        <InfoRow icon="male-female-outline" label="Gender" value={user.gender} />
        <InfoRow icon="business-outline" label="Faculty" value={user.faculty} />
      </View>

      {user.role === "student" && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={20} color={colors.text + "60"} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Academic Information</Text>
          </View>
          
          <InfoRow icon="bookmark-outline" label="Program" value={user.program} />
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.coursesHeader}>
            <Text style={[styles.coursesTitle, { color: colors.text }]}>
              Enrolled Courses ({coursesWithNames.length})
            </Text>
          </View>
          
          {loadingCourses ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : coursesWithNames.length === 0 ? (
            <View style={styles.emptyCourses}>
              <Ionicons name="book-outline" size={40} color={colors.text + "30"} />
              <Text style={[styles.noCourses, { color: colors.text + "60" }]}>
                No courses enrolled yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={coursesWithNames}
              keyExtractor={(item) => item.id}
              renderItem={renderCourseItem}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {user.role === "lecturer" && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={20} color={colors.text + "60"} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lecturer Information</Text>
          </View>
          
          <InfoRow icon="card-outline" label="Lecturer Number" value={user.lecturerNumber || "N/A"} />
          <InfoRow icon="mail-outline" label="Email" value={user.email} />
        </View>
      )}

      {(user.role === "pl" || user.role === "prl") && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={20} color={colors.text + "60"} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {user.role === "pl" ? "Program Leader" : "Principal Lecturer"} Information
            </Text>
          </View>
          
          <InfoRow icon="business-outline" label="Faculty" value={user.faculty} />
          <InfoRow icon="mail-outline" label="Email" value={user.email} />
        </View>
      )}
    </ScrollView>
  );
}

export default ProfileComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    margin: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "500",
  },
  email: {
    fontSize: 13,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  coursesHeader: {
    marginBottom: 12,
  },
  coursesTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  courseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  courseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "500",
  },
  courseCode: {
    fontSize: 11,
    marginTop: 2,
  },
  loader: {
    marginTop: 10,
  },
  emptyCourses: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noCourses: {
    fontSize: 13,
    marginTop: 8,
  },
});