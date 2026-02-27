import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const BASE_URL = "https://sunvoracrm.berisphere.com";

export default function DashboardScreen() {
  const [userName, setUserName] = useState("");
  const [prospectCount, setProspectCount] = useState<number>(0);
  const [suspectCount, setSuspectCount] = useState<number>(0);
  const [clientCount, setClientCount] = useState<number>(0);
  const router = useRouter();
  const totalLeads = prospectCount + suspectCount + clientCount;
  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        "https://sunvoracrm.berisphere.com/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) return;

      const json = await res.json();

      const firstName = json?.data?.personal_details?.first_name;
      const lastName = json?.data?.personal_details?.last_name;

      if (firstName && lastName) {
        setUserName(`${firstName} ${lastName}`);
      } else {
        setUserName("User");
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const fetchCount = async (type: string) => {
          const res = await fetch(
            `${BASE_URL}/crm/get-lead/${type}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({}), // remove if not required
            }
          );

          if (!res.ok) {
            console.log(`${type} API failed`, res.status);
            return 0;
          }

          const json = await res.json();
          return json?.data?.count ?? 0;
        };

        const [prospects, suspects, clients] = await Promise.all([
          fetchCount("Prospect"),
          fetchCount("Suspect"),
          fetchCount("Client"),
        ]);

        setProspectCount(prospects);
        setSuspectCount(suspects);
        setClientCount(clients);

      } catch (error) {
        console.log("Error fetching dashboard counts:", error);
      }
    };

    loadCounts();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.push("/(drawer)")}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.dashboardTitle}>Dashboard</Text>

        <Ionicons name="notifications-outline" size={24} color="#333" />
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.welcomeUser}>{userName || "Loading..."}</Text>
        <Text style={styles.welcomeSub}>
          Here's what's happening with your business today.
        </Text>
      </View>

      {/* Leads Section */}
      <View style={styles.leadsContainer}>
        <LeadCard
          icon="people-outline"
          color="#3B82F6"
          title="Total Leads"
          value={totalLeads}
          onPress={() =>
            router.push({
              pathname: "/(drawer)/(tabs)/crm/lead",
              params: { type: "All" },
            })
          }
        />

        <LeadCard
          icon="trending-up-outline"
          color="#10B981"
          title="Prospects"
          value={prospectCount}
          onPress={() =>
            router.push({
              pathname: "/(drawer)/(tabs)/crm/lead",
              params: { type: "Prospect" },
            })
          }
        />

        <LeadCard
          icon="call-outline"
          color="#8B5CF6"
          title="Suspects"
          value={suspectCount}
          onPress={() =>
            router.push({
              pathname: "/(drawer)/(tabs)/crm/lead",
              params: { type: "Suspect" },
            })
          }
        />

        <LeadCard
          icon="business-outline"
          color="#06B6D4"
          title="Clients"
          value={clientCount}
          onPress={() =>
            router.push({
              pathname: "/(drawer)/(tabs)/crm/lead",
              params: { type: "Client" },
            })
          }
        />

        <LeadCard
          icon="checkbox-outline"
          color="#EF4444"
          title="Tasks"
          value="0"
          onPress={() =>
            router.push("/(drawer)/(tabs)/task")
          }
        />

        <LeadCard
          icon="cash-outline"
          color="#F97316"
          title="Total Value"
          value="$440K"
        />
      </View>
    </ScrollView>
  );
}

/* Lead Card Component */
const LeadCard = ({ icon, color, title, value, onPress }: any) => (
  <TouchableOpacity style={styles.leadCard} onPress={onPress}>
    <View style={[styles.leadIconBox, { backgroundColor: color + "20" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>

    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.leadTitle}>{title}</Text>
      <Text style={styles.leadValue}>{value}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  /* Header */
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

  /* Welcome Card */
  welcomeCard: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },
  welcomeText: {
    color: "#E0ECFF",
    fontSize: 15,
  },
  welcomeUser: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2,
  },
  welcomeSub: {
    color: "#DCE7FF",
    marginTop: 6,
  },

  /* Leads */
  leadsContainer: {
    marginTop: 5,
  },

  leadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  leadIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  leadTitle: {
    fontSize: 13,
    color: "#666",
  },

  leadValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
});