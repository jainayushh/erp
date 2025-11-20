import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
          borderTopWidth: 0.4,
          borderTopColor: "#ddd",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="hrms"
        options={{
          tabBarLabel: "HRMS",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="users" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="finance"
        options={{
          tabBarLabel: "Finance",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="attach-money" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          tabBarLabel: "Inventory",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="boxes" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          tabBarLabel: "More",
          tabBarIcon: ({ color }) => (
            <Ionicons name="apps-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
