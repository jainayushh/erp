import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import "react-native-reanimated";
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';


interface SidebarProps {
  open: boolean;
  onClose: () => void;
}


export default function Sidebar({ open, onClose }: SidebarProps) {
  console.log("Sidebar open state:", open);
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(open ? 0 : -260, { duration: 300 }) }],
  }));

  const goTo = (path: Href) => {
    onClose(); // close drawer first
    router.push(path); // navigate
  };

  return (
    <>
      {open && <TouchableOpacity style={styles.overlay} onPress={onClose} />}

      <Animated.View style={[styles.sidebar, animatedStyles]}>
        <TouchableOpacity
    onPress={onClose}
    style={{
      position: "absolute",
      top: 20,
      right: 10,
      padding: 8,
      zIndex: 1000,
    }}
  >
    <Ionicons name="close" size={26} color="#333" />
  </TouchableOpacity>
        <Text style={styles.title}>Simplify</Text>
        <View style={styles.divider} />
        <View style={styles.menuGroup}>
          <SidebarItem
            icon="home-outline"
            label="Dashboard"
            onPress={() => goTo("/(drawer)/(tabs)")}
          />

          <SidebarItem
            icon="people-outline"
            label="HRMS"
            onPress={() => goTo("/(drawer)/(tabs)/hrms")}
          />

          <SidebarItem
            icon="cash-outline"
            label="Finance"
            onPress={() => goTo("/(drawer)/(tabs)/finance")}
          />

          <SidebarItem
            icon="cube-outline"
            label="Inventory"
            onPress={() => goTo("/(drawer)/(tabs)/inventory")}
          />

          <SidebarItem
            icon="briefcase-outline"
            label="Project Mgmt"
            onPress={() => goTo("/(drawer)/(tabs)/more")} // example
          />

          <SidebarItem
            icon="chatbubbles-outline"
            label="CRM"
            onPress={() => goTo("/(tabs)/crm")} // if you create crm.tsx
          />

          <SidebarItem
            icon="trending-up-outline"
            label="Sales"
            onPress={() => goTo("/(tabs)/sales")} // example
          />

          <SidebarItem
            icon="stats-chart-outline"
            label="Reports"
            onPress={() => goTo("/(tabs)/reports")} // example
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.divider} />
          <TouchableOpacity
  onPress={() => {
    onClose();
    router.push("/(drawer)/(tabs)/profile")
  }} 
  style={{ marginBottom: 10 }}
>
  <Text style={styles.user}>Admin User</Text>
  <Text style={styles.email}>admin@simplify.com</Text>
</TouchableOpacity>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btn}>
              <Text>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn}>
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

// ✔ Menu Item with navigation
const SidebarItem = ({ icon, label, onPress }: {
  icon: string;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons name={icon} size={20} color="#555" />
      <Text style={styles.itemText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#999" />
  </TouchableOpacity>
);

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
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
  divider: {
  height: 1,
  backgroundColor: "#ddd",
  width: "100%",
  marginBottom: 20,
},
  menuGroup: {
    flex: 1,
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
  footer: {
    paddingVertical: 20,
  },
  user: {
    fontWeight: "700",
  },
  email: {
    fontSize: 12,
    color: "#666",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
});
