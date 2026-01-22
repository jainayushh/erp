import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";

const BASE_URL = "https://sunvoracrm.berisphere.com";

export default function QuotationPreviewScreen() {
  const { leadId } = useLocalSearchParams<{ leadId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [preference, setPreference] = useState<any>(null);

  useEffect(() => {
    if (!leadId) return;
    checkClientPreference();
  }, [leadId]);

  const checkClientPreference = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/pricing/client_preference?prospect_id=${leadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      console.log("✅ Client Preference Response:", data);

      if (data.status === "success" && data.data) {
        setPreference(data.data);
      } else {
        router.replace({
          pathname: "/components/PriceCalculator",
          params: { prospectId: leadId },
        });
      }
    } catch (error) {
      console.log("❌ Preference Check Error:", error);
      router.replace({
        pathname: "/components/PriceCalculator",
        params: { prospectId: leadId },
      });
    } finally {
      setLoading(false);
    }
  };
  const calculateTotalCost = (p: any) => {
  return (
    (Number(p.plan_cost) || 0) +
    (Number(p.project_cost) || 0) +
    (Number(p.pannel_cost) || 0) +
    (Number(p.inverter_cost) || 0) +
    (Number(p.structure_cost) || 0) +
    (Number(p.wire_cost) || 0) +
    (Number(p.box_cost) || 0) +
    (Number(p.earthing_cost) || 0) +
    (Number(p.anchoring_cost) || 0)
  );
};


  const InfoRow = ({ label, value }: { label: string; value: any }) => {
  if (value === null || value === undefined || value === "") return null;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
    </View>
  );
};


  // 🔄 Loader
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🚫 Safety check (redirect already triggered)
  if (!preference) {
    return null;
  }
  const totalCost = calculateTotalCost(preference);

  // ✅ Render preference UI
  return (
  <>
    <Stack.Screen options={{ title: "Client Preference" }} />

    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Client Preference</Text>

      <View style={styles.card}>

        {/* 🔹 PLAN */}
        <Text style={styles.section}>Plan Details</Text>
        <InfoRow label="Plan" value={preference.plan} />
        <InfoRow label="Plan Cost (₹)" value={preference.plan_cost} />

        {/* 🔹 PROJECT */}
        <Text style={styles.section}>Project Details</Text>
        <InfoRow label="Project Size" value={preference.project_size} />
        <InfoRow label="Project Cost (₹)" value={preference.project_cost} />

        {/* 🔹 PANEL */}
        <Text style={styles.section}>Panel Details</Text>
        <InfoRow label="Manufacturer" value={preference.pannel_manufacturer} />
        <InfoRow label="Capacity" value={preference.pannel_capacity} />
        <InfoRow label="Type" value={preference.pannel_type} />
        <InfoRow label="Panel Cost (₹)" value={preference.pannel_cost} />

        {/* 🔹 INVERTER */}
        <Text style={styles.section}>Inverter Details</Text>
        <InfoRow label="Brand" value={preference.inverter_brand} />
        <InfoRow label="Capacity" value={preference.inverter_capacity} />
        <InfoRow label="Inverter Cost (₹)" value={preference.inverter_cost} />

        {/* 🔹 STRUCTURE */}
        <Text style={styles.section}>Structure Details</Text>
        <InfoRow label="Structure Type" value={preference.structure_type} />
        <InfoRow label="Structure" value={preference.structure} />
        <InfoRow label="Structure Cost (₹)" value={preference.structure_cost} />

        {/* 🔹 WIRING */}
        <Text style={styles.section}>Wiring Details</Text>
        <InfoRow label="Wire Manufacturer" value={preference.wire_manufacturer} />
        <InfoRow label="Thickness" value={preference.wire_thickness} />
        <InfoRow label="Length" value={preference.wire_length} />
        <InfoRow label="Wire Cost (₹)" value={preference.wire_cost} />

        {/* 🔹 AC/DC BOX */}
        <Text style={styles.section}>AC/DC Box</Text>
        <InfoRow label="Box Type" value={preference.ac_dc_box} />
        <InfoRow label="Box Cost (₹)" value={preference.box_cost} />

        {/* 🔹 EARTHING */}
        <Text style={styles.section}>Earthing</Text>
        <InfoRow label="Type" value={preference.earthing} />
        <InfoRow label="Cost (₹)" value={preference.earthing_cost} />

        {/* 🔹 CHEMICAL ANCHORING */}
        <Text style={styles.section}>Chemical Anchoring</Text>
        <InfoRow label="Type" value={preference.chemical_anchoring} />
        <InfoRow label="Cost (₹)" value={preference.anchoring_cost} />

    <Text style={styles.totalLabel}>Total Estimated Cost</Text>
<Text style={styles.totalValue}>₹ {totalCost.toLocaleString("en-IN")}</Text>

      </View>
    </ScrollView>
  </>
);

}


const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginTop: 40,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  card: {
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 16,
  elevation: 3,
},
row: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: 6,
},
section: {
  fontSize: 15,
  fontWeight: "700",
  marginTop: 16,
  marginBottom: 6,
  color: "#000",
},
label: {
  fontSize: 13,
  color: "#555",
  width: "55%",
},
value: {
  fontSize: 13,
  color: "#111",
  width: "45%",
  textAlign: "right",
},
totalLabel: {
  fontSize: 14,
  color: "#666",
  marginTop: 10,
},
totalValue: {
  fontSize: 20,
  fontWeight: "800",
  color: "#2e7d32", // green
  marginBottom: 12,
},


});



