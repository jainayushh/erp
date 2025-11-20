// app/(auth)/sign-in.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const LOGIN_URL = "http://82.112.238.44:8005/auth/login"; // FastAPI login endpoint

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email, // FastAPI uses "username" in OAuth2
          password: password,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        Alert.alert("Login Failed", data.detail || "Invalid credentials");
        return;
      }

      // Expected response from FastAPI:
      // { "access_token": "xxxx", "token_type": "bearer" }

      await AsyncStorage.setItem("token", data.access_token);

      router.replace("/(tabs)"); // redirect to dashboard
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Unable to connect to server");
    }
  };

  return (
    <LinearGradient colors={["#555555", "#555555"]} style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.image}
        />
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Mobile Number/Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eye}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          style={styles.button}
          loading={loading}
          onPress={handleSignIn}
        >
          SIGN IN
        </Button>

        <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 40, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 16, color: "#eef", marginTop: 4 },
  form: {
    flex: 1.3,
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  label: { color: "#555", marginBottom: 5, fontWeight: "500" },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
    paddingVertical: 8,
  },
  passwordContainer: { flexDirection: "row", alignItems: "center" },
  eye: { fontSize: 18, marginLeft: 8 },
  button: {
    marginTop: 20,
    backgroundColor: "#555555",
    paddingVertical: 8,
    borderRadius: 6,
  },
  forgotPassword: {
    textAlign: "center",
    marginTop: 10,
    color: "#555555",
  },
});
