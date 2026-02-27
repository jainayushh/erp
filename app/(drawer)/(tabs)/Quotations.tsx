import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = "https://sunvoracrm.berisphere.com/pricing/request/quotation";

type Quotation = {
    id: number;
    prospect_id: number;
    name: string;
    phone: string;
    source: string;
    discount: number;
    status: boolean;
};

export default function QuotationsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [filtered, setFiltered] = useState<Quotation[]>([]);

    useEffect(() => {
        fetchQuotations();
    }, []);

    useEffect(() => {
        handleSearch(search);
    }, [search, quotations]);

    const fetchQuotations = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return;

            const res = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await res.json();
            setQuotations(json.data || []);
            setFiltered(json.data || []);
        } catch (err) {
            console.log("Quotation fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // const isApproved = item.status === true;

    const handleSearch = (text: string) => {
        const value = text.toLowerCase();
        setFiltered(
            quotations.filter(
                (q) =>
                    q.name?.toLowerCase().includes(value) ||
                    q.phone?.includes(value) ||
                    q.source?.toLowerCase().includes(value) ||
                    String(q.id).includes(value) ||
                    String(q.prospect_id).includes(value)
            )
        );
    };

    const renderItem = ({ item }: { item: Quotation }) => {
  const isApproved = item.status === true;

  const handleDownload = () => {
    // 🔗 replace with your real API / file URL
    console.log("Downloading quotation:", item.id);
  };

  return (
    <View style={styles.row}>
      <Text style={styles.cell}>#{item.id}</Text>
      <Text style={styles.cell}>{item.prospect_id}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.phone}</Text>
      <Text style={styles.cell}>{item.source}</Text>
      <Text style={styles.cell}>{item.discount}%</Text>

      {/* STATUS */}
      <View style={styles.statusCell}>
        <Text
          style={[
            styles.statusBadge,
            isApproved ? styles.approved : styles.pending,
          ]}
        >
          {isApproved ? "Approved" : "Pending"}
        </Text>
      </View>

      {/* ACTION (VIEW) */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          !isApproved && styles.disabledAction,
        ]}
        disabled={!isApproved}
        onPress={() =>
          router.push({
            pathname: "/(drawer)/quotation-detail",
            params: { id: item.id },
          })
        }
      >
        <Ionicons
          name="eye-outline"
          size={18}
          color={isApproved ? "#2563EB" : "#9CA3AF"}
        />
      </TouchableOpacity>

      {/* 🔽 DOWNLOAD */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          !isApproved && styles.disabledAction,
        ]}
        disabled={!isApproved}
        onPress={handleDownload}
      >
        <Ionicons
          name="download-outline"
          size={18}
          color={isApproved ? "#16A34A" : "#9CA3AF"}
        />
      </TouchableOpacity>
    </View>
  );
};



    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <Text style={styles.title}>Quotation Management</Text>
            <Text style={styles.subtitle}>
                View and manage quotation requests
            </Text>

            {/* Search */}
            <TextInput
                placeholder="Search by name, phone, source, ID, or Prospect ID..."
                value={search}
                onChangeText={setSearch}
                style={styles.search}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {/* Header */}
                    <View style={[styles.row, styles.headerRow]}>
                        <Text style={styles.headerCell}>ID</Text>
                        <Text style={styles.headerCell}>Prospect</Text>
                        <Text style={styles.headerCell}>Name</Text>
                        <Text style={styles.headerCell}>Phone</Text>
                        <Text style={styles.headerCell}>Source</Text>
                        <Text style={styles.headerCell}>Discount</Text>
                        <Text style={styles.headerCell}>Status</Text>
                        <Text style={styles.headerCell}>Action</Text>
                        <Text style={styles.headerCell}>Download</Text>

                    </View>

                    {/* Rows */}
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        scrollEnabled={true} // IMPORTANT
                    />
                </View>
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111",
    },
    subtitle: {
        fontSize: 13,
        color: "#666",
        marginBottom: 12,
    },
    search: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 12,
    },
    headerRow: {
        backgroundColor: "#E5E7EB",
        borderRadius: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        marginBottom: 6,
        backgroundColor: "#fff",
        borderRadius: 8,
    },
    cell: {
        width: 110,
        fontSize: 12,
        textAlign: "center",
    },
    headerCell: {
        width: 110,
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
    },
    statusCell: {
        width: 110,
        alignItems: "center",
    },
    statusBadge: {
        backgroundColor: "#FEF9C3",
        color: "#92400E",
        fontSize: 11,
        fontWeight: "700",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        overflow: "hidden",
    },
    actionBtn: {
        width: 110,
        alignItems: "center",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    approved: {
        backgroundColor: "#DCFCE7",
        color: "#166534",
    },
    pending: {
        backgroundColor: "#FEF9C3",
        color: "#92400E",
    },
    disabledAction: {
        opacity: 0.4,
    },

});
