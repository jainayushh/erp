import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
    Alert,
    TextInput,
    TouchableOpacity,
} from "react-native";

const BASE_URL = "https://sunvoracrm.berisphere.com";

interface LeaveItem {
    id: number;
    emp_id: string;
    name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    applied_on: string;
}

export default function LeaveManagement() {
    const [loading, setLoading] = useState(true);
    const [leaves, setLeaves] = useState<LeaveItem[]>([]);
    const [showPicker, setShowPicker] = useState<"start" | "end" | null>(null);
    const [applyOpen, setApplyOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
    });

    const totalLeaves = leaves.length;

    const casualLeaves = leaves.filter(
        (l) => l.leave_type.toLowerCase() === "casual"
    ).length;

    const sickLeaves = leaves.filter(
        (l) => l.leave_type.toLowerCase() === "sick"
    ).length;



    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/leave/get`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const json = await res.json();
            console.log("📄 Leave API Response:", json);

            if (json.status === "success") {
                setLeaves(json.data?.data || []);
            }
        } catch (error) {
            console.log("❌ Leave Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateForApi = (date: Date) =>
        date.toISOString().split("T")[0];

    const applyLeave = async () => {
        if (!form.leave_type || !form.start_date || !form.end_date || !form.reason) {
            alert("All fields are required");
            return;
        }

        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/leave/apply`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const json = await res.json();
            console.log("✅ Apply Leave Response:", json);

            if (json.status === "success") {
                alert("Leave applied successfully");
                setApplyOpen(false);
                setForm({
                    leave_type: "",
                    start_date: "",
                    end_date: "",
                    reason: "",
                });
                fetchLeaves(); // 🔄 refresh list
            } else {
                alert("Failed to apply leave");
            }
        } catch (error) {
            console.log("❌ Apply Leave Error:", error);
            alert("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const cancelLeave = async (leaveId: number) => {
        Alert.alert(
            "Cancel Leave",
            "Are you sure you want to cancel this leave?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");

                            const res = await fetch(
                                `${BASE_URL}/leave/cancel/${leaveId}`,
                                {
                                    method: "PUT",
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        Accept: "application/json",
                                    },
                                }
                            );

                            const json = await res.json();
                            console.log("🗑️ Cancel Leave Response:", json);

                            if (json.status === "success") {
                                alert("Leave cancelled successfully");
                                fetchLeaves(); // 🔄 refresh list
                            } else {
                                alert("Failed to cancel leave");
                            }
                        } catch (error) {
                            console.log("❌ Cancel Leave Error:", error);
                            alert("Something went wrong");
                        }
                    },
                },
            ]
        );
    };


    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const statusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "#2e7d32";
            case "cancelled":
                return "#d32f2f";
            default:
                return "#f9a825";
        }
    };

    const renderItem = ({ item }: { item: LeaveItem }) => (
        <View style={styles.card}>
            <View style={styles.rowBetween}>
                <Text style={styles.name}>{item.name}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text style={[styles.status, { color: statusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>

                    {/* ❌ Disable delete if already cancelled */}
                    {item.status !== "cancelled" && (
                        <TouchableOpacity onPress={() => cancelLeave(item.id)}>
                            <Ionicons name="trash-outline" size={18} color="#d32f2f" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>


            <Text style={styles.label}>
                Leave Type: <Text style={styles.value}>{item.leave_type}</Text>
            </Text>

            <Text style={styles.label}>
                Date:{" "}
                <Text style={styles.value}>
                    {formatDate(item.start_date)} → {formatDate(item.end_date)}
                </Text>
            </Text>

            <Text style={styles.label}>
                Reason: <Text style={styles.value}>{item.reason}</Text>
            </Text>

            <Text style={styles.applied}>
                Applied on {formatDate(item.applied_on)}
            </Text>
        </View>
    );

    // 🔄 Loader
    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // 📭 Empty state
    if (!leaves.length) {
        return (
            <View style={styles.loader}>
                <Text>No leave records found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Leave Management</Text>
            <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setApplyOpen(true)}
            >
                <Text style={styles.applyText}>+ Apply Leave</Text>
            </TouchableOpacity>
            {/* 📊 Leave Summary */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Leaves:</Text>
                    <Text style={styles.summaryValue}>
                        {totalLeaves}
                    </Text>
                </View>

                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Casual Leaves:</Text>
                    <Text style={styles.summaryValue}>
                        {casualLeaves}
                    </Text>
                </View>

                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Sick Leaves:</Text>
                    <Text style={styles.summaryValue}>
                        {sickLeaves}
                    </Text>
                </View>
            </View>
            <FlatList
                data={leaves}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
            {applyOpen && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Apply Leave</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Leave Type (e.g. Casual)"
                            value={form.leave_type}
                            onChangeText={(v) => setForm({ ...form, leave_type: v })}
                        />

                        {/* START DATE */}
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowPicker("start")}
                        >
                            <Text>
                                {form.start_date ? form.start_date : "Select Start Date"}
                            </Text>
                        </TouchableOpacity>

                        {/* END DATE */}
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowPicker("end")}
                        >
                            <Text>
                                {form.end_date ? form.end_date : "Select End Date"}
                            </Text>
                        </TouchableOpacity>


                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            placeholder="Reason"
                            multiline
                            value={form.reason}
                            onChangeText={(v) => setForm({ ...form, reason: v })}
                        />

                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={applyLeave}
                            disabled={submitting}
                        >
                            <Text style={styles.submitText}>
                                {submitting ? "Submitting..." : "Submit"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setApplyOpen(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {showPicker && (
                <DateTimePicker
                    value={
                        showPicker === "start" && form.start_date
                            ? new Date(form.start_date)
                            : showPicker === "end" && form.end_date
                                ? new Date(form.end_date)
                                : new Date()
                    }
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                        setShowPicker(null);

                        if (event.type === "dismissed" || !selectedDate) return;

                        const formatted = formatDateForApi(selectedDate);

                        setForm((prev) => ({
                            ...prev,
                            [showPicker === "start" ? "start_date" : "end_date"]: formatted,
                        }));
                    }}
                />
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        elevation: 2,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    name: {
        fontSize: 15,
        fontWeight: "700",
    },
    status: {
        fontSize: 12,
        fontWeight: "700",
    },
    label: {
        fontSize: 13,
        color: "#555",
        marginTop: 4,
    },
    value: {
        color: "#111",
        fontWeight: "600",
    },
    applied: {
        fontSize: 11,
        color: "#777",
        marginTop: 6,
        textAlign: "right",
    },
    applyBtn: {
        backgroundColor: "#000",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    applyText: {
        color: "#fff",
        fontWeight: "700",
    },
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
    submitBtn: {
        backgroundColor: "#007bff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    submitText: {
        color: "#fff",
        fontWeight: "700",
    },
    cancelText: {
        textAlign: "center",
        color: "#777",
        marginTop: 10,
    },
    summaryCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 2,
    },

    summaryItem: {
        alignItems: "center",
    },

    summaryLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1e3a8a",
    },

    summaryValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111",
        marginTop: 4,
    },
});
