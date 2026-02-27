import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Href, router } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import React, { useEffect, useState, useContext } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

// ❌ Removed user from props
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [crmOpen, setCrmOpen] = useState(false);
  const [hrmsOpen, setHrmsOpen] = useState(false);
  const { setAuthenticated } = useContext(AuthContext);
  // ✅ Only one user state
  const [user, setUser] = useState({ name: "", email: "" });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(open ? 0 : -260, { duration: 300 }) },
    ],
  }));

  const goTo = (path: Href) => {
    onClose();
    router.push(path);
  };

  // 🟢 Fetch user from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          console.log("No token found");
          return;
        }

        const res = await axios.get("https://sunvoracrm.berisphere.com/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API RESPONSE:", res.data); // DEBUG LOG

        const personal = res.data?.data?.personal_details;

        if (!personal) {
          console.log("❌ personal_details not found");
          return;
        }

        setUser({
          name: `${personal.first_name || ""} ${personal.last_name || ""}`.trim(),
          email: personal.email || "No Email",
        });

        await AsyncStorage.setItem("user", JSON.stringify(personal));


      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      {open && <TouchableOpacity style={styles.overlay} onPress={onClose} />}

      <Animated.View style={[styles.sidebar, animatedStyles]}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Sunvore ERP</Text>
        <View style={styles.divider} />

        {/* USER INFO */}
        <TouchableOpacity
          onPress={() => {
            onClose();
            router.push("/(drawer)/(tabs)/profile");
          }}
        >
          <Text style={styles.userText}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          <SidebarItem icon="home-outline" label="Dashboard" onPress={() => goTo("/(drawer)/(tabs)")} />
          {/* HRMS */}
          <TouchableOpacity
            style={styles.item}
            onPress={() => setHrmsOpen(!hrmsOpen)}
          >
            <View style={styles.row}>
              <Ionicons name="people-outline" size={20} color="#555" />
              <Text style={styles.itemText}>HRMS</Text>
            </View>
            <Ionicons
              name={hrmsOpen ? "chevron-down" : "chevron-forward"}
              size={16}
              color="#999"
            />
          </TouchableOpacity>

          {hrmsOpen && (
            <View style={styles.submenu}>
              <SubItem
                label="Leave Management"
                onPress={() => goTo("/(drawer)/(tabs)/hrms/leave")}
              />
            </View>
          )}

          {/* <SidebarItem icon="cash-outline" label="Finance" onPress={() => goTo("/(drawer)/(tabs)/finance")} /> */}

          {/* CRM */}
          <TouchableOpacity style={styles.item} onPress={() => setCrmOpen(!crmOpen)}>
            <View style={styles.row}>
              <Ionicons name="chatbubbles-outline" size={20} color="#555" />
              <Text style={styles.itemText}>CRM</Text>
            </View>
            <Ionicons name={crmOpen ? "chevron-down" : "chevron-forward"} size={16} color="#999" />
          </TouchableOpacity>

          {crmOpen && (
            <View style={styles.submenu}>
              <SubItem label="Lead Management" onPress={() => goTo("/(drawer)/(tabs)/crm/lead")} />
              <SubItem label="Quotation" onPress={() => goTo("/(drawer)/(tabs)/Quotations")} />
            </View>
          )}

          {/* <SidebarItem icon="stats-chart-outline" label="Reports" onPress={() => goTo("/(drawer)/(tabs)/reports")} /> */}
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.divider} />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btn}><Text>Settings</Text></TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={async () => {
                await AsyncStorage.multiRemove([
                  "token",
                  "isLoggedIn",
                  "loginAt",
                ]);

                setAuthenticated(false);
                router.replace("/(auth)/sign-in");
              }}
            >
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const SidebarItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color="#555" />
      <Text style={styles.itemText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#999" />
  </TouchableOpacity>
);

const SubItem = ({ label, onPress }) => (
  <TouchableOpacity style={styles.subItem} onPress={onPress}>
    <Text style={styles.subItemText}>• {label}</Text>
  </TouchableOpacity>
);

// styles unchanged...


const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: 260,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 15,
    elevation: 20,
    zIndex: 999,
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 10,
    padding: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    width: "100%",
    marginVertical: 15,
  },
  userText: {
    fontWeight: "700",
    fontSize: 16,
  },
  email: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 0.3,
    borderColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemText: {
    marginLeft: 12,
    fontSize: 16,
  },
  submenu: {
    backgroundColor: "#f9f9f9",
    paddingLeft: 25,
    paddingVertical: 5,
  },
  subItem: {
    paddingVertical: 8,
  },
  subItemText: {
    fontSize: 14,
    color: "#444",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 15,
    right: 15,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
});
