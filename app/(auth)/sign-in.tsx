// app/(auth)/sign-in.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Button } from "react-native-paper";
const { width } = Dimensions.get("window");
export default function SignInScreen() {
  const router = useRouter();
  const { setAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const LOGIN_URL = "https://sunvoracrm.berisphere.com/auth/login";

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setLoading(false);
        Alert.alert("Login Failed", result?.detail || "Invalid credentials");
        return;
      }

      const { access_token, refresh_token, role } = result?.data || {};

      // ❌ BLOCK ADMIN LOGIN
      if (role !== "user") {
        setLoading(false);
        Alert.alert(
          "Access Denied",
          "Admin accounts are not allowed to login in this app."
        );
        return;
      }

      if (!access_token) {
        setLoading(false);
        Alert.alert("Error", "Token not received from server");
        return;
      }

      await AsyncStorage.multiSet([
        ["token", access_token],
        ["role", role],
        ["isLoggedIn", "true"],
        ["loginAt", Date.now().toString()],
      ]);

      // 🔥 fetch & store user
      const userRes = await fetch("https://sunvoracrm.berisphere.com/users/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (userRes.ok) {
        const userJson = await userRes.json();
        await AsyncStorage.setItem("user", JSON.stringify(userJson.data));
      }

      setAuthenticated(true);
      router.replace("/(drawer)");


    } catch (error) {
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };



  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/berisphere-logo.png")}
              style={styles.logo}
            />

            <Text style={styles.appTitle}>Berisphere</Text>
            <Text style={styles.subtitle}>
              Enterprise Resource Planning
            </Text>
          </View>

          {/* LOGIN CARD */}
          <View style={styles.card}>
            <Text style={styles.welcome}>Welcome Back</Text>
            <Text style={styles.description}>
              Enter your credentials to access your account
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="name@company.com"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={{ marginLeft: 10 }}>
                  {showPassword ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* SIGN IN BUTTON */}
            <LinearGradient
              colors={["#000428", "#004e92"]}
              style={styles.signInButton}
            >
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signInText}>
                  {loading ? "Signing In..." : "Sign In →"}
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity
              onPress={() =>
                router.push("/(auth)/forgot-password")
              }
            >
              <Text style={styles.forgotPassword}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
 header: {
  alignItems: "center",
  marginTop: 20,
  marginBottom: 10,
  // backgroundColor: "#0f172a",
  paddingVertical: 20,
  borderBottomLeftRadius: 25,
  borderBottomRightRadius: 25,  
},
  image: { width: 200, height: 120, marginBottom: 20 },
  form: {
    flex: 1.3,
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#555555",
    paddingVertical: 8,
    borderRadius: 6,
  },
  // logoBox: {
  //   width: 10,
  //   height: 10,
  //   backgroundColor: "#0f172a",
  //   borderRadius: 15,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginBottom: 15,
  // },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
  fontSize: 14,
  color: "#ddd",
  marginTop: 2,
},
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  smallText: {
    fontSize: 13,
    color: "#777",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eye: {
    marginLeft: 10,
    fontSize: 18,
  },
  signInButton: {
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  signInText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    textAlign: "right",
    marginTop: 15,
    color: "#004e92",
    fontSize: 13,
  },
  logo: {
  width: width * 0.55,
  height: width * 0.55,
  resizeMode: "contain",
  marginBottom: 5,
},
  appTitle: {
  fontSize: 30,
  fontWeight: "700",
  color: "#fff",
},
});
