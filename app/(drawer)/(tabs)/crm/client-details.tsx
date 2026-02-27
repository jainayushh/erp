import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://sunvoracrm.berisphere.com";

export default function ClientDetailsScreen() {
    const params = useLocalSearchParams();
    const clientId = Array.isArray(params.id) ? params.id[0] : params.id;
    const [client, setClient] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [addPaymentModal, setAddPaymentModal] = useState(false);

    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        payment_method: "",
        payment_status: "Pending",
        reference_id: "",
        notes: "",
        payment_date: "",
    });
    const Section = ({ title, children }: any) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const Row = ({ label, value }: any) => (
        <View style={styles.rowLine}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value || "-"}</Text>
        </View>
    );
    const formatDateTime = (date?: string) => {
  if (!date) return "-";

  const d = new Date(date);

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

    const submitPayment = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const payload = {
                client_id: Number(clientId),
                amount: Number(paymentForm.amount),
                payment_method: paymentForm.payment_method,
                payment_status: paymentForm.payment_status,
                reference_id: paymentForm.reference_id,
                notes: paymentForm.notes,
                payment_date: paymentForm.payment_date,
            };

            await axios.post(`${BASE_URL}/payments/`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAddPaymentModal(false);
            setPaymentForm({
                amount: "",
                payment_method: "",
                payment_status: "Pending",
                reference_id: "",
                notes: "",
                payment_date: "",
            });

            loadPayments(); // refresh table

        } catch (err) {
            console.log("❌ Add Payment Error", err);
        }
    };
    const loadClient = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.get(
      `${BASE_URL}/crm/client/${clientId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ Client Detail API:", res.data);

    const data = res.data?.data || null;

    setClient(data);

  } catch (err: any) {
    console.log("❌ Client Detail Error", err.response?.data || err.message);
  }
};

    const loadPayments = async () => {
        try {
            setLoadingPayments(true);

            const token = await AsyncStorage.getItem("token");

            const res = await axios.get(
                `${BASE_URL}/payments?client_id=${clientId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("Payment API Response:", res.data);

            const list = res.data?.data?.data || [];

            console.log("Final Payments Array:", list);

            setPayments(Array.isArray(list) ? list : []);

        } catch (err) {
            console.log("❌ Payment Load Error", err.response?.data || err.message);
        } finally {
            setLoadingPayments(false);
        }
    };
    useEffect(() => {
        loadClient();
        loadPayments();   // 🔥 automatically load payments
    }, []);

    if (!client) return <Text style={{ padding: 20 }}>Loading...</Text>;

    const assignedUser = `${client.assigned_user_first_name || ""} ${client.assigned_user_last_name || ""}`;
    const accountManager = `${client.manager_first_name || ""} ${client.manager_last_name || ""}`;
    return (
        <ScrollView style={styles.container}>

            {/* ================= CLIENT DETAILS ================= */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Client Details</Text>
                <Text>ID: {client.id}</Text>
                <Text>Name: {client.name}</Text>
                <Text>Phone: {client.phone}</Text>
                <Text>City: {client.city}</Text>
                <Text>Address: {client.address}</Text>
                <Text>Referred By: {client.referred_by}</Text>
                <Text>Date: {formatDateTime(client.created_on)}</Text>
            </View>

            {/* ================= PROJECT DETAILS ================= */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Project Details</Text>

                {/* PLAN */}
                <Section title="Plan">
                    <Row label="Plan Name" value={client.plan} />
                    <Row label="Plan Cost" value={`₹ ${client.plan_cost}`} />
                </Section>

                {/* PROJECT SIZE */}
                <Section title="Project Size">
                    <Row label="Size" value={client.project_size} />
                    <Row label="Size Cost" value={`₹ ${client.project_size_cost}`} />
                </Section>

                {/* PANEL */}
                <Section title="Panel">
                    <Row label="Manufacturer" value={client.pannel_manufacturer} />
                    <Row label="Capacity" value={client.pannel_capacity} />
                    <Row label="Type" value={client.pannel_type} />
                    <Row label="Cost" value={`₹ ${client.pannel_cost}`} />
                </Section>

                {/* INVERTER */}
                <Section title="Inverter">
                    <Row label="Brand" value={client.inverter_brand} />
                    <Row label="Capacity" value={client.inverter_capacity} />
                    <Row label="Cost" value={`₹ ${client.inverter_cost}`} />
                </Section>

                {/* STRUCTURE */}
                <Section title="Structure">
                    <Row label="Type" value={client.structure_type} />
                    <Row label="Size" value={client.structure} />
                    <Row label="Cost" value={`₹ ${client.structure_cost}`} />
                </Section>

                {/* WIRE */}
                <Section title="Wire">
                    <Row label="Manufacturer" value={client.wire_manufacturer} />
                    <Row label="Length" value={client.wire_length} />
                    <Row label="Thickness" value={client.wire_thickness} />
                    <Row label="Cost" value={`₹ ${client.wire_cost}`} />
                </Section>

                {/* AC/DC BOX */}
                <Section title="AC/DC Box">
                    <Row label="Box" value={client.ac_dc_box} />
                    <Row label="Cost" value={`₹ ${client.ac_dc_box_cost}`} />
                </Section>

                {/* EARTHING */}
                <Section title="Earthing">
                    <Row label="Type" value={client.earthing} />
                    <Row label="Cost" value={`₹ ${client.earthing_cost}`} />
                </Section>

                {/* CHEMICAL ANCHORING */}
                <Section title="Chemical Anchoring">
                    <Row label="Type" value={client.chemical_anchoring} />
                    <Row label="Cost" value={`₹ ${client.chemical_anchoring_cost}`} />
                </Section>

                {/* TOTAL */}
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total Revenue</Text>
                    <Text style={styles.totalValue}>
                        ₹ {Number(client.total_cost).toLocaleString("en-IN")}
                    </Text>
                </View>
            </View>

            {/* ================= SERVICES ================= */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Services & Assignment</Text>
                <Text>Service 1: {client.service_1 ? "Yes" : "No"}</Text>
                <Text>Service 2: {client.service_2 ? "Yes" : "No"}</Text>
                <Text>Service 3: {client.service_3 ? "Yes" : "No"}</Text>
                <Text>Assigned User: {assignedUser}</Text>
                <Text>Account Manager: {accountManager}</Text>
            </View>


            <View style={styles.card}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10
                }}>
                    <Text style={styles.cardTitle}>Payment History</Text>

                    <TouchableOpacity
                        onPress={() => setAddPaymentModal(true)}
                        style={styles.addPaymentBtn}
                    >
                        <Text style={styles.btnText}>Add Payment</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal>
                    <View>

                        {/* 🔥 TABLE HEADER ALWAYS VISIBLE */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableCell}>Sr</Text>
                            <Text style={styles.tableCell}>Amount</Text>
                            <Text style={styles.tableCell}>Method</Text>
                            <Text style={styles.tableCell}>Status</Text>
                            <Text style={styles.tableCell}>Transaction ID</Text>
                            <Text style={styles.tableCell}>Notes</Text>
                            <Text style={styles.tableCell}>Date</Text>
                        </View>

                        {/* 🔥 TABLE BODY */}
                        {loadingPayments ? (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>Loading...</Text>
                            </View>
                        ) : payments.length > 0 ? (
                            payments.map((p, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{index + 1}</Text>
                                    <Text style={styles.tableCell}>
                                        ₹ {Number(p.amount || 0).toLocaleString("en-IN")}
                                    </Text>
                                    <Text style={styles.tableCell}>{p.payment_method}</Text>
                                    <Text style={styles.tableCell}>{p.payment_status}</Text>
                                    <Text style={styles.tableCell}>{p.reference_id}</Text>
                                    <Text style={styles.tableCell}>{p.notes}</Text>
                                    <Text style={styles.tableCell}>
                                        {formatDateTime(p.payment_date)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, { width: 800, textAlign: "center", color: "#999" }]}>
                                    No payment records found
                                </Text>
                            </View>
                        )}

                    </View>
                </ScrollView>
            </View>
            <Modal
                visible={addPaymentModal}
                transparent
                animationType="slide"
            >
                <View style={styles.centeredOverlay}>
                    <View style={styles.modalBox}>
                        <ScrollView>

                            <Text style={styles.cardTitle}>Add Payment</Text>

                            <Text>Amount</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={paymentForm.amount}
                                onChangeText={(v) => setPaymentForm({ ...paymentForm, amount: v })}
                            />

                            <Text>Payment Method</Text>
                            <TextInput
                                style={styles.input}
                                value={paymentForm.payment_method}
                                onChangeText={(v) => setPaymentForm({ ...paymentForm, payment_method: v })}
                            />

                            <Text>Status</Text>
                            <TextInput
                                style={styles.input}
                                value={paymentForm.payment_status}
                                onChangeText={(v) => setPaymentForm({ ...paymentForm, payment_status: v })}
                            />

                            <Text>Transaction ID</Text>
                            <TextInput
                                style={styles.input}
                                value={paymentForm.reference_id}
                                onChangeText={(v) => setPaymentForm({ ...paymentForm, reference_id: v })}
                            />

                            <Text>Notes</Text>
                            <TextInput
                                style={styles.input}
                                value={paymentForm.notes}
                                onChangeText={(v) => setPaymentForm({ ...paymentForm, notes: v })}
                            />

                            <Text>Payment Date (ISO Format)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2026-02-27T15:07:51.936Z"
                                value={paymentForm.payment_date}
                                onChangeText={(v) => setPaymentForm({ ...paymentForm, payment_date: v })}
                            />

                            <TouchableOpacity style={styles.saveBtn} onPress={submitPayment}>
                                <Text style={{ color: "#fff", fontWeight: "700" }}>
                                    Add Payment
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setAddPaymentModal(false)}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f6f8",
        padding: 15,
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#ddd",
        paddingVertical: 6,
    },
    tableCell: {
        width: 120,
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 6,
        color: "#1565c0",
    },

    rowLine: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },

    rowLabel: {
        fontSize: 13,
        color: "#555",
    },

    rowValue: {
        fontSize: 13,
        fontWeight: "600",
    },

    totalBox: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: "#ddd",
    },

    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111",
    },

    totalValue: {
        fontSize: 18,
        fontWeight: "800",
        color: "#2e7d32",
        marginTop: 4,
    },
    viewPaymentBtn: {
        backgroundColor: "#1565c0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    addPaymentBtn: {
        backgroundColor: "#2e7d32",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },

    btnText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
        backgroundColor: "#fff",
    },

    saveBtn: {
        backgroundColor: "#000",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },

    cancelBtn: {
        backgroundColor: "#eee",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },

    centeredOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        maxHeight: "85%",
    },
});