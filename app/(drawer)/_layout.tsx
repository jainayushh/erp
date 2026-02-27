import { Slot } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Sidebar from "../components/CustomDrawer"; // <-- update path if different
import { SafeAreaView } from "react-native-safe-area-context";

export default function DrawerLayout() {
  const [open, setOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={{ flex: 1 }}>
      {/* Top Menu Button */}
      <TouchableOpacity
        style={{ padding: 15, position: "absolute", top: 40, left: 20, zIndex: 100 }}
        onPress={() => {
          console.log("Menu pressed!")
          setOpen(true)
      }}
      >
      </TouchableOpacity>

      {/* Sidebar Drawer */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Main Content */}
      <Slot />
    </View>
    </SafeAreaView>
  );
}
