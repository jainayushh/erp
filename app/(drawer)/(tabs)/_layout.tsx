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
          marginBottom: 5,
          paddingBottom: 10,
          paddingTop: 6,
          borderTopWidth: 0.4,
          borderTopColor: "#ddd",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarActiveTintColor: "#007bff",
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      {/* HRMS */}
      <Tabs.Screen
        name="hrms/leave"
        options={{
          tabBarLabel: "HRMS",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="users" size={20} color={color} />
          ),
        }}
      />

      {/* LEAD MANAGEMENT */}
      <Tabs.Screen
        name="crm/lead"
        options={{
          tabBarLabel: "Leads",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="groups" size={22} color={color} />
          ),
        }}
      />
<Tabs.Screen name="profile" options={{ href: null }} />
      {/* QUOTATION */}
      <Tabs.Screen
        name="Quotations"
        options={{
          tabBarLabel: "Quotation",
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={22} color={color} />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="task"
        options={{
          tabBarLabel: "Task",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
  name="hrms"
  options={{ href: null }}
/>
<Tabs.Screen
  name="crm/client-details"
  options={{ href: null }}
/>
      <Tabs.Screen
  name="finance"
  options={{ href: null }}
/>

<Tabs.Screen
  name="inventory"
  options={{ href: null }}
/>

<Tabs.Screen
  name="more"
  options={{ href: null }}
/>
    </Tabs>
  );
}