// app/(auth)/forgot-password.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "react-native-paper";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your registered email address and we’ll send you a reset link.
      </Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => console.log("Reset link sent")}
      >
        SEND RESET LINK
      </Button>

      <Button
        mode="text"
        onPress={() => router.back()}
        textColor="#3B82F6"
        style={{ marginTop: 10 }}
      >
        Back to Sign In
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  title: { fontSize: 26, fontWeight: "700", color: "#3B82F6" },
  subtitle: { fontSize: 15, color: "#666", marginVertical: 10 },
  label: { color: "#555", marginBottom: 5, fontWeight: "500" },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    borderRadius: 6,
  },
});
