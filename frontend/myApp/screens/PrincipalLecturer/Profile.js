import React from "react";
import { StyleSheet, View } from "react-native";
import ProfileComponent from "../../components/ProfileComponent";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <ProfileComponent user={user} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
});