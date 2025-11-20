import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import 'react-native-gesture-handler';

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.push("/(drawer)")}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.dashboardTitle}>Dashboard</Text>
        <Ionicons name="notifications-outline" size={24} color="#333" />
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.welcomeUser}>Admin User</Text>
        <Text style={styles.welcomeSub}>
          Here's what's happening with your business today.
        </Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statRow}>
        <StatCard
          icon="people"
          color="#3B82F6"
          value="130"
          label="Total Employees"
          change="+8.2%"
        />
        <StatCard
          icon="currency-rupee"
          color="#10B981"
          value="$235K"
          label="Monthly Revenue"
          change="+12.5%"
        />
      </View>

      <View style={styles.statRow}>
        <StatCard
          icon="cube"
          color="#EC4899"
          value="290"
          label="Inventory Items"
          change="-3.1%"
        />
        <StatCard
          icon="briefcase"
          color="#F97316"
          value="12"
          label="Active Projects"
          change="+5.4%"
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.quickCard}>
        <QuickAction title="New Employee" count="24" />
        <QuickAction title="Pending Invoices" count="12" />
        <QuickAction title="Low Stock Alert" count="8" />
        <QuickAction title="Active Leads" count="45" />
      </View>
    </ScrollView>
  );
}

const StatCard = ({ icon, color, value, label, change }) => (
  <View style={styles.statCard}>
    <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
      <Ionicons name={icon} size={26} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <View style={styles.statBadge}>
      <Text style={styles.statBadgeText}>{change}</Text>
    </View>
  </View>
);

const QuickAction = ({ title, count }) => (
  <TouchableOpacity style={styles.quickItem}>
    <Text style={styles.quickText}>{title}</Text>
    <Text style={styles.quickCount}>{count}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 15,
  },

  // Header
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  // Welcome Banner
  welcomeCard: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },
  welcomeText: { color: "#E0ECFF", fontSize: 15 },
  welcomeUser: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 2 },
  welcomeSub: { color: "#DCE7FF", marginTop: 6 },

  // Stats
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    position: "relative",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  statInfo: { marginTop: 10 },
  statValue: { fontSize: 20, fontWeight: "800", color: "#111" },
  statLabel: { fontSize: 13, color: "#555", marginTop: 2 },
  statBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4F46E5",
  },

  // Quick Actions
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 10,
    marginBottom: 10,
  },
  quickCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 50,
  },
  quickItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  quickText: { fontSize: 15, color: "#333" },
  quickCount: { fontSize: 15, fontWeight: "700", color: "#2563EB" },
});

