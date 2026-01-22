import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList, Linking, Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import SuspectActivityModal from "../../../components/SuspectActivityModal";

const BASE_URL = "https://sunvoracrm.berisphere.com";

const REQUIRED_QUOTE_ACTIVITY = "demo_done";
const REQUIRED_CONVERT_ACTIVITY = "detail_on_whatsapp";

const EDITABLE_CLIENT_FIELDS = [
  "name",
  "phone",
  "city",
  "address",
  "plan",
  "project_size",
];

const CLIENT_FIELDS = [
  { key: "name", label: "Name", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "city", label: "City", type: "text" },
  { key: "address", label: "Address", type: "text" },

  { key: "plan", label: "Plan", type: "text" },
  { key: "plan_cost", label: "Plan Cost", type: "number" },

  { key: "project_size", label: "Project Size", type: "text" },
  { key: "project_size_cost", label: "Project Size Cost", type: "number" },

  { key: "pannel_manufacturer", label: "Panel Manufacturer", type: "text" },
  { key: "pannel_capacity", label: "Panel Capacity", type: "text" },
  { key: "pannel_type", label: "Panel Type", type: "text" },
  { key: "pannel_cost", label: "Panel Cost", type: "number" },

  { key: "inverter_brand", label: "Inverter Brand", type: "text" },
  { key: "inverter_capacity", label: "Inverter Capacity", type: "text" },
  { key: "inverter_cost", label: "Inverter Cost", type: "number" },

  { key: "structure_type", label: "Structure Type", type: "text" },
  { key: "structure_cost", label: "Structure Cost", type: "number" },

  { key: "wire_manufacturer", label: "Wire Manufacturer", type: "text" },
  { key: "wire_length", label: "Wire Length", type: "text" },
  { key: "wire_thickness", label: "Wire Thickness", type: "text" },
  { key: "wire_cost", label: "Wire Cost", type: "number" },

  { key: "ac_dc_box", label: "AC/DC Box", type: "text" },
  { key: "ac_dc_box_cost", label: "AC/DC Box Cost", type: "number" },

  { key: "earthing", label: "Earthing", type: "text" },
  { key: "earthing_cost", label: "Earthing Cost", type: "number" },

  { key: "chemical_anchoring", label: "Chemical Anchoring", type: "text" },
  { key: "chemical_anchoring_cost", label: "Chemical Anchoring Cost", type: "number" },
];



// ============================
// 🔐 AXIOS INSTANCE WITH TOKEN
// ============================
const api = axios.create({
  baseURL: BASE_URL,
});

