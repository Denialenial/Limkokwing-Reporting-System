import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

export default function SearchBar({ onSearch, placeholder = "Search..." }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  const handleSearch = (text) => {
    setQuery(text);
    onSearch(text);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="search-outline" size={20} color={colors.text + "60"} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.text + "60"}
        value={query}
        onChangeText={handleSearch}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={clearSearch}>
          <Ionicons name="close-circle" size={20} color={colors.text + "60"} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
});