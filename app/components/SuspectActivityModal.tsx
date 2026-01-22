import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRouter } from "expo-router";

import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "https://sunvoracrm.berisphere.com";



type LeadType = "Suspect" | "Prospect";

interface Props {
  visible: boolean;
  onClose: (refresh?: boolean) => void;
  suspect: any;
  leadType: LeadType;
}


export default function SuspectActivityModal({
  visible,
  onClose,
  suspect,
  leadType,
}: Props) {
  const activityRef = useRef<TouchableOpacity>(null);
  const followUpRef = useRef<TouchableOpacity>(null);
  const router = useRouter();



  const [form, setForm] = useState({
    activity_type: "",
    notes: "",
    next_follow_up_activity: "",
    next_follow_up: null as Date | null,
  });

  const [dropdown, setDropdown] = useState<{
    type: "activity" | "followup" | null;
    top: number;
  }>({ type: null, top: 0 });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateMode, setDateMode] = useState<"date" | "time">("date");

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [activityOptions, setActivityOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const loadActivityOptions = async () => {
    try {
      setLoadingOptions(true);
      setActivityOptions([]);

      const token = await AsyncStorage.getItem("token");
      const payload =
        leadType === "Prospect"
          ? {
            module: "CRM",
            category: "ProspectActivity",
            is_active: true,
          }
          : {
            module: "CRM",
            category: "SuspectActivity",
            is_active: true,
          };

      const res = await axios.post(
        `${BASE_URL}/misc/get`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const list =
        res.data?.data?.data?.map((item: any) => ({
          label: item.label,
          value: item.value,
        })) || [];

      setActivityOptions(list);
    } catch (err: any) {
      console.log("❌ Activity Option Error:", err.response?.data || err.message);
    } finally {
      setLoadingOptions(false);
    }
  };




  useEffect(() => {
    if (!visible) return;

    // 🔑 Reset options before fetching new ones
    setActivityOptions([]);

    loadActivityOptions();
  }, [visible, leadType]);

  const openDropdownAbove = (
    ref: any,
    type: "activity" | "followup"
  ) => {
    ref.current?.measure(
      (_x: number, _y: number, _w: number, h: number, _px: number, py: number) => {
        setDropdown({
          type,
          top: py - h * 4, // dropdown opens upward
        });
      }
    );
  };

  const submit = async () => {
  if (!form.activity_type || !form.next_follow_up_activity) {
    return Alert.alert("Required", "Please fill all required fields");
  }

  const payload = {
    activity_type: form.activity_type,
    notes: form.notes,
    next_follow_up_activity: form.next_follow_up_activity,
    next_follow_up: form.next_follow_up
      ? form.next_follow_up.toISOString()
      : null,
  };

  // 🔍 FRONTEND CONFIRMATION
  console.log("🚀 Save Activity Payload:", payload);
  console.log("🆔 Lead ID:", suspect.id);
  console.log("📌 Lead Type:", leadType);

  const endpoint =
  leadType === "Prospect"
    ? `/crm/add-activity/prospect/${suspect.id}`
    : `/crm/add-activity/suspect/${suspect.id}`;


  try {
    const token = await AsyncStorage.getItem("token");
    console.log("🌐 Activity Endpoint:", endpoint);


    const res = await axios.post(
  `${BASE_URL}${endpoint}`,
  payload,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);


    console.log("✅ Activity API Response:", res.data);

    Alert.alert("Success", "Activity added successfully");
    onClose(true);
  } catch (err: any) {
    console.log("❌ Activity Error:", err.response?.data || err.message);
    Alert.alert("Error", "Failed to add activity");
  }
};

// const onCreateQuotation = () => {
//   onClose();

//   router.push({
//     pathname: "/components/PriceCalculator",
//     params: {
//       prospectId: suspect.id,
//     },
//   });
// };
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Add Activity</Text>

          {/* Activity Type */}
          <Text style={styles.label}>Activity Type *</Text>
          <TouchableOpacity
            ref={activityRef}
            style={styles.input}
            disabled={loadingOptions}
            onPress={() => openDropdownAbove(activityRef, "activity")}
          >
            <Text style={styles.inputText}>
              {loadingOptions
                ? "Loading activity types..."
                : activityOptions.find(
                  (o) => o.value === form.activity_type
                )?.label || "Select Activity Type"}
            </Text>
          </TouchableOpacity>


          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter notes"
            value={form.notes}
            onChangeText={(v) => setForm({ ...form, notes: v })}
          />

          {/* Next Follow-up Activity */}
          <Text style={styles.label}>Next Follow-up Activity *</Text>
          <TouchableOpacity
            ref={followUpRef}
            style={styles.input}
            disabled={loadingOptions}
            onPress={() => openDropdownAbove(followUpRef, "followup")}
          >
            <Text style={styles.inputText}>
              {loadingOptions
                ? "Loading follow-up activities..."
                : activityOptions.find(
                  (o) => o.value === form.next_follow_up_activity
                )?.label || "Select Follow-up Activity"}
            </Text>
          </TouchableOpacity>


          {/* Next Follow-up Date */}
          {/* Next Follow-up Date & Time */}
          <Text style={styles.label}>Next Follow-up Date & Time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => {
              setDateMode("date");
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.inputText}>
              {form.next_follow_up
                ? form.next_follow_up.toLocaleString()
                : "Select date & time"}
            </Text>
          </TouchableOpacity>




          {showDatePicker && (
            <DateTimePicker
              value={form.next_follow_up || new Date()}
              mode={dateMode}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                if (event.type === "dismissed") {
                  setShowDatePicker(false);
                  return;
                }

                if (dateMode === "date") {
                  // User selected date → now open time picker
                  const currentDate = selectedDate || new Date();
                  setForm({ ...form, next_follow_up: currentDate });
                  setDateMode("time");

                  if (Platform.OS === "android") {
                    setShowDatePicker(true);
                  }
                } else {
                  // User selected time → done
                  const finalDate = selectedDate || form.next_follow_up || new Date();
                  setForm({ ...form, next_follow_up: finalDate });
                  setShowDatePicker(false);
                  setDateMode("date");
                }
              }}
            />
          )}

          <View style={{ marginTop: 10 }}>
  <Text style={{ fontSize: 12, color: "#555" }}>
    Activity: {form.activity_type || "-"}
  </Text>
  <Text style={{ fontSize: 12, color: "#555" }}>
    Follow-up: {form.next_follow_up_activity || "-"}
  </Text>
  <Text style={{ fontSize: 12, color: "#555" }}>
    Date & Time:{" "}
    {form.next_follow_up
      ? form.next_follow_up.toLocaleString()
      : "-"}
  </Text>
