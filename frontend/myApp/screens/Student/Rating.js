import React, { useEffect, useState } from "react";
import {View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getLectures } from "../../services/dataService";
import { createRating } from "../../services/ratingService";

function Rating() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [lectures, setLectures] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    setLoading(true);
    const res = await getLectures(user.faculty);
    if (res.success) {
      setLectures(res.lectures);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setRating(0);
    setComment("");
    setSelected(null);
  };

  const submit = async () => {
    if (!selected || rating === 0) {
      Alert.alert("Error", "Please select a course and choose a rating");
      return;
    }

    setSubmitting(true);
    const res = await createRating({
      studentId: user.id,
      studentName: user.name,
      lecturerId: selected.lecturerId,
      lecturerName: selected.lecturerName,
      courseId: selected.courseId,
      courseName: selected.courseName,
      rating: Number(rating),
      comment,
    });

    if (res.success) {
      Alert.alert("Success", "Thank you for your feedback!");
      resetForm();
    } else {
      Alert.alert("Error", res.error || "Failed to submit rating");
    }
    setSubmitting(false);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7}>
            <Text style={[styles.star, { fontSize: 36 }]}>
              {i <= rating ? "⭐" : "☆"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    if (rating === 5) return "Excellent! 🌟";
    if (rating === 4) return "Very Good 👍";
    if (rating === 3) return "Average 📚";
    if (rating === 2) return "Needs Improvement ⚠️";
    if (rating === 1) return "Poor 😞";
    return "Tap a star to rate";
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Rate Your Lecturer</Text>
          <Text style={[styles.headerSubtitle, { color: colors.text + "60" }]}>
            Your feedback helps improve teaching quality
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text + "80" }]}>Select Course</Text>
          <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.pickerLoading} />
            ) : (
              <Picker
                selectedValue={selected}
                onValueChange={setSelected}
                dropdownIconColor={colors.text}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Choose a course" value={null} />
                {lectures.map((l) => (
                  <Picker.Item
                    key={l.id}
                    label={`${l.courseName} - ${l.lecturerName}`}
                    value={l}
                  />
                ))}
              </Picker>
            )}
          </View>

          {selected && (
            <View style={[styles.selectedInfo, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={[styles.selectedText, { color: colors.text }]}>
                {selected.courseName} with {selected.lecturerName}
              </Text>
            </View>
          )}

          <Text style={[styles.label, { color: colors.text + "80", marginTop: 20 }]}>Your Rating</Text>
          {renderStars()}
          <Text style={[styles.ratingHint, { color: colors.text + "60", textAlign: "center" }]}>
            {getRatingText()}
          </Text>

          <Text style={[styles.label, { color: colors.text + "80", marginTop: 20 }]}>Your Comment (Optional)</Text>
          <TextInput
            placeholder="Share your thoughts about the course and teaching..."
            placeholderTextColor={colors.text + "60"}
            value={comment}
            onChangeText={setComment}
            style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: rating > 0 ? colors.primary : colors.primary + "60" }]}
            onPress={submit}
            disabled={submitting || !selected || rating === 0}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Submit Rating</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + "40" }]}>
            Your feedback is anonymous and helps improve education quality
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default Rating;

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
  card: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  pickerBox: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  pickerLoading: {
    padding: 12,
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
  },
  selectedText: {
    fontSize: 13,
    flex: 1,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 10,
  },
  star: {
    fontSize: 36,
  },
  ratingHint: {
    fontSize: 13,
    marginTop: 5,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    fontSize: 14,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    textAlign: "center",
  },
});