import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

interface UserData {
  personal_details: any;
  employment_details: any;
  bank_details: any;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/(auth)/sign-in"); 
          return;
        }

        const res = await fetch("http://82.112.238.44:8005/users/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data: UserData = await res.json();
        setUserData(data);
      } catch (err) {
        console.log("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loader}>
        <Text>Unable to load user data</Text>
      </View>
    );
  }

  const { personal_details, employment_details, bank_details } = userData;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topHeader}>
              <TouchableOpacity
                onPress={() => router.push("/(drawer)")}
                style={{ marginRight: 12 }}
              >
                <Ionicons name="menu" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.dashboardTitle}>Simplify</Text>
              <Ionicons name="notifications-outline" size={24} color="#333" />
            </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <DetailRow label="Employee ID" value={personal_details.emp_id} />
        <DetailRow label="Name" value={`${personal_details.first_name} ${personal_details.last_name}`} />
        <DetailRow label="Email" value={personal_details.email} />
        <DetailRow label="Phone" value={personal_details.phone} />
        <DetailRow label="Gender" value={personal_details.gender} />
        <DetailRow label="Date of Birth" value={personal_details.date_of_birth} />
        <DetailRow label="Current Address" value={personal_details.current_address} />
        <DetailRow label="Permanent Address" value={personal_details.permanent_address} />
        <DetailRow label="City" value={personal_details.city} />
        <DetailRow label="State" value={personal_details.state} />
        <DetailRow label="Country" value={personal_details.country} />
        <DetailRow label="Postal Code" value={personal_details.postal_code} />
        <DetailRow label="Aadhaar" value={personal_details.aadhaar} />
        <DetailRow label="PAN" value={personal_details.pan} />
        <DetailRow label="Emergency Contact" value={`${personal_details.emergency_contact_name} (${personal_details.emergency_contact_relationship})`} />
        <DetailRow label="Emergency Phone" value={personal_details.emergency_contact_phone} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Employment Details</Text>
        <DetailRow label="Designation" value={employment_details.designation} />
        <DetailRow label="Department" value={employment_details.department} />
        <DetailRow label="Employment Type" value={employment_details.employment_type} />
        <DetailRow label="Work Location" value={employment_details.work_location} />
        <DetailRow label="Date of Joining" value={employment_details.date_of_joining} />
        <DetailRow label="Reporting Manager" value={employment_details.reporting_manager || "N/A"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bank Details</Text>
        <DetailRow label="Bank Name" value={bank_details.bank_name} />
        <DetailRow label="Account Number" value={bank_details.bank_account_number} />
        <DetailRow label="IFSC Code" value={bank_details.ifsc_code} />
      </View>
    </ScrollView>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
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
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#111" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#555", fontSize: 14 },
  value: { color: "#111", fontSize: 14, fontWeight: "600" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
