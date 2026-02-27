import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TaskType = "Suspect" | "Prospect" | "Client";
type FilterType = "None" | "Date" | "Activity";

export default function TaskScreen() {
  const [selectedType, setSelectedType] = useState<TaskType>("Suspect");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("None");

  const data = {
    Suspect: [
      { id: "1", name: "Rahul Sharma", contact: "9876543210", activity: "Call", date: "2026-02-25" },
      { id: "2", name: "Aman Gupta", contact: "9123456780", activity: "Email", date: "2026-02-24" },
    ],
    Prospect: [
      { id: "3", name: "Neha Verma", contact: "9988776655", activity: "Demo", date: "2026-02-23" },
    ],
    Client: [
      { id: "4", name: "Sunvora Pvt Ltd", contact: "support@sunvora.com", activity: "Renewal", date: "2026-02-22" },
    ],
  };

  /* 🔎 Search + Filter Logic */
  const filteredData = useMemo(() => {
    let result = data[selectedType];

    // Search filtering
    if (search.trim()) {
      result = result.filter(
        (item) =>
          item.id.toLowerCase().includes(search.toLowerCase()) ||
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.contact.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by filter
    if (filterType === "Date") {
      result = [...result].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    if (filterType === "Activity") {
      result = [...result].sort((a, b) =>
        a.activity.localeCompare(b.activity)
      );
    }

    return result;
  }, [search, selectedType, filterType]);

  return (
    <View style={styles.container}>
      
      {/* Title */}
      <Text style={styles.heading}>Tasks</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(["Suspect", "Prospect", "Client"] as TaskType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tabButton,
              selectedType === type && styles.activeTab,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.tabText,
                selectedType === type && styles.activeTabText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

       {/* 🔍 Search + Filter Row */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search by ID, Name, Contact"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <TouchableOpacity
          style={styles.filterIcon}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Ionicons name="funnel-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* ☰ Filter Dropdown */}
      {showFilter && (
        <View style={styles.filterBox}>
          <TouchableOpacity
            onPress={() => {
              setFilterType("Date");
              setShowFilter(false);
            }}
          >
            <Text style={styles.filterOption}>Date Wise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setFilterType("Activity");
              setShowFilter(false);
            }}
          >
            <Text style={styles.filterOption}>Activity Wise</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, { flex: 0.5 }]}>ID</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Name</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Contact</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Activity</Text>
      </View>

      {/* Table Data */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={[styles.cell, { flex: 0.5 }]}>{item.id}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{item.name}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{item.contact}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{item.activity}</Text>
          </View>
        )}
      />
    </View>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 15 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  filterIcon: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },

  filterBox: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
  },

  filterOption: {
    paddingVertical: 8,
    fontWeight: "600",
  },

  tabContainer: { flexDirection: "row", marginBottom: 15 },

  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },

  activeTab: { backgroundColor: "#2563EB" },

  tabText: { fontSize: 14, fontWeight: "600", color: "#333" },

  activeTabText: { color: "#fff" },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#F1F5F9",
  },

  headerText: { fontWeight: "700", fontSize: 13 },

  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#E5E7EB",
  },

  cell: { fontSize: 13 },
});