</View>


          {/* ✅ Create Quotation (Only for Prospect) */}
{/* {leadType === "Prospect" && (
  <TouchableOpacity
    style={styles.quoteBtn}
    onPress={onCreateQuotation}
  >
    <Text style={styles.quoteText}>Create Quotation</Text>
  </TouchableOpacity>
)} */}

<TouchableOpacity style={styles.saveBtn} onPress={submit}>
  <Text style={styles.saveText}>Save Activity</Text>
</TouchableOpacity>


          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Anchored Dropdown */}
        {dropdown.type && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.dropdownOverlay}
            onPress={() => setDropdown({ type: null, top: 0 })}
          >
            <View style={[styles.dropdownBox, { top: dropdown.top }]}>
              <ScrollView showsVerticalScrollIndicator>
                {activityOptions.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setForm({
                        ...form,
                        [dropdown.type === "activity"
                          ? "activity_type"
                          : "next_follow_up_activity"]: item.value,
                      });
                      setDropdown({ type: null, top: 0 });
                    }}
                  >
                    <Text style={styles.dropdownText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

          </TouchableOpacity>
        )}


      </View>

    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
  },
  inputText: {
    color: "#333",
  },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  cancelBtn: {
    padding: 12,
    alignItems: "center",
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdownBox: {
    position: "absolute",
    left: 20,
    right: 20,
    maxHeight: 220,          // 🔑 IMPORTANT
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  dropdownText: {
    fontSize: 15,
  },
  quoteBtn: {
  backgroundColor: "#28a745", // green
  padding: 14,
  borderRadius: 8,
  marginTop: 12,
},
quoteText: {
  color: "#fff",
  textAlign: "center",
  fontWeight: "700",
},

});