// Add token automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default function LeadScreen() {
  const [tab, setTab] = useState("prospects");
  const [prospects, setProspects] = useState([]);
  const [clients, setClients] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [clientModal, setClientModal] = useState(false);


  const [addModal, setAddModal] = useState(false);
  const [interestOptions, setInterestOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [referredOptions, setReferredOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const [showReferredDropdown, setShowReferredDropdown] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activityHistoryModal, setActivityHistoryModal] = useState(false);
  const [activityHistoryList, setActivityHistoryList] = useState([]);
  const [activityHistoryTitle, setActivityHistoryTitle] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    referred_by: "",
    activity_type: "",
    interested_in: "",
    suspect_lead_id: null,
  });

  const DEFAULT_CLIENT_VALUES = {
    plan: "basic",
    plan_cost: 0,

    project_size: "small",
    project_size_cost: 0,

    pannel_manufacturer: "generic",
    pannel_capacity: "1kw",
    pannel_type: "mono",
    pannel_cost: 0,

    inverter_brand: "generic",
    inverter_capacity: "1kw",
    inverter_cost: 0,

    structure_type: "standard",
    structure: "standard",
    structure_cost: 0,

    wire_manufacturer: "standard",
    wire_length: "10m",
    wire_thickness: "4mm",
    wire_cost: 0,

    ac_dc_box: "standard",
    ac_dc_box_cost: 0,

    earthing: "standard",
    earthing_cost: 0,

    chemical_anchoring: "no",
    chemical_anchoring_cost: 0,

    service_1: false,
    service_2: false,
    service_3: false,
  };


  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      city: "",
      address: "",
      referred_by: "",
      activity_type: "",
      interested_in: "",
      suspect_lead_id: null,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProspects();
    await loadClients();
    await loadSuspects();
    setRefreshing(false);
  };


  const [clientForm, setClientForm] = useState({
    prospect_lead_id: null,

    name: "",
    phone: "",
    city: "",
    address: "",
    referred_by: "",

    plan: "",
    plan_cost: 0,

    project_size: "",
    project_size_cost: 0,

    pannel_manufacturer: "",
    pannel_capacity: "",
    pannel_type: "",
    pannel_cost: 0,

    inverter_brand: "",
    inverter_capacity: "",
    inverter_cost: 0,

    structure_type: "",
    structure: "",
    structure_cost: 0,

    wire_manufacturer: "",
    wire_length: "",
    wire_thickness: "",
    wire_cost: 0,

    ac_dc_box: "",
    ac_dc_box_cost: 0,

    earthing: "",
    earthing_cost: 0,

    chemical_anchoring: "",
    chemical_anchoring_cost: 0,

    service_1: false,
    service_2: false,
    service_3: false,
  });


  const Input = ({
    label,
    value,
    onChange,
    numeric = false,
  }: {
    label: string;
    value: any;
    onChange: (v: string) => void;
    numeric?: boolean;
  }) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>
        {label}
      </Text>
      <TextInput
        style={styles.input}
        value={String(value ?? "")}
        keyboardType={numeric ? "numeric" : "default"}
        onChangeText={onChange}
      />
    </View>
  );



  const callNumber = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;

    // Ensure country code (India example +91)
    const formattedPhone = phone.startsWith("+")
      ? phone
      : `91${phone}`;

    const url = `https://wa.me/${formattedPhone}`;
    Linking.openURL(url);
  };

  const fetchQuotation = async (leadId: number, token: string) => {
    const res = await fetch(
      `https://sunvoracrm.berisphere.com/crm/quotation/download-pdf?lead_id=${leadId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.json(); // because API is application/json
  };

  const openActivityHistory = (lead, leadType) => {
    if (!lead.activities || !lead.activities.length) {
      Alert.alert("No Activities", "No activity history found");
      return;
    }

    // Sort latest first
    const sorted = [...lead.activities].sort(
      (a, b) =>
        new Date(b.activity_date).getTime() -
        new Date(a.activity_date).getTime()
    );

    setActivityHistoryList(sorted);
    setActivityHistoryTitle(
      `${leadType} Activity History • ${lead.name}`
    );
    setActivityHistoryModal(true);
  };


  const ActionIconButton = ({
    icon,
    label,
    onPress,
    color = "#333",
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionItem}>
      {icon}
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );





  // ============================
  // 📌 LOAD DATA (GET)
  // ============================

  const loadProspects = async (activityType?: string) => {
    try {
      const payload: any = {
        from_id: 1,
        to_id: 99999,
        assign_forward: false,
      };

      if (activityType) {
        payload.activity_type = activityType;
      }
      console.log("🌐 Fetch Prospect URL:", api.defaults.baseURL + "/crm/get-lead/Prospect");


      const res = await api.post("/crm/get-lead/Prospect", payload);

      const raw = res.data?.data?.data || [];

      const normalized = raw.map((p) => {
        const referredObj = referredOptions.find(
          (o) => o.label === p.referred_by
        );

        const interestObj = interestOptions.find(
          (o) => o.label === p.interested_in
        );

        // 🔥 GET LATEST ACTIVITY
        const latestActivity =
          p.activities && p.activities.length
            ? [...p.activities].sort(
              (a, b) =>
                new Date(b.activity_date).getTime() -
                new Date(a.activity_date).getTime()
            )[0]
            : null;

        return {
          ...p,
          referred_by_value: referredObj?.value ?? null,
          interested_in_value: interestObj?.value ?? null,

          // ✅ derived fields for UI
          latest_activity_type: latestActivity?.activity_type ?? null,
          latest_activity_date: latestActivity?.activity_date ?? null,
          next_follow_up: latestActivity?.next_follow_up ?? null,
        };
      });


      console.log("✅ NORMALIZED PROSPECT:", normalized[0]);

      setProspects(normalized);
    } catch (e: any) {
      console.log("❌ Prospect Load Error", e.response?.data || e.message);
    }
  };





  const loadClients = async () => {
    try {
      const res = await api.get(`/crm/get-lead/Client`);
      setClients(res.data || []);
    } catch (e) {
      console.log("❌ Client Load Error:", e.response?.data || e.message);
    }
  };

  const loadSuspects = async () => {
    try {
      const res = await api.post("/crm/get-lead/Suspect", {
        from_id: 1,
        to_id: 99999,
        assign_forward: false,
      });

      const raw = res.data?.data?.data || [];

      const normalized = raw.map((s) => {
        const latestActivity =
          s.activities && s.activities.length
            ? [...s.activities].sort(
              (a, b) =>
                new Date(b.activity_date).getTime() -
                new Date(a.activity_date).getTime()
            )[0]
            : null;

        return {
          ...s,
          latest_activity_type: latestActivity?.activity_type ?? null,
          latest_activity_date: latestActivity?.activity_date ?? null,
          next_follow_up: latestActivity?.next_follow_up ?? null,
        };
      });

      setSuspects(normalized);
    } catch (error) {
      console.log(
        "❌ Suspect Load Error:",
        error.response?.data || error.message
      );
    }
  };


  const loadInterestOptions = async () => {
    try {
      const res = await api.post("/misc/get", {
        module: "CRM",
        category: "AddProspect",
        is_active: true,
      });

      const list =
        res.data?.data?.data?.map((item: any) => ({
          label: item.label,
          value: item.value,
        })) || [];

      setInterestOptions(list);
    } catch (err) {
      console.log("❌ Interest Options Error:", err);
    }
  };

  const loadReferredOptions = async () => {
    try {
      const res = await api.post("/misc/get", {
        module: "CRM",
        category: "AddProspectReferred",
        is_active: true,
      });

      const list =
        res.data?.data?.data?.map((item) => ({
          label: item.label,
          value: item.value,
        })) || [];

      setReferredOptions(list);
    } catch (err) {
      console.log("❌ Referred Options Error:", err);
    }
  };

  const viewQuotation = (prospect) => {
    router.push({
      pathname: "/components/QuotationPreviewScreen",
      params: { leadId: prospect.id },
    });
  };

  const fetchQuotationData = async (leadId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/crm/quotation/get?lead_id=${leadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      return json?.data || null;
    } catch (err) {
      console.log("❌ Fetch Quotation Error", err);
      return null;
    }
  };


  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        // 🔥 Load dropdowns first
        await loadInterestOptions();
        await loadReferredOptions();

        // 🔥 Then load lists ONCE
        await loadProspects();
        await loadClients();
        await loadSuspects();
      };

      init();
    }, [])
  );





  // useEffect(() => {
  //   if (interestOptions.length && referredOptions.length) {
  //     loadProspects();
  //   }
  // }, [interestOptions, referredOptions]);

  useEffect(() => {
    if (interestOptions.length > 0) {
      console.log("📦 interestOptions loaded:", interestOptions);
    }
  }, [interestOptions]);

  useEffect(() => {
    if (referredOptions.length > 0) {
      console.log("📦 referredOptions loaded:", referredOptions);
    }
  }, [referredOptions]);




  // ============================
  // 📌 ADD PROSPECT (POST)
  // ============================

  const addProspect = async () => {
    if (!form.name || !form.phone) {
      return Alert.alert("Required", "Name & Phone are required");
    }

    const storedUser = await AsyncStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
      Alert.alert("Error", "User not found. Please login again.");
      return;
    }
    const assignedUser =
      user?.username || user?.employee_id || user?.created_by || "admin-0";

    const payload = {
      ...form,
      referred_by: form.referred_by, // ensure VALUE
      // assigned_user: assignedUser,                 // STRING, not number
    };



    console.log("🚀 Add Prospect Payload:", payload);

    try {
      await api.post("/crm/add-lead/Prospect", payload);

      Alert.alert("Success", "Prospect added successfully");
      setAddModal(false);
      resetForm();

      await loadProspects();
      await loadSuspects();
    } catch (err: any) {
      console.log("❌ Add Prospect Error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.error?.message || "Failed to add prospect");
    }
  };


  const emptyClientForm = {
    prospect_lead_id: 0,

    name: "",
    phone: "",
    city: "",
    address: "",
    referred_by: "",

    plan: "",
    plan_cost: 0,

    project_size: "",
    project_size_cost: 0,

    pannel_manufacturer: "",
    pannel_capacity: "",
    pannel_type: "",
    pannel_cost: 0,

    inverter_brand: "",
    inverter_capacity: "",
    inverter_cost: 0,

    structure_type: "",
    structure: "",
    structure_cost: 0,

    wire_manufacturer: "",
    wire_length: "",
    wire_thickness: "",
    wire_cost: 0,

    ac_dc_box: "",
    ac_dc_box_cost: 0,

    earthing: "",
    earthing_cost: 0,

    chemical_anchoring: "",
    chemical_anchoring_cost: 0,

    service_1: false,
    service_2: false,
    service_3: false,
  };

  const buildSafeClientPayload = (prospect: any, form: any) => ({
    prospect_lead_id: prospect.id,

    name: form.name,
    phone: form.phone,
    city: form.city,
    address: form.address,

    referred_by: form.referred_by,

    // 🔥 REQUIRED BY BACKEND (missing earlier)
    interested_in: prospect.interested_in || "solar",

    plan: form.plan,
    plan_cost: Number(form.plan_cost) || 0,

    project_size: form.project_size,
    project_size_cost: Number(form.project_size_cost) || 0,

    pannel_manufacturer: form.pannel_manufacturer,
    pannel_capacity: form.pannel_capacity,
    pannel_type: form.pannel_type,
    pannel_cost: Number(form.pannel_cost) || 0,

    inverter_brand: form.inverter_brand,
    inverter_capacity: form.inverter_capacity,
    inverter_cost: Number(form.inverter_cost) || 0,

    structure_type: form.structure_type,
    structure: form.structure,
    structure_cost: Number(form.structure_cost) || 0,

    wire_manufacturer: form.wire_manufacturer,
    wire_length: form.wire_length,
    wire_thickness: form.wire_thickness,
    wire_cost: Number(form.wire_cost) || 0,

    ac_dc_box: form.ac_dc_box,
    ac_dc_box_cost: Number(form.ac_dc_box_cost) || 0,

    earthing: form.earthing,
    earthing_cost: Number(form.earthing_cost) || 0,

    chemical_anchoring: form.chemical_anchoring,
    chemical_anchoring_cost: Number(form.chemical_anchoring_cost) || 0,

    service_1: !!form.service_1,
    service_2: !!form.service_2,
    service_3: !!form.service_3,
  });




  const convertProspectToClient = async (prospect: any) => {
    setSelectedProspect(prospect);

    // 🔥 Step 1: try fetching quotation
    const quotation = await fetchQuotationData(prospect.id);

    if (quotation) {
      console.log("✅ Quotation found:", quotation);

      // 🔥 Prefill client form from quotation
      setClientForm({
        prospect_lead_id: prospect.id,

        name: quotation.name || prospect.name,
        phone: quotation.phone || prospect.phone,
        city: quotation.city || prospect.city,
        address: quotation.address || prospect.address,
        referred_by: prospect.referred_by || "",

        plan: quotation.plan,
        plan_cost: quotation.plan_cost,

        project_size: quotation.project_size,
        project_size_cost: quotation.project_size_cost,

        pannel_manufacturer: quotation.pannel_manufacturer,
        pannel_capacity: quotation.pannel_capacity,
        pannel_type: quotation.pannel_type,
        pannel_cost: quotation.pannel_cost,

        inverter_brand: quotation.inverter_brand,
        inverter_capacity: quotation.inverter_capacity,
        inverter_cost: quotation.inverter_cost,

        structure_type: quotation.structure_type,
        structure: quotation.structure,
        structure_cost: quotation.structure_cost,

        wire_manufacturer: quotation.wire_manufacturer,
        wire_length: quotation.wire_length,
        wire_thickness: quotation.wire_thickness,
        wire_cost: quotation.wire_cost,

        ac_dc_box: quotation.ac_dc_box,
        ac_dc_box_cost: quotation.ac_dc_box_cost,

        earthing: quotation.earthing,
        earthing_cost: quotation.earthing_cost,

        chemical_anchoring: quotation.chemical_anchoring,
        chemical_anchoring_cost: quotation.chemical_anchoring_cost,

        service_1: !!quotation.service_1,
        service_2: !!quotation.service_2,
        service_3: !!quotation.service_3,
      });
    } else {
      console.log("ℹ️ No quotation found, using prospect data");

      // 🔹 fallback (existing behavior)
      setClientForm({
        ...DEFAULT_CLIENT_VALUES,
        prospect_lead_id: prospect.id,
        name: prospect.name || "",
        phone: prospect.phone || "",
        city: prospect.city || "",
        address: prospect.address || "",
        referred_by: prospect.referred_by || "",
      });
    }

    setClientModal(true);
  };





  const fetchProspectDetails = async (prospectId: number) => {
    try {
      const res = await api.post("/crm/get-lead/Prospect", {
        id: prospectId,
      });

      // Backend usually returns data.data
      return res.data?.data || null;
    } catch (err: any) {
      console.log(
        "❌ Fetch Prospect Details Error:",
        err.response?.status,
        err.response?.data || err.message
      );
      Alert.alert("Error", "Failed to fetch prospect details");
      return null;
    }
  };





  const convertSuspectToProspect = (suspect) => {
    setForm({
      name: suspect.name || "",
      phone: suspect.phone || "",
      city: suspect.city || "",
      address: suspect.address || "",
      referred_by: suspect.referred_by || "",
      interested_in: suspect.interested_in || "",
      suspect_lead_id: suspect.id,
    });

    setAddModal(true); // Open modal
  };

  const submitClient = async () => {
    try {
      if (!clientForm.name || !clientForm.phone) {
        Alert.alert("Required", "Name and Phone are required");
        return;
      }

      const payload = {
        ...DEFAULT_CLIENT_VALUES, // 👈 auto-fill 25+ fields
        ...clientForm,            // 👈 overwrite editable ones
        prospect_lead_id: selectedProspect.id,
        referred_by: selectedProspect.referred_by_value || "social_media",
        interested_in: selectedProspect.interested_in || "solar",
      };

      console.log("🚀 FINAL CLIENT PAYLOAD:", payload);

      await api.post("/crm/add-lead/client", payload);

      Alert.alert("Success", "Client created successfully");

      setClientModal(false);
      setClientForm({});
      setSelectedProspect(null);

      await loadProspects();
      await loadClients();
    } catch (err: any) {
      console.log("❌ Client Save Error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to create client");
    }
  };


  // // INPUT COMPONENT
  // const Input = (label, field) => (
  //   <View style={{ marginBottom: 10 }}>
  //     <Text style={{ marginBottom: 4 }}>{label}</Text>
  //     <TextInput
  //       style={styles.input}
  //       value={form[field]}
  //       onChangeText={(txt) => setForm({ ...form, [field]: txt })}
  //       placeholder={label}
  //     />
  //   </View>
  // );

  const TabButton = ({ title, keyName }) => (
    <TouchableOpacity
      onPress={() => setTab(keyName)}
      style={[
        styles.tabButton,
        tab === keyName && styles.activeTabButton,
      ]}
    >
      <Text
        style={[
          styles.tabText,
          tab === keyName && styles.activeTabText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const formatActivityDateTime = (date?: string) => {
    if (!date) return "";

    // 🔑 force UTC interpretation
    const d = new Date(date.endsWith("Z") ? date : `${date}Z`);

    const datePart = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const timePart = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${datePart} • ${timePart}`;
  };
  const formatDateTimeSafe = (date?: string) => {
    if (!date) return "-";

    const d = new Date(date.endsWith("Z") ? date : `${date}Z`);

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };



  const renderProspect = ({ item }) => {
    const canGenerateQuote = item.latest_activity_type === "demo_done";

    return (

      <View style={styles.row}>
        <Text style={styles.cell}>{item.name}</Text>
        <View style={[styles.cell, styles.phoneCell]}>
          <Text>{item.phone}</Text>

          <View style={styles.phoneActions}>
            {/* Call */}
            <TouchableOpacity onPress={() => callNumber(item.phone)}>
              <Ionicons name="call" size={18} color="#007bff" />
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity onPress={() => openWhatsApp(item.phone)}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View >

        <Text style={styles.cell}>{item.city}</Text>
        <Text style={styles.cell}>{item.address}</Text>
        <Text style={styles.cell}>{item.referred_by}</Text>
        <TouchableOpacity
          style={styles.cell}
          onPress={() => openActivityHistory(item, "Prospect")}
          disabled={!item.activities?.length}
        >
          {item.latest_activity_type ? (
            <View
              style={{
                backgroundColor: "#e3f2fd",
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#1565c0",
                  textTransform: "capitalize",
                }}
              >
                {item.latest_activity_type.replaceAll("_", " ")}
              </Text>

              <Text style={{ fontSize: 10, marginTop: 2, color: "#555" }}>
                {formatActivityDateTime(item.latest_activity_date)}
              </Text>
            </View>
          ) : (
            <Text style={{ color: "#999" }}>—</Text>
          )}
        </TouchableOpacity>



        <Text style={styles.cell}>{item.interested_in}</Text>
        {/* Convert to Client */}
        {/* ACTION ICONS */}
        <View style={styles.actionRow}>

          {/* Convert to Client */}
          <ActionIconButton
            icon={
              <Ionicons
                name="person-add-outline"
                size={22}
                color="#2e7d32"
              />
            }
            label="Convert"
            onPress={() => convertProspectToClient(item)}
            color="#2e7d32"
          />

          {/* Activity */}
          <ActionIconButton
            icon={
              <MaterialIcons
                name="playlist-add-check"
                size={22}
                color="#1565c0"
              />
            }
            label="Activity"
            onPress={() => {
              setSelectedSuspect(null);
              setSelectedProspect(item);
              setActivityModal(true);
            }}
            color="#1565c0"
          />

          {/* Quotation */}
          <ActionIconButton
            icon={
              <Ionicons
                name="document-text-outline"
                size={22}
                color={canGenerateQuote ? "#6a1b9a" : "#aaa"}
              />
            }
            label="Quote"
            onPress={() => {
              if (!canGenerateQuote) {
                Alert.alert(
                  "Action Required",
                  "Please complete Demo Done activity before generating quotation"
                );
                return;
              }
              viewQuotation(item);
            }}
            color={canGenerateQuote ? "#6a1b9a" : "#aaa"}
          />


          {/* Disqualify */}
          <ActionIconButton
            icon={
              <MaterialIcons
                name="block"
                size={22}
                color="#d32f2f"
              />
            }
            label="Disqualify"
            onPress={() => disqualifyProspect(item)}
            color="#d32f2f"
          />


        </View>



      </View>
    );
  };

  const renderClient = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.company}</Text>
      <Text style={styles.cell}>{item.phone}</Text>
      <Text style={styles.cell}>{item.status}</Text>
    </View>
  );

  const renderSuspect = ({ item }) => {
    const canConvert =
      item.latest_activity_type === REQUIRED_CONVERT_ACTIVITY;



    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{item.id}</Text>
        <Text style={styles.cell}>{item.name}</Text>

        <View style={[styles.cell, styles.phoneCell]}>
          <Text>{item.phone}</Text>
          <View style={styles.phoneActions}>
            <TouchableOpacity onPress={() => callNumber(item.phone)}>
              <Ionicons name="call" size={18} color="#007bff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openWhatsApp(item.phone)}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ✅ Activity Column (already added by you) */}
        <TouchableOpacity
          style={styles.cell}
          onPress={() => openActivityHistory(item, "Suspect")}
          disabled={!item.activities?.length}
        >
          {item.latest_activity_type ? (
            <View
              style={{
                backgroundColor: "#e3f2fd",
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#1565c0",
                  textTransform: "capitalize",
                }}
              >
                {item.latest_activity_type.replaceAll("_", " ")}
              </Text>
              <Text style={{ fontSize: 10, marginTop: 2, color: "#555" }}>
                {formatActivityDateTime(item.latest_activity_date)}
              </Text>
            </View>
          ) : (
            <Text style={{ color: "#999" }}>—</Text>
          )}

        </TouchableOpacity>


        {/* ACTIONS */}
        <View style={styles.actionRow}>

          {/* 🔒 Convert to Prospect */}
          <ActionIconButton
            icon={
              <Ionicons
                name="swap-horizontal-outline"
                size={22}
                color={canConvert ? "#2e7d32" : "#aaa"}
              />
            }
            label="Convert"
            onPress={() => {
              if (!canConvert) {
                Alert.alert(
                  "Action Required",
                  "Please complete 'Detail on WhatsApp' activity before converting to Prospect"
                );
                return;
              }
              convertSuspectToProspect(item);
            }}
            color={canConvert ? "#2e7d32" : "#aaa"}
          />

          {/* Activity */}
          <ActionIconButton
            icon={
              <MaterialIcons
                name="playlist-add-check"
                size={22}
                color="#1565c0"
              />
            }
            label="Activity"
            onPress={() => {
              setSelectedProspect(null);
              setSelectedSuspect(item);
              setActivityModal(true);
            }}
            color="#1565c0"
          />

          {/* Disqualify */}
          <ActionIconButton
            icon={
              <MaterialIcons
                name="block"
                size={22}
                color="#d32f2f"
              />
            }
            label="Disqualify"
            onPress={() => disqualifySuspect(item.id)}
            color="#d32f2f"
          />

        </View>
      </View>
    );
  };

  // ============================
  // ❌ DISQUALIFY LEADS
  // ============================

  // PROSPECT → soft delete
  const disqualifyProspect = async (prospect) => {
    const payload = {
      id: prospect.id,
      name: prospect.name,
      phone: prospect.phone,
      city: prospect.city,
      address: prospect.address,
      assigned_user: "",
      is_active: false,
    };

    console.log("🚀 FINAL DISQUALIFY PAYLOAD:", payload);

    try {
      await api.post("/crm/edit-lead/Prospect", payload);
      Alert.alert("Success", "Prospect disqualified");
      loadProspects();
    } catch (err) {
      console.log("❌ Disqualify Error", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.error?.message || "Failed to disqualify"
      );
    }
  };








  // SUSPECT → hard delete
  const disqualifySuspect = async (id: number) => {
    Alert.alert(
      "Disqualify Suspect",
      "Are you sure you want to disqualify this suspect?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await api.post(`/crm/disqualify/Suspect/${id}`);
              Alert.alert("Success", "Suspect disqualified");
              loadSuspects();
            } catch (err) {
              console.log("❌ Disqualify Suspect Error", err.response?.data || err.message);
              Alert.alert("Error", "Failed to disqualify suspect");
            }
          },
        },
      ]
    );
  };


  return (
    <View style={{ flex: 1, padding: 15 }}>

      {/* HEADER */}
      <View style={styles.topHeader}>
        <Ionicons name="menu" size={28} color="#333" />
        <Text style={styles.dashboardTitle}>Dashboard</Text>
        <Ionicons name="notifications-outline" size={24} color="#333" />
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        <TabButton title="Suspects" keyName="suspects" />
        <TabButton title="Prospects" keyName="prospects" />
        <TabButton title="Clients" keyName="clients" />

      </View>

      {/* ========== SUSPECTS ========== */}
      {tab === "suspects" && (
        <ScrollView horizontal>
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.header}>ID</Text>
              <Text style={styles.header}>Name</Text>
              <Text style={styles.header}>Phone</Text>
              <Text style={styles.header}>Latest Activity</Text>
              <Text style={styles.header}>Action</Text>
            </View>

            <FlatList data={suspects} renderItem={renderSuspect} 
            keyExtractor={(item) => `suspect-${item.id}`}
            refreshing={refreshing}
              onRefresh={onRefresh} />
          </View>
        </ScrollView>
      )}

      {/* ========== PROSPECTS ========== */}
      {tab === "prospects" && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            {/* LEFT SIDE TEXT */}
            <View style={{ maxWidth: "60%" }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#111" }}>
                Prospect Leads
              </Text>
              <Text style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
                Qualified leads with complete information
              </Text>
            </View>

            {/* RIGHT SIDE BUTTON */}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                resetForm();
                setAddModal(true);
              }}
            >

              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add Prospect</Text>
            </TouchableOpacity>
          </View>


          <ScrollView horizontal>
            <View>
              <View style={styles.headerRow}>
                <Text style={styles.header}>Name</Text>
                <Text style={styles.header}>Phone</Text>
                <Text style={styles.header}>City</Text>
                <Text style={styles.header}>Address</Text>
                <Text style={styles.header}>Referred By</Text>
                <Text style={styles.header}>Latest Activity</Text>
                <Text style={styles.header}>Interested In</Text>
                <Text style={styles.header}>Action</Text>
              </View>

              <FlatList
                data={prospects}
                keyExtractor={(item, index) =>
  `prospect-${item.id}-${index}`
}
                renderItem={renderProspect}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />


            </View>
          </ScrollView>
        </>
      )}

      {/* ========== CLIENTS ========== */}
      {tab === "clients" && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            {/* LEFT SIDE TEXT */}
            <View style={{ maxWidth: "60%" }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#111" }}>
                Suspects Leads
              </Text>
              <Text style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
                Qualified leads with complete information
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setClientForm({
                  name: "",
                  phone: "",
                  city: "",
                  address: "",
                  prospect_lead_id: 0,
                });
                setClientModal(true);
              }}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add Client</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal>
            <View>
              <View style={styles.headerRow}>
                <Text style={styles.header}>ID</Text>
                <Text style={styles.header}>Name</Text>
                <Text style={styles.header}>Company</Text>
                <Text style={styles.header}>Phone</Text>
                <Text style={styles.header}>Status</Text>
              </View>

              <FlatList data={clients} renderItem={renderClient}
                keyExtractor={(item) => `client-${item.id}`}
                refreshing={refreshing}
                onRefresh={onRefresh} />
            </View>
          </ScrollView>
        </>
      )}



      {/* ADD MODAL */}
      {/* ====================== ADD PROSPECT MODAL ====================== */}
      <Modal
        visible={addModal}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModal(false)}
      >
        {/* Background overlay */}
        <View style={styles.centeredOverlay}>

          {/* Modal Box */}
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>

              <Text style={styles.modalTitle}>Add New Prospect</Text>
              <Text style={styles.modalSubtitle}>
                Enter the details of the qualified lead below
              </Text>

              {/* ROW 1 */}
              <View style={styles.rowPair}>
                <View style={styles.column}>
                  <Text style={styles.label}>Contact Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter name"
                    value={form.name}
                    onChangeText={(txt) => setForm({ ...form, name: txt })}
                  />
                </View>

                <View style={styles.column}>
                  <Text style={styles.label}>Phone *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91-0000000000"
                    value={form.phone}
                    onChangeText={(txt) => setForm({ ...form, phone: txt })}
                  />
                </View>
              </View>

              {/* ROW 2 */}
              <View style={styles.rowPair}>
                <View style={styles.column}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={form.city}
                    onChangeText={(txt) => setForm({ ...form, city: txt })}
                  />
                </View>

                <View style={styles.column}>
                  <Text style={styles.label}>Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Address"
                    value={form.address}
                    onChangeText={(txt) => setForm({ ...form, address: txt })}
                  />
                </View>
              </View>

              {/* ROW 3 */}
              <View style={styles.rowPair}>
                <View style={styles.column}>
                  <Text style={styles.label}>Referred By *</Text>

                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowReferredDropdown(true)}
                  >
                    <Text style={{ color: form.referred_by ? "#000" : "#999" }}>
                      {referredOptions.find(
                        (o) => o.value === form.referred_by
                      )?.label || "Select Referred By"}
                    </Text>

                  </TouchableOpacity>

                  {/* Dropdown */}
                  <Modal
                    visible={showReferredDropdown}
                    transparent
                    animationType="fade"
                  >
                    <TouchableOpacity
                      style={styles.dropdownOverlay}
                      onPress={() => setShowReferredDropdown(false)}
                    >
                      <View style={styles.dropdownBox}>
                        {referredOptions.map((item, index) => (
                          <TouchableOpacity
                            key={`referred-${item.value}-${index}`}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setForm({ ...form, referred_by: item.value });
                              setShowReferredDropdown(false);
                            }}
                          >
                            <Text>{item.label}</Text>
                          </TouchableOpacity>
                        ))}

                      </View>
                    </TouchableOpacity>
                  </Modal>
                </View>

                <View style={styles.column}>
                  <Text style={styles.label}>Interested In *</Text>

                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowInterestDropdown(true)}
                  >
                    <Text style={{ color: form.interested_in ? "#000" : "#999" }}>
                      {interestOptions.find(
                        (o) => o.value === form.interested_in
                      )?.label || "Select Interest"}
                    </Text>

                  </TouchableOpacity>

                  {/* Dropdown */}
                  <Modal
                    visible={showInterestDropdown}
                    transparent
                    animationType="fade"
                  >
                    <TouchableOpacity
                      style={styles.dropdownOverlay}
                      onPress={() => setShowInterestDropdown(false)}
                    >
                      <View style={styles.dropdownBox}>
                        {interestOptions.map((item, index) => (
                          <TouchableOpacity
                            key={`interest-${item.value}-${index}`}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setForm({ ...form, interested_in: item.value });
                              setShowInterestDropdown(false);
                            }}
                          >
                            <Text>{item.label}</Text>
                          </TouchableOpacity>
                        ))}

                      </View>
                    </TouchableOpacity>
                  </Modal>
                </View>
              </View>

              {/* BUTTONS */}
              <TouchableOpacity style={styles.saveBtn} onPress={addProspect}>
                <Text style={styles.saveBtnText}>Add Prospect</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={clientModal}
        transparent
        animationType="fade"
        onRequestClose={() => setClientModal(false)}
      >
        <View style={styles.centeredOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {clientForm.prospect_lead_id ? "Convert to Client" : "Add Client"}
              </Text>

              {CLIENT_FIELDS.map((field) => (
                <View key={field.key}>
                  <Text style={styles.label}>{field.label}</Text>

                  <TextInput
                    style={styles.input}
                    keyboardType={field.type === "number" ? "numeric" : "default"}
                    value={String(clientForm[field.key] ?? "")}
                    onChangeText={(v) =>
                      setClientForm({
                        ...clientForm,
                        [field.key]:
                          field.type === "number" ? Number(v) : v,
                      })
                    }
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.saveBtn} onPress={submitClient}>
                <Text style={styles.saveBtnText}>
                  {clientForm.prospect_lead_id ? "Convert to Client" : "Add Client"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setClientModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>

          </View>
        </View>
      </Modal>

      {(selectedSuspect || selectedProspect) && (
  <SuspectActivityModal
    key={`activity-${(selectedSuspect || selectedProspect).id}`}
    visible={activityModal}
    suspect={selectedSuspect || selectedProspect}
    leadType={selectedSuspect ? "Suspect" : "Prospect"}
    onClose={(shouldRefresh = false) => {
      setActivityModal(false);
      setSelectedSuspect(null);
      setSelectedProspect(null);

      if (shouldRefresh) {
        loadSuspects();
        loadProspects();
      }
    }}
  />
)}

      <Modal
        visible={activityHistoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setActivityHistoryModal(false)}
      >
        <View style={styles.centeredOverlay}>
          <View style={[styles.modalBox, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>{activityHistoryTitle}</Text>

            <ScrollView>
              {activityHistoryList.map((a, index) => (
                <View
                  key={`activity-${a.id ?? `${a.activity_type}-${a.activity_date}-${index}`}`}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderColor: "#eee",
                  }}
                >
                  {/* Activity Type */}
                  <Text style={{ fontWeight: "700", fontSize: 14 }}>
                    {a.activity_type.replaceAll("_", " ")}
                  </Text>

                  {/* Notes */}
                  {a.notes ? (
                    <Text style={{ fontSize: 12, marginTop: 4, color: "#444" }}>
                      {a.notes}
                    </Text>
                  ) : null}

                  {/* Activity Date */}
                  <Text style={{ fontSize: 11, color: "#777", marginTop: 6 }}>
                    Activity: {formatDateTimeSafe(a.activity_date)}
                  </Text>

                  {/* Next Follow-up Activity */}
                  {a.next_follow_up_activity ? (
                    <Text style={{ fontSize: 11, color: "#555", marginTop: 4 }}>
                      Next Activity:{" "}
                      {a.next_follow_up_activity.replaceAll("_", " ")}
                    </Text>
                  ) : null}

                  {/* ✅ Next Follow-up Date & Time */}
                  {a.next_follow_up ? (
                    <Text style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                      Follow-up On: {formatDateTimeSafe(a.next_follow_up)}
                    </Text>
                  ) : null}
                </View>
              ))}

            </ScrollView>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setActivityHistoryModal(false)}
            >
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ============================
// 📌 STYLES
// ============================

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  phoneCell: {
    width: 140,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  phoneActions: {
    flexDirection: "row",
    gap: 10, // if gap not supported, use marginLeft
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#ececec",
    alignItems: "center",
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: "#007bff",
  },
  tabText: {
    color: "#555",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  addBtn: {
    flexDirection: "row",
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  addBtnText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 14,
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding: 10,
  },
  header: {
    width: 140,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
  },
  cell: {
    width: 140,
  },
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
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 10,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },

  centeredOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  centerModalBox: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "85%",
    elevation: 5,
    position: "relative",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
  },

  closeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  modalSubtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },

  dropdownInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  dropdownBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    elevation: 10,
  },

  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  dropdownText: {
    fontSize: 16,
  },

  saveBtn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },

  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  cancelBtn: {
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  cancelBtnText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 15,
  },
  rowPair: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  column: {
    width: "48%",
  },

  convertBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    width: 150,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: 240,
  },

  actionItem: {
    alignItems: "center",
    width: 60,
  },

  actionLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },

});
